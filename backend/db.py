import os
import psycopg2

def get_db_connection():
    try:
        database_url = os.getenv("DATABASE_URL")

        if database_url:
            # Railway / production
            conn = psycopg2.connect(database_url)
        else:
            # Local development fallback
            conn = psycopg2.connect(
                host=os.getenv("DB_HOST"),
                dbname=os.getenv("DB_NAME"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASSWORD"),
                port=os.getenv("DB_PORT", 5432)
            )

        return conn

    except Exception as e:
        print("DB connection failed:", e)
        return None
