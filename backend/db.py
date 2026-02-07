import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    try:
        # Try both uppercase and mixed case to be safe
        db_host = os.getenv("DB_HOST") or os.getenv("DB_Host")
        db_name = os.getenv("DB_NAME")
        db_user = os.getenv("DB_USER")
        db_password = os.getenv("DB_PASSWORD")
        
        if not db_host:
            print("Error: DB_HOST/DB_Host is missing")

        conn = psycopg2.connect(
            host=db_host,
            database=db_name,
            user=db_user,
            password=db_password,
            port=os.getenv("DB_PORT", "5432")
        )
        return conn
    except Exception as e:
        print("DB connection failed:", e)
        return None


