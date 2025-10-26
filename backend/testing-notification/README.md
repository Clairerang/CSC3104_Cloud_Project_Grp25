Testing Notification — exact run & test instructions

This README provides exact, copy-paste PowerShell commands and expected outputs to manually test the daily "I'm Okay" check-in flow.

Prerequisites
- Docker and Docker Compose installed
- You are in PowerShell on Windows
- Repository root: `C:\cloud_project\CSC3104_Cloud_Project_Grp25`

Start backend stack (zookeeper, kafka, mongo, notification)

Run these commands from the `backend` folder (PowerShell):

```powershell
cd C:\cloud_project\CSC3104_Cloud_Project_Grp25\backend
# start required infra (zookeeper, kafka, mongo) and the notification service
docker compose up -d zookeeper kafka mongo
# give services a few seconds to become healthy
Start-Sleep -Seconds 5
# (re)start notification service after infra is healthy
docker compose up -d notification
Start-Sleep -Seconds 3
docker compose ps
```

Open the test frontend in your browser

```powershell
# the notification service serves the static test page
Start-Process "http://localhost:4002/testing-notification"
```

Manual quick test (PowerShell) — register a user and post a check-in

Copy/paste these two blocks (one at a time) into PowerShell. They call the service endpoints directly (the same buttons on the test page do this):

Register a test user:

```powershell
$body = @{ userId = 'senior-1'; name = 'Alice' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:4002/register-user -Body $body -ContentType 'application/json' | ConvertTo-Json
```

Submit a check-in (daily login):

```powershell
$body = @{ userId = 'senior-1'; mood = 'okay'; timestamp = (Get-Date).ToString('o') } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:4002/checkin -Body $body -ContentType 'application/json' | ConvertTo-Json
```

Expected results
- The register endpoint returns JSON with the created/updated user document.
- The checkin endpoint returns JSON with the saved checkin and the published event payload. Example snippet you should see in the response:

	{
		"ok": true,
		"checkin": { ... },
		"publishedEvent": {
			"type": "checkin",
			"userId": "senior-1",
			"mood": "okay",
			"timestamp": "...",
			"target": ["dashboard","mobile","tablet"]
		}
	}

Watch the Notification service logs for event publishing

In PowerShell, run:

```powershell
cd C:\cloud_project\CSC3104_Cloud_Project_Grp25\backend
docker compose logs notification --tail=200 -f
```

You should see lines like:

	📣 Published event to notification.events: checkin

Inspect MongoDB (optional)

To check persisted users/checkins, run (PowerShell):

```powershell
# open a mongo shell inside the mongo container (interactive)
docker compose exec mongo mongosh --eval "use notification; db.users.find().pretty(); db.checkins.find().pretty()"
```

Inspect topics with Kafdrop (optional)

If Kafdrop is running in your compose, open http://localhost:9100 and look for the `notification.events` topic to see messages.

Troubleshooting
- If Kafka fails to start with ZK NodeExists errors, recreate zookeeper + kafka containers to clear in-container state:

```powershell
cd C:\cloud_project\CSC3104_Cloud_Project_Grp25\backend
# WARNING: this recreates containers and resets broker ephemeral state (safe for dev)
docker compose rm -fs kafka zookeeper
docker compose up -d zookeeper kafka
Start-Sleep -Seconds 5
docker compose ps
```

- If `docker compose logs notification` shows errors connecting to Kafka, make sure Kafka is healthy and reachable at `kafka:9092` inside compose. Re-run `docker compose up -d kafka zookeeper`.

Event payload shapes
- Check-in event emitted by `/checkin` (published to `notification.events`):

```json
{
	"type": "checkin",
	"userId": "senior-1",
	"mood": "okay",
	"timestamp": "2025-10-26T...Z",
	"target": ["dashboard","mobile","tablet"]
}
```

- Missed-checkin alert emitted by scheduler (published to `notification.events`):

```json
{
	"type": "missed_checkin_alert",
	"userId": "senior-1",
	"name": "Alice",
	"ageMs": 86400000,
	"targets": ["dashboard","mobile","tablet"]
}
```

Notes
- The test frontend is intentionally minimal and served statically by the notification service at `/testing-notification`.
- Email/Ethereal was removed — events are published to Kafka so your dashboard / mobile / tablet listeners can consume and react.

If you'd like, I can add a tiny dashboard stub that subscribes to `notification.events` to visualize events in real time; tell me if you want websockets or a simple polling dashboard.
