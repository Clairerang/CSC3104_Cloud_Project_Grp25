@echo off
SETLOCAL EnableDelayedExpansion
REM Script to tag and push all Senior Care images to DockerHub

echo ====================================
echo Senior Care - Push to DockerHub
echo ====================================
echo.

REM Prompt for DockerHub username
set /p DOCKERHUB_USERNAME="Enter your DockerHub username: "

if "%DOCKERHUB_USERNAME%"=="" (
    echo Error: DockerHub username cannot be empty!
    exit /b 1
)

echo.
echo Logging in to DockerHub...
docker login

if %ERRORLEVEL% NEQ 0 (
    echo Error: Docker login failed!
    exit /b 1
)

echo.
echo ====================================
echo Tagging and pushing images...
echo ====================================

REM List of images to push
set IMAGES=senior-care-frontend senior-care-api-gateway senior-care-games-service senior-care-notification-service senior-care-push-notification-service senior-care-ai-companion-service senior-care-sms-service senior-care-email-service

for %%i in (%IMAGES%) do (
    echo.
    echo [%%i] Tagging...
    docker tag %%i:latest %DOCKERHUB_USERNAME%/%%i:latest
    
    if !ERRORLEVEL! NEQ 0 (
        echo Error: Failed to tag %%i
    ) else (
        echo [%%i] Pushing to DockerHub...
        docker push %DOCKERHUB_USERNAME%/%%i:latest
        
        if !ERRORLEVEL! NEQ 0 (
            echo Error: Failed to push %%i
        ) else (
            echo [%%i] Successfully pushed!
        )
    )
)

echo.
echo ====================================
echo Done!
echo ====================================
echo.
echo Your images are now available at:
for %%i in (%IMAGES%) do (
    echo   - https://hub.docker.com/r/%DOCKERHUB_USERNAME%/%%i
)
echo.
pause
