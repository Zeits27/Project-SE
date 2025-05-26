import os
import psycopg2
import jwt
import datetime
import re
import unicodedata
import boto3

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from botocore.exceptions import NoCredentialsError
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
# from flask_jwt_extended import jwt_required, get_jwt_identity


# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "*"}}, expose_headers=["Authorization"])

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

# Wasabi config
WASABI_ACCESS_KEY = os.getenv("WASABI_ACCESS_KEY")
WASABI_SECRET_KEY = os.getenv("WASABI_SECRET_KEY")
WASABI_BUCKET = "eduverse"
WASABI_ENDPOINT = "https://s3.ap-southeast-1.wasabisys.com"

s3 = boto3.client(
    's3',
    endpoint_url=WASABI_ENDPOINT,
    aws_access_key_id=WASABI_ACCESS_KEY,
    aws_secret_access_key=WASABI_SECRET_KEY
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
#upload to wasabi
def upload_to_wasabi(file_obj, filename):
    try:
        s3.upload_fileobj(
            file_obj,
            WASABI_BUCKET,
            filename,
            ExtraArgs={"ACL": "public-read"}  # or private
        )
        file_url = f"{WASABI_ENDPOINT}/{WASABI_BUCKET}/{filename}"
        return file_url
    except NoCredentialsError:
        return None
def generate_presigned_url(filename, expiration=3600):
    try:
        url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': WASABI_BUCKET, 'Key': filename},
            ExpiresIn=expiration
        )
        return url
    except Exception as e:
        print("Presigned URL generation error:", e)
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

    name = request.form.get("name")
    description = request.form.get("description")
    user_id = request.form.get("user_id")
    cover_image = request.files.get("cover_image")
    banner_image = request.files.get("banner_image")

    if not name or not description or not user_id or not cover_image or not banner_image:
        return jsonify({"error": "All fields including cover and banner images are required."}), 400

    slug = generate_slug(name)

    # Upload cover image
    cover_filename = secure_filename(cover_image.filename)
    cover_url = upload_to_wasabi(cover_image, f"communities/cover/{cover_filename}")
    if not cover_url:
        return jsonify({"error": "Failed to upload cover image"}), 500

    # Upload banner image
    banner_filename = secure_filename(banner_image.filename)
    banner_url = upload_to_wasabi(banner_image, f"communities/banner/{banner_filename}")
    if not banner_url:
        return jsonify({"error": "Failed to upload banner image"}), 500

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                # Handle duplicate slugs
                base_slug = slug
                counter = 1
                while True:
                    cursor.execute("SELECT id FROM communities WHERE slug = %s", (slug,))
                    if not cursor.fetchone():
                        break
                    slug = f"{base_slug}-{counter}"
                    counter += 1

                cursor.execute(
                    """
                    INSERT INTO communities (name, description, user_id, slug, cover_url, banner_url)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id;
                    """,
                    (name, description, user_id, slug, cover_url, banner_url)
                )
                community_id = cursor.fetchone()[0]
                conn.commit()

        return jsonify({
            "message": "Community created successfully",
            "community_id": community_id,
            "slug": slug,
            "cover_url": cover_url,
            "banner_url": banner_url
        }), 201

    except Exception as e:
        print("Community creation error:", e)
        return jsonify({"error": "Failed to create community"}), 500
    
#get all communities
@app.route("/api/community", methods=["GET"])
def get_all_communities():
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, description, user_id, slug, cover_url, banner_url
                    FROM communities
                    ORDER BY created_at DESC
                """)
                rows = cursor.fetchall()
                communitiess = []
                for row in rows:
                    cover_key = row[5].split(f"{WASABI_BUCKET}/")[-1] if row[5] else None
                    banner_key = row[6].split(f"{WASABI_BUCKET}/")[-1] if row[6] else None

                    cover_url = generate_presigned_url(cover_key) if cover_key else None
                    banner_url = generate_presigned_url(banner_key) if banner_key else None

                    communitiess.append({
                        "id": row[0],
                        "name": row[1],
                        "description": row[2],
                        "user_id": row[3],
                        "slug": row[4],
                        "cover_url": cover_url,
                        "banner_url": banner_url
                    })
                return jsonify(communitiess), 200
    except Exception as e:
        print("Error fetching communities:", e)
        return jsonify({"error": "Failed to fetch communities"}), 500

@app.route("/api/community/<slug>", methods=["GET"])
def get_community_by_slug(slug):
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, description, user_id, slug, cover_url, banner_url , created_at
                    FROM communities
                    WHERE slug = %s
                """, (slug,))
                row = cursor.fetchone()

                if row:
                    cover_key = row[5].split(f"{WASABI_BUCKET}/")[-1] if row[5] else None
                    banner_key = row[6].split(f"{WASABI_BUCKET}/")[-1] if row[6] else None

                    cover_url = generate_presigned_url(cover_key) if cover_key else None
                    banner_url = generate_presigned_url(banner_key) if banner_key else None

                    community = {
                        "id": row[0],
                        "name": row[1],
                        "description": row[2],
                        "user_id": row[3],
                        "slug": row[4],
                        "cover_url": cover_url,
                        "banner_url": banner_url
                        ,"created_at": row[7]
                    }
                    return jsonify(community), 200
                else:
                    return jsonify({"error": "Community not found"}), 404
    except Exception as e:
        print("Error fetching community:", e)
        return jsonify({"error": "Failed to fetch community"}), 500




        
#create live-class
@app.route('/api/live-class', methods=['POST'])
def create_live_class():
    email = decode_token(request)
    if not email:
        return jsonify({"error": "Unauthorized"}), 401

    # Use request.form for text fields
    name = request.form.get("name")
    description = request.form.get("description")
    link = request.form.get("link")
    date_time = request.form.get("date_time")
    user_id = request.form.get("user_id")
    subject = request.form.get("subject")

    # Use request.files for the image file
    img = request.files.get("img_url")

    if not name or not description or not link or not date_time or not subject or not user_id or not img:
        return jsonify({"error": "All fields are required"}), 400

    slug = generate_slug(name)

    img_filename = secure_filename(img.filename)
    img_url = upload_to_wasabi(img, f"liveclass/banner/{img_filename}")
    if not img_url:
        return jsonify({"error": "Failed to upload banner image"}), 500

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                base_slug = slug
                counter = 1
                while True:
                    cursor.execute("SELECT id FROM live_class WHERE slug = %s", (slug,))
                    if not cursor.fetchone():
                        break
                    slug = f"{base_slug}-{counter}"
                    counter += 1

                cursor.execute(
                    """
                    INSERT INTO live_class (name, description, link, date_time, subject, user_id, slug, img_url)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id;
                    """,
                    (name, description, link, date_time, subject, user_id, slug, img_url)
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
                    SELECT id, name, description, link, date_time, subject, slug, img_url
                    FROM live_class
                    ORDER BY created_at DESC
                """)
                rows = cursor.fetchall()
                books = []
                for row in rows:
                    image_key = row[7].split(f"{WASABI_BUCKET}/")[-1] if row[7] else None
                    image_presigned = generate_presigned_url(image_key) if image_key else None

                    books.append({
                        "id": row[0],
                        "name": row[1],
                        "description": row[2],
                        "link": row[3],
                        "date_time": row[4],
                        "subject": row[5],
                        "image": image_presigned,
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
                    SELECT id, name, description, link, date_time, subject, slug, img_url
                    FROM live_class
                    WHERE slug = %s
                """, (slug,))
                row = cursor.fetchone()
                image_key = row[7].split(f"{WASABI_BUCKET}/")[-1] if row[7] else None
                image_presigned = generate_presigned_url(image_key) if image_key else None
                if row:
                    book = {
                        "id": row[0],
                        "name": row[1],
                        "link": row[3],
                        "description": row[2],
                        "date_time": row[4],
                        "subject": row[5],
                        "image":image_presigned,
                        "slug": row[6]

                    }
                    return jsonify(book), 200
                else:
                    return jsonify({"error": "Book not found"}), 404
    except Exception as e:
        print("Error fetching book:", e)
        return jsonify({"error": "Failed to fetch book"}), 500

#books

@app.route('/api/book', methods=['POST'])
def create_book():
    email = decode_token(request)
    if not email:
        return jsonify({"error": "Unauthorized"}), 401

    title = request.form.get("title")
    author = request.form.get("author")
    subject = request.form.get("subject")
    description = request.form.get("description")
    user_id = request.form.get("user_id")
    image = request.files.get("image")
    pdf = request.files.get("pdf")  

    if not title or not author or not subject or not description or not user_id or not image or not pdf:
        return jsonify({"error": "All fields are required, including image and PDF"}), 400

    slug = generate_slug(title)

    # Upload image
    image_filename = secure_filename(image.filename)
    image_url = upload_to_wasabi(image, f"books/{image_filename}")
    if not image_url:
        return jsonify({"error": "Failed to upload image"}), 500

    # Upload PDF
    pdf_filename = secure_filename(pdf.filename)
    pdf_url = upload_to_wasabi(pdf, f"books/pdf/{pdf_filename}")
    if not pdf_url:
        return jsonify({"error": "Failed to upload PDF"}), 500

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
                    INSERT INTO book (title, author, subject, description, user_id, slug, image_url, pdf_url)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id;
                    """,
                    (title, author, subject, description, user_id, slug, image_url, pdf_url)
                )
                book_id = cursor.fetchone()[0]
                conn.commit()

        return jsonify({
            "message": "Book created successfully",
            "book_id": book_id,
            "slug": slug,
            "image_url": image_url,
            "pdf_url": pdf_url
        }), 201

    except Exception as e:
        print("Book creation error:", e)
        return jsonify({"error": "Failed to create book"}), 500

    
@app.route("/api/books", methods=["GET"])
def get_all_books():
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT id, title, author, subject, description, image_url, pdf_url, slug
                    FROM book
                    ORDER BY created_at DESC
                """)
                rows = cursor.fetchall()
                books = []
                for row in rows:
                    image_key = row[5].split(f"{WASABI_BUCKET}/")[-1]
                    pdf_key = row[6].split(f"{WASABI_BUCKET}/")[-1] if row[6] else None

                    image_presigned = generate_presigned_url(image_key)
                    pdf_presigned = generate_presigned_url(pdf_key) if pdf_key else None

                    books.append({
                        "id": row[0],
                        "title": row[1],
                        "author": row[2],
                        "subject": row[3],
                        "description": row[4],
                        "image": image_presigned,
                        "pdf": pdf_presigned,
                        "slug": row[7]
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
                    SELECT id, title, author, subject, description,image_url,pdf_url, slug
                    FROM book
                    WHERE slug = %s
                """, (slug,))
                row = cursor.fetchone()
                image_key = row[5].split(f"{WASABI_BUCKET}/")[-1]
                pdf_key = row[6].split(f"{WASABI_BUCKET}/")[-1] if row[6] else None

                image_presigned = generate_presigned_url(image_key)
                pdf_presigned = generate_presigned_url(pdf_key) if pdf_key else None

                if row:
                    book = {
                        "id": row[0],
                        "title": row[1],
                        "author": row[2],
                        "subject": row[3],
                        "description": row[4],
                        "image": image_presigned,
                        "pdf": pdf_presigned,
                        "slug": row[7]
                    }
                    return jsonify(book), 200
                else:
                    return jsonify({"error": "Book not found"}), 404
    except Exception as e:
        print("Error fetching book:", e)
        return jsonify({"error": "Failed to fetch book"}), 500

#bookmark

@app.route("/api/bookmark", methods=["POST"])
    
def add_bookmark():
    email = decode_token(request)
    if not email:
        return jsonify({"error": "Unauthorized"}), 401

    user = get_user_by_email(email)
    if not user:
        return jsonify({"error": "User not found"}), 404

    current_user_id = user["id"]
    data = request.get_json()
    content_type = data.get("content_type")
    content_id = data.get("content_id")

    if content_type not in ["book", "live"]:
        return jsonify({"error": "Invalid content type"}), 400

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT 1 FROM bookmarks WHERE user_id = %s AND content_type = %s AND content_id = %s
    """, (current_user_id, content_type, content_id))
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"error": "Already bookmarked"}), 400

    cur.execute("""
        INSERT INTO bookmarks (user_id, content_type, content_id) VALUES (%s, %s, %s)
    """, (current_user_id, content_type, content_id))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Bookmarked successfully"}), 201


@app.route("/api/bookmark", methods=["DELETE"])
def remove_bookmark():
    email = decode_token(request)
    if not email:
        return jsonify({"error": "Unauthorized"}), 401

    user = get_user_by_email(email)
    if not user:
        return jsonify({"error": "User not found"}), 404

    current_user_id = user["id"]
    data = request.get_json()
    content_type = data.get("content_type")
    content_id = data.get("content_id")

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        DELETE FROM bookmarks WHERE user_id = %s AND content_type = %s AND content_id = %s
    """, (current_user_id, content_type, content_id))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Bookmark removed"}), 200



@app.route("/api/bookmark", methods=["GET"])
def get_bookmarks():
    print("Authorization header:", request.headers.get("Authorization"))

    email = decode_token(request)
    if not email:
        return jsonify({"error": "Unauthorized"}), 401

    user = get_user_by_email(email)
    if not user:
        return jsonify({"error": "User not found"}), 404

    current_user_id = user["id"]
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT content_type, content_id FROM bookmarks WHERE user_id = %s
    """, (current_user_id,))
    bookmarks = cur.fetchall()

    results = []

    for content_type, content_id in bookmarks:
        if content_type == "book":
            cur.execute("SELECT title, author, pdf_url FROM book WHERE id = %s", (content_id,))
            data = cur.fetchone()
            if data:
                results.append({
                    "type": "book",
                    "id": content_id,
                    "title": data[0],
                    "author": data[1],
                    "pdf_url": data[2]
                })
        elif content_type == "live":
            cur.execute("SELECT title, mentor_name, date_time, image_url FROM live_classes WHERE id = %s", (content_id,))
            data = cur.fetchone()
            if data:
                results.append({
                    "type": "live",
                    "id": content_id,
                    "title": data[0],
                    "mentor_name": data[1],
                    "date_time": data[2],
                    "image_url": data[3]
                })

    cur.close()
    conn.close()
    return jsonify(results), 200



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
