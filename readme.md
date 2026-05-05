# Full-Stack 2FA Application

📌 About the Project
A secure full-stack web application that implements user registration and a complete Two-Factor Authentication (2FA) login flow using TOTP (Time-based One-Time Password).
Users can register an account, log in securely, and enable 2FA by scanning a QR code with Microsoft or Google Authenticator. Once 2FA is enabled, every subsequent login requires a 6-digit OTP from the authenticator app to access the dashboard.

## 🎥 Demo Video
> https://youtu.be/amvFa5lpXoI?si=KjtcylGAcDaIieRK

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI |
| Frontend | Vanilla JavaScript, HTML, CSS |
| Database | MySQL |

---

## 📁 Project Structure

```
Full-Stack-2FA-Application/
├── Backend/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   └── auth.py
├── Frontend/
│   ├── index.html
│   ├── login.html
│   ├── dashboard.html
│   ├── verify.html
│   ├── script.js
│   └── style.css
└── README.md
```

---

## ⚙️ Setup & Running

**Step 1: Create MySQL database**
```sql
CREATE DATABASE 2fa_app;
```

**Step 2: Update credentials in `Backend/database.py`**
```python
DATABASE_URL = "mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/2fa_app"
```

**Step 3: Install dependencies**
```bash
pip install fastapi uvicorn sqlalchemy pymysql pyotp qrcode passlib python-multipart bcrypt==3.2.0
```

**Step 4: Run the application**
```bash
uvicorn Backend.main:app --reload
```

**Step 5: Open browser**
```
http://127.0.0.1:8000
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login with credentials |
| GET | `/enable-2fa/{username}` | Generate QR code |
| POST | `/verify-2fa` | Verify OTP code |

---

## 🤖 AI Usage
Used ChatGPT and Claude AI for assistance with boilerplate code, debugging, and understanding TOTP flow. All code was reviewed and tested manually.