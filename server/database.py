from flask import Flask, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import os

# Load .env
load_dotenv()

app = Flask(__name__)

# Database connection function
def get_connection():
    return psycopg2.connect(
        user=os.getenv("user"),
        password=os.getenv("password"),
        host=os.getenv("host"),
        port=os.getenv("port"),
        dbname=os.getenv("dbname")
    )

# User Section
def get_table_list():
    try:
        with get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public';
                """)
                return cursor.fetchall()
    except Exception as e:
        print(f"Failed to fetch table list: {e}")
        return []

# Fetch all rows from a given table
def fetch_table_data(table_name):
    try:
        with get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(f'SELECT * FROM "{table_name}";')
                return cursor.fetchall()
    except Exception as e:
        return {"error": str(e)}

# API: Get all data from all tables
@app.route('/data', methods=['GET'])
def get_all_data():
    tables = get_table_list()
    data = {}
    for table in tables:
        table_name = table['table_name']
        data[table_name] = fetch_table_data(table_name)
    return jsonify(data)

# API: Get all table names
@app.route('/getAllTable', methods=['GET'])
def get_all_table():
    tables = get_table_list()
    return jsonify({"tables": [table['table_name'] for table in tables]})

# API: Debug prints tables to console
@app.route('/debug', methods=['POST'])
def debug():
    tables = get_table_list()
    print("Tables in database:")
    for table in tables:
        print(table['table_name'])
    return jsonify({"debug": "Printed to console"})

# Start Flask server
if __name__ == '__main__':
    app.run(debug=True)
