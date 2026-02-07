@echo off
set /p PROJECT_ID="Enter your Google Cloud Project ID: "
set REGION=asia-south1
set REPO_NAME=apartment-repo
set DB_INSTANCE=apartment-db-asia
set /p DB_PASSWORD="Enter your Database Password: "

echo Enabling APIs...
call gcloud services enable artifactregistry.googleapis.com run.googleapis.com sqladmin.googleapis.com

echo Creating Artifact Registry...
call gcloud artifacts repositories create %REPO_NAME% --repository-format=docker --location=%REGION% --description="Apartment Rental Portal Repository"

echo Creating Cloud SQL Instance...
call gcloud sql instances create %DB_INSTANCE% --database-version=POSTGRES_15 --cpu=1 --memory=4GB --region=%REGION%
call gcloud sql users set-password postgres --instance=%DB_INSTANCE% --password=%DB_PASSWORD%
call gcloud sql databases create apartment_db --instance=%DB_INSTANCE%

echo.
echo --------------------------------------------------------------------------------
echo Deploying Backend...
echo --------------------------------------------------------------------------------
call gcloud builds submit --tag %REGION%-docker.pkg.dev/%PROJECT_ID%/%REPO_NAME%/apartment-backend ./backend

call gcloud run deploy apartment-backend --image %REGION%-docker.pkg.dev/%PROJECT_ID%/%REPO_NAME%/apartment-backend --region %REGION% --allow-unauthenticated --port 8080 --set-env-vars "DB_HOST=/cloudsql/%PROJECT_ID%:%REGION%:%DB_INSTANCE%,DB_NAME=apartment_db,DB_USER=postgres,DB_PASSWORD=%DB_PASSWORD%,JWT_SECRET_KEY=super-secret-key-change-in-production,FLASK_DEBUG=False" --add-cloudsql-instances %PROJECT_ID%:%REGION%:%DB_INSTANCE%

echo.
echo *****************************************************
echo Backend deployed!
echo Please find the Backend URL in the output above.
echo (It ends with .run.app)
echo.
echo NOW: Open 'frontend/user-portal/src/environments/environment.prod.ts'
echo and replace 'YOUR_BACKEND_URL' with that URL.
echo.
echo Save the file, and then...
echo *****************************************************
pause

echo.
echo --------------------------------------------------------------------------------
echo Deploying Frontend...
echo --------------------------------------------------------------------------------
call gcloud builds submit --tag %REGION%-docker.pkg.dev/%PROJECT_ID%/%REPO_NAME%/apartment-frontend ./frontend/user-portal

call gcloud run deploy apartment-frontend --image %REGION%-docker.pkg.dev/%PROJECT_ID%/%REPO_NAME%/apartment-frontend --region %REGION% --allow-unauthenticated --port 8080

echo.
echo Done!
pause
