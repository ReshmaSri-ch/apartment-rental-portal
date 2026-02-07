@echo off
set REGION=asia-south1
set PROJECT_ID=apartment-rental-portal-486707
set REPO_NAME=apartment-repo
set DB_INSTANCE=apartment-db-asia
set /p DB_PASSWORD="Enter your Database Password again (to verify connection): "

echo.
echo ==========================================
echo  FIXING BACKEND CONNECTION
echo ==========================================
echo.

echo 1. Rebuilding Backend...
call gcloud builds submit --tag %REGION%-docker.pkg.dev/%PROJECT_ID%/%REPO_NAME%/apartment-backend ./backend

echo.
echo 2. Redeploying with CORRECT Environment Variables...
call gcloud run deploy apartment-backend --image %REGION%-docker.pkg.dev/%PROJECT_ID%/%REPO_NAME%/apartment-backend --region %REGION% --allow-unauthenticated --port 8080 --set-env-vars "DB_HOST=/cloudsql/%PROJECT_ID%:%REGION%:%DB_INSTANCE%,DB_NAME=apartment_db,DB_USER=postgres,DB_PASSWORD=%DB_PASSWORD%,JWT_SECRET_KEY=super-secret-key-change-in-production,FLASK_DEBUG=False" --add-cloudsql-instances %PROJECT_ID%:%REGION%:%DB_INSTANCE%

echo.
echo ==========================================
echo  DONE!
echo  Wait 30 seconds, then try to Register on the website.
echo ==========================================
pause
