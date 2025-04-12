import os
import django
from django.db import connection

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')
django.setup()

def drop_all_tables():
    with connection.cursor() as cursor:
        # Drop all tables in the public schema
        cursor.execute("""
            DO $$ DECLARE
                r RECORD;
            BEGIN
                FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                END LOOP;
            END $$;
        """)
        print("All tables have been dropped.")

if __name__ == '__main__':
    drop_all_tables() 