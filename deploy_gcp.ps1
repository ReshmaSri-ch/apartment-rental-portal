# Google Cloud Deployment Script

$PROJECT_ID = Read-Host "Enter your Google Cloud Project ID"
$REGION = "us-central1"
$REPO_NAME = "apartment-repo"
$DB_INSTANCE = "apartment-db-instance"
$DB_PASSWORD = Read-Host "Enter your Database Password" -AsSecureString
$DB_PASSWORD_PLAIN = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD))

Write-Host "Enabling APIs..."
gcloud services enable artifactregistry.googleapis.com run.googleapis.com sqladmin.googleapis.com

Write-Host "Creating Artifact Registry..."
gcloud artifacts repositories create $REPO_NAME --repository-format=docker --location=$REGION --description="Apartment Rental Portal Repository"

Write-Host "Creating Cloud SQL Instance (this may take a while)..."
gcloud sql instances create $DB_INSTANCE --database-version=POSTGRES_15 --cpu=1 --memory=4GB --region=$REGION
gcloud sql users set-password postgres --instance=$DB_INSTANCE --password=$DB_PASSWORD_PLAIN
gcloud sql databases create apartment_db --instance=$DB_INSTANCE

Write-Host "Deploying Backend..."
gcloud builds submit --tag "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/apartment-backend" ./backend

gcloud run deploy apartment-backend `
  --image "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/apartment-backend" `
  --region $REGION `
  --allow-unauthenticated `
  --set-env-vars "DB_Host=/cloudsql/$PROJECT_ID:$REGION:$DB_INSTANCE,DB_NAME=apartment_db,DB_USER=postgres,DB_PASSWORD=$DB_PASSWORD_PLAIN,JWT_SECRET_KEY=super-secret-key-change-in-production,FLASK_DEBUG=False" `
  --add-cloudsql-instances "$PROJECT_ID:$REGION:$DB_INSTANCE"

$BACKEND_URL = gcloud run services describe apartment-backend --region $REGION --format 'value(status.url)'
Write-Host "Backend deployed at: $BACKEND_URL"

Write-Host "Updating Frontend Configuration..."
$ConfigFile = "./frontend/user-portal/src/environments/environment.prod.ts"
(Get-Content $ConfigFile).Replace("YOUR_BACKEND_URL", $BACKEND_URL) | Set-Content $ConfigFile

Write-Host "Deploying Frontend..."
gcloud builds submit --tag "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/apartment-frontend" ./frontend/user-portal

gcloud run deploy apartment-frontend `
  --image "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/apartment-frontend" `
  --region $REGION `
  --allow-unauthenticated `
  --port 8080

$FRONTEND_URL = gcloud run services describe apartment-frontend --region $REGION --format 'value(status.url)'
Write-Host "Deployment Complete!"
Write-Host "Frontend URL: $FRONTEND_URL"
Write-Host "Backend URL: $BACKEND_URL"
