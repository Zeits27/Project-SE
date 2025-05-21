from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import jwt
import datetime
import re
import unicodedata


# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Secrets
JWT_SECRET = os.getenv("JWT_SECRET", "your-jwt-secret")
JWT_EXP_DELTA_SECONDS = 3600  # Token valid for 1 hour

# Database connection
def get_connection():
    return psycopg2.connect(
        user=os.getenv("user"),
        password=os.getenv("password"),
        host=os.getenv("host"),
        port=os.getenv("port"),
        dbname=os.getenv("dbname")
    )

def generate_slug(title):
    # Normalisasi, hilangkan karakter khusus, ubah spasi jadi strip
    slug = unicodedata.normalize('NFKD', title)
    slug = slug.encode('ascii', 'ignore').decode('ascii')
    slug = re.sub(r'[^\w\s-]', '', slug).strip().lower()
    slug = re.sub(r'[\s_-]+', '-', slug)
    return slug

# Helper: get user by email
def get_user_by_email(email):
    try:
        with get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("SELECT * FROM users WHERE email = %s LIMIT 1;", (email,))
                return cursor.fetchone()
    except Exception as e:
        print("Error fetching user:", e)
        return None

# Helper: decode token
def decode_token(request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload["email"]
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# Register

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    existing_user = get_user_by_email(email)
    if existing_user:
        return jsonify({"error": "Email already registered"}), 400

    hashed_pw = generate_password_hash(password)

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO users (name, email, password) VALUES (%s, %s, %s);",
                    (name, email, hashed_pw)
                )
                conn.commit()

        # Generate token after successful registration
        payload = {
            "email": email,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(seconds=JWT_EXP_DELTA_SECONDS)
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

        return jsonify({
            "message": "User registered successfully",
            "token": token,
            "name": name
        }), 201

    except Exception as e:
        print("Registration exception:", e)
        return jsonify({"error": "Something went wrong."}), 500


# Login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = get_user_by_email(email)

    if user and check_password_hash(user["password"], password):
        payload = {
            "email": user["email"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(seconds=JWT_EXP_DELTA_SECONDS)
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
        return jsonify({
            "message": "Login successful",
            "token": token,
            "name": user["name"]
        })
    else:
        return jsonify({"error": "Invalid email or password"}), 401

# Set Profile
@app.route('/api/profile', methods=['POST'])
def set_profile():
    email = decode_token(request)
    if not email:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    birthdate = data.get("birthdate")
    education = data.get("education")
    region = data.get("region")

    if not birthdate or not education or not region:
        return jsonify({"error": "All fields are required"}), 400

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE users
                    SET birthdate = %s,
                        education = %s,
                        region = %s
                    WHERE email = %s;
                """, (birthdate, education, region, email))
                conn.commit()

        return jsonify({"message": "Profile updated successfully"}), 200

    except Exception as e:
        print("Profile update error:", e)
        return jsonify({"error": "Failed to update profile"}), 500
    

# API: Get current user info
@app.route('/api/me', methods=['GET'])
def get_me():
    email = decode_token(request)
    if not email:
        return jsonify({"error": "Unauthorized"}), 401

    user = get_user_by_email(email)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Only send back the info you want the frontend to have
    return jsonify({
        "name": user["name"],
        "email": user["email"],
        "birthdate": user.get("birthdate"),
        "education": user.get("education"),
        "region": user.get("region"),
    })

    # Helper: get user ID by email
def get_user_id_by_email(email):
        try:
            with get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("SELECT id FROM users WHERE email = %s LIMIT 1;", (email,))
                    result = cursor.fetchone()
                    return result["id"] if result else None
        except Exception as e:
            print("Error fetching user ID:", e)
            return None

    # API: Get current user ID
@app.route('/api/user_id', methods=['GET'])
def get_user_id():
        email = decode_token(request)
        if not email:
            return jsonify({"error": "Unauthorized"}), 401

        user_id = get_user_id_by_email(email)
        if not user_id:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"user_id": user_id})

    # API: Create a community
@app.route('/api/community', methods=['POST'])
def create_community():
        email = decode_token(request)
        if not email:
            return jsonify({"error": "Unauthorized"}), 401

        data = request.get_json()
        name = data.get("name")
        description = data.get("description")
        user_id = data.get("user_id")

        if not name or not description or not user_id:
            return jsonify({"error": "All fields are required"}), 400

        try:
            with get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(
                        """
                        INSERT INTO communities (name, description, user_id)
                        VALUES (%s, %s, %s)
                        RETURNING id;
                        """,
                        (name, description, user_id)
                    )
                    community_id = cursor.fetchone()[0]
                    conn.commit()

            return jsonify({
                "message": "Community created successfully",
                "community_id": community_id
            }), 201

        except Exception as e:
            print("Community creation error:", e)
            return jsonify({"error": "Failed to create community"}), 500
        
#create live-class
@app.route('/api/live-class', methods=['POST'])
def create_live_class():
    email = decode_token(request)
    if not email:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    name = data.get("name")
    description = data.get("description")
    link = data.get("link")
    date_time = data.get("date_time")
    user_id = data.get("user_id")
    subject = data.get("subject")


    if not name or not description or not link or not date_time or not subject or not user_id:
        return jsonify({"error": "All fields are required"}), 400

    slug = generate_slug(name)

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                base_slug = slug
                counter = 1
                while True:
                    cursor.execute("SELECT id FROM book WHERE slug = %s", (slug,))
                    if not cursor.fetchone():
                        break
                    slug = f"{base_slug}-{counter}"
                    counter += 1

                cursor.execute(
                    """
                    INSERT INTO live_class (name, description, link, date_time, subject, user_id, slug)
                    VALUES (%s, %s, %s, %s, %s, %s,%s)
                    RETURNING id;
                    """,
                    (name, description, link, date_time, subject, user_id, slug)
                )
                live_class_id = cursor.fetchone()[0]
                conn.commit()

        return jsonify({
            "message": "Live class created successfully",
            "live_class_id": live_class_id
        }), 201

    except Exception as e:
        print("live class creation error:", e)
        return jsonify({"error": "Failed to create live class"}), 500

#get all live class
@app.route("/api/live-class", methods=["GET"])
def get_all_liveclass():
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, description, link, date_time, subject, slug
                    FROM live_class
                    ORDER BY created_at DESC
                """)
                rows = cursor.fetchall()
                books = []
                for row in rows:
                    books.append({
                        "id": row[0],
                        "name": row[1],
                        "description": row[2],
                        "link": row[3],
                        "date_time": row[4],
                        "subject": row[5],
                        "image": f"https://via.placeholder.com/300x420?text={row[1].replace(' ', '+')}",
                        "slug": row[6]
                    })
                return jsonify(books), 200
    except Exception as e:
        print("Error fetching books:", e)
        return jsonify({"error": "Failed to fetch books"}), 500

#get live stream
@app.route("/api/live-class/<slug>", methods=["GET"])
def get_liveclass_by_id(slug):
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, description, link, date_time, subject, slug
                    FROM live_class
                    WHERE slug = %s
                """, (slug,))
                row = cursor.fetchone()
                if row:
                    book = {
                        "id": row[0],
                        "name": row[1],
                        "link": row[3],
                        "description": row[2],
                        "date_time": row[4],
                        "subject": row[5],
                        "image": f"https://via.placeholder.com/300x420?text={row[1].replace(' ', '+')}",
                        "slug": row[6]

                    }
                    return jsonify(book), 200
                else:
                    return jsonify({"error": "Book not found"}), 404
    except Exception as e:
        print("Error fetching book:", e)
        return jsonify({"error": "Failed to fetch book"}), 500


@app.route('/api/book', methods=['POST'])
def create_book():
    email = decode_token(request)
    if not email:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    title = data.get("title")
    author = data.get("author")
    subject = data.get("subject")
    description = data.get("description")
    user_id = data.get("user_id")

    if not title or not author or not subject or not description or not user_id:
        return jsonify({"error": "All fields are required"}), 400

    slug = generate_slug(title)

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                # Pastikan slug unik (tambah angka jika perlu)
                base_slug = slug
                counter = 1
                while True:
                    cursor.execute("SELECT id FROM book WHERE slug = %s", (slug,))
                    if not cursor.fetchone():
                        break
                    slug = f"{base_slug}-{counter}"
                    counter += 1

                cursor.execute(
                    """
                    INSERT INTO book (title, author, subject, description, user_id, slug)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id;
                    """,
                    (title, author, subject, description, user_id, slug)
                )
                book_id = cursor.fetchone()[0]
                conn.commit()

        return jsonify({
            "message": "Book created successfully",
            "book_id": book_id,
            "slug": slug
        }), 201

    except Exception as e:
        print("book creation error:", e)
        return jsonify({"error": "Failed to create book"}), 500
    
@app.route("/api/books", methods=["GET"])
def get_all_books():
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT id, title, author, subject, description, slug
                    FROM book
                    ORDER BY created_at DESC
                """)
                rows = cursor.fetchall()
                books = []
                for row in rows:
                    books.append({
                        "id": row[0],
                        "title": row[1],
                        "author": row[2],
                        "subject": row[3],
                        "description": row[4],
                        "image": f"https://via.placeholder.com/300x420?text={row[1].replace(' ', '+')}",
                        "slug": row[5]
                    })
                return jsonify(books), 200
    except Exception as e:
        print("Error fetching books:", e)
        return jsonify({"error": "Failed to fetch books"}), 500

@app.route("/api/books/<slug>", methods=["GET"])
def get_book_by_id(slug):
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT id, title, author, subject, description, slug
                    FROM book
                    WHERE slug = %s
                """, (slug,))
                row = cursor.fetchone()
                if row:
                    book = {
                        "id": row[0],
                        "name": row[1],
                        "author": row[2],
                        "subject": row[3],
                        "description": row[4],
                        "image": f"https://via.placeholder.com/300x420?text={row[1].replace(' ', '+')}",
                        "slug": row[5]
                    }
                    return jsonify(book), 200
                else:
                    return jsonify({"error": "Book not found"}), 404
    except Exception as e:
        print("Error fetching book:", e)
        return jsonify({"error": "Failed to fetch book"}), 500



# --- Extra debugging & utils ---

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


if __name__ == '__main__':
    app.run(debug=True, port=8080)
