# 🏢 Apartment Rental Portal - Docker Setup

This document provides instructions for running the Apartment Rental Portal using Docker.

## 🚀 Quick Start

### 1. Create Environment File
Copy the example environment file:
```bash
# Windows PowerShell
Copy-Item .env.example .env
```

### 2. Build and Start
```bash
docker-compose up -d
```

### 3. Access Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🛠️ Common Commands

### Stop All Services
```bash
docker-compose down
```

### Rebuild After Changes
```bash
docker-compose up -d --build
```

### View Logs
```bash
docker-compose logs -f
```

## ⚠️ Notes
- The database initializes with sample data automatically.
- **Login**: Register a new user at http://localhost/register.
- **Admin**: Update a user role to 'admin' in the database to access the Admin Portal.
