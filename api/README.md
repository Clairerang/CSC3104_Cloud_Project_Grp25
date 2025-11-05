1. npm install
2. npm run dev from /api folder


# Senior App - Basic API Structure

## Authentication
```
Authorization: Bearer <jwt_token>
```

## 1. USER & AUTHENTICATION
```typescript
// POST /auth/login
// GET /auth/verify
// POST /auth/logout

interface User {
  id: string;
  name: string;
  email: string;
  role: 'senior' | 'family' | 'admin';
}
```
## 2. CHECK-IN SYSTEM
```typescript
// POST /checkins
interface CheckInRequest {
  mood: 'great' | 'okay' | 'not-well';
  session: 'morning' | 'afternoon' | 'evening';
}

// GET /checkins/daily
interface DailyCheckIns {
  date: string;
  checkIns: CheckIn[];
  totalCheckIns: number;
}

## 3. SOCIAL CIRCLE (CONTACTS)
```typescript
// GET /contacts
// POST /contacts
// PUT /contacts/:id
// DELETE /contacts/:id

interface Contact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber?: string;
  isFavorite: boolean;
  lastCall?: string;
}

// POST /contacts/:id/call
interface CallRequest {
  type: 'voice' | 'video';
}

## 4. ACTIVITIES & GAMES
```typescript
// GET /activities
interface Activity {
  id: string;
  title: string;
  description: string;
  points: number;
  category: 'Exercise' | 'Mental' | 'Learning' | 'Social';
}

// POST /activities/:id/complete
interface CompleteActivityRequest {
  score?: number;
  duration: number;
}
```

---

## 5. GAMES - MEMORY & TRIVIA
```typescript
// GET /games/memory-quiz/cards
interface MemoryCard {
  id: string;
  emoji: string;
}

// POST /games/memory-quiz/complete
interface CompleteMemoryQuizRequest {
  moves: number;
  timeSpent: number;
  score: number;
}

// GET /games/cultural-trivia/questions
interface TriviaQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

// POST /games/cultural-trivia/complete
interface CompleteTriviaRequest {
  questionsAnswered: number;
  correctAnswers: number;
  score: number;
}

## 6. INVITATIONS
```typescript
// GET /invitations
interface Invitation {
  id: string;
  from: string;
  title: string;
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'declined';
}

// POST /invitations/:id/respond
interface RespondToInvitationRequest {
  status: 'accepted' | 'declined';
}
```

---

## 7. POINTS & PROGRESS
```typescript
// GET /gamification/stats
interface GamificationStats {
  totalPoints: number;
  currentStreak: number;
  level: number;
}
```

---

## 8. NOTIFICATIONS
```typescript
// GET /notifications
interface Notification {
  id: string;
  type: 'checkin_reminder' | 'invitation' | 'achievement';
  title: string;
  message: string;
  isRead: boolean;
}

// PUT /notifications/:id/read

## Core Endpoints Summary

| Feature | Endpoints | Purpose |
|---------|-----------|---------|
| **Auth** | `/auth/*` | Login, logout, verify |
| **Check-ins** | `/checkins` | Daily mood tracking |
| **Contacts** | `/contacts` | Social circle management |
| **Activities** | `/activities` | Game activities |
| **Memory Game** | `/games/memory-quiz` | Memory card game |
| **Trivia Game** | `/games/cultural-trivia` | Trivia questions |
| **Invitations** | `/invitations` | Event scheduling |
| **Progress** | `/gamification/stats` | Points & streaks |
| **Notifications** | `/notifications` | Alerts & reminders |

## Notes
- **Morning Stretch**: No API needed - just local timer/game logic
- **Share Recipe**: Can be simplified to just text submission
- **Media Upload**: Skip for now
- **Emergency**: Can be basic contact calling
- **Analytics**: Basic stats only

