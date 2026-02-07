# Deploying Apartment Rental Portal to Google Cloud

This guide outlines the steps to deploy the backend and frontend services to **Google Cloud Run** and use **Cloud SQL** for the database.

## Prerequisites

1.  **Google Cloud Project**: An active GCP project is required.
2.  **Google Cloud CLI**: Installed and authenticated (`gcloud init`).
3.  **Billing Enabled**: Required for Cloud Run and Cloud SQL.

## 1. Setup Environment

Enable necessary APIs:
```powershell
gcloud services enable artifactregistry.googleapis.com run.googleapis.com sqladmin.googleapis.com
```

Create an Artifact Registry repository for Docker images:
```powershell
gcloud artifacts repositories create apartment-repo --repository-format=docker --location=asia-south1 --description="Apartment Rental Portal Repository"
```

## 2. Cloud SQL (PostgreSQL) Setup

1.  Create a Cloud SQL instance:
    ```powershell
    gcloud sql instances create apartment-db-asia --database-version=POSTGRES_15 --cpu=1 --memory=4GB --region=asia-south1
    ```
2.  Set the root password:
    ```powershell
    gcloud sql users set-password postgres --instance=apartment-db-asia --password=DB_PASSWORD
    ```
3.  Create the database:
    ```powershell
    gcloud sql databases create apartment_db --instance=apartment-db-asia
    ```

## 3. Deploy Backend

1.  **Build and Push Image**:
    ```powershell
    gcloud builds submit --tag asia-south1-docker.pkg.dev/PROJECT_ID/apartment-repo/apartment-backend ./backend
    ```
    *Replace `PROJECT_ID` with the actual project ID.*

2.  **Deploy to Cloud Run**:
    ```powershell
    gcloud run deploy apartment-backend ^
      --image asia-south1-docker.pkg.dev/PROJECT_ID/apartment-repo/apartment-backend ^
      --region asia-south1 ^
      --allow-unauthenticated ^
      --port 8080 ^
      --set-env-vars "DB_HOST=/cloudsql/PROJECT_ID:asia-south1:apartment-db-asia,DB_NAME=apartment_db,DB_USER=postgres,DB_PASSWORD=DB_PASSWORD,JWT_SECRET_KEY=production-secret,FLASK_DEBUG=False" ^
      --add-cloudsql-instances PROJECT_ID:asia-south1:apartment-db-asia
    ```
    *Note the `DB_HOST` connection string format.*

3.  **Get Backend URL**:
    Run `gcloud run services describe apartment-backend --region asia-south1 --format 'value(status.url)'`.

## 4. Deploy Frontend

1.  **Update Environment**:
    Update `frontend/user-portal/src/environments/environment.prod.ts` with the deployed backend URL.

2.  **Build and Push Image**:
    ```powershell
    gcloud builds submit --tag asia-south1-docker.pkg.dev/PROJECT_ID/apartment-repo/apartment-frontend ./frontend/user-portal
    ```

3.  **Deploy to Cloud Run**:
    ```powershell
    gcloud run deploy apartment-frontend ^
      --image asia-south1-docker.pkg.dev/PROJECT_ID/apartment-repo/apartment-frontend ^
      --region asia-south1 ^
      --allow-unauthenticated ^
      --port 8080
    ```

## 5. Initialize Database

Run the `init.sql` script manually or connect to the database securely to seed initial data.
To connect securely found in Cloud Shell:
```bash
gcloud sql connect apartment-db-asia --user=postgres --database=apartment_db
```
Then execute the contents of `backend/init.sql`.

## 6. Deployment Status

The application is LIVE.

- **Frontend URL**: https://apartment-frontend-334319182833.asia-south1.run.app
- **Backend URL**: https://apartment-backend-334319182833.asia-south1.run.app

### Admin Credentials
- **Email**: admin@test.com
- **Password**: admin123
