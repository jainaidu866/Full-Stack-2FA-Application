from fastapi import FastAPI, Depends, Form
from sqlalchemy.orm import Session
from Backend.database import SessionLocal, engine
from Backend import models
from Backend.auth import hash_password, verify_password
import pyotp
import qrcode
import io
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()
models.Base.metadata.create_all(bind=engine)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "..", "Frontend")

app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

@app.get("/")
def home():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

@app.get("/login-page")
def login_page():
    return FileResponse(os.path.join(FRONTEND_DIR, "login.html"))

@app.get("/dashboard-page")
def dashboard_page():
    return FileResponse(os.path.join(FRONTEND_DIR, "dashboard.html"))

@app.get("/verify-page")
def verify_page():
    return FileResponse(os.path.join(FRONTEND_DIR, "verify.html"))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/register")
def register(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=username).first()
    if user:
        return {"error": "User already exists"}
    hashed = hash_password(password)
    new_user = models.User(username=username, password=hashed)
    db.add(new_user)
    db.commit()
    return {"message": "Registered successfully"}

@app.post("/login")
def login(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=username).first()
    if not user:
        return {"error": "User not found"}
    if not verify_password(password, user.password):
        return {"error": "Wrong password"}
    # If 2FA already enabled, ask for OTP
    if user.is_2fa_enabled:
        return {"message": "2FA required"}
    # First time login, no 2FA yet
    return {"message": "Login successful"}

@app.get("/enable-2fa/{username}")
def enable_2fa(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=username).first()
    if not user:
        return {"error": "User not found"}
    secret = pyotp.random_base32()
    user.secret = secret
    db.commit()
    uri = pyotp.totp.TOTP(secret).provisioning_uri(name=username, issuer_name="2FA-App")
    img = qrcode.make(uri)
    buf = io.BytesIO()
    img.save(buf)
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")

@app.post("/verify-2fa")
def verify_2fa(username: str = Form(...), code: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=username).first()
    if not user or not user.secret:
        return {"error": "2FA not setup"}
    totp = pyotp.TOTP(user.secret)
    if totp.verify(code):
        user.is_2fa_enabled = True
        db.commit()
        return {"message": "2FA verified"}
    return {"error": "Invalid OTP"}