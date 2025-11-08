# 🧪 Frontend to Backend Connection Testing Guide

This guide will help you verify that the entire connection chain is working:
**Frontend → API Gateway → MQTT → Games Service → MongoDB**

---

## 📋 Prerequisites

1. **Docker Desktop is running**
2. **All services are healthy**
3. **Databases are seeded**

---

## Step 1: Start All Services

```bash
# Navigate to project root
cd C:\Users\ericn\Documents\CSC3104_Cloud_Project_Grp25

# Start all Docker services
docker-compose up -d

# Wait ~30 seconds, then check health
docker-compose ps
```

**Expected Output:**
```
NAME            STATUS
api-gateway     Up (healthy)
games-service   Up (healthy)
hivemq-broker   Up (healthy)
mongodb-main    Up (healthy)
mongodb-games   Up (healthy)
```

---

## Step 2: Verify Backend Services Are Running

### 2.1 Test API Gateway Health

```bash
# Test basic endpoint
curl http://localhost:8080/

# Expected: "Welcome to the homepage"
```

### 2.2 Test Games Service Health

```bash
# Test health endpoint
curl http://localhost:8081/health

# Expected: {"status":"ok"} or similar
```

### 2.3 Check Service Logs

```bash
# Check API Gateway logs
docker logs api-gateway --tail 50

# Check Games Service logs
docker logs games-service --tail 50

# Look for:
# ✅ "MQTT client connected"
# ✅ "Server listening on port 8080"
# ✅ "Connected to MongoDB"
```

---

## Step 3: Test Authentication (Get JWT Token)

### 3.1 Login via API

```bash
# Test login endpoint
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"senior1\",\"password\":\"password123\"}"

# Expected Response:
# {
#   "success": true,
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": { ... }
# }
```

**Save the token** - You'll need it for authenticated requests.

---

## Step 4: Test Backend API Endpoints Directly

### 4.1 Test Get All Games

```bash
# Replace YOUR_TOKEN with the token from Step 3
curl -X GET http://localhost:8080/api/games \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected Response:
# {
#   "success": true,
#   "games": [
#     { "gameId": "1", "name": "Morning Stretch", ... },
#     { "gameId": "2", "name": "Memory Quiz", ... },
#     ...
#   ]
# }
```

### 4.2 Test Get Trivia Questions

```bash
curl -X GET "http://localhost:8080/api/games/trivia?count=3" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected Response:
# {
#   "success": true,
#   "questions": [
#     { "question": "...", "options": [...], "correctAnswer": 0, ... },
#     ...
#   ]
# }
```

### 4.3 Test Get Memory Cards

```bash
curl -X GET "http://localhost:8080/api/games/memory?difficulty=easy" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected Response:
# {
#   "success": true,
#   "memorySet": {
#     "cards": ["🍎", "🍌", ...],
#     "difficulty": "easy",
#     ...
#   }
# }
```

### 4.4 Test Get Stretch Exercises

```bash
curl -X GET http://localhost:8080/api/games/stretch \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected Response:
# {
#   "success": true,
#   "exercises": [
#     { "exerciseId": 1, "name": "Neck Rolls", ... },
#     ...
#   ]
# }
```

### 4.5 Test Start Game Session

```bash
curl -X POST http://localhost:8080/api/games/session/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"gameId\":\"3\",\"gameType\":\"trivia\"}"

# Expected Response:
# {
#   "success": true,
#   "session": {
#     "sessionId": "...",
#     "gameId": "3",
#     ...
#   }
# }
```

---

## Step 5: Test Frontend Connection

### 5.1 Start Senior App Frontend

```bash
# Navigate to senior app
cd front-end/senior-app

# Install dependencies (if not done)
npm install

# Start development server
npm start
```

**Expected:** Browser opens to `http://localhost:3000`

### 5.2 Open Browser Developer Tools

1. **Press F12** (or Right-click → Inspect)
2. Go to **Console** tab
3. Go to **Network** tab

### 5.3 Test Login Flow

1. Navigate to login page (if needed)
2. Login with credentials:
   - Username: `senior1`
   - Password: `password123`
3. **Check Console** for:
   - ✅ No red errors
   - ✅ "Login successful" messages
   - ✅ Token stored in localStorage

4. **Check Network Tab**:
   - Look for `POST /login` request
   - Status should be **200 OK**
   - Response should contain `token`

---

## Step 6: Test Game Data Loading

### 6.1 Test Activities List

1. Navigate to **Activities** tab in Senior App
2. **Check Network Tab**:
   - Look for `GET /api/games` request
   - Status: **200 OK**
   - Response should contain array of games

3. **Check Console**:
   - ✅ No errors
   - ✅ "Activities fetched successfully" (if logged)

4. **Visual Check**:
   - Activities should appear on screen
   - Should show: Morning Stretch, Memory Quiz, Cultural Trivia, Stack Tower

### 6.2 Test Cultural Trivia Game

1. Click **"Play Game"** on Cultural Trivia
2. **Check Network Tab**:
   - `GET /api/games/trivia?count=3` - Should return questions
   - `POST /api/games/session/start` - Should create session
3. **Visual Check**:
   - Questions should appear
   - Options should be clickable

### 6.3 Test Memory Quiz Game

1. Click **"Play Game"** on Memory Quiz
2. **Check Network Tab**:
   - `GET /api/games/memory?difficulty=easy` - Should return cards
   - `POST /api/games/session/start` - Should create session
3. **Visual Check**:
   - Cards should appear (preview, then flip)

### 6.4 Test Morning Stretch

1. Click **"Play Game"** on Morning Stretch
2. **Check Network Tab**:
   - `GET /api/games/stretch` - Should return exercises
   - `POST /api/games/session/start` - Should create session
3. **Visual Check**:
   - Exercises should appear with timers

---

## Step 7: Test Game Completion

### 7.1 Complete a Game

1. Play through any game (e.g., answer trivia questions)
2. Complete the game
3. **Check Network Tab**:
   - `POST /api/games/session/complete` - Should be called
   - Status: **200 OK**
   - Should include score/metadata

### 7.2 Verify Points Update

1. Return to Activities screen
2. **Visual Check**:
   - Total points should increase
   - Points should match the game's point value

---

## Step 8: Test Check-In Feature

1. Navigate to **Check-In** tab
2. Select a mood and submit
3. **Check Network Tab**:
   - `POST /checkin` - Should be called
   - Status: **200 OK** or **201 Created**

---

## Step 9: Verify MQTT Communication

### 9.1 Check MQTT Logs

```bash
# Check API Gateway logs for MQTT messages
docker logs api-gateway | grep -i mqtt

# Check Games Service logs for MQTT messages
docker logs games-service | grep -i mqtt

# Look for:
# ✅ "Published to games/request/trivia"
# ✅ "Received response on games/response/trivia/..."
```

### 9.2 Check HiveMQ Control Center

1. Open browser: `http://localhost:8082`
2. Navigate to **Topics** or **MQTT Clients**
3. You should see:
   - API Gateway connected
   - Games Service connected
   - Topics: `games/request/*` and `games/response/*`

---

## Step 10: Verify Database Updates

### 10.1 Check Game Sessions in MongoDB

```bash
# Connect to MongoDB Games
docker exec -it mongodb-games mongosh games

# Check game sessions
use games
db.gamesessions.find().pretty()

# Should see sessions created from your game plays
```

### 10.2 Check Check-Ins in MongoDB Main

```bash
# Connect to MongoDB Main
docker exec -it mongodb-main mongosh seniorcare

# Check check-ins
use seniorcare
db.checkins.find().pretty()

# Should see check-ins from your tests
```

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to API"

**Symptoms:**
- Network tab shows `ERR_CONNECTION_REFUSED`
- Console shows "Network Error"

**Solutions:**
1. Check if API Gateway is running:
   ```bash
   docker ps | grep api-gateway
   ```
2. Test API directly:
   ```bash
   curl http://localhost:8080/
   ```
3. Check API Gateway logs:
   ```bash
   docker logs api-gateway
   ```

---

### Issue: "401 Unauthorized"

**Symptoms:**
- Network tab shows `401` status
- Console shows "Unauthorized"

**Solutions:**
1. Check if token exists:
   - Open Browser DevTools → Application → Local Storage
   - Look for `authToken`
2. Re-login to get a new token
3. Check if token is expired (JWT tokens expire)

---

### Issue: "500 Internal Server Error"

**Symptoms:**
- Network tab shows `500` status
- Response shows error message

**Solutions:**
1. Check API Gateway logs:
   ```bash
   docker logs api-gateway --tail 100
   ```
2. Check Games Service logs:
   ```bash
   docker logs games-service --tail 100
   ```
3. Check MQTT connection:
   ```bash
   docker logs api-gateway | grep -i mqtt
   docker logs games-service | grep -i mqtt
   ```

---

### Issue: "No games/data returned"

**Symptoms:**
- Activities list is empty
- Games don't load

**Solutions:**
1. Check if database is seeded:
   ```bash
   docker exec -it mongodb-games mongosh games
   db.games.find().count()
   # Should be > 0
   ```
2. If empty, seed the database:
   ```bash
   cd games-service
   npm run seed
   ```
3. Check MQTT communication:
   ```bash
   docker logs api-gateway | grep -i "games/request"
   ```

---

## ✅ Success Checklist

- [ ] All Docker services are healthy
- [ ] API Gateway responds to `curl http://localhost:8080/`
- [ ] Games Service responds to `curl http://localhost:8081/health`
- [ ] Login returns a JWT token
- [ ] `GET /api/games` returns game list
- [ ] `GET /api/games/trivia` returns questions
- [ ] `GET /api/games/memory` returns cards
- [ ] `GET /api/games/stretch` returns exercises
- [ ] Frontend loads without console errors
- [ ] Activities list displays games
- [ ] Games can be started and completed
- [ ] Points update after game completion
- [ ] Check-in saves to backend
- [ ] MQTT messages are being sent/received
- [ ] Database contains game sessions and check-ins

---

## 📊 Quick Test Script

Save this as `test-connection.sh` (or run commands manually):

```bash
#!/bin/bash

echo "🧪 Testing Frontend to Backend Connection..."
echo ""

# Test 1: API Gateway
echo "1. Testing API Gateway..."
curl -s http://localhost:8080/ && echo " ✅" || echo " ❌"

# Test 2: Games Service
echo "2. Testing Games Service..."
curl -s http://localhost:8081/health && echo " ✅" || echo " ❌"

# Test 3: Login
echo "3. Testing Login..."
TOKEN=$(curl -s -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"username":"senior1","password":"password123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo " ❌ Login failed"
else
  echo " ✅ Login successful"
  
  # Test 4: Get Games
  echo "4. Testing Get Games..."
  curl -s -X GET http://localhost:8080/api/games \
    -H "Authorization: Bearer $TOKEN" \
    | grep -q "success" && echo " ✅" || echo " ❌"
fi

echo ""
echo "✅ Testing complete!"
```

---

## 🎯 Expected Flow Diagram

```
┌─────────────┐
│ Senior App  │
│ (Port 3000) │
└──────┬──────┘
       │ HTTP GET /api/games
       ▼
┌─────────────┐
│ API Gateway │
│ (Port 8080) │
└──────┬──────┘
       │ MQTT Publish: games/request/list
       ▼
┌─────────────┐
│ HiveMQ      │
│ (Port 1883) │
└──────┬──────┘
       │ MQTT Message
       ▼
┌─────────────┐
│Games Service│
│ (Port 8081) │
└──────┬──────┘
       │ Query
       ▼
┌─────────────┐
│ MongoDB     │
│ Games       │
│ (Port 27018)│
└─────────────┘
```

---

**Good luck testing! 🚀**

