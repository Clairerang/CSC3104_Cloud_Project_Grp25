# Senior Care Notification System - Backend

A microservices-based notification platform for senior care applications, featuring SMS verification (OTP), urgent messaging, gamification, and comprehensive monitoring.

## 📁 Project Structure

```
backend/
├── services/                      # All microservices
│   ├── notification-service/      # Main API gateway & orchestrator
│   ├── sms-service/              # SMS delivery & OTP verification
│   ├── email-service/            # Email notifications
│   └── gamification-service/     # Badges, points, streaks
│
├── config/                        # Configuration files
│   ├── secrets/                   # 🔒 GIT-IGNORED - Credentials
│   │   ├── .env                   # Environment variables
│   │   ├── .env.example           # Template (safe to commit)
│   │   └── firebase-sa.json       # Firebase service account
│   │
│   ├── grafana/                   # Monitoring dashboards
│   ├── prometheus/                # Metrics configuration
│   └── protos/                    # gRPC definitions
│
├── shared/                        # Shared utilities
│   ├── testing-ui/                # Browser test interfaces
│   │   ├── index.html             # Main testing page
│   │   ├── complete-flow.html     # Phone verification flow
│   │   └── verify-test.html       # OTP standalone test
│   └── scripts/                   # Helper scripts
│
├── docker-compose.yml             # Main service definitions
├── docker-compose.override.yml    # Local overrides
└── README.md                      # This file
```

## 🚀 Quick Start

### Prerequisites
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Git
- **Service Accounts (for production features)**:
  - [Twilio Account](https://www.twilio.com/try-twilio) - For SMS & OTP verification
  - [Gmail SMTP](https://support.google.com/mail/answer/185833) - For email notifications
  - [Firebase Project](https://console.firebase.google.com/) - For push notifications

### 1. Clone & Setup

```powershell
# Clone repository
git clone <repository-url>
cd CSC3104_Cloud_Project_Grp25/backend

# Create secrets from template
Copy-Item config/secrets/.env.example config/secrets/.env

# Edit config/secrets/.env with your credentials (see Step 2 below)
notepad config/secrets/.env
```

### 2. Configure Secrets (REQUIRED)

⚠️ **IMPORTANT**: The `config/secrets/` folder is **git-ignored** to protect your credentials. Never commit `.env` or `firebase-sa.json` files!

#### 🔐 Setting Up Credentials

Edit `config/secrets/.env` with your actual service credentials:

```env
# ===========================================
# TWILIO SMS SERVICE (Required for SMS/OTP)
# ===========================================
# Get these from: https://console.twilio.com/
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Your Account SID
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Your Auth Token
TWILIO_FROM=+1234567890  # Your Twilio phone number (E.164 format)

# Twilio Verify Service (for OTP verification)
# Create at: https://console.twilio.com/us1/develop/verify/services
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ⚠️ TRIAL ACCOUNT LIMITS:
# - 50 messages/day limit
# - Can only send to verified phone numbers
# - Messages include "Sent from your Twilio trial account"
# To remove limits: Upgrade account ($20 credit minimum)

# ===========================================
# EMAIL SERVICE (Gmail SMTP)
# ===========================================
# Use Gmail App Password: https://support.google.com/mail/answer/185833
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # Gmail App Password (16 chars with spaces)
EMAIL_FROM=your-email@gmail.com

# ===========================================
# FIREBASE (Push Notifications)
# ===========================================
# 1. Create Firebase project: https://console.firebase.google.com/
# 2. Enable Firebase Cloud Messaging (FCM)
# 3. Add Web App to get these keys
FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
FIREBASE_VAPID_KEY=BXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# 4. Download Service Account JSON:
#    Project Settings → Service Accounts → Generate New Private Key
#    Save as: config/secrets/firebase-sa.json
FCM_FALLBACK_V1=true

# ===========================================
# DATABASE & MESSAGING (Auto-configured)
# ===========================================
MONGO_URI=mongodb://mongo:27017/notification-system
KAFKA_BROKERS=kafka:9092
```

#### 📱 Twilio Setup Guide

1. **Create Account**: Go to [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. **Get Phone Number**: 
   - Navigate to **Phone Numbers** → Buy a number
   - Trial accounts get 1 free number
3. **Find Credentials**:
   - **Account SID** & **Auth Token**: Dashboard home page
   - Copy to `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`
4. **Create Verify Service**:
   - Go to **Verify** → **Services** → Create new
   - Copy Service SID to `TWILIO_VERIFY_SERVICE_SID`
5. **Add Verified Numbers** (Trial only):
   - **Phone Numbers** → **Verified Caller IDs** → Add number
   - Trial accounts can only send to verified numbers

⚠️ **Twilio Trial Limitations**:
- **50 messages/day** - Resets at midnight UTC
- **Verified numbers only** - Must verify recipients first
- **"Trial account" prefix** in messages
- **Solution**: Upgrade account or use mock adapter for development

#### 📧 Gmail SMTP Setup

1. **Enable 2FA**: Google Account → Security → 2-Step Verification
2. **Create App Password**:
   - Security → 2-Step Verification → App passwords
   - Select **Mail** and **Other (Custom name)**
   - Copy 16-character password to `EMAIL_PASS`
3. **Use your Gmail address** for `EMAIL_USER` and `EMAIL_FROM`

#### 🔥 Firebase Setup

1. **Create Project**: [console.firebase.google.com](https://console.firebase.google.com/)
2. **Add Web App**:
   - Project Overview → Add app → Web (</>) icon
   - Copy config values to `.env`
3. **Enable Cloud Messaging**:
   - Build → Cloud Messaging
   - Generate VAPID key → Copy to `FIREBASE_VAPID_KEY`
4. **Download Service Account**:
   - Project Settings → Service Accounts
   - Click **Generate New Private Key**
   - Save as `config/secrets/firebase-sa.json`

```powershell
# Verify firebase-sa.json exists:
Test-Path config/secrets/firebase-sa.json  # Should return: True
```

### 3. Start Services

```powershell
# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f notification
```

### 4. Access Services

- **Main Testing UI**: http://localhost:4002/testing-notification/
- **Phone Verification Flow**: http://localhost:4002/testing-notification/complete-flow.html
- **OTP Test**: http://localhost:4002/testing-notification/verify-test.html
- **Notification Service**: http://localhost:4002
- **SMS Service**: http://localhost:4004
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)

## 🏗️ Architecture

### Event Flow

```
Mobile App / Admin Portal
         ↓
  Notification Service (4002)
         ↓
    Apache Kafka
    ↙         ↘
SMS Service  Email Service
   (4004)       (4003)
```

### Key Features

- **OTP Verification**: Twilio Verify API for phone number verification
- **Urgent SMS**: Send to verified phones without OTP
- **Event-Driven**: Apache Kafka (KRaft mode) for reliable messaging
- **Outbox Pattern**: MongoDB persistence before Kafka publishing
- **Monitoring**: Prometheus metrics + Grafana dashboards
- **Pluggable Adapters**: Mock/Twilio SMS adapters

## 📡 API Reference

### Notification Service (Port 4002)

#### Phone Verification

```bash
# Save verified phone
POST /verify-phone/save
Content-Type: application/json

{
  "userId": "user123",
  "phoneNumber": "+6598765432",
  "relationship": "self"  # self|family|caregiver|emergency
}

# List verified phones
GET /verify-phone/list?userId=user123

# Send urgent SMS (no OTP)
POST /send-urgent-sms
Content-Type: application/json

{
  "userId": "user123",
  "message": "URGENT: Your elderly parent needs assistance!"
}
```

### SMS Service (Port 4004)

#### OTP Verification

```bash
# Send OTP code
POST /verify/send
Content-Type: application/json

{
  "to": "+6598765432",
  "channel": "sms"  # sms|call|whatsapp
}

# Verify OTP code
POST /verify/check
Content-Type: application/json

{
  "to": "+6598765432",
  "code": "123456"
}
```

#### Direct SMS

```bash
# Send SMS (bypasses Kafka)
POST /send-sms
Content-Type: application/json

{
  "to": "+6598765432",
  "message": "Test message"
}
```

## 🧪 Testing

### Browser Testing

1. **Complete Flow Test** (Recommended)
   - Visit: http://localhost:4002/testing-notification/complete-flow.html
   - Steps:
     1. View verified phones for a user
     2. Verify new phone with OTP
     3. Send urgent SMS to all verified phones

2. **Standalone OTP Test**
   - Visit: http://localhost:4002/testing-notification/verify-test.html
   - Quick OTP send/verify testing

### PowerShell Testing

```powershell
# Test OTP send
Invoke-RestMethod -Uri "http://localhost:4004/verify/send" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"to":"+6598765432","channel":"sms"}'

# Test OTP verify
Invoke-RestMethod -Uri "http://localhost:4004/verify/check" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"to":"+6598765432","code":"123456"}'

# Test urgent SMS
Invoke-RestMethod -Uri "http://localhost:4002/send-urgent-sms" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"userId":"user123","message":"Test urgent message"}'
```

## 🔒 Security & Secrets

### What's Git-Ignored

```gitignore
config/secrets/.env
config/secrets/firebase-sa.json
config/secrets/*.key
config/secrets/*.pem
```

### Secrets Best Practices

✅ **DO:**
- Keep all secrets in `config/secrets/`
- Use `.env.example` as template
- Rotate credentials every 90 days
- Use Docker secrets in production

❌ **DON'T:**
- Commit `.env` files
- Hardcode credentials
- Share secrets via email/Slack
- Use production secrets in development

### If Secrets Were Committed

```powershell
# Remove from Git (file stays on disk)
git rm --cached config/secrets/.env
git commit -m "Remove secrets from tracking"

# Rotate compromised credentials immediately
# - Change Twilio credentials in console
# - Regenerate Firebase keys
# - Update SMTP passwords
```

## 🐛 Troubleshooting

### Twilio Errors

#### Error 30039 - Message Loops
**Cause**: Too many messages sent to same number in short time
**Solution**: Rate limiting implemented (10-minute window)

#### Error 30454 - Geographic Permissions
**Cause**: Destination country blocked (e.g., Singapore)
**Solution**: Enable at https://console.twilio.com/us1/develop/sms/settings/geo-permissions

#### Error 63038 - Daily Limit
**Cause**: Trial account hit quota (50 messages/day)
**Solutions**:
- Wait for reset (8 AM SGT)
- Upgrade to pay-as-you-go ($20 credit → ~2,667 messages)

### Docker Issues

```powershell
# Service won't start
docker compose logs <service-name> --tail=100

# Port conflicts
netstat -ano | findstr "4002"  # Find process using port
Stop-Process -Id <PID>         # Kill conflicting process

# Rebuild after code changes
docker compose up -d --build <service-name>

# Nuclear option (removes all data)
docker compose down
docker volume prune
docker compose up -d
```

### Kafka Issues

```powershell
# Check Kafka is running
docker compose ps kafka

# View topics
docker compose exec kafka kafka-topics.sh --list --bootstrap-server localhost:9092

# View consumer groups
docker compose exec kafka kafka-consumer-groups.sh --list --bootstrap-server localhost:9092
```

## 📊 Monitoring

### Prometheus Metrics

All services expose metrics at `/metrics`:
- http://localhost:4002/metrics (notification)
- http://localhost:4004/metrics (sms)

### Grafana Dashboards

1. Access: http://localhost:3000 (admin/admin)
2. Pre-configured dashboards in `config/grafana/dashboards/`
3. Key metrics:
   - SMS delivery rate
   - OTP verification success rate
   - Kafka lag
   - API response times

### Service Health Checks

```powershell
# Check all services
docker compose ps

# Notification service health
Invoke-RestMethod http://localhost:4002/health

# SMS service health
Invoke-RestMethod http://localhost:4004/health
```

## 🔧 Development

### Adding a New Service

1. Create service directory:
```powershell
mkdir services/new-service
cd services/new-service
npm init -y
```

2. Add to `docker-compose.yml`:
```yaml
new-service:
  build:
    context: .
    dockerfile: services/new-service/Dockerfile
  env_file:
    - config/secrets/.env
  ports:
    - "4005:4005"
  depends_on:
    - kafka
    - mongo
```

3. Implement Kafka consumer/producer
4. Add Prometheus metrics
5. Add health check endpoint

### Code Changes

```powershell
# Rebuild specific service
docker compose up -d --build notification

# View logs
docker compose logs -f notification

# Restart without rebuild
docker compose restart notification
```

### Database Access

```powershell
# MongoDB shell
docker compose exec mongo mongosh notification-system

# View collections
show collections

# Query verified phones
db.verifiedphones.find().pretty()
```

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] All secrets in environment variables (not files)
- [ ] Docker secrets configured
- [ ] Kafka replication factor > 1
- [ ] MongoDB replica set configured
- [ ] Health checks enabled
- [ ] Prometheus alerts configured
- [ ] Log aggregation setup
- [ ] Backup strategy implemented
- [ ] Rate limiting tuned
- [ ] SSL/TLS certificates valid

### Docker Secrets (Production)

```bash
# Create secrets
echo "ACxxx" | docker secret create twilio_account_sid -
echo "xxx" | docker secret create twilio_auth_token -

# Update docker-compose.yml
services:
  sms:
    secrets:
      - twilio_account_sid
      - twilio_auth_token

secrets:
  twilio_account_sid:
    external: true
  twilio_auth_token:
    external: true
```

### Environment-Specific Configs

```powershell
# Development
docker compose up -d

# Staging
docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🐛 Troubleshooting

### SMS Service Issues

#### ❌ "Account exceeded the 50 daily messages limit"

**Problem**: Twilio trial accounts have a 50 message/day limit.

**Solution**:
```powershell
# Option 1: Wait for daily reset (midnight UTC)
# Check current time: https://www.timeanddate.com/worldclock/timezone/utc

# Option 2: Use mock adapter for development
# In config/secrets/.env, change:
SMS_PROVIDER=mock  # Instead of 'twilio'

# Restart SMS service
docker compose restart sms

# Test with mock adapter (no actual SMS sent, but logs show success)
Invoke-RestMethod -Uri "http://localhost:4004/send-test" -Method POST -ContentType "application/json" -Body '{"to":"+6598765787","body":"Test"}'
```

**Option 3: Upgrade Twilio Account** (Removes limits)
- Add $20 credit minimum
- Removes "trial account" message prefix
- No daily message limit
- Can send to any number (not just verified)

#### ❌ "TWILIO_FROM not set" or "Twilio credentials not configured"

**Problem**: Missing environment variables in `.env` file.

**Solution**:
```powershell
# 1. Verify .env file exists
Test-Path config/secrets/.env  # Should return: True

# 2. Check if variables are set
Get-Content config/secrets/.env | Select-String "TWILIO"

# 3. Ensure these variables exist:
# SMS_PROVIDER=twilio
# TWILIO_ACCOUNT_SID=ACxxxxx...
# TWILIO_AUTH_TOKEN=xxxxx...
# TWILIO_FROM=+1234567890
# TWILIO_VERIFY_SERVICE_SID=VAxxxxx...

# 4. Restart SMS service to reload environment
docker compose restart sms

# 5. Verify variables loaded in container
docker exec sms env | Select-String "TWILIO"
```

#### ❌ "Cannot send to unverified numbers" (Trial accounts)

**Problem**: Twilio trial can only send to verified phone numbers.

**Solution**:
1. Log into [Twilio Console](https://console.twilio.com/)
2. Go to **Phone Numbers** → **Verified Caller IDs**
3. Click **+** to add new number
4. Enter phone number in E.164 format (e.g., +6598765787)
5. Verify via SMS or call
6. Now you can send to that number

### OTP Verification Issues

#### ❌ "Too many verification requests" (Error 30039)

**Problem**: Twilio rate limiting - too many verification codes sent too quickly.

**Solution**:
```powershell
# The service has built-in rate limiting (10 minutes between requests)
# Wait 10 minutes before requesting a new code for the same phone number

# Check logs for rate limit messages:
docker logs sms | Select-String "Rate limit"
```

#### ❌ "Invalid verification code"

**Causes**:
1. Code expired (10 minutes validity)
2. Wrong code entered
3. Code already used

**Solution**:
```powershell
# Request new code:
Invoke-RestMethod -Uri "http://localhost:4004/verify/send" -Method POST -ContentType "application/json" -Body '{"to":"+6512345678"}'

# Check new code in SMS and verify within 10 minutes
```

### Email Service Issues

#### ❌ "Failed to send email" / "Invalid login"

**Problem**: Gmail SMTP authentication failed.

**Solution**:
```powershell
# 1. Enable 2-Factor Authentication on Gmail account
# 2. Generate App Password (NOT your regular password):
#    https://myaccount.google.com/apppasswords
# 3. Update .env with 16-character app password:
EMAIL_PASS=xxxx xxxx xxxx xxxx

# 4. Restart email service
docker compose restart email
```

### Firebase/Push Notification Issues

#### ❌ "Firebase service account not found"

**Problem**: `firebase-sa.json` file missing.

**Solution**:
```powershell
# 1. Download from Firebase Console:
#    Project Settings → Service Accounts → Generate New Private Key
# 2. Save to: config/secrets/firebase-sa.json
# 3. Verify file exists:
Test-Path config/secrets/firebase-sa.json  # Should return: True

# 4. Restart notification service
docker compose restart notification
```

### Kafka Issues

#### ❌ Services not receiving Kafka events

**Problem**: Kafka consumer not connected or topic doesn't exist.

**Solution**:
```powershell
# 1. Check Kafka is running
docker compose ps kafka  # Should show "healthy"

# 2. List topics
docker exec kafka kafka-topics.sh --list --bootstrap-server localhost:9092

# 3. Check consumer groups
docker exec kafka kafka-consumer-groups.sh --list --bootstrap-server localhost:9092

# 4. View consumer lag
docker exec kafka kafka-consumer-groups.sh --describe --group sms-service-group --bootstrap-server localhost:9092

# 5. Restart consumers
docker compose restart sms email gamification
```

### General Issues

#### ❌ "Port already in use"

**Problem**: Another service using the same port.

**Solution**:
```powershell
# Find process using port (example: 4004)
Get-NetTCPConnection -LocalPort 4004 | Format-Table

# Stop Docker services first
docker compose down

# Kill process if needed (use PID from above)
Stop-Process -Id <PID> -Force

# Restart services
docker compose up -d
```

#### ❌ "Container keeps restarting"

**Solution**:
```powershell
# Check logs for specific service
docker logs <service-name> --tail 100

# Common causes:
# 1. Missing environment variables - check .env file
# 2. Can't connect to dependencies - check Kafka/MongoDB health
# 3. Port conflict - change port in docker-compose.yml

# Rebuild service
docker compose up -d --build <service-name>
```

## 🆘 Support

### Common Commands

```powershell
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f sms

# Restart all services
docker compose restart

# Restart specific service
docker compose restart sms

# Stop all services
docker compose down

# Clean rebuild
docker compose down; docker compose up -d --build

# Check resource usage
docker stats

# Check container health
docker compose ps
```

### Team Communication

- **Issues**: Create GitHub issue with logs
- **Questions**: Check this README first
- **Urgent**: Contact team lead

## 📚 Additional Resources

- [Twilio Verify API](https://www.twilio.com/docs/verify/api)
- [Twilio SMS](https://www.twilio.com/docs/sms)
- [Apache Kafka](https://kafka.apache.org/documentation/)
- [MongoDB](https://docs.mongodb.com/)
- [Prometheus](https://prometheus.io/docs/)
- [Grafana](https://grafana.com/docs/)

---

**Last Updated**: November 2025  
**Maintainer**: CSC3104 Group 25