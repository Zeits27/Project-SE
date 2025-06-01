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
        print("No auth header")
        return None
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        print("Decoded email:", payload["email"])  # <-- DEBUG
        return payload["email"]
    except jwt.ExpiredSignatureError:
        print("Token expired")
        return None
    except jwt.InvalidTokenError as e:
        print("Invalid token", e)
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

@app.route('/api/home', methods=['GET'])
def get_home_data():
        try:
            with get_connection() as conn:
                with conn.cursor() as cursor:
                    # Communities
                    cursor.execute("""
                        SELECT id, name, description, user_id, slug, cover_url, banner_url
                        FROM communities
                        ORDER BY created_at DESC
                        LIMIT 10
                    """)
                    communities = []
                    for row in cursor.fetchall():
                        cover_key = row[5].split(f"{WASABI_BUCKET}/")[-1] if row[5] else None
                        banner_key = row[6].split(f"{WASABI_BUCKET}/")[-1] if row[6] else None
                        cover_url = generate_presigned_url(cover_key) if cover_key else None
                        banner_url = generate_presigned_url(banner_key) if banner_key else None
                        communities.append({
                            "id": row[0],
                            "name": row[1],
                            "description": row[2],
                            "user_id": row[3],
                            "slug": row[4],
                            "cover_url": cover_url,
                            "banner_url": banner_url
                        })

                    # Live Classes
                    cursor.execute("""
                        SELECT id, name, description, link, date_time, subject, slug, img_url
                        FROM live_class
                        ORDER BY created_at DESC
                        LIMIT 10
                    """)
                    live_classes = []
                    for row in cursor.fetchall():
                        image_key = row[7].split(f"{WASABI_BUCKET}/")[-1] if row[7] else None
                        image_presigned = generate_presigned_url(image_key) if image_key else None
                        live_classes.append({
                            "id": row[0],
                            "name": row[1],
                            "description": row[2],
                            "link": row[3],
                            "date_time": row[4],
                            "subject": row[5],
                            "slug": row[6],
                            "image": image_presigned
                        })

                    # Books
                    cursor.execute("""
                        SELECT id, title, author, subject, description, image_url, pdf_url, slug
                        FROM book
                        ORDER BY created_at DESC
                        LIMIT 10
                    """)
                    books = []
                    for row in cursor.fetchall():
                        image_key = row[5].split(f"{WASABI_BUCKET}/")[-1] if row[5] else None
                        pdf_key = row[6].split(f"{WASABI_BUCKET}/")[-1] if row[6] else None
                        image_presigned = generate_presigned_url(image_key) if image_key else None
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

            return jsonify({
                "communities": communities,
                "live_classes": live_classes,
                "books": books
            }), 200
        except Exception as e:
            print("Error fetching home data:", e)
            return jsonify({"error": "Failed to fetch home data"}), 500
        
        
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
    subject = request.form  .get("subject")

    if not name or not description or not user_id or not cover_image or not banner_image or not subject:
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
                    INSERT INTO communities (name, description, user_id, slug, cover_url, banner_url,subject)
                    VALUES (%s, %s, %s, %s, %s, %s,%s)
                    RETURNING id;
                    """,
                    (name, description, user_id, slug, cover_url, banner_url, subject)
                )
                community_id = cursor.fetchone()[0]
                conn.commit()

        return jsonify({
            "message": "Community created successfully",
            "community_id": community_id,
            "slug": slug,
            "cover_url": cover_url,
            "banner_url": banner_url,
            "subject": subject
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

@app.route("/api/community/<slug>/post", methods=["POST"])
def create_post(slug):
    email = decode_token(request)
    if not email:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    title = data.get("title")
    content = data.get("content")
    if not title or not content:
        return jsonify({"error": "Title and content required"}), 400

    try:
        with get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                # Get user ID
                cursor.execute("SELECT id, name FROM users WHERE email = %s;", (email,))
                user = cursor.fetchone()
                if not user:
                    return jsonify({"error": "User not found"}), 404

                # Get community ID
                cursor.execute("SELECT id FROM communities WHERE slug = %s;", (slug,))
                community = cursor.fetchone()
                if not community:
                    return jsonify({"error": "Community not found"}), 404

                # Insert post
                cursor.execute(
                    """
                    INSERT INTO posts (community_id, user_id, title, content)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id, created_at;
                    """,
                    (community["id"], user["id"], title, content),
                )
                post = cursor.fetchone()
                conn.commit()

                return jsonify({
                    "id": post["id"],
                    "title": title,
                    "content": content,
                    "author": user["name"],
                    "created_at": post["created_at"],
                    "replies": [],
                    "votes": 0,
                    "comments": 0
                }), 201
    except Exception as e:
        print("Post creation error:", e)
        return jsonify({"error": "Internal server error"}), 500

@app.route("/api/community/<slug>/post/<int:post_id>/reply", methods=["POST"])
def reply_to_post(slug, post_id):
    email = decode_token(request)
    if not email:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    content = data.get("content")
    if not content:
        return jsonify({"error": "Content required"}), 400

    try:
        with get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                # Get user
                cursor.execute("SELECT id, name FROM users WHERE email = %s;", (email,))
                user = cursor.fetchone()
                if not user:
                    return jsonify({"error": "User not found"}), 404

                # Ensure post exists
                cursor.execute("SELECT id FROM posts WHERE id = %s;", (post_id,))
                if not cursor.fetchone():
                    return jsonify({"error": "Post not found"}), 404

                # Insert reply
                cursor.execute(
                    """
                    INSERT INTO replies (post_id, user_id, content)
                    VALUES (%s, %s, %s)
                    RETURNING id, created_at;
                    """,
                    (post_id, user["id"], content),
                )
                reply = cursor.fetchone()
                conn.commit()

                return jsonify({
                    "id": reply["id"],
                    "content": content,
                    "author": user["name"],
                    "created_at": reply["created_at"]
                }), 201
    except Exception as e:
        print("Reply creation error:", e)
        return jsonify({"error": "Internal server error"}), 500

@app.route("/api/community/<slug>/posts", methods=["GET"])
def get_community_posts(slug):
    try:
        with get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                # Find community ID
                cursor.execute("SELECT id FROM communities WHERE slug = %s;", (slug,))
                community = cursor.fetchone()
                if not community:
                    return jsonify({"error": "Community not found"}), 404

                # Get posts for the community
                cursor.execute("""
                    SELECT 
                        posts.id AS post_id,
                        posts.title,
                        posts.content,
                        posts.created_at,
                        users.name AS author
                    FROM posts
                    JOIN users ON posts.user_id = users.id
                    WHERE posts.community_id = %s
                    ORDER BY posts.created_at DESC;
                """, (community["id"],))
                posts = cursor.fetchall()

                post_ids = [post["post_id"] for post in posts]

                # Get replies to those posts
                if post_ids:
                    cursor.execute("""
                        SELECT 
                            replies.id,
                            replies.post_id,
                            replies.content,
                            replies.created_at,
                            users.name AS author
                        FROM replies
                        JOIN users ON replies.user_id = users.id
                        WHERE replies.post_id = ANY(%s)
                        ORDER BY replies.created_at ASC;
                    """, (post_ids,))
                    replies = cursor.fetchall()
                else:
                    replies = []

                # Group replies under each post
                post_map = {post["post_id"]: {**post, "replies": []} for post in posts}
                for reply in replies:
                    post_map[reply["post_id"]]["replies"].append(reply)

                return jsonify(list(post_map.values())), 200

    except Exception as e:
        print("Error fetching posts with replies:", e)
        return jsonify({"error": "Internal server error"}), 500

@app.route("/api/post/<int:post_id>/reply", methods=["POST"])
def create_reply(post_id):
    user_email = decode_token(request)
    if not user_email:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    content = data.get("content", "").strip()

    if not content:
        return jsonify({"error": "Reply content is required"}), 400

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT id FROM users WHERE email = %s;", (user_email,))
                user = cursor.fetchone()
                if not user:
                    return jsonify({"error": "User not found"}), 404

                cursor.execute("""
                    INSERT INTO replies (post_id, user_id, content)
                    VALUES (%s, %s, %s);
                """, (post_id, user[0], content))
                conn.commit()

        return jsonify({"message": "Reply created"}), 201

    except Exception as e:
        print("Error creating reply:", e)
        return jsonify({"error": "Server error"}), 500

@app.route('/api/class', methods=['POST'])
def create_class():
    email = decode_token(request)
    if not email:
        return jsonify({"error": "Unauthorized"}), 401

    name = request.form.get("name")
    image = request.files.get("image")

    if not name or not image:
        return jsonify({"error": "Name and image are required."}), 400

    slug = generate_slug(name)

    image_filename = secure_filename(image.filename)
    image_url = upload_to_wasabi(image, f"class_images/{image_filename}")
    if not image_url:
        return jsonify({"error": "Failed to upload image"}), 500

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                # Handle duplicate slugs
                base_slug = slug
                counter = 1
                while True:
                    cursor.execute("SELECT id FROM class WHERE slug = %s", (slug,))
                    if not cursor.fetchone():
                        break
                    slug = f"{base_slug}-{counter}"
                    counter += 1

                cursor.execute(
                    """
                    INSERT INTO class (name, slug, img_url)
                    VALUES (%s, %s, %s)
                    RETURNING id;
                    """,
                    (name, slug, image_url)
                )
                class_id = cursor.fetchone()[0]
                conn.commit()

        return jsonify({
            "message": "Class created successfully",
            "class_id": class_id,
            "slug": slug,
            "img_url": image_url
        }), 201

    except Exception as e:
        print("Class creation error:", e)
        return jsonify({"error": "Failed to create class"}), 500

@app.route('/api/class', methods=['GET'])
def get_all_classes():
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, slug, img_url FROM class ORDER BY name;
                """)
                classes = cursor.fetchall()
                classess = []
                for classs in classes:
                    image_key = classs[3].split(f"{WASABI_BUCKET}/")[-1]
                    image_presigned = generate_presigned_url(image_key)

                    classess.append({
                        "id": classs[0],
                        "name": classs[1],
                        "slug": classs[2],
                        "img_url": image_presigned

                         })

            return jsonify(classess), 200 

    except Exception as e:
        print("Error fetching class list:", e)
        return jsonify({"error": "Failed to fetch classes"}), 500
    
@app.route('/api/class/<slug>', methods=['GET'])
def get_class_by_slug(slug):
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                # Get the class info
                cur.execute("SELECT id, name, slug, img_url FROM class WHERE slug = %s;", (slug,))
                result = cur.fetchone()
                if not result:
                    return jsonify({"error": "Class not found"}), 404

                class_id, name, slug, img_url = result
                class_image_key = img_url.split(f"{WASABI_BUCKET}/")[-1] if img_url else None
                class_image = generate_presigned_url(class_image_key) if class_image_key else None

                subject = name  # Use name as the subject

                # --- Fetch Books ---
                cur.execute("""
                    SELECT id, title, author, subject, description, image_url, pdf_url, slug
                    FROM book WHERE subject = %s;
                """, (subject,))
                books = []
                for b in cur.fetchall():
                    image_key = b[5].split(f"{WASABI_BUCKET}/")[-1] if b[5] else None
                    pdf_key = b[6].split(f"{WASABI_BUCKET}/")[-1] if b[6] else None

                    books.append({
                        "type": "book",
                        "id": b[0],
                        "title": b[1],
                        "author": b[2],
                        "subject": b[3],
                        "description": b[4],
                        "image": generate_presigned_url(image_key) if image_key else None,
                        "pdf": generate_presigned_url(pdf_key) if pdf_key else None,
                        "slug": b[7]
                    })

                # --- Fetch Communities ---
                cur.execute("""
                    SELECT id, name, description, user_id, slug, cover_url, banner_url
                    FROM communities WHERE subject = %s;
                """, (subject,))
                communities = []
                for c in cur.fetchall():
                    cover_key = c[5].split(f"{WASABI_BUCKET}/")[-1] if c[5] else None
                    banner_key = c[6].split(f"{WASABI_BUCKET}/")[-1] if c[6] else None

                    communities.append({
                        "type": "community",
                        "id": c[0],
                        "name": c[1],
                        "description": c[2],
                        "user_id": c[3],
                        "slug": c[4],
                        "cover_url": generate_presigned_url(cover_key) if cover_key else None,
                        "banner_url": generate_presigned_url(banner_key) if banner_key else None
                    })

                # --- Fetch Live Classes ---
                cur.execute("""
                    SELECT id, name, description, link, date_time, subject, slug, img_url
                    FROM live_class WHERE subject = %s;
                """, (subject,))
                live_classes = []
                for l in cur.fetchall():
                    img_key = l[7].split(f"{WASABI_BUCKET}/")[-1] if l[7] else None
                    live_classes.append({
                        "type": "live",
                        "id": l[0],
                        "name": l[1],
                        "description": l[2],
                        "link": l[3],
                        "date_time": l[4],
                        "subject": l[5],
                        "slug": l[6],
                        "image": generate_presigned_url(img_key) if img_key else None
                    })

                return jsonify({
                    "id": class_id,
                    "name": name,
                    "slug": slug,
                    "image": class_image,
                    "books": books,
                    "communities": communities,
                    "live_classes": live_classes
                }), 200

    except Exception as e:
        print("Error fetching class detail:", e)
        return jsonify({"error": "Server error"}), 500

        
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

    if content_type not in ["book", "live", "community"]:
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
                cur.execute("""
                    SELECT id, title, author, subject, description, image_url, pdf_url, slug
                    FROM book WHERE id = %s
                """, (content_id,))
                data = cur.fetchone()
                if data:
                    image_key = data[5].split(f"{WASABI_BUCKET}/")[-1]
                    pdf_key = data[6].split(f"{WASABI_BUCKET}/")[-1] if data[6] else None

                    image_presigned = generate_presigned_url(image_key)
                    pdf_presigned = generate_presigned_url(pdf_key) if pdf_key else None

                    results.append({
                        "type": "book",
                        "id": data[0],
                        "title": data[1],
                        "author": data[2],
                        "subject": data[3],
                        "description": data[4],
                        "image": image_presigned,
                        "pdf": pdf_presigned,
                        "slug": data[7]
                })
            elif content_type == "live":
                cur.execute("""SELECT id, name, description, link, date_time, subject, slug, img_url FROM live_class WHERE id = %s""", (content_id,))
                data = cur.fetchone()
                if data:
                    image_key = data[7].split(f"{WASABI_BUCKET}/")[-1] if data[7] else None
                    image_presigned = generate_presigned_url(image_key) if image_key else None
                    results.append({
                        "type": "live",
                         "id": data[0],
                        "name": data[1],
                        "description": data[2],
                        "link": data[3],
                        "date_time": data[4],
                        "subject": data[5],
                        "image": image_presigned,
                        "slug": data[6]
                    })
            elif content_type == "community":
                cur.execute("""
                    SELECT id, nam  e, description, user_id, slug, cover_url, banner_url
                    FROM communities WHERE id = %s
                """, (content_id,))
                data = cur.fetchone()
                if data:
                    cover_key = data[5].split(f"{WASABI_BUCKET}/")[-1] if data[5] else None
                    banner_key = data[6].split(f"{WASABI_BUCKET}/")[-1] if data[6] else None

                    cover_url = generate_presigned_url(cover_key) if cover_key else None
                    banner_url = generate_presigned_url(banner_key) if banner_key else None

                    results.append({
                        "type": "community",
                        "id": data[0],
                        "name": data[1],
                        "description": data[2],
                        "user_id": data[3],
                        "slug": data[4],
                        "cover_url": cover_url,
                        "banner_url": banner_url
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
