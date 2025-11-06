# 🤖 AWS Lex Companion Service

An AI-powered chatbot for senior care using AWS Lex, Comprehend (sentiment analysis), and Polly (text-to-speech).

## ✨ Features

- 🗣️ **Natural Conversation**: AWS Lex-powered chatbot with intent recognition
- 😊 **Sentiment Analysis**: Detects emotional state using AWS Comprehend
- 🔊 **Text-to-Speech**: Converts responses to audio using AWS Polly
- 🚨 **Emergency Detection**: Automatically alerts family for emergencies
- 💊 **Medication Reminders**: Tracks and reminds about medications
- 📞 **Family Calling**: Initiates calls to family members
- 🎮 **Interactive Games**: Trivia, riddles, and entertainment
- 📊 **Conversation History**: Stores all conversations in MongoDB
- 📈 **Sentiment Tracking**: Monitors emotional wellness over time

## 🎯 Use Cases

### For Seniors
- 24/7 companion to reduce loneliness
- Voice-activated assistance
- Emergency help at any time
- Medication management
- Entertainment and games

### For Family
- Real-time alerts for emergencies or negative sentiment
- Track emotional wellness trends
- Peace of mind with 24/7 monitoring
- Engagement analytics

## 🏗️ Architecture

```
Senior speaks/types
        ↓
┌───────────────────┐
│ Lex Companion     │
│   Service         │
│  (Port 4015)      │
└───────┬───────────┘
        ├─→ AWS Lex (Intent Recognition)
        ├─→ AWS Comprehend (Sentiment Analysis)
        ├─→ AWS Polly (Text-to-Speech)
        ├─→ MongoDB (Conversation History)
        └─→ Kafka (Alerts & Events)
                ↓
        Notification Service
                ↓
        SMS/Email to Family
```

## 📡 API Endpoints

### POST `/chat`
Send a message to the AI companion

**Request:**
```json
{
  "userId": "senior-001",
  "message": "I need help!",
  "sessionId": "session-12345"
}
```

**Response:**
```json
{
  "success": true,
  "response": "I'm calling emergency services and your family right now. Stay calm, help is on the way.",
  "intent": "EmergencyHelp",
  "dialogState": "Fulfilled",
  "sentiment": "NEGATIVE",
  "sessionAttributes": {}
}
```

### POST `/speak`
Convert text to speech

**Request:**
```json
{
  "text": "Good morning! Time for your medication.",
  "voiceId": "Joanna"
}
```

**Response:** MP3 audio file

### GET `/history/:userId`
Get conversation history

**Response:**
```json
{
  "success": true,
  "conversations": [...]
}
```

### GET `/sentiment/:userId?days=7`
Get sentiment trend

**Response:**
```json
{
  "success": true,
  "userId": "senior-001",
  "period": "7 days",
  "trend": [...],
  "averageScore": 0.65
}
```

## 🎭 Supported Intents

| Intent | Sample Utterances | Action |
|--------|------------------|--------|
| **EmergencyHelp** | "Help!", "I fell down" | 🚨 Alerts family, emergency services |
| **CallFamily** | "Call my daughter" | 📞 Initiates call to family member |
| **MedicationReminder** | "When do I take my pills?" | 💊 Shows medication schedule |
| **Loneliness** | "I feel lonely", "I'm sad" | 😔 Offers comfort, suggests activities |
| **WeatherInfo** | "What's the weather?" | 🌤️ Provides weather information |
| **PlayGame** | "Let's play trivia" | 🎮 Starts interactive game |

## 🚀 Setup

### 1. AWS Configuration

See [AWS_LEX_SETUP_GUIDE.md](./bot-config/AWS_LEX_SETUP_GUIDE.md) for complete setup instructions.

Quick summary:
1. Create AWS account (free tier)
2. Create Lex bot with intents
3. Get IAM credentials
4. Add to `.env`:

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
LEX_BOT_NAME=SeniorCareBot
LEX_BOT_ALIAS=prod
```

### 2. Docker Compose

```bash
# Start the service
docker compose up -d lex-companion

# Check logs
docker compose logs lex-companion -f

# Check status
docker compose ps lex-companion
```

### 3. Test

Open the testing UI:
- http://localhost:4002/testing-notification/ai-companion-chat.html

Or use curl:
```bash
curl -X POST http://localhost:4015/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "senior-001",
    "message": "Hello!"
  }'
```

## 🧪 Testing

### Quick Test Phrases

```bash
# Emergency
"Help!"
"I fell down"
"I need help"

# Medication
"When do I take my medication?"
"Did I take my pills?"

# Social
"I feel lonely"
"Call my daughter"

# Information
"What's the weather?"
"Tell me a joke"

# Games
"Let's play trivia"
"Tell me a riddle"
```

### Testing Without AWS

If AWS is not configured, the service runs in **fallback mode**:
- ✅ Basic responses work
- ❌ No intent recognition
- ❌ No sentiment analysis
- ❌ No text-to-speech

Perfect for development/testing!

## 📊 Monitoring

### Prometheus Metrics

Available at http://localhost:4015/metrics

- `lex_chat_messages_total` - Total messages processed
- `lex_user_sentiment` - Current user sentiment scores

### Health Check

```bash
curl http://localhost:4015/health
```

## 🔔 Kafka Events

The service publishes these events:

### chat.message
```json
{
  "userId": "senior-001",
  "message": "...",
  "botResponse": "...",
  "intent": "EmergencyHelp",
  "sentiment": "NEGATIVE",
  "timestamp": "2025-11-06T..."
}
```

### Alerts (→ notification.events topic)
- `emergency_sos` - Emergency help requested
- `negative_sentiment` - Negative emotion detected
- `loneliness_detected` - User expressed loneliness
- `call_request` - User wants to call family
- `game_started` - User started a game

## 💰 Cost (After Free Tier)

- **Lex**: $0.00065/request (~$6.50 for 10,000 conversations/month)
- **Comprehend**: $0.0001/unit (~$1 for 10,000 analyses)
- **Polly**: $4.00/1M characters (~$0.40 for 100,000 characters)

**Total**: ~$8/month for moderate usage

## 🎨 Customization

### Add New Intents

1. Create intent in AWS Lex Console
2. Add handler in `src/intents/yourIntent.js`:

```javascript
module.exports = {
  async handle({ userId, slots, sessionAttributes, publishAlert, logger }) {
    logger.info(`New intent triggered by ${userId}`);
    
    // Your logic here
    
    return { success: true, message: 'Response' };
  }
};
```

3. Register in `src/index.js`:

```javascript
const intentHandlers = {
  // ...existing
  YourIntent: require('./intents/yourIntent')
};
```

### Change Voice

Available voices (neural engine):
- **English US**: Joanna (F), Matthew (M), Ivy (F), Kevin (M)
- **English UK**: Amy (F), Emma (F), Brian (M)
- **English Australian**: Olivia (F)

Update in `/speak` endpoint or testing UI.

## 🐛 Troubleshooting

### "Lex is not configured"
- Check AWS credentials in `.env`
- Verify bot name and alias
- Ensure IAM permissions are correct

### "ComprehendNotAvailable"
- Comprehend is optional
- Service works without it (no sentiment analysis)
- Check AWS region supports Comprehend

### "Polly error"
- Polly is optional
- Service works without it (no text-to-speech)
- Check AWS credentials and permissions

### High AWS Costs
- Monitor usage in AWS Console → Billing
- Set up billing alerts
- Use CloudWatch to track API calls

## 🔐 Security

- ✅ Never commit AWS credentials
- ✅ Use IAM roles with minimum permissions
- ✅ Rotate access keys every 90 days
- ✅ Enable MFA on AWS account
- ✅ Monitor CloudWatch logs for unusual activity

## 🎯 Future Enhancements

- [ ] Voice input (AWS Transcribe)
- [ ] Multi-language support (AWS Translate)
- [ ] Image analysis (AWS Rekognition)
- [ ] Proactive check-ins (scheduled messages)
- [ ] Integration with wearables
- [ ] Advanced game logic
- [ ] Personalized responses based on history
- [ ] Family dashboard for conversation insights

## 📚 Resources

- [AWS Lex Documentation](https://docs.aws.amazon.com/lex/)
- [AWS Comprehend](https://docs.aws.amazon.com/comprehend/)
- [AWS Polly](https://docs.aws.amazon.com/polly/)
- [AWS Free Tier](https://aws.amazon.com/free/)

## 💡 Tips

1. **Start Simple**: Test with fallback mode first (no AWS)
2. **Monitor Costs**: Set up AWS billing alerts
3. **Customize Intents**: Add domain-specific intents for your use case
4. **Track Sentiment**: Use sentiment trends to identify wellness issues
5. **Engage Seniors**: Make responses warm and conversational

---

Built with ❤️ by CSC3104 Group 25
