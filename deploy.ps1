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
gcloud builds submit --tag "gcr.io/$ProjectId/$BackendService"
gcloud run deploy $BackendService `
    --image "gcr.io/$ProjectId/$BackendService" `
    --platform managed `
    --region $Region `
    --allow-unauthenticated

# Get Backend URL
$BackendUrl = gcloud run services describe $BackendService --platform managed --region $Region --format 'value(status.url)'
Write-Host "Backend deployed at: $BackendUrl" -ForegroundColor Yellow

# 2. Build and Deploy Frontend
Write-Host "--- Deploying Frontend ---" -ForegroundColor Green
Set-Location ..\frontend

# Read Clerk Key from .env if possible
if (Test-Path .env) {
    $envContent = Get-Content .env
    foreach ($line in $envContent) {
        if ($line -match "^VITE_CLERK_PUBLISHABLE_KEY=(.*)") {
            $ViteClerkKey = $Matches[1].Trim()
        }
    }
}

gcloud builds submit --tag "gcr.io/$ProjectId/$FrontendService" `
    --build-arg "VITE_API_URL=$BackendUrl" `
    --build-arg "VITE_CLERK_PUBLISHABLE_KEY=$ViteClerkKey"

gcloud run deploy $FrontendService `
    --image "gcr.io/$ProjectId/$FrontendService" `
    --platform managed `
    --region $Region `
    --allow-unauthenticated

$FrontendUrl = gcloud run services describe $FrontendService --platform managed --region $Region --format 'value(status.url)'

Write-Host "--- Deployment Complete! ---" -ForegroundColor Cyan
Write-Host "Frontend: $FrontendUrl" -ForegroundColor White
Write-Host "Backend: $BackendUrl" -ForegroundColor White

Set-Location ..
