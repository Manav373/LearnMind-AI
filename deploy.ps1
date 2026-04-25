# Configuration
$ProjectId = gcloud config get-value project
$Region = "us-central1"
$BackendService = "learnmind-backend"
$FrontendService = "learnmind-frontend"

if (-not $ProjectId) {
    Write-Error "Error: No Google Cloud Project ID found. Please run 'gcloud config set project [PROJECT_ID]'"
    exit 1
}

Write-Host "Deploying LearnMind AI to Project: $ProjectId in Region: $Region" -ForegroundColor Cyan

# 1. Build and Deploy Backend
Write-Host "--- Deploying Backend ---" -ForegroundColor Green
Set-Location backend
gcloud run deploy $BackendService `
    --source . `
    --platform managed `
    --region $Region `
    --allow-unauthenticated `
    --quiet

# Get Backend URL
$BackendUrl = gcloud run services describe $BackendService --platform managed --region $Region --format 'value(status.url)'
Write-Host "Backend deployed at: $BackendUrl" -ForegroundColor Yellow

# 2. Build and Deploy Frontend
Write-Host "--- Deploying Frontend ---" -ForegroundColor Green
Set-Location ..\frontend

# Read Clerk Key from .env if possible
$ViteClerkKey = ""
if (Test-Path .env) {
    $envContent = Get-Content .env
    foreach ($line in $envContent) {
        if ($line -match "^VITE_CLERK_PUBLISHABLE_KEY=(.*)") {
            $ViteClerkKey = $Matches[1].Trim()
        }
    }
}

if (-not $ViteClerkKey) {
    Write-Warning "VITE_CLERK_PUBLISHABLE_KEY not found in .env. Deployment might fail or lack authentication."
}

# Use --set-build-env-vars to pass variables to the build process (Vite)
gcloud run deploy $FrontendService `
    --source . `
    --platform managed `
    --region $Region `
    --allow-unauthenticated `
    --set-build-env-vars "VITE_API_URL=$BackendUrl,VITE_CLERK_PUBLISHABLE_KEY=$ViteClerkKey" `
    --quiet

$FrontendUrl = gcloud run services describe $FrontendService --platform managed --region $Region --format 'value(status.url)'

Write-Host "--- Deployment Complete! ---" -ForegroundColor Cyan
Write-Host "Frontend: $FrontendUrl" -ForegroundColor White
Write-Host "Backend: $BackendUrl" -ForegroundColor White

Set-Location ..
