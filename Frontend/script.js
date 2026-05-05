// ==========================================
// REGISTER - Create a new user account
// ==========================================
async function register() {
    const username = document.getElementById("reg-username").value;
    const password = document.getElementById("reg-password").value;
    const msg = document.getElementById("msg");

    // Basic validation
    if (!username || !password) {
        showMsg(msg, "Please enter username and password", "error");
        return;
    }

    // Send data to backend API
    const data = new URLSearchParams();
    data.append("username", username);
    data.append("password", password);

    const res = await fetch("/register", {
        method: "POST",
        body: data,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    const result = await res.json();

    if (result.message) {
        showMsg(msg, "Account created! Redirecting to login...", "success");
        setTimeout(() => window.location.href = "/login-page", 1500);
    } else {
        showMsg(msg, result.error, "error");
    }
}

// ==========================================
// LOGIN - Authenticate user
// ==========================================
async function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    const msg = document.getElementById("msg");

    if (!username || !password) {
        showMsg(msg, "Please enter username and password", "error");
        return;
    }

    const data = new URLSearchParams();
    data.append("username", username);
    data.append("password", password);

    const res = await fetch("/login", {
        method: "POST",
        body: data,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    const result = await res.json();

    if (result.message === "Login successful") {
        // No 2FA yet - go directly to dashboard
        localStorage.setItem("username", username);
        window.location.href = "/dashboard-page";
    } else if (result.message === "2FA required") {
        // 2FA is enabled - go to OTP verification page
        localStorage.setItem("username", username);
        window.location.href = "/verify-page";
    } else {
        showMsg(msg, result.error || "Login failed", "error");
    }
}

// ==========================================
// ENABLE 2FA - Generate and display QR code
// ==========================================
async function enable2FA() {
    const username = localStorage.getItem("username");

    if (!username) {
        window.location.href = "/login-page";
        return;
    }

    // Request QR code image from backend
    const res = await fetch(`/enable-2fa/${username}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    // Show QR code on page
    document.getElementById("qr").src = url;
    document.getElementById("enable-section").style.display = "none";
    document.getElementById("qr-section").style.display = "block";
}

// ==========================================
// VERIFY OTP - First time 2FA setup on dashboard
// ==========================================
async function verifyOTP() {
    const username = localStorage.getItem("username");
    const code = document.getElementById("otp").value;

    if (!code) {
        alert("Please enter the OTP");
        return;
    }

    const data = new URLSearchParams();
    data.append("username", username);
    data.append("code", code);

    const res = await fetch("/verify-2fa", {
        method: "POST",
        body: data,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    const result = await res.json();

    if (result.message) {
        // Hide QR section, show success message
        document.getElementById("qr-section").style.display = "none";
        document.getElementById("verified-section").style.display = "block";
        document.getElementById("status-badge").className = "status-badge active";
        document.getElementById("status-badge").innerText = "✓ 2FA Enabled";
    } else {
        alert(result.error || "Invalid OTP. Please try again.");
    }
}

// ==========================================
// VERIFY LOGIN - OTP check on login (when 2FA already enabled)
// ==========================================
async function verifyLogin() {
    const username = localStorage.getItem("username");
    const code = document.getElementById("otp-code").value;
    const msg = document.getElementById("msg");

    if (!code) {
        showMsg(msg, "Please enter the OTP", "error");
        return;
    }

    const data = new URLSearchParams();
    data.append("username", username);
    data.append("code", code);

    const res = await fetch("/verify-2fa", {
        method: "POST",
        body: data,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    const result = await res.json();

    if (result.message) {
        // OTP correct - go to dashboard
        window.location.href = "/dashboard-page";
    } else {
        showMsg(msg, result.error || "Invalid OTP. Please try again.", "error");
    }
}

// ==========================================
// CHECK LOGIN - Protect dashboard from unauthenticated access
// ==========================================
function checkLogin() {
    const username = localStorage.getItem("username");

    // If no username in storage, redirect to login
    if (!username) {
        window.location.href = "/login-page";
        return;
    }

    // Show welcome message with username
    const welcome = document.getElementById("welcome");
    if (welcome) {
        welcome.innerText = "Welcome, " + username + "! 👋";
    }
}

// ==========================================
// LOGOUT - Clear session and redirect to login
// ==========================================
function logout() {
    localStorage.removeItem("username");
    window.location.href = "/login-page";
}

// ==========================================
// HELPER - Show styled messages on page
// ==========================================
function showMsg(el, text, type) {
    el.innerText = text;
    el.className = "msg " + type;
}