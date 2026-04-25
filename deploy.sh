#!/bin/bash

# Configuration
PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
BACKEND_SERVICE="learnmind-backend"
FRONTEND_SERVICE="learnmind-frontend"

if [ -z "$PROJECT_ID" ]; then
    echo "Error: No Google Cloud Project ID found. Please run 'gcloud config set project [PROJECT_ID]'"
    exit 1
fi

echo "Deploying LearnMind AI to Project: $PROJECT_ID in Region: $REGION"

# 1. Build and Deploy Backend
echo "--- Deploying Backend ---"
cd backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/$BACKEND_SERVICE
gcloud run deploy $BACKEND_SERVICE \
    --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated

# Get Backend URL
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --platform managed --region $REGION --format 'value(status.url)')
echo "Backend deployed at: $BACKEND_URL"

# 2. Build and Deploy Frontend
echo "--- Deploying Frontend ---"
cd ../frontend

# You might need to provide your Clerk Publishable Key here
# Read from .env if possible or ask user
if [ -f .env ]; then
    source .env
fi

gcloud builds submit --tag gcr.io/$PROJECT_ID/$FRONTEND_SERVICE \
    --build-arg VITE_API_URL=$BACKEND_URL \
    --build-arg VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

gcloud run deploy $FRONTEND_SERVICE \
    --image gcr.io/$PROJECT_ID/$FRONTEND_SERVICE \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated

FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --platform managed --region $REGION --format 'value(status.url)')
echo "--- Deployment Complete! ---"
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL"
