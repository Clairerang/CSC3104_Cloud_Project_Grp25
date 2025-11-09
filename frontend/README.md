# Senior Care Platform - Unified Frontend

This is the unified frontend application that combines three separate applications into one:
- Admin Portal
- Caregiver Dashboard
- Senior App

## Structure

```
src/
├── admin/              # Admin Portal components and logic
├── caregiver/          # Caregiver Dashboard components and logic
├── senior/             # Senior App components and logic
├── theme/              # Shared theme configuration
├── types/              # Shared TypeScript types
├── App.tsx             # Main app with routing
└── index.tsx           # Entry point
```

## Routes

- `/senior` - Senior citizen interface with check-ins, activities, and games
- `/caregiver` - Caregiver dashboard for monitoring and managing seniors
- `/admin` - Admin portal for system management and analytics

## Getting Started

### Install dependencies
```bash
npm install
```

### Run development server
```bash
npm start
```

The app will open at http://localhost:3000 and will default to the senior app route.

### Build for production
```bash
npm build
```

## Technology Stack

- React 19.2.0
- TypeScript 4.9.5
- Material-UI 7.3.4
- React Router 7.9.4
- Recharts 3.3.0 (for analytics)
- Axios 1.12.2 (for API calls)

## Features by Section

### Senior App (`/senior`)
- Daily check-in system
- Contact circle management
- Activity tracking with points
- Interactive games (Morning Stretch, Memory Quiz, Cultural Trivia, Recipe Sharing)
- Emergency call button

### Caregiver Dashboard (`/caregiver`)
- Dashboard overview
- Analytics and reporting
- Activity monitoring
- Reminder management
- Settings

### Admin Portal (`/admin`)
- User management
- Service monitoring
- System analytics
- Settings and configuration
- Protected routes with authentication
