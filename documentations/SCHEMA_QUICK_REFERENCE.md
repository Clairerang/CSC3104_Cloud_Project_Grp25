# Database Schema - Quick Reference

## Quick Collection Overview

### Database: `senior_care` (Port 27017)

| Collection | Purpose | Key Fields | Primary Key |
|------------|---------|------------|-------------|
| **users** | User accounts | userId, username, role, profile | userId (unique) |
| **relationships** | Senior-family links | seniorId, linkAccId, relation | seniorId+linkAccId |
| **engagements** | Daily activity tracking | userId, date, checkIn, totalScore | userId+date |
| **games** | Game catalog | gameId, type, difficulty | gameId (unique) |
| **gamesessions** | Play sessions | sessionId, userId, gameId | sessionId (unique) |
| **exercises** | Exercise library | exerciseId, duration, videoUrl | exerciseId (unique) |
| **triviaquestions** | Trivia questions | questionId, question, options | questionId (unique) |
| **memorysets** | Memory card sets | setId, cards, theme | setId (unique) |

---

## Common Queries

### Users
```javascript
// Find user by username
db.users.findOne({ username: "john_doe" })

// Find all seniors
db.users.find({ role: "senior" })

// Find user with profile
db.users.findOne({ userId: "uuid-here" }, { passwordHash: 0 })
```

### Relationships
```javascript
// Find all family members of a senior
db.relationships.find({ seniorId: "senior-uuid" })

// Find all seniors monitored by a family member
db.relationships.find({ linkAccId: "family-uuid" })
```

### Engagements
```javascript
// Get user's engagement for specific date
db.engagements.findOne({ userId: "uuid", date: "2025-11-09" })

// Get user's last 7 days of engagement
db.engagements.find({
  userId: "uuid",
  date: { $gte: "2025-11-02" }
}).sort({ date: -1 })

// Calculate total score for a user
db.engagements.aggregate([
  { $match: { userId: "uuid" } },
  { $group: { _id: "$userId", total: { $sum: "$totalScore" } } }
])
```

### Games
```javascript
// Get all active games
db.games.find({ isActive: true })

// Get games by type and difficulty
db.games.find({ type: "trivia", difficulty: "easy", isActive: true })
```

### Game Sessions
```javascript
// Get user's completed games
db.gamesessions.find({
  userId: "uuid",
  isCompleted: true
}).sort({ completedAt: -1 })

// Get user's high scores
db.gamesessions.aggregate([
  { $match: { userId: "uuid", isCompleted: true } },
  { $group: {
      _id: "$gameId",
      highScore: { $max: "$score" },
      totalPlays: { $sum: 1 }
  }}
])
```

### Trivia Questions
```javascript
// Get random questions by difficulty
db.triviaquestions.aggregate([
  { $match: { difficulty: "easy", isActive: true } },
  { $sample: { size: 10 } }
])

// Get questions by category
db.triviaquestions.find({ category: "history", isActive: true })
```

---

## Field Type Reference

### Common Types
- **String**: Text data (UTF-8)
- **Number**: Integer or float
- **Boolean**: true/false
- **Date**: ISO 8601 datetime
- **ObjectId**: MongoDB's internal ID
- **Mixed**: Flexible schema (use sparingly)
- **[String]**: Array of strings

### Enum Values

**User Roles:**
- `senior` - Elderly user
- `family` - Family member/caregiver
- `admin` - System administrator

**Game Types:**
- `trivia` - Question & answer game
- `memory` - Card matching game
- `stretch` - Physical exercise

**Difficulty Levels:**
- `easy` - Beginner level
- `medium` - Intermediate level
- `hard` - Advanced level

---

## UUID Generation

All ID fields (userId, gameId, sessionId, etc.) should use UUID v4:

```javascript
const { v4: uuidv4 } = require('uuid');
const newId = uuidv4(); // e.g., "550e8400-e29b-41d4-a716-446655440000"
```

---

## Required Indexes (Already Implemented)

### users
- `userId`: unique
- `username`: unique (implicit)

### relationships
- `{ seniorId: 1, linkAccId: 1 }`: unique compound

### engagements
- `{ userId: 1, date: 1 }`: unique compound

### games
- `gameId`: unique

### gamesessions
- `sessionId`: unique
- `userId`: indexed
- `{ userId: 1, completedAt: -1 }`: compound

### exercises
- `exerciseId`: unique

### triviaquestions
- `questionId`: unique

### memorysets
- `setId`: unique

---

## Connection Strings

### Local Development
```
mongodb://localhost:27017/senior_care
```

### Docker Containers
```
mongodb://mongodb:27017/senior_care
```

---

## Sample Documents

### User (Senior)
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "mary_smith",
  "passwordHash": "$2b$10$...",
  "role": "senior",
  "profile": {
    "name": "Mary Smith",
    "age": 72,
    "email": "mary@example.com",
    "contact": "+1-555-0100"
  },
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

### Engagement
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2025-11-09",
  "checkIn": true,
  "tasksCompleted": [
    { "type": "trivia", "points": 50 },
    { "type": "stretch", "points": 30 }
  ],
  "totalScore": 80,
  "lastActiveAt": "2025-11-09T14:25:00.000Z"
}
```

### Game Session
```json
{
  "sessionId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "gameId": "a12b34c5-d678-90ef-1234-567890abcdef",
  "gameType": "trivia",
  "startedAt": "2025-11-09T14:20:00.000Z",
  "completedAt": "2025-11-09T14:25:00.000Z",
  "score": 8,
  "pointsEarned": 50,
  "correctAnswers": 8,
  "totalQuestions": 10,
  "isCompleted": true,
  "metadata": {
    "timePerQuestion": [15, 12, 18, 10, 20, 14, 16, 11, 13, 17]
  }
}
```

---

## Validation Rules Summary

| Field | Rule | Reason |
|-------|------|--------|
| userId | UUID v4 format | Globally unique, no collisions |
| username | Unique | Prevent duplicate accounts |
| passwordHash | Bcrypt (10+ rounds) | Security best practice |
| role | Enum | Data consistency |
| engagements.date | "YYYY-MM-DD" | Consistent date format |
| options (trivia) | Length = 4 | Game design requirement |
| correctAnswer | 0-3 | Must match options index |
| cards (memory) | 4-12 items | Game difficulty balance |
| difficulty | Enum | Consistent difficulty levels |

---

## Best Practices

### ✅ DO
- Use UUID v4 for all ID fields
- Hash passwords with bcrypt (10+ rounds)
- Validate enums at application level
- Use indexes for frequently queried fields
- Implement soft deletes for user data
- Keep timestamps consistent (createdAt, updatedAt)

### ❌ DON'T
- Expose passwordHash in API responses
- Use sequential IDs (use UUIDs instead)
- Store passwords in plain text
- Create circular references
- Delete users without handling relationships
- Use string concatenation in queries (use parameterized queries)

---

## Migration Checklist

When deploying schema changes:

- [ ] Update model definitions in code
- [ ] Create/update indexes
- [ ] Write data migration script
- [ ] Test on development data
- [ ] Backup production database
- [ ] Run migration on production
- [ ] Verify data integrity
- [ ] Update API documentation

---

## Support

For questions about the database schema:
1. Review `DATABASE_SCHEMA.md` for detailed documentation
2. Check this quick reference for common patterns
3. Review model files in `api/app.js` and `games-service/models/`
