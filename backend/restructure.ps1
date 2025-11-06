# Backend Restructuring Script
# This script reorganizes the backend folder into a clean microservices architecture

Write-Host "🚀 Backend Restructuring Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = $PSScriptRoot

# Step 1: Create new directory structure
Write-Host "📁 Creating new directory structure..." -ForegroundColor Yellow

$newDirs = @(
    "services",
    "config/secrets",
    "config/grafana",
    "config/prometheus",
    "config/protos",
    "shared/testing-ui",
    "shared/scripts"
)

foreach ($dir in $newDirs) {
    $fullPath = Join-Path $backendPath $dir
    if (!(Test-Path $fullPath)) {
        New-Item -Path $fullPath -ItemType Directory -Force | Out-Null
        Write-Host "  ✅ Created: $dir" -ForegroundColor Green
    } else {
        Write-Host "  ⏭️  Exists: $dir" -ForegroundColor Gray
    }
}

Write-Host ""

# Step 2: Move services
Write-Host "📦 Moving microservices..." -ForegroundColor Yellow

$services = @(
    "notification-service",
    "sms-service",
    "email-service",
    "gamification-service"
)

foreach ($service in $services) {
    $source = Join-Path $backendPath $service
    $dest = Join-Path $backendPath "services\$service"
    
    if ((Test-Path $source) -and !(Test-Path $dest)) {
        Move-Item -Path $source -Destination $dest -Force
        Write-Host "  ✅ Moved: $service -> services/$service" -ForegroundColor Green
    } elseif (Test-Path $dest) {
        Write-Host "  ⏭️  Already moved: $service" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠️  Not found: $service" -ForegroundColor Red
    }
}

Write-Host ""

# Step 3: Move config files
Write-Host "⚙️  Moving configuration files..." -ForegroundColor Yellow

# Grafana
$grafanaSource = Join-Path $backendPath "grafana"
$grafanaDest = Join-Path $backendPath "config\grafana"
if ((Test-Path $grafanaSource) -and !(Test-Path $grafanaDest)) {
    Move-Item -Path $grafanaSource -Destination $grafanaDest -Force
    Write-Host "  ✅ Moved: grafana -> config/grafana" -ForegroundColor Green
} elseif (Test-Path $grafanaDest) {
    Write-Host "  ⏭️  Already moved: grafana" -ForegroundColor Gray
}

# Prometheus
$prometheusSource = Join-Path $backendPath "prometheus"
$prometheusDest = Join-Path $backendPath "config\prometheus"
if ((Test-Path $prometheusSource) -and !(Test-Path $prometheusDest)) {
    Move-Item -Path $prometheusSource -Destination $prometheusDest -Force
    Write-Host "  ✅ Moved: prometheus -> config/prometheus" -ForegroundColor Green
} elseif (Test-Path $prometheusDest) {
    Write-Host "  ⏭️  Already moved: prometheus" -ForegroundColor Gray
}

# Protos
$protosSource = Join-Path $backendPath "protos"
$protosDest = Join-Path $backendPath "config\protos"
if ((Test-Path $protosSource) -and !(Test-Path $protosDest)) {
    Move-Item -Path $protosSource -Destination $protosDest -Force
    Write-Host "  ✅ Moved: protos -> config/protos" -ForegroundColor Green
} elseif (Test-Path $protosDest) {
    Write-Host "  ⏭️  Already moved: protos" -ForegroundColor Gray
}

Write-Host ""

# Step 4: Move secrets
Write-Host "🔒 Moving secrets to config/secrets..." -ForegroundColor Yellow

$secretFiles = @(
    ".env",
    ".env.example",
    "firebase-sa.json"
)

foreach ($file in $secretFiles) {
    $source = Join-Path $backendPath $file
    $dest = Join-Path $backendPath "config\secrets\$file"
    
    if ((Test-Path $source) -and !(Test-Path $dest)) {
        Move-Item -Path $source -Destination $dest -Force
        Write-Host "  ✅ Moved: $file -> config/secrets/$file" -ForegroundColor Green
    } elseif (Test-Path $dest) {
        Write-Host "  ⏭️  Already moved: $file" -ForegroundColor Gray
    } else {
        Write-Host "  ⏭️  Not found: $file" -ForegroundColor Gray
    }
}

Write-Host ""

# Step 5: Move testing UI
Write-Host "🧪 Moving testing UI..." -ForegroundColor Yellow

$testingSource = Join-Path $backendPath "testing-notification"
$testingDest = Join-Path $backendPath "shared\testing-ui"
if ((Test-Path $testingSource) -and !(Test-Path $testingDest)) {
    Move-Item -Path $testingSource -Destination $testingDest -Force
    Write-Host "  ✅ Moved: testing-notification -> shared/testing-ui" -ForegroundColor Green
} elseif (Test-Path $testingDest) {
    Write-Host "  ⏭️  Already moved: testing-notification" -ForegroundColor Gray
}

Write-Host ""

# Step 6: Move scripts
Write-Host "📜 Moving scripts..." -ForegroundColor Yellow

$scripts = @(
    "test-sms.ps1",
    "test-verify.ps1",
    "check-twilio-account.js",
    "sendBadgeEvent.js",
    "testProducer.js"
)

foreach ($script in $scripts) {
    $source = Join-Path $backendPath $script
    $dest = Join-Path $backendPath "shared\scripts\$script"
    
    if ((Test-Path $source) -and !(Test-Path $dest)) {
        Move-Item -Path $source -Destination $dest -Force
        Write-Host "  ✅ Moved: $script -> shared/scripts/$script" -ForegroundColor Green
    } elseif (Test-Path $dest) {
        Write-Host "  ⏭️  Already moved: $script" -ForegroundColor Gray
    } else {
        Write-Host "  ⏭️  Not found: $script" -ForegroundColor Gray
    }
}

Write-Host ""

# Step 7: Delete old MD files (except README)
Write-Host "🗑️  Removing old documentation files..." -ForegroundColor Yellow

$oldDocs = @(
    "QUICKSTART_VERIFY.md",
    "TWILIO_VERIFY_GUIDE.md",
    "TWILIO_SMS_GUIDE.md",
    "TWILIO_ERROR_30039_RESOLUTION.md",
    "PHONE_VERIFICATION_COMPLETE_SYSTEM.md",
    "SMS_MESSAGE_LOOP_FIX.md",
    "MICROSERVICES.txt"
)

foreach ($doc in $oldDocs) {
    $path = Join-Path $backendPath $doc
    if (Test-Path $path) {
        Remove-Item -Path $path -Force
        Write-Host "  ✅ Deleted: $doc" -ForegroundColor Green
    } else {
        Write-Host "  ⏭️  Not found: $doc" -ForegroundColor Gray
    }
}

Write-Host ""

# Step 8: Replace README
Write-Host "📝 Replacing README.md..." -ForegroundColor Yellow

$oldReadme = Join-Path $backendPath "README.md"
$newReadme = Join-Path $backendPath "README_NEW.md"

if (Test-Path $newReadme) {
    if (Test-Path $oldReadme) {
        Remove-Item -Path $oldReadme -Force
        Write-Host "  ✅ Deleted old README.md" -ForegroundColor Green
    }
    Rename-Item -Path $newReadme -NewName "README.md" -Force
    Write-Host "  ✅ Replaced with new README.md" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  README_NEW.md not found" -ForegroundColor Red
}

Write-Host ""

# Step 9: Update docker-compose paths
Write-Host "🐳 Updating docker-compose.yml paths..." -ForegroundColor Yellow
Write-Host "  ⚠️  You need to manually update docker-compose.yml paths:" -ForegroundColor Red
Write-Host "     - notification-service/ -> services/notification-service/" -ForegroundColor Yellow
Write-Host "     - sms-service/ -> services/sms-service/" -ForegroundColor Yellow
Write-Host "     - email-service/ -> services/email-service/" -ForegroundColor Yellow
Write-Host "     - gamification-service/ -> services/gamification-service/" -ForegroundColor Yellow
Write-Host "     - .env -> config/secrets/.env" -ForegroundColor Yellow
Write-Host "     - testing-notification/ -> shared/testing-ui/" -ForegroundColor Yellow
Write-Host "     - grafana/ -> config/grafana/" -ForegroundColor Yellow
Write-Host "     - prometheus/ -> config/prometheus/" -ForegroundColor Yellow

Write-Host ""
Write-Host "✅ Restructuring complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Update docker-compose.yml paths (see above)" -ForegroundColor White
Write-Host "  2. Update docker-compose.override.yml paths" -ForegroundColor White
Write-Host "  3. Test: docker compose up -d --build" -ForegroundColor White
Write-Host "  4. Commit changes: git add . && git commit -m 'Restructure backend'" -ForegroundColor White
Write-Host ""
