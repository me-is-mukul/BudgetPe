# BudgetPe Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER DEVICES                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────┐          ┌──────────────────────┐        │
│  │   Android Phone      │          │   Web Browser        │        │
│  │  (SMS App)          │          │  (Frontend)         │        │
│  │                      │          │                      │        │
│  │ • SMS Receiver      │          │ • Dashboard         │        │
│  │ • ML Classification │          │ • Reports           │        │
│  │ • Sync to Backend   │          │ • Analytics         │        │
│  └─────────┬──────────┘          └─────────┬───────────┘        │
│            │                              │                      │
└────────────┼──────────────────────────────┼──────────────────────┘
             │                              │
             │ HTTP POST                    │ HTTP GET/POST
             │ (Token+SMS Data)             │ (Token+JSON)
             │                              │
   ┌─────────▼──────────────────────────────▼──────────────────────┐
   │                      BACKEND SERVER                           │
   │              (Node.js + Express on port 5000)                │
   ├──────────────────────────────────────────────────────────────┤
   │                                                              │
   │  ┌──────────────────────┐      ┌──────────────────────┐    │
   │  │   Authentication     │      │   Message Handler    │    │
   │  ├──────────────────────┤      ├──────────────────────┤    │
   │  │ • Register           │      │ • Validate request   │    │
   │  │ • Login              │      │ • Save to DB         │    │
   │  │ • JWT Token          │      │ • Fetch messages     │    │
   │  │ • Verify Token       │      │ • Group by category  │    │
   │  └──────────────────────┘      └──────────────────────┘    │
   │                                                              │
   │  ┌──────────────────────────────────────────────────────┐   │
   │  │           MongoDB Database                           │   │
   │  │  (Stores Users, Messages, Classifications)          │   │
   │  └──────────────────────────────────────────────────────┘   │
   │                                                              │
   └────────────┬─────────────────────────────────────────────────┘
                │
                │ HTTP POST
                │ (SMS Text)
                │
   ┌────────────▼─────────────────────────────────────────────────┐
   │               ML MODEL SERVER                                │
   │          (Flask on port 5001, Python)                        │
   ├───────────────────────────────────────────────────────────────┤
   │                                                              │
   │  ┌────────────────────────────────────────────────────────┐ │
   │  │           SMS Classification Pipeline                  │ │
   │  │                                                        │ │
   │  │  1. Validate Bank Message                            │ │
   │  │     └─ Check for keywords: A/C, debited, etc.       │ │
   │  │                                                        │ │
   │  │  2. Extract Data                                     │ │
   │  │     ├─ Amount: Extract ₹/Rs amount                  │ │
   │  │     ├─ Receiver: Extract merchant name              │ │
   │  │     └─ Time: Parse transaction timestamp             │ │
   │  │                                                        │ │
   │  │  3. Classify (3-Level)                               │ │
   │  │     ├─ Level 1: Rule-based (merchant keywords)      │ │
   │  │     │   └─ Swiggy/Zomato → Food                    │ │
   │  │     │   └─ Uber/Ola → Travel                       │ │
   │  │     │   └─ Amazon/Flipkart → Shopping              │ │
   │  │     │                                                │ │
   │  │     ├─ Level 2: ML Model (if rule fails)           │ │
   │  │     │   ├─ TF-IDF vectorize merchant                │ │
   │  │     │   ├─ Extract numeric features (amount, hour) │ │
   │  │     │   └─ Predict using LogisticRegression         │ │
   │  │     │                                                │ │
   │  │     └─ Level 3: Fallback heuristics                │ │
   │  │         ├─ Amount ≤ 300 & 6-11 PM → Food          │ │
   │  │         ├─ Amount 50-500 → Travel                  │ │
   │  │         └─ Amount > 500 → Shopping                 │ │
   │  │                                                        │ │
   │  │  4. Return Classification                            │ │
   │  │     └─ {category, amount, date, receiver}           │ │
   │  └────────────────────────────────────────────────────────┘ │
   │                                                              │
   │  Data Files (Trained Model):                               │
   │  ├─ model.pkl - Trained LogisticRegression model           │
   │  ├─ vectorizer.pkl - TF-IDF vectorizer                     │
   │  └─ dataset.csv - Training data                            │
   │                                                              │
   └──────────────────────────────────────────────────────────────┘
```

---

## Complete Message Flow (Step-by-Step)

### 1️⃣ User Authentication
```
User enters credentials on Frontend/SMS App
        ↓
POST /api/auth/login
        ↓
Backend validates password
        ↓
Backend generates JWT token (valid 7 days)
        ↓
Frontend/App stores token in localStorage/SecureStore
        ↓
Token included in Authorization header for all future requests
```

### 2️⃣ SMS Capture & Processing
```
Bank sends SMS to phone
        ↓
SMS App polls device SMS inbox every 3 seconds
        ↓
New SMS detected → Extract:
  • body: "Debited Rs. 500 to Swiggy..."
  • address: "SWIGGY" or "+91XXXXXXXXX"
  • date: timestamp
        ↓
App calls ML Model API:
  POST http://localhost:5001/model/classify
  Body: { msg: "Debited Rs. 500 to Swiggy..." }
```

### 3️⃣ ML Classification
```
ML Model receives SMS text
        ↓
Pipeline processes:
  1. Check if bank message ✓
  2. Check if debit transaction ✓
  3. Extract amount (500) ✓
  4. Extract receiver (Swiggy) ✓
        ↓
Classify in 3 levels:
  Level 1 Rule-Based:
    "swiggy" in receiver.lower() → MATCH!
    Return: "food"
        ↓
ML returns:
{
  "category": "food",
  "amount": 500,
  "date": "2024-04-23T19:30:00",
  "receiver": "Swiggy"
}
```

### 4️⃣ Backend Storage
```
SMS App receives classification
        ↓
App sends to Backend:
  POST /api/messages
  Headers: {
    Authorization: "Bearer eyJhbGciOi...",
    Content-Type: "application/json"
  }
  Body: {
    "category": "food",
    "amount": 500,
    "originalText": "Debited Rs. 500 to Swiggy...",
    "receiver": "Swiggy",
    "date": "2024-04-23T19:30:00"
  }
        ↓
Backend verifies JWT token ✓
        ↓
Backend validates all fields:
  - category is valid enum ✓
  - amount is positive number ✓
  - originalText not empty ✓
        ↓
Backend creates Message document:
  {
    _id: ObjectId,
    user: ObjectId("user123"),
    category: "food",
    amount: 500,
    originalText: "Debited Rs. 500 to Swiggy...",
    receiver: "Swiggy",
    date: Date("2024-04-23T19:30:00"),
    confidence: 1.0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
        ↓
Backend saves to MongoDB
        ↓
Returns to App:
{
  "message": "Message sent successfully",
  "data": { ... saved message ... }
}
```

### 5️⃣ Frontend Display
```
User opens Frontend Dashboard at http://localhost:5173
        ↓
Frontend fetches messages:
  GET /api/messages
  Headers: { Authorization: "Bearer ..." }
        ↓
Backend returns all user messages:
{
  "count": 15,
  "messages": [
    { category: "food", amount: 500, date: "...", ... },
    { category: "travel", amount: 250, date: "...", ... },
    { category: "shopping", amount: 1200, date: "...", ... },
    ...
  ]
}
        ↓
Frontend processes:
  • Group by category
  • Calculate totals
  • Sort by date
  • Color code by category
        ↓
Dashboard displays:
  • Stats: Total Spent: ₹1,950 | Categories: 3 | Top: Food
  • Breakdown bar chart
  • Category cards with progress bars
  • Recent transactions list
  • "Generate Report" button per category
```

### 6️⃣ Report Generation
```
User clicks "Generate Report" on Food category
        ↓
ReportModal opens with category data
        ↓
Modal displays:
  • Category: Food
  • Total: ₹1,500
  • 3 transactions
        ↓
Chart renders:
  • Weekly breakdown (Mon-Sun)
  • Bar heights = spending per day
        ↓
AI Insights display (placeholder for Gemini):
  • "Your food spend peaks on weekends..."
  • "Delivery fees account for 15-20%..."
  • "You order most frequently 7-9 PM..."
```

---

## Data Model Relationships

```
User (1) ──── (Many) Messages

User:
  _id
  name
  email
  phoneNumber
  password
  timestamps

Message:
  _id
  user_id (Foreign Key)
  originalText
  category (enum: food, travel, shopping, others)
  amount
  receiver
  date
  confidence
  timestamps
```

---

## API Response Examples

### Register
```
POST /api/auth/register
{
  "name": "Mukul",
  "email": "mukul@example.com",
  "phoneNumber": "9876543210",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Mukul",
    "email": "mukul@example.com",
    "phoneNumber": "9876543210"
  }
}
```

### Get Messages
```
GET /api/messages
Header: Authorization: Bearer <token>

Response:
{
  "count": 5,
  "messages": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "category": "food",
      "amount": 500,
      "originalText": "Debited Rs. 500 to Swiggy...",
      "receiver": "Swiggy",
      "date": "2024-04-23T19:30:00Z",
      "confidence": 1.0,
      "createdAt": "2024-04-23T19:31:00Z",
      "updatedAt": "2024-04-23T19:31:00Z"
    },
    ...
  ]
}
```

### Classify Message
```
POST /model/classify
{
  "msg": "Debited Rs. 500 to Swiggy. Available Balance: ₹5000"
}

Response:
{
  "category": "food",
  "amount": 500,
  "date": "2024-04-23T19:30:00",
  "receiver": "Swiggy"
}
```

---

## Port Configuration

| Service | Port | URL | Protocol |
|---------|------|-----|----------|
| Backend | 5000 | http://localhost:5000 | HTTP |
| ML Model | 5001 | http://localhost:5001 | HTTP |
| Frontend | 5173 | http://localhost:5173 | HTTP |
| MongoDB | 27017 | mongodb://localhost:27017 | TCP |

---

## Environment Variables Summary

```
Backend (.env):
  PORT=5000
  MONGO_URI=mongodb+srv://...
  JWT_SECRET=<secret>
  JWT_EXPIRES_IN=7d

Frontend (.env):
  VITE_API_URL=http://localhost:5000/api

SMS App (lib/api.ts):
  Dynamic host detection (Expo)
```

---

## Security Flow

```
1. Credentials transmitted over HTTPS (prod)
2. Password hashed with bcrypt (rounds=12)
3. JWT token issued (valid 7 days)
4. Token sent in Authorization header
5. Backend verifies token signature with secret
6. User ID extracted from token
7. Messages filtered by user ID
8. No cross-user data leakage possible
```

---

**This architecture ensures secure, scalable, and reliable expense tracking! 🚀**
