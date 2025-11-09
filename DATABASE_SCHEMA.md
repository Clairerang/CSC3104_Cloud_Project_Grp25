# Senior Care Management System - Database Schema

## Overview
This document defines the standardized database schema for the Senior Care Management System. The system uses MongoDB across two separate databases:
- **cloud** database: User management, relationships, and engagement tracking
- **games** database: Gaming and wellness activities

## Database: `cloud` (Main API Service)

### Collection: `users`
Stores user accounts for seniors, family members, and administrators.

```javascript
{
  _id: ObjectId,
  userId: String (required, unique),          // UUID format
  username: String (required),                // Unique username
  passwordHash: String (required),            // Bcrypt hashed password
  role: String (required),                    // Enum: ['senior', 'family', 'admin']
  profile: {
    name: String,                            // Full name
    age: Number,                             // Age in years
    email: String,                           // Email address
    contact: String                          // Phone number or contact info
  },
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**
- `userId`: unique
- `username`: unique (implicit from schema)

**Validation Rules:**
- `role` must be one of: 'senior', 'family', 'admin'
- `passwordHash` should be bcrypt hashed with salt rounds ≥ 10
- `userId` should be generated using UUID v4

---

### Collection: `relationships`
Links senior users with family members or caregivers.

```javascript
{
  _id: ObjectId,
  seniorId: String (required),               // userId of the senior
  linkAccId: String (required),              // userId of the linked account (family/caregiver)
  relation: String (required),               // e.g., "son", "daughter", "caregiver", "spouse"
  createdAt: Date (default: Date.now)
}
```

**Indexes:**
- `{ seniorId: 1, linkAccId: 1 }`: unique compound index
- Ensures one relationship per senior-family pair

**Validation Rules:**
- Both `seniorId` and `linkAccId` must reference valid `userId` from users collection
- Cannot create duplicate relationships

---

### Collection: `engagements`
Tracks daily engagement activities and check-ins for users.

```javascript
{
  _id: ObjectId,
  userId: String (required),                 // User who performed activities
  date: String (required),                   // Date in format "YYYY-MM-DD"
  checkIn: Boolean (default: false),         // Daily check-in status
  tasksCompleted: [
    {
      type: String,                          // Task type (e.g., "game", "exercise", "social")
      points: Number (default: 0)            // Points earned for task
    }
  ],
  totalScore: Number (default: 0),           // Sum of all points for the day
  lastActiveAt: Date (default: Date.now),    // Last activity timestamp
  createdAt: Date (auto-generated),          // Mongoose timestamp
  updatedAt: Date (auto-generated)           // Mongoose timestamp
}
```

**Indexes:**
- `{ userId: 1, date: 1 }`: unique compound index
- Ensures one engagement record per user per day

**Validation Rules:**
- `date` format must be "YYYY-MM-DD"
- `totalScore` should equal sum of `tasksCompleted.points`

---

## Database: `games` (Games Microservice)

### Collection: `games`
Master list of available games/activities.

```javascript
{
  _id: ObjectId,
  gameId: String (required, unique),         // UUID format
  name: String (required),                   // Display name of game
  type: String (required),                   // Enum: ['trivia', 'memory', 'stretch']
  description: String (required),            // Game description
  points: Number (required, default: 10),    // Base points awarded
  difficulty: String,                        // Enum: ['easy', 'medium', 'hard']
                                            // Default: 'easy'
  isActive: Boolean (default: true),         // Whether game is available
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**
- `gameId`: unique

**Pre-save Hook:**
- Updates `updatedAt` timestamp on every save

**Validation Rules:**
- `type` must be one of: 'trivia', 'memory', 'stretch'
- `difficulty` must be one of: 'easy', 'medium', 'hard'
- `points` must be positive number

---

### Collection: `gamesessions`
Records of individual game play sessions.

```javascript
{
  _id: ObjectId,
  sessionId: String (required, unique),      // UUID format
  userId: String (required, indexed),        // Player's userId
  gameId: String (required),                 // Reference to games collection
  gameType: String (required),               // Enum: ['trivia', 'memory', 'stretch']
  startedAt: Date (default: Date.now),       // Session start time
  completedAt: Date,                         // Session completion time (null if ongoing)
  score: Number (default: 0),                // Game-specific score
  pointsEarned: Number (default: 0),         // Points credited to user
  moves: Number,                             // (For memory game) Number of moves
  correctAnswers: Number,                    // (For trivia) Correct answers count
  totalQuestions: Number,                    // (For trivia) Total questions
  isCompleted: Boolean (default: false),     // Completion status
  metadata: Mixed (default: {}),             // Flexible field for game-specific data
}
```

**Indexes:**
- `sessionId`: unique
- `userId`: indexed for fast user queries
- `{ userId: 1, completedAt: -1 }`: compound index for user history queries

**Validation Rules:**
- `gameType` must match the referenced game's type
- `completedAt` should be set when `isCompleted` is true
- `score` and `pointsEarned` must be non-negative

---

### Collection: `exercises`
Stretch and physical exercise library.

```javascript
{
  _id: ObjectId,
  exerciseId: String (required, unique),     // UUID format
  name: String (required),                   // Exercise name
  description: String (required),            // Exercise instructions
  duration: Number (required, default: 30),  // Duration in seconds
  image: String (default: '🧘'),             // Emoji or image URL
  videoUrl: String (required),               // Link to demonstration video
  order: Number (default: 0),                // Display order in UI
  difficulty: String,                        // Enum: ['easy', 'medium', 'hard']
                                            // Default: 'easy'
  isActive: Boolean (default: true),         // Whether exercise is available
  createdAt: Date (default: Date.now)
}
```

**Indexes:**
- `exerciseId`: unique
- Consider adding index on `order` for sorted queries

**Validation Rules:**
- `difficulty` must be one of: 'easy', 'medium', 'hard'
- `duration` must be positive number (in seconds)
- `videoUrl` should be valid URL format

---

### Collection: `triviaquestions`
Question bank for trivia games.

```javascript
{
  _id: ObjectId,
  questionId: String (required, unique),     // UUID format
  question: String (required),               // Question text
  options: [String] (required),              // Array of 4 answer choices
  correctAnswer: Number (required),          // Index of correct option (0-3)
  fact: String (required),                   // Educational fact/explanation
  category: String (default: 'general'),     // Question category
  difficulty: String,                        // Enum: ['easy', 'medium', 'hard']
                                            // Default: 'easy'
  isActive: Boolean (default: true),         // Whether question is in rotation
  createdAt: Date (default: Date.now)
}
```

**Indexes:**
- `questionId`: unique
- Consider adding index on `{ category: 1, difficulty: 1 }` for filtered queries

**Validation Rules:**
- `options` must have exactly 4 elements
- `correctAnswer` must be between 0 and 3
- `difficulty` must be one of: 'easy', 'medium', 'hard'

---

### Collection: `memorysets`
Card sets for memory matching games.

```javascript
{
  _id: ObjectId,
  setId: String (required, unique),          // UUID format
  name: String (required),                   // Set name
  cards: [String] (required),                // Array of unique card identifiers
  theme: String (default: 'fruits'),         // Theme category
  difficulty: String,                        // Enum: ['easy', 'medium', 'hard']
                                            // Default: 'easy'
  isActive: Boolean (default: true),         // Whether set is available
  createdAt: Date (default: Date.now)
}
```

**Indexes:**
- `setId`: unique

**Validation Rules:**
- `cards` must have between 4 and 12 elements
- All cards in array should be unique
- `difficulty` must be one of: 'easy', 'medium', 'hard'

---

## Naming Conventions

### Field Naming
- Use camelCase for all field names (e.g., `userId`, `createdAt`)
- Use descriptive names (avoid abbreviations unless widely understood)
- ID fields should follow pattern: `{entity}Id` (e.g., `gameId`, `userId`)

### Collection Naming
- Use lowercase plural nouns (e.g., `users`, `games`)
- MongoDB will auto-pluralize model names (e.g., `User` → `users`)

### Date Fields
- Always use Date type for timestamps
- Standard timestamp fields: `createdAt`, `updatedAt`
- Use ISO 8601 format for date strings when needed

---

## Data Integrity Rules

### Cross-Database References
⚠️ **Important**: The system uses two separate databases. Cross-database foreign key constraints are NOT enforced by MongoDB.

**Manual Integrity Checks Required:**
1. `gamesessions.userId` must exist in `cloud.users.userId`
2. `gamesessions.gameId` should exist in `games.games.gameId`
3. `engagements.userId` must exist in `cloud.users.userId`
4. `relationships.seniorId` and `relationships.linkAccId` must exist in `cloud.users.userId`

**Recommended Practices:**
- Implement application-level validation before creating cross-database references
- Use UUID v4 for all ID fields to prevent collisions
- Consider implementing soft deletes (`isDeleted` flag) instead of hard deletes

### Cascading Deletes
When deleting a user, consider:
- Delete or anonymize all `engagements` records
- Delete all `relationships` where user is seniorId or linkAccId
- Keep `gamesessions` for analytics (mark as orphaned or anonymize userId)

---

## Performance Optimization

### Recommended Additional Indexes

**cloud.engagements:**
```javascript
db.engagements.createIndex({ "userId": 1, "lastActiveAt": -1 });
db.engagements.createIndex({ "date": 1 });
```

**games.gamesessions:**
```javascript
db.gamesessions.createIndex({ "gameId": 1, "completedAt": -1 });
db.gamesessions.createIndex({ "userId": 1, "gameType": 1, "completedAt": -1 });
```

**games.triviaquestions:**
```javascript
db.triviaquestions.createIndex({ "category": 1, "difficulty": 1, "isActive": 1 });
```

**games.exercises:**
```javascript
db.exercises.createIndex({ "difficulty": 1, "isActive": 1, "order": 1 });
```

---

## Migration Scripts

### Adding New Fields (Example)
When adding new fields to existing collections, ensure backwards compatibility:

```javascript
// Example: Adding 'preferences' field to users
db.users.updateMany(
  { preferences: { $exists: false } },
  { $set: { preferences: {} } }
);
```

### Updating Enum Values
When changing enum values, ensure all existing documents are updated:

```javascript
// Example: Renaming difficulty level
db.games.updateMany(
  { difficulty: 'beginner' },
  { $set: { difficulty: 'easy' } }
);
```

---

## Security Considerations

1. **Password Storage**: Always use bcrypt with minimum 10 salt rounds
2. **Sensitive Data**: Never log or expose `passwordHash` in API responses
3. **Input Validation**: Validate all user inputs before database operations
4. **Injection Prevention**: Use Mongoose query builders, avoid string concatenation
5. **Access Control**: Implement JWT-based authentication and role-based access

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-09 | Initial schema documentation |

---

## Entity Relationship Diagram

```
┌─────────────┐
│    users    │
└──────┬──────┘
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌──────────────┐   ┌──────────────┐
│relationships │   │ engagements  │
└──────────────┘   └──────────────┘

Database: games
┌──────────────┐
│    games     │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────────┐
│ gamesessions │────▶│ triviaquestions  │
└──────────────┘     └──────────────────┘
       │             ┌──────────────────┐
       └────────────▶│   memorysets     │
                     └──────────────────┘
                     ┌──────────────────┐
                     │    exercises     │
                     └──────────────────┘
```

Note: Dashed lines (──▶) indicate cross-database references that must be validated at the application level.
