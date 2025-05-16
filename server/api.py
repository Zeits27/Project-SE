from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)



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

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})



# Get user by email
def get_user_by_email(email):
    response = supabase.table("users").select("*").eq("email", email).limit(1).execute()
    if response.data and len(response.data) > 0:
        return response.data[0]
    return None


# Register endpoint
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    if get_user_by_email(email):
        return jsonify({"error": "Email already registered"}), 400

    hashed_pw = generate_password_hash(password)

    try:
        response = supabase.table("users").insert({
            "name": name,
            "email": email,
            "password": hashed_pw
        }).execute()

        print("Insert response:", response)

        if not response.data:
            return jsonify({"error": "Failed to register user"}), 500

        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        print("Registration exception:", e)
        return jsonify({"error": "Something went wrong."}), 500


# Login endpoint
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = get_user_by_email(email)

    if user and check_password_hash(user["password"], password):
        return jsonify({
            "message": "Login successful",
            "name": user["name"]
        })
    else:
        return jsonify({"error": "Invalid email or password"}), 401

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
# Run server
if __name__ == '__main__':
    app.run(debug=True, port=8080)
