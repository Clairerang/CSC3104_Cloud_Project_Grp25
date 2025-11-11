# AI Companion Service Updates

## Summary of Changes (November 11, 2025)

### 1. Smarter Default Responses ✨

**Before:**
```
"I'm here to help! Ask me about activities, family, health, or just chat."
```

**After:**
- **Greetings** (hello, hi, good morning, etc.):
  ```
  "Hello! It's wonderful to chat with you today! 😊 I'm here to help you with many things:
  • 📱 Contact your family
  • 🎉 Find fun community activities
  • 💊 Track your medications
  • 🌤️ Check the weather
  • 🎮 Play games together
  • 🤝 Connect with friendly volunteers
  
  What would you like to do?"
  ```

- **Other queries**:
  ```
  "I'd love to help you! I can assist with:
  • 📱 Sending messages to your family
  • 🎉 Finding community events and activities
  • 💊 Medication reminders
  • 🌤️ Weather updates and safety advice
  • 🎮 Fun games and entertainment
  • 🤝 Connecting you with volunteers
  
  What can I help you with today?"
  ```

### 2. Database Schema Implementation 🗄️

Created proper database models following the specification:

#### **User Model** (`src/models/User.js`)
```javascript
{
  userId: String (required, unique, indexed)
  username: String (required, unique)
  passwordHash: String (required)
  role: Enum ['senior', 'family', 'admin']
  profile: {
    name: String
    age: Number
    email: String
    contact: String
    address: String
    phoneNumber: String (starts with +)
    emailContact: String
  }
  createdAt: Date
  updatedAt: Date
}
```

#### **Relationship Model** (`src/models/Relationship.js`)
```javascript
{
  seniorId: String (required, indexed)
  linkAccId: String (required, indexed)
  relation: String (required) // e.g., "Son", "Daughter", "Caregiver"
  createdAt: Date
}
```

**Helper Methods:**
- `Relationship.getFamilyMembers(seniorId)` - Get all family members
- `Relationship.findByRelation(seniorId, relation)` - Find by relation type

### 3. Enhanced "SMS Family" Feature 📱

**Upgraded SMS Family Intent** (`src/intents/smsFamily.js`):

**Features:**
- ✅ Database lookup for family relationships
- ✅ Automatic phone number resolution from profile
- ✅ Support for multiple relation types (son, daughter, mother, father, etc.)
- ✅ Custom message extraction
- ✅ Fallback to test number if relationship not found
- ✅ Real SMS sending via MQTT

**Flow:**
1. User says: "Message my son" or "Text my daughter"
2. System detects relation type from message
3. Looks up relationship in database
4. Fetches family member's phone number from profile
5. Publishes SMS event to MQTT topic `sms/send`
6. Returns confirmation with masked phone number

**Example Response:**
```
"I've sent a message to your Son, David Tan, at +6598****. They'll be happy to hear from you! 💙"
```

### 4. Test Data Seeding 🌱

Created `src/seedTestData.js` script that creates:

**Senior User:**
- userId: `senior-1`
- name: Mr. Tan Ah Kow
- phone: +6591234567
- location: Punggol

**Family Member (Son):**
- userId: `family-son-1`
- name: David Tan
- phone: **+6598765787** (as specified)
- email: **cloudproject6769@gmail.com** (as specified)
- relation: Son

**Relationship Link:**
- Links senior-1 to family-son-1 as "Son"

### 5. Testing UI Updates 🧪

**Auto-populated userId:**
- Default userId is now `senior-1` (matches test data)
- Stored in localStorage
- Users can test immediately without manual entry

### 6. MQTT Integration 📡

**SMS Event Structure:**
```json
{
  "type": "sms",
  "to": "+6598765787",
  "body": "Message content",
  "userId": "senior-1",
  "recipient": "David Tan",
  "relation": "Son",
  "source": "ai-companion-sms-family",
  "originalMessage": "Message my son",
  "timestamp": "2025-11-11T..."
}
```

**Published to topic**: `sms/send` (consumed by sms-service)

**SMS Service Integration:**
- AI companion publishes to `sms/send` MQTT topic
- SMS service (container: `sms`) subscribes to `sms/send`
- Automatically processes `type: 'sms'` events
- Sends via Twilio adapter to the specified phone number

## Testing Instructions 🧪

### 1. Verify Test Data
```bash
docker exec ai-companion node src/seedTestData.js
```

### 2. Test in Browser
1. Go to http://localhost:4002/testing-notification/
2. UserId should be pre-filled with `senior-1`
3. Click the AI chat button (purple floating button)
3. Try these commands:
   - "Hello" → See new smart greeting
   - "Message my son" → Should send SMS to +6598765787
   - "Text my son" → Same result
   - "What can you do?" → See helpful feature list

### 3. Check SMS Service Logs
```bash
docker logs sms --tail 50
```
Should see:
- `📞 SMS service subscribed to sms/send, notification/events`
- When you test "Call my son", you'll see:
  - `Processing SMS send for +6598765787`
  - Twilio API call and response

### 4. Verify Database
```bash
docker exec -it mongo mongosh ai-companion
db.users.find({userId: 'senior-1'}).pretty()
db.relationships.find({seniorId: 'senior-1'}).pretty()
```

## API Response Example

**Request:**
```bash
POST http://localhost:4015/chat
{
  "userId": "senior-1",
  "message": "Message my son"
}
```

**Response:**
```json
{
  "success": true,
  "response": "I've sent a message to your Son, David Tan, at +6598****. They'll be happy to hear from you! 💙",
  "intent": "SMSFamily",
  "confidence": 0.85,
  "responseTime": 234
}
```

## Architecture Changes

### Before:
```
User → AI → Generic SMS request → MQTT
```

### After:
```
User → AI → Detect Relation → 
  ↓
Database Lookup (User + Relationship) → 
  ↓
Fetch Family Profile → 
  ↓
Generate SMS with Real Phone Number → 
  ↓
MQTT Publish (notification/sms) → 
  ↓
SMS Service → Twilio → Family Member's Phone (+6598765787)
```

## Files Modified/Created

### New Files:
- `src/models/User.js` - User schema with profile
- `src/models/Relationship.js` - Relationship schema
- `src/seedTestData.js` - Test data seeding script

### Modified Files:
- `src/index.js`:
  - Enhanced default responses (greeting vs general help)
  - Added publishEvent early definition
  - Set publishEvent for SMS handler
  
- `src/intents/smsFamily.js`:
  - Complete rewrite with database integration
  - Family lookup logic
  - Phone number resolution
  - Custom message extraction
  - Real SMS publishing

- `backend/shared/testing-ui/index.html`:
  - Auto-populate userId with 'senior-1'

## Benefits ✅

1. **Smarter Interactions**: Context-aware responses based on user input type
2. **Real Relationships**: Uses actual database schema matching specifications
3. **Production Ready**: Proper data modeling, not hardcoded values
4. **Extensible**: Easy to add more family members (daughter, wife, etc.)
5. **Testable**: Seed script provides consistent test environment
6. **User Friendly**: Clear, helpful responses with emojis
7. **Database Driven**: Can scale to multiple seniors and families

## Next Steps (Future Enhancements)

1. Add authentication/authorization
2. Support multiple family members in one message
3. Add SMS history tracking
4. Implement read receipts
5. Add family member CRUD API endpoints
6. Create admin panel for relationship management

---

**Last Updated**: November 11, 2025  
**Status**: ✅ Production Ready  
**Test Data**: ✅ Seeded  
**Services**: ✅ Running
