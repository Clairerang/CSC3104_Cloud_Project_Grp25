# Authentication & Routing Architecture Overview

## Project Context
**System**: Senior Care Management System (Cloud-based)
**Framework**: React with TypeScript + Node.js Express Backend
**Architecture**: Microservices with MQTT communication
**Authentication**: JWT-based with localStorage for client-side storage

---

## 1. USER ROLES IN THE SYSTEM

### Three Primary Roles Defined:
```typescript
// From API (api/app.js - userSchema)
role: { 
  type: String, 
  enum: ['senior', 'family', 'admin'],
  required: true 
}
```

### Role Breakdown:

#### 1.1 SENIOR (Elderly/Senior User)
- **App**: Senior App (`front-end/senior-app`)
- **Purpose**: For elderly users to interact with games, check-ins, and their care network
- **Key Features**:
  - Check-in tracking
  - Games and activities (Memory Quiz, Cultural Trivia, Morning Stretch, Share Recipe)
  - Circle of contacts (family and caregivers)
  - Progress tracking
  - Emergency call button
- **Authentication**: Currently NO login system (direct access to app)

#### 1.2 FAMILY (Caregiver/Family Members)
- **App**: Caregiver Dashboard (`front-end/caregiver-dashboard`)
- **Purpose**: For family members to monitor seniors and provide care support
- **Key Features**:
  - View assigned seniors' activities
  - Analytics and engagement tracking
  - Reminders management
  - Participant dashboard
- **Authentication**: Currently NO login system (direct access to app)

#### 1.3 ADMIN (Administrator)
- **App**: Admin Portal (`front-end/admin-portal`)
- **Purpose**: System administration and management
- **Key Features**:
  - User management
  - Service monitoring
  - Analytics and reporting
  - System health checks
- **Authentication**: IMPLEMENTED with JWT + localStorage

---

## 2. CURRENT AUTHENTICATION SYSTEM

### 2.1 Backend Authentication (API Gateway - Port 8080)

**Location**: `/Users/angcl/Documents/GitHub/CSC3104_Cloud-_Project_Grp25/api/app.js`

**Database Schema**:
```javascript
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['senior', 'family', 'admin'], required: true },
  profile: {
    name: String,
    age: Number,
    email: String,
    contact: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

**Key Endpoints**:

| Endpoint | Method | Purpose | Protected |
|----------|--------|---------|-----------|
| `/register` | POST | User registration | No |
| `/login` | POST | User login, returns JWT token | No |
| `/checkin` | POST | Record daily check-in | Yes |
| `/add-relation` | POST | Link family members to senior | Yes |
| `/add-task` | POST | Add engagement tasks | Yes |

**JWT Implementation**:
```javascript
// Token Creation (Line 293-301)
const token = jwt.sign(
  {
    userId: user.userId,
    username: user.username,
    role: user.role
  },
  JWT_SECRET,
  { expiresIn: '7d' }
);

// Authentication Middleware (Line 73-88)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}
```

**Login Flow**:
1. User submits credentials (username, password)
2. API validates against MongoDB
3. Password verified using bcrypt
4. JWT token generated (7-day expiration)
5. Token + User info returned to client

---

### 2.2 Frontend Authentication

#### Admin Portal (ONLY app with login)
**Location**: `/front-end/admin-portal`

**Login Component**: `src/pages/Login.tsx`
```typescript
// Storage Keys
localStorage.setItem('adminToken', token);
localStorage.setItem('adminUser', JSON.stringify(user));

// Expected user structure
{
  id: string,
  name: string,
  email: string,
  role: 'admin'
}
```

**Protected Route Component**: `src/components/ProtectedRoute.tsx`
```typescript
const isAuthenticated = () => {
  const token = localStorage.getItem('adminToken');
  const user = localStorage.getItem('adminUser');
  
  if (!token || !user) return false;
  
  try {
    const userData = JSON.parse(user);
    return userData.role === 'admin';
  } catch {
    return false;
  }
};
```

**Mock Authentication** (for development):
- Can be enabled via `REACT_APP_USE_MOCK_DATA=true` env variable
- Creates mock token and user for testing without backend

**API Client Interceptors** (`src/services/api.ts`):
```typescript
// Request Interceptor: Adds JWT token to Authorization header
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Clears auth on 401 and redirects to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### Senior App & Caregiver Dashboard
- **NO authentication system currently**
- Direct access to all features
- No login screens
- No protected routes

---

## 3. ROUTING STRUCTURE

### 3.1 Admin Portal Routing
**Location**: `/front-end/admin-portal/src/App.tsx`

**Framework**: React Router v7

```typescript
<BrowserRouter>
  <Routes>
    {/* Public Routes */}
    <Route path="/login" element={<Login />} />
    
    {/* Protected Routes */}
    <Route element={<ProtectedRoute />}>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="/services" element={<ServiceMonitor />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Route>

    {/* 404 Route */}
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
</BrowserRouter>
```

**Routes**:
| Path | Component | Protected | Purpose |
|------|-----------|-----------|---------|
| `/login` | Login | No | Admin login page |
| `/dashboard` | DashboardHome | Yes | Main dashboard |
| `/users` | UserList | Yes | User management |
| `/users/:id` | UserDetail | Yes | User details |
| `/services` | ServiceMonitor | Yes | Service health |
| `/analytics` | Analytics | Yes | Analytics dashboard |
| `/settings` | Settings | Yes | System settings |

---

### 3.2 Senior App Routing
**Location**: `/front-end/senior-app/src/App.tsx`

**Framework**: State-based navigation (NO React Router)

**Navigation Method**: Tab-based using React state
```typescript
const [activeTab, setActiveTab] = useState<Tab>("check-in");
const [activeGame, setActiveGame] = useState<string | null>(null);
```

**Tabs/Screens**:
| Tab Name | Component | Purpose |
|----------|-----------|---------|
| `check-in` | CheckInScreen | Daily mood/health check-in |
| `circle` | CircleScreen | View family contacts |
| `activities` | ActivitiesScreen | Browse available games/activities |

**Game Screens** (overlays):
| Game ID | Component | Type |
|---------|-----------|------|
| "1" | MorningStretch | Exercise routine |
| "2" | MemoryQuiz | Cognitive game |
| "3" | CulturalTrivia | Knowledge game |
| "4" | ShareRecipe | Social activity |

**Architecture**:
```
App Component
├── If activeGame is set:
│   └── Display Game Component (MorningStretch, MemoryQuiz, etc.)
└── Else:
    ├── CheckInScreen (check-in tab)
    ├── CircleScreen (circle tab)
    ├── ActivitiesScreen (activities tab)
    ├── Emergency Button (fixed position)
    └── Bottom Navigation (tab switcher)
```

---

### 3.3 Caregiver Dashboard Routing
**Location**: `/front-end/caregiver-dashboard/src/App.tsx`

**Framework**: State-based navigation (NO React Router)

**Navigation Method**: Sidebar + React state
```typescript
const [activeTab, setActiveTab] = useState<Tab>("dashboard");
```

**Tabs/Screens**:
| Tab Name | Component | Purpose |
|----------|-----------|---------|
| `dashboard` | Dashboard | Main dashboard view |
| `analytics` | Analytics | Engagement analytics |
| `activities` | Activities | Activity management |
| `reminders` | Reminders | Reminder management |
| `settings` | Settings | Settings page |

**Architecture**:
```
App Component
├── Sidebar Navigation (left panel)
└── Main Content Area
    ├── Dashboard
    ├── Analytics
    ├── Activities
    ├── Reminders
    └── Settings
```

---

## 4. FRONTEND FRAMEWORK DETAILS

### All Frontend Apps Use:
- **React**: v19.2.0
- **TypeScript**: v4.9.5
- **UI Library**: Material-UI (MUI)
  - Admin Portal: v5.15.21
  - Senior App: v7.3.4
  - Caregiver Dashboard: v7.3.4
- **Build Tool**: React Scripts v5.0.1
- **Styling**: MUI Emotion (CSS-in-JS)

### Admin Portal Additional Dependencies:
- **React Router DOM**: v7.9.4 (only app using routing)
- **Axios**: v1.12.2 (HTTP client)
- **Recharts**: v3.3.0 (charts/graphs)

### Senior App & Caregiver Dashboard:
- **Recharts**: v3.3.0 (charts/graphs)
- No HTTP client library currently (would need axios/fetch)

---

## 5. GAMES SERVICE INTEGRATION

**Location**: `/api/routes/games.js`

**Endpoints** (all protected with authenticateToken middleware):

| Endpoint | Method | Purpose | Payload |
|----------|--------|---------|---------|
| `/api/games` | GET | List available games | - |
| `/api/games/trivia` | GET | Get trivia questions | `?count=3` |
| `/api/games/memory` | GET | Get memory cards | `?difficulty=easy` |
| `/api/games/stretch` | GET | Get exercises | - |
| `/api/games/session/start` | POST | Start game session | `{ gameId, gameType }` |
| `/api/games/session/complete` | POST | Complete session | `{ sessionId, score, ... }` |
| `/api/games/history` | GET | Get game history | `?limit=10` |

**Communication**: MQTT to Games Microservice (Port 8081)

---

## 6. API CONFIGURATION

### Environment Variables

**API Gateway (.env)**:
```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/cloud
MQTT_BROKER_URL=mqtt://localhost:1883
JWT_SECRET=your-secret-key-here
SERVICE_NAME=api-gateway
```

**Admin Portal (.env)**:
```env
REACT_APP_API_GATEWAY=http://localhost:4000  # or 8080
REACT_APP_USE_MOCK_DATA=true  # for development
```

### API Service Architecture (Admin Portal)

**Base URL**: `http://localhost:4000` (configurable)

**API Groups**:
1. **Auth**: `/api/v1/auth/login`, `/api/v1/auth/logout`
2. **Users**: `/api/v1/users/*`
3. **Engagement**: `/api/v1/engagement/*`
4. **Gamification**: `/api/v1/gamification/*`
5. **Notifications**: `/api/v1/notifications/*`
6. **System**: `/health/*`, `/api/v1/system/*`
7. **Analytics**: `/api/v1/analytics/*`
8. **Settings**: `/api/v1/settings/*`

---

## 7. CURRENT AUTHENTICATION STATUS SUMMARY

|      Feature     |  Admin Portal    | Senior App | Caregiver Dashboard |
|------------------|------------------|------------|---------------------|
| Login Page       | ✅ Implemented   | ❌ None     | ❌ None             |
| Protected Routes | ✅ Yes           | ❌ No       | ❌ No               |
| JWT Support      | ✅ Yes           | ❌ No       | ❌ No               |
| Role Checking    | ✅ Admin only    | ❌ No       | ❌ No               |
| Token Storage    | ✅ localStorage  | ❌ N/A      | ❌ N/A              |
| API Client       | ✅ Axios         | ❌ None     | ❌ None             |
| Mock Auth        | ✅ Yes           | ❌ No       | ❌ No               |

---

## 8. AUTHENTICATION FLOW DIAGRAMS

### Admin Portal Login Flow
```
User (Browser)
    │
    ├─→ Login Page
    │   ├─→ Enter credentials
    │   └─→ Submit form
    │
    ├─→ API Gateway (/login)
    │   ├─→ Check username/password
    │   ├─→ Verify password with bcrypt
    │   └─→ Return JWT token + user
    │
    ├─→ Store in localStorage
    │   ├─→ adminToken
    │   └─→ adminUser (JSON)
    │
    ├─→ Protected Route Check
    │   ├─→ Verify token exists
    │   ├─→ Verify role === 'admin'
    │   └─→ Allow/Deny access
    │
    └─→ Dashboard (if authorized)
```

### Senior App Flow (Current)
```
User (Browser)
    │
    └─→ Direct Access to Senior App
        ├─→ No authentication
        ├─→ No login required
        └─→ Full access to all features
```

### API Request with JWT
```
Frontend
    │
    ├─→ Create Request
    │   └─→ Add header: Authorization: Bearer {token}
    │
    ├─→ API Gateway Middleware
    │   ├─→ Extract token from header
    │   ├─→ Verify token signature
    │   ├─→ Verify not expired (7 days)
    │   └─→ Attach user to req.user
    │
    └─→ Route Handler
        └─→ Access req.user data
```

---

## 9. KEY FILES REFERENCE

### Backend
- **Main API**: `/api/app.js` (348 lines)
  - User schema, authentication, relationships
- **Games Routes**: `/api/routes/games.js` (212 lines)
  - Game endpoints with auth middleware
- **Packages**: `/api/package.json`
  - bcrypt, jwt, express, mongoose

### Frontend - Admin Portal
- **App**: `/front-end/admin-portal/src/App.tsx` (100 lines)
  - Main routing with ProtectedRoute
- **Login**: `/front-end/admin-portal/src/pages/Login.tsx` (207 lines)
  - Login form and mock auth
- **ProtectedRoute**: `/front-end/admin-portal/src/components/ProtectedRoute.tsx` (28 lines)
  - Route guard component
- **Layout**: `/front-end/admin-portal/src/components/Layout.tsx` (281 lines)
  - Navigation and logout
- **API Service**: `/front-end/admin-portal/src/services/api.ts` (225 lines)
  - Axios client with interceptors

### Frontend - Senior App
- **App**: `/front-end/senior-app/src/App.tsx` (196 lines)
  - Tab-based navigation, game handling
- **Pages**: Various screen components in `/src/pages/`
  - No authentication logic

### Frontend - Caregiver Dashboard
- **App**: `/front-end/caregiver-dashboard/src/App.tsx` (102 lines)
  - Sidebar navigation
- **Pages**: Various page components in `/src/pages/`
  - No authentication logic

---

## 10. RECOMMENDATIONS FOR IMPLEMENTATION

### For Senior App Authentication:
1. Add Login page component
2. Add ProtectedRoute wrapper
3. Integrate axios/fetch client
4. Store JWT in localStorage
5. Implement role checking for 'senior' role
6. Update App.tsx to use React Router

### For Caregiver Dashboard Authentication:
1. Add Login page component
2. Add ProtectedRoute wrapper
3. Integrate axios/fetch client
4. Store JWT in localStorage
5. Implement role checking for 'family' role
6. Update App.tsx to use React Router

### Backend Enhancements:
1. Add role-based middleware for routes
2. Implement refresh token mechanism
3. Add password reset functionality
4. Add audit logging for auth events
5. Implement rate limiting for login attempts

---

