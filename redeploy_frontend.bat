@echo off
set REGION=asia-south1
set PROJECT_ID=apartment-rental-portal-486707
set REPO_NAME=apartment-repo

echo.
echo ==========================================
echo  FAST REDEPLOY: Frontend Only
echo ==========================================
echo.

call gcloud builds submit --tag %REGION%-docker.pkg.dev/%PROJECT_ID%/%REPO_NAME%/apartment-frontend ./frontend/user-portal

call gcloud run deploy apartment-frontend --image %REGION%-docker.pkg.dev/%PROJECT_ID%/%REPO_NAME%/apartment-frontend --region %REGION% --allow-unauthenticated --port 8080

echo.
echo ==========================================
echo  DONE! Refresh your browser now.
echo ==========================================
pause
