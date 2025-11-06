# Quick Authentication & Routing Reference

## Quick Facts

| Item | Details |
|------|---------|
| **JWT Secret** | `process.env.JWT_SECRET` or `'secret1234@'` |
| **Token Expiry** | 7 days |
| **API Port** | 8080 |
| **Auth Header Format** | `Authorization: Bearer {token}` |
| **Storage Keys** | `adminToken`, `adminUser` (Admin only) |

---

## Three User Roles

```
1. SENIOR (elderly users)        → Senior App
   - No authentication required
   - Check-in, games, circle

2. FAMILY (caregivers)            → Caregiver Dashboard  
   - No authentication required
   - Monitor, analytics, reminders

3. ADMIN (administrators)         → Admin Portal
   - JWT authentication required
   - Full system management
```

---

## API Endpoints Quick List

### Authentication
```
POST /register        - Create user account
POST /login          - Login, get JWT token
```

### Protected Endpoints (requires token)
```
POST /checkin                  - Record check-in
POST /add-relation            - Link family member
POST /add-task               - Add engagement task
GET  /api/games              - List games
GET  /api/games/trivia       - Trivia questions
GET  /api/games/memory       - Memory cards
GET  /api/games/stretch      - Stretch exercises
POST /api/games/session/start     - Start game
POST /api/games/session/complete  - Complete game
GET  /api/games/history      - Game history
```

---

## File Locations

### Backend Authentication
- **Main**: `/api/app.js` (lines 73-88, 275-317)
- **Middleware**: `authenticateToken()` function
- **Schema**: User model with role enum

### Admin Portal Auth
- **Login**: `/front-end/admin-portal/src/pages/Login.tsx`
- **Guard**: `/front-end/admin-portal/src/components/ProtectedRoute.tsx`
- **API Client**: `/front-end/admin-portal/src/services/api.ts`
- **Router**: `/front-end/admin-portal/src/App.tsx`

### Senior App (No Auth)
- **Routes**: `/front-end/senior-app/src/App.tsx`
- **Pages**: `/front-end/senior-app/src/pages/*.tsx`

### Caregiver Dashboard (No Auth)
- **Routes**: `/front-end/caregiver-dashboard/src/App.tsx`
- **Pages**: `/front-end/caregiver-dashboard/src/pages/*.tsx`

---

## Authentication Flow (Admin Portal)

```
1. User submits credentials
   ↓
2. Login endpoint validates against MongoDB
   ↓
3. Password verified with bcrypt
   ↓
4. JWT token generated (7-day expiry)
   ↓
5. Token + User stored in localStorage
   ↓
6. Subsequent requests include Authorization header
   ↓
7. Middleware verifies token on each request
   ↓
8. If token invalid/expired → Redirect to /login
```

---

## Local Testing with cURL

### Register User
```bash
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin1",
    "password": "testpass123",
    "role": "admin",
    "profile": {
      "name": "Admin User",
      "email": "admin@example.com"
    }
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin1",
    "password": "testpass123"
  }'
```

### Protected Request (with token)
```bash
curl -X POST http://localhost:8080/checkin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{}'
```

---

## MongoDB User Document

```javascript
{
  userId: "550e8400-e29b-41d4-a716-446655440000",  // UUID
  username: "john_doe",                              // Unique
  passwordHash: "$2b$10$...",                        // bcrypt
  role: "senior" | "family" | "admin",              // Enum
  profile: {
    name: "John Doe",
    age: 75,
    email: "john@example.com",
    contact: "+1-555-0123"
  },
  createdAt: ISODate("2024-11-06T..."),
  updatedAt: ISODate("2024-11-06T...")
}
```

---

## Environment Variables

### Backend (.env)
```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/cloud
MQTT_BROKER_URL=mqtt://localhost:1883
JWT_SECRET=your-secret-key-here
SERVICE_NAME=api-gateway
```

### Frontend (.env)
```env
REACT_APP_API_GATEWAY=http://localhost:8080
REACT_APP_USE_MOCK_DATA=true  # for dev testing
```

---

## JWT Token Structure

### Header
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### Payload
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe",
  "role": "admin",
  "iat": 1730890000,
  "exp": 1731494800
}
```

### Signature
```
HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

---

## Router Configuration

### Admin Portal (React Router)
```
/login                    (public)
  └─ <ProtectedRoute>
      /dashboard          (admin only)
      /users
      /users/:id
      /services
      /analytics
      /settings
```

### Senior App (State-based tabs)
```
App
├─ Check-In Tab
├─ Circle Tab
└─ Activities Tab
    └─ Games (MorningStretch, MemoryQuiz, etc.)
```

### Caregiver Dashboard (State-based tabs)
```
App
├─ Dashboard Tab
├─ Analytics Tab
├─ Activities Tab
├─ Reminders Tab
└─ Settings Tab
```

---

## Common Issues & Solutions

### Issue: "Access denied. No token provided"
**Cause**: Missing Authorization header
**Fix**: Ensure token is sent with request

### Issue: "Invalid or expired token"
**Cause**: Token is malformed or expired
**Fix**: Re-login to get new token

### Issue: 401 Unauthorized
**Cause**: Token verification failed
**Fix**: Check JWT_SECRET matches between backend and token generation

### Issue: Login page appears but form won't submit
**Cause**: API endpoint not running
**Fix**: Start API gateway: `cd api && npm start`

---

## Security Notes

- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire after 7 days
- Tokens stored in localStorage (vulnerable to XSS)
- No refresh token mechanism currently
- Role-based access only implemented for admin portal

---

## For Development

### Mock Authentication
Enable mock mode in `.env`:
```env
REACT_APP_USE_MOCK_DATA=true
```

Then login with any credentials - backend not required.

### Populate Test Data
```bash
cd api
node populate.js
```

### Check User in Database
```bash
mongosh mongodb://localhost:27017/cloud
db.users.find().pretty()
```

---

## Next Steps for Completion

- [ ] Add authentication to Senior App
- [ ] Add authentication to Caregiver Dashboard
- [ ] Implement refresh tokens
- [ ] Add role-based middleware for protected routes
- [ ] Add password reset functionality
- [ ] Implement logout across all apps
- [ ] Add rate limiting for login attempts
- [ ] Add audit logging for auth events

