# AWS Lex Bot Configuration Guide

## 🤖 Setting Up Your Lex Bot

### Step 1: Create AWS Account & Get Free Tier

1. Sign up at https://aws.amazon.com/free/
2. Free tier includes:
   - **10,000 text requests/month** for 12 months
   - **5,000 speech requests/month** for 12 months

### Step 2: Create IAM User with Permissions

1. Go to AWS Console → IAM → Users → Create User
2. User name: `lex-companion-service`
3. Attach policies:
   - `AmazonLexFullAccess`
   - `ComprehendFullAccess` (for sentiment analysis)
   - `AmazonPollyFullAccess` (for text-to-speech)

4. Create access key → Save credentials:
```
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-east-1
```

### Step 3: Create Lex Bot (V2)

#### Via AWS Console:

1. Go to AWS Console → Amazon Lex → Create bot
2. **Bot configuration:**
   - Bot name: `SeniorCareBot`
   - Description: `AI companion for senior care`
   - IAM role: Create new role
   - COPPA: No
   - Idle session timeout: 5 minutes

3. **Language:** English (US)

4. **Create Intents:**

#### Intent 1: EmergencyHelp
```
Sample utterances:
- Help!
- I need help
- Emergency
- I fell down
- Call 911
- I'm in trouble
- Something's wrong

Slots: (optional)
- Reason (AMAZON.SearchQuery)

Response:
"I'm calling emergency services and your family right now. Stay calm, help is on the way."
```

#### Intent 2: CallFamily
```
Sample utterances:
- Call my daughter
- I want to talk to {FamilyMember}
- Can you call {FamilyMember}
- Connect me with my son
- I need to speak to my family

Slots:
- FamilyMember (AMAZON.Person) - Required

Response:
"I'm calling {FamilyMember} for you now."
```

#### Intent 3: MedicationReminder
```
Sample utterances:
- When do I take my medication
- Medication reminder
- What pills do I need to take
- Med schedule
- Did I take my medicine

Response:
"Let me check your medication schedule for today."
```

#### Intent 4: Loneliness
```
Sample utterances:
- I'm lonely
- I feel alone
- Nobody visits me
- I'm sad
- I miss my family
- I'm bored

Response:
"I'm sorry you're feeling lonely. Would you like me to call someone, or we could play a game together? I'm here for you."
```

#### Intent 5: WeatherInfo
```
Sample utterances:
- What's the weather
- Is it raining
- What's the temperature
- Weather forecast
- Should I bring an umbrella

Response:
"Let me check the weather for you."
```

#### Intent 6: PlayGame
```
Sample utterances:
- Let's play a game
- I want to play {GameType}
- Can we do trivia
- Tell me a riddle
- Entertainment

Slots:
- GameType (custom slot: trivia, riddles, memory, word-game)

Response:
"Great! Let's play {GameType}. This will be fun!"
```

#### Fallback Intent
```
Response:
"I'm here to help! You can ask me about medication reminders, calling family, the weather, or we can chat. What would you like to do?"
```

5. **Build & Test** the bot in Lex console

6. **Create Alias:**
   - Name: `prod`
   - Description: `Production alias`
   - Version: Latest

### Step 4: Get Bot Configuration

After creating the bot:
```
LEX_BOT_NAME=SeniorCareBot
LEX_BOT_ALIAS=prod
```

### Step 5: Add to .env

Edit `config/secrets/.env`:
```bash
# AWS Lex Configuration
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-east-1
LEX_BOT_NAME=SeniorCareBot
LEX_BOT_ALIAS=prod

# Optional: Enable AWS services
ENABLE_AWS_COMPREHEND=true
ENABLE_AWS_POLLY=true
```

### Step 6: Test

```bash
# Start the service
docker compose up -d lex-companion

# Test chat
curl -X POST http://localhost:4015/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "senior-001",
    "message": "I need help!"
  }'

# Test text-to-speech
curl -X POST http://localhost:4015/speak \
  -H "Content-Type: application/json" \
  -d '{"text": "Good morning! Time for your medication."}' \
  --output morning-greeting.mp3
```

## 📊 Monitoring Free Tier Usage

1. AWS Console → Billing → Free Tier
2. Monitor usage:
   - Lex: Text requests
   - Comprehend: Units processed
   - Polly: Characters converted

## 💡 Alternative: Use Without AWS (Fallback Mode)

If you don't configure AWS credentials, the service will run in fallback mode with:
- Simple rule-based responses
- No sentiment analysis
- No text-to-speech
- Still functional for basic chatbot features!

## 🔒 Security Best Practices

1. ✅ **Never commit AWS credentials**
2. ✅ **Use IAM roles with minimum permissions**
3. ✅ **Rotate access keys every 90 days**
4. ✅ **Enable MFA on AWS root account**
5. ✅ **Monitor CloudWatch for unusual activity**

## 🎯 Next Steps

1. Set up AWS account (free tier)
2. Create Lex bot with intents above
3. Add credentials to `.env`
4. Test the chatbot!
5. Integrate with mobile app
6. Add more intents as needed

## 💰 Cost After Free Tier

- Lex: $0.00065/text request ($0.65 per 1,000)
- Comprehend: $0.0001/unit
- Polly: $4.00/1M characters

**Example**: 10,000 conversations/month = ~$6.50/month
