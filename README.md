# 🏢 Smart Rental Portal - Full Stack Application

A comprehensive apartment rental management system built with Angular 20, Flask, and PostgreSQL.

## 🌟 Features

### User Portal
- **Browse Flats**: View available apartments with detailed amenities.
- **Advanced Filtering**: Filter by Tower and Floor to find the perfect unit.
- **Booking System**: Request bookings for available flats.
- **Dashboard**: Track status of booking requests.

### Admin Portal
- **Dashboard**: View occupancy stats and revenue reports.
- **Management**: Manage towers, flats, and amenities.
- **Approvals**: Approve or reject booking requests.
- **Tenants**: Manage leases and payment statuses.

## 🏗️ Tech Stack
- **Frontend**: Angular 20, Tailwind CSS
- **Backend**: Python Flask, JWT Authentication
- **Database**: PostgreSQL
- **Infrastructure**: Docker & Docker Compose

## 🚀 Setup & Installation

### Prerequisites
- Docker Desktop installed and running.

### Quick Start
1. **Clone the repository** (if not already done).
2. **Create Environment File**:
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env
   ```
3. **Build and Run**:
   ```bash
   docker-compose up -d --build
   ```

### Demo Credentials
- **Admin**: Create a user via registration, then manually update their role to 'admin' in the database.
- **User**: Register a new account at http://localhost/register.

## 🛠️ Project Structure
- `/frontend` - Angular application source code.
- `/backend` - Flask API source code.
- `docker-compose.yml` - Orchestration configuration.
- `.env.example` - Template for environment variables.
