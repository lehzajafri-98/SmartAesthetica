"""
Authentication Module — JWT-based User Authentication
=====================================================
Provides signup, login, and user verification endpoints using:
- SQLite for user storage
- bcrypt for password hashing
- PyJWT for token generation/validation
"""

import sqlite3
import hashlib
import hmac
import os
import time
import json
import base64
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional

# =====================================================================
# CONFIG
# =====================================================================

SECRET_KEY = os.environ.get("JWT_SECRET", "smartaesthetica_secret_key_2026")
TOKEN_EXPIRY_HOURS = 24
DB_PATH = "users.db"

router = APIRouter(tags=["Authentication"])

# =====================================================================
# DATABASE
# =====================================================================

def get_db():
    """Get a database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the users and reviews tables if they don't exist."""
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            plan TEXT DEFAULT 'Free',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
            comment TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            last_visit TEXT DEFAULT 'New Patient',
            status TEXT DEFAULT 'Pending',
            simulations_count INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS staff (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            access_level TEXT DEFAULT 'View Only',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            procedure TEXT,
            original_image TEXT,
            processed_image TEXT,
            patient_id INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(patient_id) REFERENCES patients(id)
        )
    """)
    conn.commit()
    conn.close()
    print("[Auth] Database initialized.")

# Initialize on import
init_db()

# =====================================================================
# PASSWORD HASHING (using hashlib + salt — no external bcrypt needed)
# =====================================================================

def hash_password(password: str) -> str:
    """Hash a password with a random salt using PBKDF2."""
    salt = os.urandom(32)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return (salt + key).hex()

def verify_password(password: str, stored_hash: str) -> bool:
    """Verify a password against a stored hash."""
    stored_bytes = bytes.fromhex(stored_hash)
    salt = stored_bytes[:32]
    stored_key = stored_bytes[32:]
    new_key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return hmac.compare_digest(stored_key, new_key)

# =====================================================================
# JWT TOKEN (lightweight implementation — no PyJWT dependency needed)
# =====================================================================

def _b64_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def _b64_decode(s: str) -> bytes:
    s += '=' * (4 - len(s) % 4)
    return base64.urlsafe_b64decode(s)

def create_token(user_id: int, name: str, email: str, plan: str = "Free") -> str:
    """Create a JWT token."""
    header = _b64_encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    
    payload = {
        "user_id": user_id,
        "name": name,
        "email": email,
        "plan": plan,
        "exp": int((datetime.utcnow() + timedelta(hours=TOKEN_EXPIRY_HOURS)).timestamp()),
        "iat": int(datetime.utcnow().timestamp())
    }
    payload_b64 = _b64_encode(json.dumps(payload).encode())
    
    signature_input = f"{header}.{payload_b64}".encode()
    signature = hmac.new(SECRET_KEY.encode(), signature_input, hashlib.sha256).digest()
    signature_b64 = _b64_encode(signature)
    
    return f"{header}.{payload_b64}.{signature_b64}"

def decode_token(token: str) -> dict:
    """Decode and validate a JWT token."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Invalid token format")
        
        header_b64, payload_b64, signature_b64 = parts
        
        # Verify signature
        signature_input = f"{header_b64}.{payload_b64}".encode()
        expected_sig = hmac.new(SECRET_KEY.encode(), signature_input, hashlib.sha256).digest()
        actual_sig = _b64_decode(signature_b64)
        
        if not hmac.compare_digest(expected_sig, actual_sig):
            raise ValueError("Invalid signature")
        
        # Decode payload
        payload = json.loads(_b64_decode(payload_b64))
        
        # Check expiry
        if payload.get("exp", 0) < time.time():
            raise ValueError("Token expired")
        
        return payload
    except Exception as e:
        raise ValueError(f"Token validation failed: {e}")

# =====================================================================
# DEPENDENCY — Extract current user from token
# =====================================================================

async def get_current_user(authorization: str = Header(default=None)):
    """FastAPI dependency to extract user from Authorization header."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Support "Bearer <token>" format
    token = authorization.replace("Bearer ", "").strip()
    
    try:
        payload = decode_token(token)
        return payload
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

# =====================================================================
# REQUEST / RESPONSE MODELS
# =====================================================================

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UpgradeRequest(BaseModel):
    plan: str

class ReviewRequest(BaseModel):
    rating: int
    comment: str

class HistoryRequest(BaseModel):
    procedure: str
    original_image: str
    processed_image: str
    patient_id: Optional[int] = None

class PatientRequest(BaseModel):
    name: str
    last_visit: str = "New Patient"
    status: str = "Pending"
    simulations_count: int = 0

class StaffRequest(BaseModel):
    name: str
    role: str
    access_level: str = "View Only"

# =====================================================================
# ENDPOINTS
# =====================================================================

@router.post("/signup")
async def signup(req: SignupRequest):
    """Create a new user account."""
    if not req.name or len(req.name.strip()) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters")
    if not req.email or "@" not in req.email:
        raise HTTPException(status_code=400, detail="Invalid email address")
    if not req.password or len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    conn = get_db()
    try:
        # Check if email already exists
        existing = conn.execute("SELECT id FROM users WHERE email = ?", (req.email.lower(),)).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")
        
        # Hash password and insert user (defaults to Free)
        pw_hash = hash_password(req.password)
        cursor = conn.execute(
            "INSERT INTO users (name, email, password_hash, plan) VALUES (?, ?, ?, 'Free')",
            (req.name.strip(), req.email.lower().strip(), pw_hash)
        )
        conn.commit()
        
        user_id = cursor.lastrowid
        token = create_token(user_id, req.name.strip(), req.email.lower().strip(), "Free")
        
        return {
            "token": token,
            "user": {
                "id": user_id,
                "name": req.name.strip(),
                "email": req.email.lower().strip(),
                "plan": "Free"
            }
        }
    finally:
        conn.close()

@router.post("/login")
async def login(req: LoginRequest):
    """Authenticate a user and return a JWT token."""
    if not req.email or not req.password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    
    conn = get_db()
    try:
        user = conn.execute(
            "SELECT id, name, email, password_hash, plan FROM users WHERE email = ?",
            (req.email.lower().strip(),)
        ).fetchone()
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        if not verify_password(req.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # plan defaults to "Free" if None for very legacy accounts before ALTER TABLE
        user_plan = user["plan"] if user["plan"] else "Free"
        token = create_token(user["id"], user["name"], user["email"], user_plan)
        
        return {
            "token": token,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "plan": user_plan
            }
        }
    finally:
        conn.close()

@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    """Return the current authenticated user's info."""
    # We fetch fresh from DB to ensure plan changes reflect immediately
    conn = get_db()
    try:
        db_user = conn.execute(
            "SELECT plan FROM users WHERE id = ?",
            (user["user_id"],)
        ).fetchone()
        current_plan = db_user["plan"] if db_user and db_user["plan"] else "Free"
    finally:
        conn.close()

    return {
        "user": {
            "id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
            "plan": current_plan
        }
    }

@router.post("/upgrade")
async def upgrade_plan(req: UpgradeRequest, user: dict = Depends(get_current_user)):
    """Mock billing endpoint to upgrade the user's plan."""
    allowed_plans = ["Free", "Pro", "Clinic"]
    if req.plan not in allowed_plans:
        raise HTTPException(status_code=400, detail="Invalid plan selected")
    
    conn = get_db()
    try:
        conn.execute(
            "UPDATE users SET plan = ? WHERE id = ?",
            (req.plan, user["user_id"])
        )
        conn.commit()
        
        # Issue a new token with the updated plan so the frontend refreshes automatically
        new_token = create_token(user["user_id"], user["name"], user["email"], req.plan)
        
        return {
            "message": f"Successfully upgraded to {req.plan} Plan",
            "token": new_token,
            "user": {
                "id": user["user_id"],
                "name": user["name"],
                "email": user["email"],
                "plan": req.plan
            }
        }
    finally:
        conn.close()

@router.get("/reviews")
async def get_reviews():
    """Get all public reviews."""
    conn = get_db()
    try:
        reviews = conn.execute(
            "SELECT id, name, rating, comment, created_at, user_id FROM reviews ORDER BY id DESC LIMIT 50"
        ).fetchall()
        return {"reviews": [dict(r) for r in reviews]}
    finally:
        conn.close()

@router.post("/reviews")
async def create_review(req: ReviewRequest, user: dict = Depends(get_current_user)):
    """Create a new review (Authenticated)."""
    if req.rating < 1 or req.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    if not req.comment or len(req.comment.strip()) < 3:
        raise HTTPException(status_code=400, detail="Comment is too short")

    conn = get_db()
    try:
        cursor = conn.execute(
            "INSERT INTO reviews (user_id, name, rating, comment) VALUES (?, ?, ?, ?)",
            (user["user_id"], user["name"], req.rating, req.comment.strip())
        )
        conn.commit()
        return {"message": "Review submitted successfully", "review_id": cursor.lastrowid}
    finally:
        conn.close()

@router.get("/history")
async def get_history(user: dict = Depends(get_current_user)):
    """Get past simulation history for the authenticated user."""
    conn = get_db()
    try:
        history = conn.execute(
            "SELECT id, procedure, original_image, processed_image, created_at FROM history WHERE user_id = ? ORDER BY id DESC LIMIT 50",
            (user["user_id"],)
        ).fetchall()
        return {"history": [dict(h) for h in history]}
    finally:
        conn.close()

@router.post("/history")
async def save_history(req: HistoryRequest, user: dict = Depends(get_current_user)):
    """Save a new simulation to the user's history."""
    import uuid
    import base64
    from pathlib import Path
    
    # Create static directory if it doesn't exist
    upload_dir = Path("static/uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    def save_base64_image(b64_str: str) -> str:
        # Extract base64 part
        if "," in b64_str:
            header, encoded = b64_str.split(",", 1)
        else:
            encoded = b64_str
        
        filename = f"{uuid.uuid4().hex}.jpg"
        filepath = upload_dir / filename
        
        with open(filepath, "wb") as f:
            f.write(base64.b64decode(encoded))
            
        return f"/static/uploads/{filename}"

    try:
        # First ensure patient_id column exists
        try:
            conn = get_db()
            conn.execute("ALTER TABLE history ADD COLUMN patient_id INTEGER REFERENCES patients(id)")
            conn.commit()
            conn.close()
        except:
            pass # Ignore if column already exists

        orig_path = save_base64_image(req.original_image)
        proc_path = save_base64_image(req.processed_image)
        
        conn = get_db()
        cursor = conn.execute(
            "INSERT INTO history (user_id, procedure, original_image, processed_image, patient_id) VALUES (?, ?, ?, ?, ?)",
            (user["user_id"], req.procedure, orig_path, proc_path, req.patient_id)
        )
        
        # If a patient was selected, increment their count and set them to active
        if req.patient_id is not None:
            conn.execute(
                "UPDATE patients SET simulations_count = simulations_count + 1, status = 'Active', last_visit = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
                (req.patient_id, user["user_id"])
            )

        conn.commit()
        conn.close()
        
        return {"message": "Simulation saved to history", "id": cursor.lastrowid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save history: {e}")

@router.get("/patients")
async def get_patients(user: dict = Depends(get_current_user)):
    """Get all patients for a clinic."""
    if user.get("plan") != "Clinic":
        raise HTTPException(status_code=403, detail="Clinic plan required")
    conn = get_db()
    try:
        patients = conn.execute(
            "SELECT id, name, last_visit, status, simulations_count FROM patients WHERE user_id = ? ORDER BY id DESC",
            (user["user_id"],)
        ).fetchall()
        return {"patients": [dict(p) for p in patients]}
    finally:
        conn.close()

@router.post("/patients")
async def create_patient(req: PatientRequest, user: dict = Depends(get_current_user)):
    """Add a new patient."""
    if user.get("plan") != "Clinic":
        raise HTTPException(status_code=403, detail="Clinic plan required")
    conn = get_db()
    try:
        cursor = conn.execute(
            "INSERT INTO patients (user_id, name, last_visit, status, simulations_count) VALUES (?, ?, ?, ?, ?)",
            (user["user_id"], req.name, req.last_visit, req.status, req.simulations_count)
        )
        conn.commit()
        return {"message": "Patient added", "id": cursor.lastrowid}
    finally:
        conn.close()

@router.get("/staff")
async def get_staff(user: dict = Depends(get_current_user)):
    """Get all staff members for a clinic."""
    if user.get("plan") != "Clinic":
        raise HTTPException(status_code=403, detail="Clinic plan required")
    conn = get_db()
    try:
        staff = conn.execute(
            "SELECT id, name, role, access_level FROM staff WHERE user_id = ? ORDER BY id DESC",
            (user["user_id"],)
        ).fetchall()
        return {"staff": [dict(s) for s in staff]}
    finally:
        conn.close()

@router.post("/staff")
async def create_staff(req: StaffRequest, user: dict = Depends(get_current_user)):
    """Invite a new staff member."""
    if user.get("plan") != "Clinic":
        raise HTTPException(status_code=403, detail="Clinic plan required")
    conn = get_db()
    try:
        cursor = conn.execute(
            "INSERT INTO staff (user_id, name, role, access_level) VALUES (?, ?, ?, ?)",
            (user["user_id"], req.name, req.role, req.access_level)
        )
        conn.commit()
        return {"message": "Staff member invited", "id": cursor.lastrowid}
    finally:
        conn.close()


# ── Google Signup ──────────────────────────────────────────────────────────

class GoogleSignupRequest(BaseModel):
    name: str
    email: str

@router.post("/google-signup")
async def google_signup(req: GoogleSignupRequest):
    """Create or login a user who signed in with Google OAuth."""
    conn = get_db()
    try:
        # Check if user already exists
        existing = conn.execute(
            "SELECT id, name, plan FROM users WHERE email = ?",
            (req.email.lower(),)
        ).fetchone()

        if existing:
            # User exists — just return a login token
            token = create_token(
                existing["id"], existing["name"],
                req.email.lower(), existing["plan"]
            )
            return {
                "token": token,
                "user": {
                    "id":    existing["id"],
                    "name":  existing["name"],
                    "email": req.email.lower(),
                    "plan":  existing["plan"]
                }
            }

        # New user — create account with google-oauth as password placeholder
        cursor = conn.execute(
            "INSERT INTO users (name, email, password_hash, plan) VALUES (?, ?, ?, 'Free')",
            (req.name.strip(), req.email.lower(), "google-oauth")
        )
        conn.commit()

        token = create_token(
            cursor.lastrowid, req.name.strip(),
            req.email.lower(), "Free"
        )
        return {
            "token": token,
            "user": {
                "id":    cursor.lastrowid,
                "name":  req.name.strip(),
                "email": req.email.lower(),
                "plan":  "Free"
            }
        }
    finally:
        conn.close()