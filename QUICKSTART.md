# Quick Start Guide

## 🚀 Run Everything (5 minutes)

### Prerequisites
- Node.js installed
- Python installed
- MongoDB running locally (or use MongoDB Atlas connection in `.env`)
- Android phone/emulator for SMS app

### Terminal 1: Backend
```bash
cd Backend
npm install
npm run dev
# Runs on http://localhost:5000
```

### Terminal 2: ML Model
```bash
cd "ML model"
python -m venv venv
source venv/Scripts/activate  # or: venv\Scripts\activate (Windows)
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5001
```

### Terminal 3: Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Terminal 4: SMS App
```bash
cd smsApp
npm install
npx expo run:android
# Then press 'a' for Android emulator or scan QR code with Expo Go app
```

---

## ✅ Test the Flow

1. Go to **http://localhost:5173** in browser
2. Register or login
3. Open SMS App on phone
4. Send a bank SMS to the phone (or wait for one)
5. Dashboard will auto-update with classified message
6. Click "Generate Report" on any category to see insights

---

## 🛠️ What Was Fixed

✅ Backend Message model - now stores original SMS text
✅ SMS App integration - sends complete message data to backend
✅ ML Model error handling - graceful fallback if model fails
✅ Message validation - proper request validation
✅ Frontend .env - API configuration added

---

## 📱 SMS Flow

```
Bank SMS on phone
    ↓ (app polls every 3 sec)
SMS App reads SMS
    ↓
ML Model classifies
    ↓
Backend saves to DB
    ↓
Frontend displays
```

---

## 🔧 Troubleshooting

**Backend won't start:** Check MongoDB is running or update MONGO_URI in `.env`
**ML Model error:** Run `pip install -r requirements.txt` again
**SMS App can't connect:** Ensure phone/PC on same WiFi, update IP in `smsApp/lib/api.ts`
**No messages showing:** Try logging out and logging back in

---

See **SETUP.md** for detailed setup instructions and troubleshooting.
