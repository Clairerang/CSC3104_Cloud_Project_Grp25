# Frontend Folder Structure Guide

This document explains the new standardized folder structure for all frontend applications.

## Structure Overview

Each frontend application (`senior-app`, `admin-portal`, `caregiver-dashboard`) now follows this structure:

```
src/
├── components/        # Reusable UI components
├── pages/            # Page-level components (screens/views)
├── services/         # API calls and business logic
├── types/            # TypeScript type definitions
└── theme/            # Theme configuration (if applicable)
```

---

## 1. Senior App (`front-end/senior-app`)

### Current Component Distribution

**Move to `pages/`:**
- `components/activities/ActivitiesScreen.tsx` → `pages/ActivitiesScreen.tsx`
- `components/checkin/CheckInScreen.tsx` → `pages/CheckInScreen.tsx`
- `components/circle/CircleScreen.tsx` → `pages/CircleScreen.tsx`
- `components/progress/ProgressScreen.tsx` → `pages/ProgressScreen.tsx`
- `components/schedule/ScheduleScreen.tsx` → `pages/ScheduleScreen.tsx`
- `components/games/CulturalTrivia.tsx` → `pages/CulturalTrivia.tsx`
- `components/games/MemoryQuiz.tsx` → `pages/MemoryQuiz.tsx`
- `components/games/MorningStretch.tsx` → `pages/MorningStretch.tsx`
- `components/games/ShareRecipe.tsx` → `pages/ShareRecipe.tsx`

**Keep in `components/`:**
- `components/common/Layout.tsx` (reusable layout component)
- `components/circle/ContactDetailModal.tsx` (reusable modal)

**Create in `services/`:**
- `services/api.ts` - API client configuration
- `services/games.ts` - Games service API calls (connect to games-service:8081)
- `services/checkin.ts` - Check-in API calls
- `services/activities.ts` - Activities API calls

**Create in `types/`:**
- `types/index.ts` - Common type exports
- `types/game.ts` - Game-related types
- `types/user.ts` - User-related types
- `types/activity.ts` - Activity-related types

---

## 2. Admin Portal (`front-end/admin-portal`)

### Current Component Distribution

**Move to `pages/`:**
- `components/auth/Login.tsx` → `pages/Login.tsx`
- `components/dashboard/DashboardHome.tsx` → `pages/DashboardHome.tsx`
- `components/users/UserList.tsx` → `pages/UserList.tsx`
- `components/users/UserDetail.tsx` → `pages/UserDetail.tsx`
- `components/analytics/Analytics.tsx` → `pages/Analytics.tsx`
- `components/settings/Settings.tsx` → `pages/Settings.tsx`
- `components/services/ServiceMonitor.tsx` → `pages/ServiceMonitor.tsx`

**Keep in `components/`:**
- `components/common/Layout.tsx` (reusable layout)
- `components/auth/ProtectedRoute.tsx` (reusable route guard)
- `components/dashboard/RecentActivity.tsx` (reusable widget)
- `components/dashboard/SystemHealth.tsx` (reusable widget)

**Existing `services/`:**
- Already has `services/api.ts` - Keep and organize API calls here

**Create in `types/`:**
- `types/index.ts` - Common type exports
- `types/user.ts` - User-related types
- `types/service.ts` - Service monitoring types
- `types/analytics.ts` - Analytics types

---

## 3. Caregiver Dashboard (`front-end/caregiver-dashboard`)

### Current Component Distribution

**Move to `pages/`:**
- `components/dashboard/Dashboard.tsx` → `pages/Dashboard.tsx`
- `components/activities/Activities.tsx` → `pages/Activities.tsx`
- `components/reminders/Reminders.tsx` → `pages/Reminders.tsx`
- `components/analytics/Analytics.tsx` → `pages/Analytics.tsx`
- `components/settings/Settings.tsx` → `pages/Settings.tsx`

**Keep in `components/`:**
- Any reusable UI components (if they exist)

**Existing folders:**
- `api/` - Can merge into `services/` for consistency

**Create in `services/`:**
- `services/api.ts` - API client configuration
- `services/activities.ts` - Activities API calls
- `services/reminders.ts` - Reminders API calls
- `services/analytics.ts` - Analytics API calls

**Create in `types/`:**
- `types/index.ts` - Common type exports
- `types/activity.ts` - Activity-related types
- `types/reminder.ts` - Reminder-related types
- `types/analytics.ts` - Analytics types

---

## Folder Purposes

### `components/`
- **Purpose:** Reusable UI components that can be used across multiple pages
- **Examples:** Layout, Header, Footer, Modal, Button, Card, Form fields
- **Naming:** PascalCase for component files (e.g., `Layout.tsx`, `ContactDetailModal.tsx`)

### `pages/`
- **Purpose:** Page-level components that represent entire screens/routes
- **Examples:** DashboardHome, Login, UserList, ActivitiesScreen
- **Naming:** PascalCase with descriptive names (e.g., `DashboardHome.tsx`, `CheckInScreen.tsx`)

### `services/`
- **Purpose:** API calls, business logic, data fetching
- **Examples:** API client, service methods for different features
- **Naming:** camelCase for service files (e.g., `api.ts`, `games.ts`, `checkin.ts`)

### `types/`
- **Purpose:** TypeScript type definitions and interfaces
- **Examples:** User types, Game types, API response types
- **Naming:** camelCase for type files (e.g., `user.ts`, `game.ts`, `index.ts`)

---

## Migration Steps

To move your existing components to this new structure:

### 1. Move Page Components
```bash
# Example for senior-app
mv front-end/senior-app/src/components/activities/ActivitiesScreen.tsx front-end/senior-app/src/pages/
mv front-end/senior-app/src/components/checkin/CheckInScreen.tsx front-end/senior-app/src/pages/
# ... repeat for all page components
```

### 2. Update Imports
After moving files, update all import statements in:
- `App.tsx`
- Other page components
- Route configurations

Example:
```typescript
// Before
import ActivitiesScreen from './components/activities/ActivitiesScreen';

// After
import ActivitiesScreen from './pages/ActivitiesScreen';
```

### 3. Create Service Files
Create API service files to connect to your microservices:

```typescript
// services/api.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  timeout: 10000,
});

export default apiClient;
```

```typescript
// services/games.ts
import apiClient from './api';

export const gamesService = {
  getGames: async () => {
    const response = await apiClient.get('/games');
    return response.data;
  },

  getTriviaQuestions: async () => {
    const response = await apiClient.get('/games/trivia');
    return response.data;
  },

  // Add more game-related API calls
};
```

### 4. Create Type Definitions
```typescript
// types/game.ts
export interface Game {
  id: string;
  name: string;
  description: string;
  type: 'trivia' | 'memory' | 'stretch' | 'recipe';
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}
```

---

## Benefits of This Structure

1. **Separation of Concerns:** Clear distinction between pages, components, and business logic
2. **Reusability:** Easy to identify and reuse components
3. **Maintainability:** Easier to find and update code
4. **Scalability:** Structure can grow with the application
5. **Consistency:** All frontend apps follow the same pattern
6. **Type Safety:** Centralized type definitions for TypeScript

---

## API Service Integration

Your frontend apps should connect to these microservices:

- **API Gateway:** `http://localhost:8080` (or via env var `REACT_APP_API_URL`)
- **Games Service:** `http://localhost:8081` (or via env var `REACT_APP_GAMES_URL`)

Configure in `.env` files:
```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_GAMES_URL=http://localhost:8081
```

---

## Next Steps

1. ✅ Folder structure created
2. ⏳ Move page components from `components/` to `pages/`
3. ⏳ Update import statements
4. ⏳ Create service files for API calls
5. ⏳ Create type definition files
6. ⏳ Update `.env` files with API URLs
7. ⏳ Test all functionality after reorganization
