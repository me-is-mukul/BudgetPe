# BudgetPe Project Setup & Flow Guide

## Project Overview
BudgetPe is a full-stack expense tracking application with an ML-powered SMS classifier. The app captures SMS messages from your phone, classifies them using ML, stores them in a database, and displays them on a web dashboard.

### Flow
```
📱 Phone SMS → SMS App (React Native) → ML Model (Python)
                ↓
         Backend API (Node.js)
                ↓
         MongoDB Database
                ↓
         Frontend Dashboard (React)
                ↓
         User sees classified expenses + Reports
```

---

## Prerequisites
- Node.js 18+ (for Backend & Frontend)
- Python 3.8+ (for ML Model)
- MongoDB (local or Atlas)
- Android Phone/Emulator (for SMS App)
- Expo CLI (`npm install -g expo-cli`)

---

## Setup Instructions

### 1. Backend Setup

```bash
cd Backend
npm install

# Configure .env (already created, update MongoDB URI if needed)
# Then run:
npm run dev  # or `npm start`
```

**Server runs on:** `http://localhost:5000`

**API Endpoints:**
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/messages` - Get all messages (protected)
- `POST /api/messages` - Send/save message (protected)

---

### 2. ML Model Setup

```bash
cd "ML model"

# Create virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Train model (optional - model.pkl and vectorizer.pkl already exist)
python train.py

# Start ML API server
python app.py
```

**ML Server runs on:** `http://localhost:5001`

**API Endpoint:**
- `POST /model/classify` - Classify SMS message
  - Request: `{"msg": "Bank SMS text"}`
  - Response: `{"category": "food", "amount": 500, "date": "...", "receiver": "..."}`

---

### 3. Frontend Setup

```bash
cd frontend
npm install

# Create .env (already created)
# Run dev server
npm run dev
```

**Frontend runs on:** `http://localhost:5173`

**Login with:**
- Email: `test@example.com`
- Password: `password123`

(Or register a new account)

---

### 4. SMS App Setup (Android)

```bash
cd smsApp
npm install

# Start expo server
npx expo run:android

# Or with expo go:
npx expo start
```

**Requirements:**
- App needs SMS read permissions
- Phone and development machine on same WiFi network
- Backend must be accessible from phone (check IP address in `lib/api.ts`)

---

## Key Files Modified

### Backend
- **models/Message.js** - Added `originalText`, `receiver`, `confidence` fields
- **controllers/messageController.js** - Updated to handle new fields
- **validators/messageValidator.js** - Added message validation
- **routes/messages.js** - Added validator middleware

### ML Model
- **model.py** - Added error handling and fallback support
- **pipeline.py** - Enhanced with fallback classification logic
- **requirements.txt** - Added scikit-learn dependency

### SMS App
- **lib/api.ts** - Updated `postMessage` to include `originalText` and `receiver`
- **app/(tabs)/index.tsx** - SMS polling sends full data to backend

### Frontend
- **.env** - Added API configuration

---

## How the Flow Works

### Step-by-Step Message Classification:

1. **SMS Capture**
   - SMS App polls for new SMS messages every 3 seconds
   - Filters for bank-related messages

2. **ML Classification**
   - Sends SMS text to ML Model API
   - Model classifies into: food, travel, shopping, or others
   - Returns: `{category, amount, date, receiver}`

3. **Backend Storage**
   - SMS App sends classified data to Backend API
   - Backend validates and stores in MongoDB
   - Associates message with logged-in user

4. **Frontend Display**
   - Dashboard fetches all messages from Backend
   - Groups by category
   - Shows spending breakdown, stats, and recent transactions
   - User can click "Generate Report" for insights

---

## Classification Logic

The ML model uses a 3-level hierarchy:

### Level 1: Rule-Based (Fast)
Checks if SMS contains known merchant keywords:
- **Food**: swiggy, zomato, eats, food, restaurant
- **Travel**: uber, rapido, ola, taxi, cab, auto, travel
- **Shopping**: amazon, flipkart, myntra, ebay, shop, store

### Level 2: ML Model (Accurate)
If no rule matches, uses trained ML model:
- Analyzes receiver (merchant) name
- Considers transaction amount
- Considers time of transaction (hour)

### Level 3: Fallback (Reliable)
If ML model unavailable:
- Amount ≤ 300 & hour 18-23 → Food
- Amount 50-500 → Travel
- Amount > 500 → Shopping
- Otherwise → Others

---

## Testing the Flow

### Manual Test Flow:

1. **Start all services:**
   ```bash
   # Terminal 1: Backend
   cd Backend && npm run dev

   # Terminal 2: ML Model
   cd "ML model" && python app.py

   # Terminal 3: Frontend
   cd frontend && npm run dev

   # Terminal 4: SMS App
   cd smsApp && npx expo start
   ```

2. **Register/Login** to Frontend at `http://localhost:5173`

3. **Open SMS App** on Android device

4. **Receive bank SMS** (or simulate)

5. **Check Frontend Dashboard** - Message should appear in 3-5 seconds

---

## Troubleshooting

### SMS App can't connect to Backend
- Ensure phone and PC are on same WiFi
- Check IP address in `smsApp/lib/api.ts` matches your machine
- Firewall: Allow port 5000 (Backend) and 5001 (ML)

### ML Model returns error
- Ensure Python 3.8+ is installed
- Check `data/model.pkl` and `data/vectorizer.pkl` exist
- Run `pip install -r requirements.txt` again
- If files missing: run `python train.py`

### Frontend shows "No transactions yet"
- Check Backend is running (`http://localhost:5000/api/health`)
- Check ML Model is running (`http://localhost:5001/`)
- Check token is stored in localStorage (login again)
- Check browser console for errors

### Backend connection refused
- Verify MongoDB is running locally
- Or update `MONGO_URI` in `.env` to your MongoDB Atlas connection string
- Restart Backend: `npm run dev`

---

## Report Generation (Future)

Current implementation:
- ✅ Shows category spending breakdown
- ✅ Displays weekly spending chart
- ✅ Shows dummy AI insights
- ⏳ Placeholder for Gemini API integration

To integrate Gemini API later:
1. Add `GEMINI_API_KEY` to Backend `.env`
2. Create `/api/reports/:category` endpoint
3. Call Gemini API with spending data
4. Return insights in Frontend ReportModal

---

## Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  phoneNumber: String,
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Message
```javascript
{
  user: ObjectId (ref: User),
  originalText: String,
  category: Enum["food", "travel", "shopping", "others"],
  amount: Number,
  receiver: String,
  date: Date,
  confidence: Number (0-1),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Development Notes

### Adding New Categories
1. Update `Message.js` enum: `enum: ["food", "travel", "shopping", "newCategory"]`
2. Update `messageValidator.js`: `isIn(["food", ..., "newCategory"])`
3. Update `pipeline.py`: Add rules in `rule_based_category()`
4. Update Frontend `Dashboard.jsx`: Add colors in `CATEGORY_COLORS`

### Retraining ML Model
1. Update `data/dataset.csv` with new training data
2. Run `python train.py` in ML Model directory
3. Restart ML API server

---

## Security Notes

⚠️ **Before Production:**
- Change `JWT_SECRET` in Backend `.env`
- Use MongoDB Atlas with authentication
- Enable HTTPS for Frontend and Backend
- Add rate limiting to API endpoints
- Implement refresh token rotation
- Use environment variables for sensitive data

---

**Happy Tracking! 💰**
