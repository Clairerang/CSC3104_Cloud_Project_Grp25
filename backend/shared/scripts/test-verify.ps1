# Twilio Verify (OTP) Test Script
# Usage: .\test-verify.ps1 "+61412345678"

param(
    [Parameter(Mandatory=$true)]
    [string]$PhoneNumber
)

Write-Host ""
Write-Host "🔐 Twilio Verify - Phone Number Verification Test" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Validate E.164 format
if (-not $PhoneNumber.StartsWith("+")) {
    Write-Host "❌ Error: Phone number must start with + (E.164 format)" -ForegroundColor Red
    Write-Host "   Example: +61412345678 for Australia" -ForegroundColor Yellow
    exit 1
}

Write-Host "📱 Phone Number: $PhoneNumber" -ForegroundColor Gray
Write-Host ""

# Step 1: Send Verification Code
Write-Host "📤 Step 1: Sending verification code..." -ForegroundColor Green
try {
    $sendBody = @{
        to = $PhoneNumber
        channel = "sms"
    } | ConvertTo-Json

    $sendResponse = Invoke-RestMethod -Uri "http://localhost:4004/verify/send" `
        -Method POST `
        -ContentType "application/json" `
        -Body $sendBody `
        -ErrorAction Stop

    Write-Host "✅ Verification code sent successfully!" -ForegroundColor Green
    Write-Host "   Status: $($sendResponse.status)" -ForegroundColor Gray
    Write-Host "   Channel: $($sendResponse.channel)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📱 Check your phone for the 6-digit code!" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host "❌ Failed to send verification code" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try to parse error response
    if ($_.ErrorDetails.Message) {
        try {
            $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "   Details: $($errorObj.error)" -ForegroundColor Red
        } catch {}
    }
    exit 1
}

# Step 2: Prompt for verification code
Write-Host "🔢 Step 2: Enter the verification code" -ForegroundColor Green
$code = Read-Host "Enter the 6-digit code you received"

if ([string]::IsNullOrWhiteSpace($code)) {
    Write-Host "❌ No code entered. Exiting." -ForegroundColor Red
    exit 1
}

# Remove any spaces or dashes
$code = $code.Replace(" ", "").Replace("-", "")

Write-Host ""
Write-Host "🔍 Verifying code: $code" -ForegroundColor Yellow

# Step 3: Check Verification Code
try {
    $checkBody = @{
        to = $PhoneNumber
        code = $code
    } | ConvertTo-Json

    $checkResponse = Invoke-RestMethod -Uri "http://localhost:4004/verify/check" `
        -Method POST `
        -ContentType "application/json" `
        -Body $checkBody `
        -ErrorAction Stop

    Write-Host ""
    if ($checkResponse.verified) {
        Write-Host "✅ SUCCESS! Phone number verified!" -ForegroundColor Green
        Write-Host "   Status: $($checkResponse.status)" -ForegroundColor Gray
        Write-Host "   $($checkResponse.message)" -ForegroundColor Green
    } else {
        Write-Host "❌ Verification failed" -ForegroundColor Red
        Write-Host "   $($checkResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "❌ Verification check failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try to parse error response
    if ($_.ErrorDetails.Message) {
        try {
            $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "   Details: $($errorObj.message)" -ForegroundColor Red
        } catch {}
    }
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "📊 Check Twilio Console for details:" -ForegroundColor Yellow
Write-Host "   https://console.twilio.com/monitor/logs/verify" -ForegroundColor Gray
Write-Host ""
