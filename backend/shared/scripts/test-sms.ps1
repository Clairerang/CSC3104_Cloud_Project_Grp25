# Quick SMS Test Script for Twilio
# Usage: .\test-sms.ps1 "+61412345678"

param(
    [Parameter(Mandatory=$true)]
    [string]$PhoneNumber
)

Write-Host "🚀 Testing Twilio SMS Service..." -ForegroundColor Cyan
Write-Host ""

# Validate E.164 format
if (-not $PhoneNumber.StartsWith("+")) {
    Write-Host "❌ Error: Phone number must start with + (E.164 format)" -ForegroundColor Red
    Write-Host "   Example: +61412345678 for Australia" -ForegroundColor Yellow
    exit 1
}

# Test 1: Direct SMS endpoint
Write-Host "📱 Test 1: Sending SMS via /send-test endpoint..." -ForegroundColor Green
try {
    $body = @{
        to = $PhoneNumber
        body = "Hello from Cloud Project! Your SMS service is working. ✅"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:4004/send-test" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body

    Write-Host "✅ SMS sent successfully!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to send SMS: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "⏳ Waiting 3 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Test 2: Daily login flow (triggers email + SMS)
Write-Host "📱 Test 2: Sending SMS via daily-login endpoint..." -ForegroundColor Green
try {
    $loginBody = @{
        userId = "test-user-$(Get-Date -Format 'HHmmss')"
        userName = "Test User"
        mood = "excellent"
        familyPhone = $PhoneNumber
        familyEmail = "test@example.com"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:4002/daily-login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody

    Write-Host "✅ Daily login processed!" -ForegroundColor Green
    Write-Host "SMS Event Published: $($loginResponse.smsPublishedEvent -ne $null)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Daily login failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📊 Checking SMS service metrics..." -ForegroundColor Green
try {
    $metrics = Invoke-WebRequest -Uri "http://localhost:4004/metrics" -UseBasicParsing
    $sentCount = ($metrics.Content | Select-String -Pattern "sms_sent_total\s+(\d+)").Matches.Groups[1].Value
    $failedCount = ($metrics.Content | Select-String -Pattern "sms_failed_total\s+(\d+)").Matches.Groups[1].Value
    
    Write-Host "✅ SMS Sent: $sentCount" -ForegroundColor Green
    Write-Host "❌ SMS Failed: $failedCount" -ForegroundColor $(if ($failedCount -eq "0") { "Green" } else { "Red" })
} catch {
    Write-Host "⚠️  Could not fetch metrics" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Check your phone for messages!" -ForegroundColor Cyan
Write-Host "📱 Phone: $PhoneNumber" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 To view detailed logs:" -ForegroundColor Yellow
Write-Host "   docker compose logs sms --tail=50" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Check Twilio Console:" -ForegroundColor Yellow
Write-Host "   https://console.twilio.com/monitor/logs/messages" -ForegroundColor Gray
