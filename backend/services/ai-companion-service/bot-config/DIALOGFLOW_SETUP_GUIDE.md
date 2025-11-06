# 🆓 Google Dialogflow Setup Guide - 100% FREE

## ✨ Why Dialogflow?

- ✅ **Completely FREE** - No credit card required
- ✅ **UNLIMITED text requests** (forever!)
- ✅ **1000 voice requests/month** (free forever)
- ✅ **Perfect for student projects** - No surprise charges
- ✅ **Google Cloud Platform** - Shows cloud computing skills
- ✅ **Easy to use** - Better than AWS Lex for beginners

---

## 🎯 Step 1: Create Google Cloud Account

### 1.1 Sign Up (No Credit Card!)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account (or create one)
3. **No credit card required for Dialogflow ES!**

### 1.2 Create a New Project

1. Click the project dropdown at the top
2. Click **"New Project"**
3. Project name: `SeniorCareBot`
4. Click **"Create"**

---

## 🤖 Step 2: Enable Dialogflow API

### 2.1 Enable the API

1. Go to [Dialogflow API](https://console.cloud.google.com/apis/library/dialogflow.googleapis.com)
2. Select your `SeniorCareBot` project
3. Click **"Enable"**
4. Wait ~30 seconds for activation

### 2.2 Create Service Account

1. Go to [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click **"Create Service Account"**
3. Service account name: `dialogflow-companion`
4. Service account ID: `dialogflow-companion`
5. Click **"Create and Continue"**

### 2.3 Grant Roles

Select these roles:
- **Dialogflow API Client**
- **Dialogflow API Admin**

Click **"Continue"** → **"Done"**

### 2.4 Create Key (JSON)

1. Find your service account in the list
2. Click the **⋮** (three dots) menu
3. Select **"Manage keys"**
4. Click **"Add Key"** → **"Create new key"**
5. Choose **JSON**
6. Click **"Create"**
7. **Save the JSON file!** (downloads automatically)

---

## 💬 Step 3: Create Dialogflow Agent

### 3.1 Go to Dialogflow Console

1. Visit [Dialogflow ES Console](https://dialogflow.cloud.google.com/)
2. Sign in with the same Google account
3. Accept terms if prompted

### 3.2 Create New Agent

1. Click **"Create Agent"**
2. Agent name: `SeniorCareBot`
3. Default language: `English`
4. Default time zone: `(your timezone)`
5. Google Project: Select `SeniorCareBot`
6. Click **"Create"**

---

## 🎯 Step 4: Create Intents

### Intent 1: EmergencyHelp

1. Click **"Intents"** in left sidebar
2. Click **"Create Intent"**
3. Intent name: `EmergencyHelp`

**Training phrases:**
```
Help!
I need help
Emergency
I fell down
I can't get up
Call for help
Someone help me
I'm hurt
I need assistance
Get help now
```

**Response:**
```
🚨 I'm sending an emergency alert to your family right now! Help is on the way. Stay calm, someone will be with you soon.
```

Click **"Save"**

---

### Intent 2: Loneliness

1. Click **"Create Intent"**
2. Intent name: `Loneliness`

**Training phrases:**
```
I feel lonely
I'm lonely
I feel alone
Nobody is here
I'm sad
I miss my family
I feel sad
Nobody talks to me
I want company
Can you talk to me
```

**Response:**
```
I'm here with you, and you're not alone. 💜 I'm always here to chat. Would you like me to call someone for you?
```

Click **"Save"**

---

### Intent 3: CallFamily

1. Click **"Create Intent"**
2. Intent name: `CallFamily`

**Training phrases:**
```
Call my daughter
Call my son
I want to talk to my family
Can you call someone
Call my wife
Call my husband
I want to talk to Sarah
Connect me to my family
Call my kids
I miss my family
```

**Response:**
```
I'll help you connect with your family right away. Who would you like to talk to?
```

Click **"Save"**

---

### Intent 4: MedicationReminder

1. Click **"Create Intent"**
2. Intent name: `MedicationReminder`

**Training phrases:**
```
When do I take my medication
What are my pills
Medication reminder
What medicine do I take
When is my next dose
Did I take my pills
Remind me about my medication
What time is my medicine
Show my medication schedule
```

**Response:**
```
Let me check your medication schedule for you. One moment...
```

Click **"Save"**

---

### Intent 5: WeatherInfo

1. Click **"Create Intent"**
2. Intent name: `WeatherInfo`

**Training phrases:**
```
What's the weather
How's the weather today
Is it raining
What's the temperature
Weather forecast
Is it cold outside
Should I wear a jacket
What's the weather like
Tell me the weather
```

**Response:**
```
Let me get the weather information for you right now...
```

Click **"Save"**

---

### Intent 6: GameRequest

1. Click **"Create Intent"**
2. Intent name: `GameRequest`

**Training phrases:**
```
Let's play a game
I want to play
Tell me a joke
Play trivia
Let's play trivia
Entertain me
I'm bored
Tell me something funny
Can we play
Let's have fun
```

**Response:**
```
How about a fun game? I can play trivia, tell jokes, or we can just chat! What sounds fun to you?
```

Click **"Save"**

---

## 🔑 Step 5: Configure Service

### 5.1 Copy JSON Key to Server

1. Rename your downloaded JSON file to `dialogflow-key.json`
2. Copy it to: `backend/config/secrets/dialogflow-key.json`

```powershell
# PowerShell command
Copy-Item ~/Downloads/seniorcarbot-*.json `
  backend/config/secrets/dialogflow-key.json
```

### 5.2 Update .env File

Add to `backend/config/secrets/.env`:

```bash
# Google Dialogflow (100% FREE)
DIALOGFLOW_PROJECT_ID=seniorcarbot-xxxx
GOOGLE_APPLICATION_CREDENTIALS=/app/config/dialogflow-key.json
```

**How to find your Project ID:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Project ID is shown at the top (e.g., `seniorcarbot-123456`)

### 5.3 Update docker-compose.yml

Add volume mount for the key:

```yaml
lex-companion:
  volumes:
    - ./config/secrets/dialogflow-key.json:/app/config/dialogflow-key.json:ro
  environment:
    - DIALOGFLOW_PROJECT_ID=${DIALOGFLOW_PROJECT_ID}
    - GOOGLE_APPLICATION_CREDENTIALS=/app/config/dialogflow-key.json
```

---

## 🚀 Step 6: Test Your Bot!

### 6.1 Test in Dialogflow Console

1. Click **"Try it now"** in the right panel
2. Type: `Help!`
3. Should respond: "🚨 I'm sending an emergency alert..."
4. Try: `I feel lonely`
5. Try: `Call my daughter`

### 6.2 Rebuild & Restart Service

```powershell
cd backend
docker compose up -d --build lex-companion
docker logs lex-companion -f
```

**Expected output:**
```
✅ Google Dialogflow initialized (GCP)
✅ Connected to MongoDB
✅ Kafka producer connected
🤖 Dialogflow Companion Service running on port 4015
🌐 Mode: Google Dialogflow (GCP)
💰 Cost: 100% FREE with Google Cloud
```

### 6.3 Test the API

```powershell
Invoke-RestMethod -Uri "http://localhost:4015/chat" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"userId":"senior-001","message":"Help!"}'
```

**Expected response:**
```json
{
  "success": true,
  "response": "🚨 I'm sending an emergency alert...",
  "intent": "EmergencyHelp",
  "sentiment": "NEGATIVE",
  "mode": "dialogflow",
  "confidence": 0.95
}
```

---

## 🎨 Step 7: Test the UI

1. Open: http://localhost:4002/testing-notification/ai-companion-chat.html
2. Try quick buttons:
   - Help
   - Lonely
   - Call Family
   - Medication
   - Weather
   - Game
3. Check sentiment indicators
4. View intent badges

---

## 💰 Cost Breakdown (Spoiler: It's FREE!)

### Dialogflow ES (Essential Edition)

| Feature | Free Tier | After Free Tier |
|---------|-----------|-----------------|
| Text Requests | **UNLIMITED** | **FREE FOREVER** |
| Voice Requests | 1,000/month | $0.0065/request |
| Intent Detection | **UNLIMITED** | **FREE FOREVER** |
| Entity Extraction | **UNLIMITED** | **FREE FOREVER** |

### For This Project:
- **Text chat**: UNLIMITED FREE ✅
- **Sentiment**: FREE (npm package) ✅
- **MongoDB**: FREE (local) ✅
- **Kafka**: FREE (local) ✅

**Total Cost: $0.00/month** 🎉

---

## 🔒 Security Best Practices

### 1. Protect Your JSON Key

```bash
# Add to .gitignore
config/secrets/dialogflow-key.json
config/secrets/*.json
```

### 2. Service Account Permissions

- ✅ Use minimal permissions (Dialogflow API Client)
- ✅ Don't use Owner or Editor roles
- ✅ Create separate keys for dev/prod

### 3. Project Security

1. Go to [IAM & Admin](https://console.cloud.google.com/iam-admin)
2. Review service account permissions
3. Remove unused service accounts

---

## 🐛 Troubleshooting

### Error: "Dialogflow key not found"

**Solution:**
```powershell
# Check if file exists
Test-Path backend/config/secrets/dialogflow-key.json

# If not, copy it again
Copy-Item ~/Downloads/seniorcarbot-*.json `
  backend/config/secrets/dialogflow-key.json
```

### Error: "Project ID not found"

**Solution:**
1. Check `.env` file has `DIALOGFLOW_PROJECT_ID`
2. Get correct ID from Google Cloud Console
3. Restart service: `docker compose restart lex-companion`

### Error: "Permission denied"

**Solution:**
1. Go to [Dialogflow API](https://console.cloud.google.com/apis/library/dialogflow.googleapis.com)
2. Make sure it's **Enabled**
3. Check service account has **Dialogflow API Client** role

### Service uses fallback mode

**Check:**
```powershell
# View logs
docker logs lex-companion --tail 50

# Should see:
# ✅ Google Dialogflow initialized (GCP)

# If you see:
# ⚠️ Dialogflow key not found, using fallback mode
```

**Solutions:**
1. Verify JSON key file exists
2. Check `GOOGLE_APPLICATION_CREDENTIALS` path
3. Verify `DIALOGFLOW_PROJECT_ID` is correct
4. Restart service

---

## 📊 Monitor Usage (Stay in Free Tier)

### 1. Check Dialogflow Usage

1. Go to [Dialogflow Console](https://dialogflow.cloud.google.com/)
2. Select your agent
3. Click **"Analytics"** (left sidebar)
4. View request counts

### 2. Google Cloud Quotas

1. Go to [Quotas](https://console.cloud.google.com/iam-admin/quotas)
2. Filter: `dialogflow`
3. Monitor usage

**You won't exceed free tier with normal usage!** Text requests are unlimited.

---

## 🎓 For Your CSC3104 Project

### What to Mention in Report:

1. **Cloud Platform Used**: Google Cloud Platform (GCP)
2. **Service**: Dialogflow ES (Conversational AI)
3. **Cost**: $0 (100% free tier)
4. **Integration**: RESTful API with Docker microservices
5. **Features**: Intent recognition, NLU, sentiment analysis

### Demo Points:

- ✅ Show Dialogflow console with intents
- ✅ Demonstrate real-time chat with AI
- ✅ Show intent recognition working
- ✅ Display sentiment analysis
- ✅ Explain cloud integration architecture

### Architecture Diagram:

```
User → Chat UI → Express API → Google Dialogflow (GCP) → Intent Handlers → Kafka → Notification Service
                              ↓
                        Sentiment Analysis (npm)
                              ↓
                          MongoDB (History)
```

---

## 🌟 Advantages Over AWS Lex

| Feature | Dialogflow ES | AWS Lex |
|---------|--------------|---------|
| Text Requests | ✅ UNLIMITED FREE | ❌ 10K/month year 1 only |
| Credit Card | ✅ Not required | ❌ Required |
| After Free Tier | ✅ Still FREE | ❌ $0.00075/request |
| Setup Difficulty | ✅ Easy | ⚠️ Complex |
| Student Friendly | ✅ Perfect | ⚠️ Risky (can charge) |

---

## 🎊 You're Done!

You now have:
- ✅ 100% FREE AI chatbot
- ✅ Google Cloud Platform integration
- ✅ Perfect for CSC3104 project
- ✅ No risk of charges
- ✅ UNLIMITED usage

**Test it now:**
- Open chat UI
- Try all the quick buttons
- Show your professor! 🎓

---

## 📚 Additional Resources

- [Dialogflow ES Docs](https://cloud.google.com/dialogflow/es/docs)
- [Dialogflow Pricing](https://cloud.google.com/dialogflow/pricing)
- [Node.js Client Library](https://github.com/googleapis/nodejs-dialogflow)
- [Best Practices](https://cloud.google.com/dialogflow/es/docs/best-practices)

---

**🎉 Enjoy your FREE, production-ready AI companion!**

Perfect for your cloud computing project with ZERO cost! 💜
