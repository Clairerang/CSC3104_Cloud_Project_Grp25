# Unified Login System Guide

## Overview

All users (Admin, Seniors, Family/Caregivers) now login through the same authentication system and are automatically redirected to their respective dashboards based on their role.

## How It Works

```
┌─────────────────────────────────────┐
│   User enters credentials at any   │
│         login page (any port)       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Backend validates credentials      │
│  Returns: token + user info (role)  │
└──────────────┬──────────────────────┘
               │
               ▼
     ┌─────────┴─────────┐
     │  Check user.role   │
     └─────────┬──────────┘
               │
       ┌───────┼───────┐
       │       │       │
       ▼       ▼       ▼
    Admin  Senior  Family
       │       │       │
       ▼       ▼       ▼
   Port     Port    Port
   3001     3000    3002
```

## Login Endpoints

You can access the login page from **any** of these URLs:
- **http://localhost:3001/login** (Admin Portal)
- **http://localhost:3000/login** (Senior App) - *Coming soon*
- **http://localhost:3002/login** (Caregiver Dashboard) - *Coming soon*

All login pages function identically and redirect based on role.

## Test Accounts

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Redirects to**: http://localhost:3001/dashboard (Admin Portal)

### Creating Test Users

You can create senior and family accounts using the backend API:

#### Create Senior Account
```bash
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "senior1",
    "password": "password123",
    "role": "senior",
    "profile": {
      "name": "John Smith",
      "age": 75,
      "email": "john@example.com",
      "contact": "+65 9123 4567"
    }
  }'
```

#### Create Family Account
```bash
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "family1",
    "password": "password123",
    "role": "family",
    "profile": {
      "name": "Sarah Johnson",
      "age": 45,
      "email": "sarah@example.com",
      "contact": "+65 9234 5678"
    }
  }'
```

## Role-Based Redirects

| User Role | Login Credentials | Redirected To |
|-----------|-------------------|---------------|
| `admin` | username: `admin` | http://localhost:3001/dashboard |
| `senior` | username: `senior1` | http://localhost:3000/dashboard |
| `family` | username: `family1` | http://localhost:3002/dashboard |

## Architecture

### Frontend (3 Separate Apps)
- **Admin Portal** (port 3001) - Management dashboard
- **Senior App** (port 3000) - Senior-friendly interface
- **Caregiver Dashboard** (port 3002) - Family monitoring

### Backend (Unified API)
- **API Gateway** (port 8080) - Single authentication endpoint
- **MongoDB** (port 27017) - User database

### Authentication Flow

1. User enters credentials on any login page
2. Frontend sends POST request to `http://localhost:8080/login`
3. Backend validates against MongoDB
4. Backend returns JWT token + user object with role
5. Frontend stores token in localStorage as:
   - `authToken` - Generic token (all apps)
   - `adminToken` - Legacy compatibility
   - `user` - User object with role
6. Frontend reads `user.role` and redirects:
   - `admin` → stays/redirects to port 3001
   - `senior` → redirects to port 3000
   - `family` → redirects to port 3002

## Token Storage

Tokens are stored in localStorage with these keys:
```javascript
localStorage.setItem('authToken', token);      // Universal token
localStorage.setItem('user', JSON.stringify(user)); // User info with role
localStorage.setItem('adminToken', token);     // Legacy compatibility
localStorage.setItem('adminUser', JSON.stringify(user)); // Legacy
```

## Security Notes

⚠️ **Current Implementation**: For development only
- Tokens stored in localStorage (vulnerable to XSS)
- No token refresh mechanism
- No session timeout
- HTTP only (not HTTPS)

🔒 **Production Recommendations**:
- Use HTTP-only cookies for tokens
- Implement token refresh
- Add CSRF protection
- Enable HTTPS
- Add rate limiting
- Implement session timeout

## Testing the System

### 1. Start All Services
```bash
docker-compose up -d
```

### 2. Verify Services are Running
```bash
docker ps
```

You should see:
- `admin-portal` (port 3001)
- `senior-app` (port 3000)
- `caregiver-dashboard` (port 3002)
- `api-gateway` (port 8080)
- `mongodb-main` (port 27017)

### 3. Test Admin Login
1. Go to http://localhost:3001/login
2. Username: `admin`
3. Password: `admin123`
4. Should stay on http://localhost:3001/dashboard

### 4. Test Cross-App Login (After Creating Test Users)
1. Create a senior account (see above)
2. Go to http://localhost:3001/login (admin portal)
3. Login as `senior1` / `password123`
4. Should redirect to http://localhost:3000/dashboard

## Troubleshooting

### Login Fails
- Check if API is running: `docker logs api-gateway`
- Verify MongoDB is running: `docker ps | grep mongodb`
- Check network: `curl http://localhost:8080/`

### Wrong Redirect
- Clear localStorage: `localStorage.clear()` in browser console
- Verify user role in MongoDB:
  ```bash
  docker exec mongodb-main mongosh seniorcare --eval "db.users.find({username: 'admin'})"
  ```

### Can't Access Dashboard After Login
- Check if token is stored:
  - Open DevTools → Application → Local Storage
  - Look for `authToken` and `user` keys
- Verify redirect URL in browser network tab

## Next Steps

To fully implement routing in senior-app and caregiver-dashboard:

1. **Install react-router-dom** (if not already installed)
2. **Wrap App.tsx with Router**
3. **Add Protected Routes**
4. **Implement authentication check on load**

Would you like me to implement the full routing for the other two apps?

## API Endpoints

### Authentication
- `POST /login` - Login (all roles)
- `POST /register` - Create new user

### Protected Endpoints (Require JWT)
- `POST /checkin` - Daily check-in (seniors)
- `POST /add-task` - Add task (seniors)
- `POST /add-relation` - Link family member (seniors)
- `GET /api/games/*` - Game endpoints

## Environment Variables

### Admin Portal (.env)
```
REACT_APP_USE_MOCK_DATA=false
REACT_APP_API_GATEWAY=http://localhost:8080
```

### Senior App (.env) - *To be created*
```
REACT_APP_API_GATEWAY=http://localhost:8080
```

### Caregiver Dashboard (.env) - *To be created*
```
REACT_APP_API_GATEWAY=http://localhost:8080
```

## Questions?

- Check backend logs: `docker logs api-gateway`
- Check frontend logs: Browser DevTools Console
- Verify MongoDB data: `docker exec mongodb-main mongosh seniorcare`
