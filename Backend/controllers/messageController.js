import Message from "../models/Message.js";
import { GoogleGenAI } from "@google/genai";

const PERSONA_STYLES = {
  "Impulse Eater": {
    emoji: "🍔",
    vibe: "Late-night and spontaneous purchases are driving your spend.",
    recommendation: "Set an evening spending cap and pre-plan weekday meals.",
  },
  "Big Spender": {
    emoji: "🛍️",
    vibe: "High-ticket transactions are dominating your budget profile.",
    recommendation: "Use a 24-hour cooling rule for purchases over your comfort threshold.",
  },
  "Daily Commuter": {
    emoji: "🚆",
    vibe: "Travel cadence is consistent and frequent.",
    recommendation: "A pass or bundled transport plan can lower monthly burn.",
  },
  "Weekend Spender": {
    emoji: "🎉",
    vibe: "Most spending spikes happen on weekends.",
    recommendation: "Create a dedicated weekend wallet to avoid overshoot.",
  },
  "Irregular Spender": {
    emoji: "🎯",
    vibe: "Expense variability is high with sudden spikes.",
    recommendation: "Set alerts for unusually large spends to stay in control.",
  },
  "Balanced User": {
    emoji: "⚖️",
    vibe: "Your spending distribution is relatively stable.",
    recommendation: "Maintain this with small monthly optimization goals.",
  },
};

const FALLBACK_INSIGHTS = {
  food: [
    "Food spending is concentrated in short bursts; try setting a weekly food budget cap.",
    "Track delivery versus dine-in to identify where hidden charges are accumulating.",
    "Pre-planning 2-3 meals each week can reduce impulsive orders significantly.",
  ],
  travel: [
    "Travel expenses appear frequent; a monthly pass may reduce total transportation cost.",
    "Peak commute-time rides are likely increasing your average travel ticket size.",
    "Batching errands into fewer trips can lower travel burn across the month.",
  ],
  shopping: [
    "Shopping spend has periodic spikes; pause 24 hours before non-essential purchases.",
    "Higher-value purchases dominate this category; set a per-transaction limit.",
    "Create a separate wishlist bucket to prevent unplanned buying.",
  ],
  others: [
    "Unclassified expenses are reducing report clarity; recategorize unknown transactions.",
    "Review recurring merchants in this bucket to detect subscriptions or autopay charges.",
    "Improving merchant labels over time will make recommendations more accurate.",
  ],
};

const getTopDay = (messages) => {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const counts = Array(7).fill(0);
  messages.forEach((m) => {
    const d = new Date(m.date).getDay();
    counts[d] += Number(m.amount || 0);
  });
  const maxIdx = counts.indexOf(Math.max(...counts));
  return dayNames[maxIdx];
};

const parseGeminiBullets = (text) => {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 3);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildGeminiModelList = () => {
  const fromEnv = process.env.GEMINI_MODELS;
  if (fromEnv) {
    return fromEnv
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
  }

  return ["gemini-3-flash-preview", "gemini-2.5-flash", "gemini-2.0-flash"];
};

const isTransientGeminiError = (message = "") => {
  const text = String(message).toLowerCase();
  return (
    text.includes("503") ||
    text.includes("unavailable") ||
    text.includes("deadline") ||
    text.includes("timeout") ||
    text.includes("rate limit") ||
    text.includes("429")
  );
};

const parseRetryDelayMs = (message = "") => {
  const match = String(message).match(/retry in\s+([\d.]+)s/i);
  if (!match) return null;
  const seconds = Number(match[1]);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return Math.ceil(seconds * 1000);
};

let geminiCooldownUntil = 0;

// GET /api/messages  — fetch all messages for the logged-in user
const getMessages = async (req, res, next) => {
  try {
    console.log(`[getMessages] fetching for user: ${req.user._id}`);
    const messages = await Message.find({ user: req.user._id }).sort({ date: -1 });
    console.log(`[getMessages] success — ${messages.length} message(s) returned`);
    res.status(200).json({ count: messages.length, messages });
  } catch (error) {
    console.error(`[getMessages] error — ${error.message}`);
    next(error);
  }
};

// GET /api/messages/insights?days=30
const getBehaviorInsights = async (req, res, next) => {
  try {
    const daysRaw = Number(req.query.days ?? 30);
    const days = Number.isFinite(daysRaw) ? Math.min(Math.max(Math.floor(daysRaw), 1), 365) : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const allWindowMessages = await Message.find({ date: { $gte: since } })
      .select("user category amount date")
      .lean();

    const userId = String(req.user._id);
    const userMessages = allWindowMessages.filter((m) => String(m.user) === userId);

    if (userMessages.length === 0) {
      return res.status(200).json({
        days,
        hasData: false,
        message: "No transactions found in this period.",
      });
    }

    const payloadTransactions = allWindowMessages.map((m) => ({
      user: String(m.user),
      category: m.category,
      amount: m.amount,
      date: new Date(m.date).toISOString(),
    }));

    const mlBase = process.env.ML_API_URL ?? "http://localhost:5001/model";
    let mlPersona = "Balanced User";
    let mode = "fallback";
    let clusteredUsers = new Set(payloadTransactions.map((t) => t.user)).size;

    try {
      const mlRes = await fetch(`${mlBase}/clustering/user-insight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userId,
          transactions: payloadTransactions,
        }),
      });

      if (mlRes.ok) {
        const mlJson = await mlRes.json();
        if (mlJson?.persona) {
          mlPersona = mlJson.persona;
          mode = mlJson.mode ?? mode;
          clusteredUsers = mlJson.clustered_users ?? clusteredUsers;
        }
      }
    } catch (mlError) {
      console.warn(`[getBehaviorInsights] ML API unavailable — ${mlError.message}`);
    }

    const totalSpent = userMessages.reduce((sum, m) => sum + Number(m.amount || 0), 0);
    const avgTxnAmount = totalSpent / userMessages.length;

    const byCategory = userMessages.reduce((acc, m) => {
      const key = m.category || "others";
      acc[key] = (acc[key] || 0) + Number(m.amount || 0);
      return acc;
    }, {});

    const topCategoryEntry = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0] || ["others", 0];
    const weekendTxns = userMessages.filter((m) => {
      const d = new Date(m.date).getDay();
      return d === 0 || d === 6;
    }).length;
    const nightTxns = userMessages.filter((m) => {
      const h = new Date(m.date).getHours();
      return h >= 18 && h <= 23;
    }).length;

    const personaStyle = PERSONA_STYLES[mlPersona] ?? PERSONA_STYLES["Balanced User"];
    const categoryShare = totalSpent > 0 ? (topCategoryEntry[1] / totalSpent) * 100 : 0;

    return res.status(200).json({
      days,
      hasData: true,
      ml: {
        persona: mlPersona,
        mode,
        clusteredUsers,
      },
      summary: {
        totalSpent,
        transactionCount: userMessages.length,
        avgTxnAmount,
        topCategory: topCategoryEntry[0],
        topCategoryShare: categoryShare,
        nightRatio: (nightTxns / userMessages.length) * 100,
        weekendRatio: (weekendTxns / userMessages.length) * 100,
      },
      narrative: {
        emoji: personaStyle.emoji,
        vibe: personaStyle.vibe,
        recommendation: personaStyle.recommendation,
      },
    });
  } catch (error) {
    console.error(`[getBehaviorInsights] error — ${error.message}`);
    next(error);
  }
};

// POST /api/messages/report
const generateCategoryReport = async (req, res, next) => {
  try {
    const { category, days = 90 } = req.body;

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const normalizedCategory = String(category).toLowerCase();
    const lookbackDays = Math.min(Math.max(Number(days) || 90, 7), 365);
    const since = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);

    const messages = await Message.find({
      user: req.user._id,
      category: normalizedCategory,
      date: { $gte: since },
    })
      .sort({ date: -1 })
      .lean();

    if (messages.length === 0) {
      return res.status(200).json({
        category: normalizedCategory,
        windowDays: lookbackDays,
        insights: [
          "No transactions found in this period for this category.",
          "Try increasing the day range to analyze a larger time window.",
          "Once new transactions arrive, regenerate the report for personalized tips.",
        ],
        source: "system",
      });
    }

    const total = messages.reduce((sum, m) => sum + Number(m.amount || 0), 0);
    const avg = total / messages.length;
    const maxTxn = Math.max(...messages.map((m) => Number(m.amount || 0)));
    const minTxn = Math.min(...messages.map((m) => Number(m.amount || 0)));
    const topDay = getTopDay(messages);
    const recentMerchants = [...new Set(messages.map((m) => m.receiver).filter(Boolean))].slice(0, 5);
    const nightTxns = messages.filter((m) => {
      const h = new Date(m.date).getHours();
      return h >= 18 && h <= 23;
    }).length;

    const prompt = `
You are a personal finance assistant. Write exactly 3 concise, actionable insights for this user.
Context:
- Category: ${normalizedCategory}
- Time window: last ${lookbackDays} days
- Transactions: ${messages.length}
- Total spend: ${total.toFixed(2)} INR
- Average transaction: ${avg.toFixed(2)} INR
- Max transaction: ${maxTxn.toFixed(2)} INR
- Min transaction: ${minTxn.toFixed(2)} INR
- Night transaction ratio: ${((nightTxns / messages.length) * 100).toFixed(1)}%
- Highest spend day: ${topDay}
- Recent merchants: ${recentMerchants.join(", ") || "N/A"}

Rules:
- Return exactly 3 bullet points.
- Keep each bullet under 24 words.
- Be practical and specific.
- Avoid generic disclaimers.
`;

    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    let insights = [];
    let source = "fallback";
    let reason = "GEMINI_KEY_MISSING";

    if (geminiKey) {
      if (Date.now() < geminiCooldownUntil) {
        const remainingMs = geminiCooldownUntil - Date.now();
        reason = `GEMINI_COOLDOWN:${Math.ceil(remainingMs / 1000)}s`;
      }
    }

    if (geminiKey && Date.now() >= geminiCooldownUntil) {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const modelsToTry = buildGeminiModelList();
      const maxAttempts = Math.min(Math.max(Number(process.env.GEMINI_MAX_RETRIES) || 2, 1), 4);

      for (const model of modelsToTry) {
        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
          try {
            const response = await ai.models.generateContent({
              model,
              contents: prompt,
            });

            insights = parseGeminiBullets(response?.text);
            if (insights.length >= 3) {
              source = "gemini";
              reason = `OK:${model}`;
              break;
            }

            reason = `GEMINI_EMPTY:${model}`;
          } catch (geminiError) {
            const msg = geminiError?.message || String(geminiError);
            console.warn(
              `[generateCategoryReport] Gemini failed (model=${model}, attempt=${attempt}/${maxAttempts}) — ${msg}`
            );
            reason = `GEMINI_UNAVAILABLE:${model}`;

            if (String(msg).toLowerCase().includes("resource_exhausted")) {
              const retryMs = parseRetryDelayMs(msg) ?? 60_000;
              geminiCooldownUntil = Date.now() + retryMs;
              reason = `GEMINI_QUOTA_EXHAUSTED:${model}:${Math.ceil(retryMs / 1000)}s`;
              break;
            }

            if (!isTransientGeminiError(msg) || attempt === maxAttempts) {
              break;
            }
            await sleep(300 * attempt);
          }
        }

        if (insights.length >= 3) break;
      }
    }

    if (insights.length < 3) {
      const fallback = FALLBACK_INSIGHTS[normalizedCategory] ?? FALLBACK_INSIGHTS.others;
      insights = fallback.slice(0, 3);
      source = source === "gemini" ? "gemini+fallback" : "fallback";
    }

    return res.status(200).json({
      category: normalizedCategory,
      windowDays: lookbackDays,
      transactionCount: messages.length,
      totalSpent: total,
      avgSpent: avg,
      insights,
      source,
      reason,
    });
  } catch (error) {
    console.error(`[generateCategoryReport] error — ${error.message}`);
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { category, amount, date, originalText, receiver } = req.body;
    console.log(`[sendMessage] attempt — user: ${req.user._id}, category: ${category}, amount: ${amount}`);

    if (!category || amount === undefined || !originalText) {
      console.warn(`[sendMessage] failed — missing required fields (category, amount, originalText)`);
      return res.status(400).json({ message: "category, amount, and originalText are required" });
    }

    const newMessage = new Message({
      user: req.user._id,
      category,
      amount,
      originalText,
      receiver: receiver || "",
      date: date || Date.now(),
    });

    const savedMessage = await newMessage.save();
    console.log(`[sendMessage] success — message saved: ${savedMessage._id}`);
    res.status(201).json({ 
      message: "Message sent successfully",
      data: savedMessage 
    });
  } catch (error) {
    console.error(`[sendMessage] error — ${error.message}`);
    next(error);
  }
};

export { getMessages, sendMessage, getBehaviorInsights, generateCategoryReport };
