// REGISTER
async function register() {
    const username = document.getElementById("reg-username").value;
    const password = document.getElementById("reg-password").value;

    if (!username || !password) {
        alert("Please enter username and password");
        return;
    }

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
        alert("Registered successfully! Please login.");
        window.location.href = "/login-page";
    } else {
        alert(result.error);
    }
}

// LOGIN
async function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    if (!username || !password) {
        alert("Please enter username and password");
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
        // First time - no 2FA yet, go to dashboard
        localStorage.setItem("username", username);
        window.location.href = "/dashboard-page";
    } else if (result.message === "2FA required") {
        // 2FA already enabled, go to OTP verify page
        localStorage.setItem("username", username);
        window.location.href = "/verify-page";
    } else {
        alert(result.error || "Login failed");
    }
}

// ENABLE 2FA - generate and show QR code
async function enable2FA() {
    const username = localStorage.getItem("username");

    if (!username) {
        alert("Session expired. Please login again.");
        window.location.href = "/login-page";
        return;
    }

    const res = await fetch(`/enable-2fa/${username}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    document.getElementById("qr").src = url;
    document.getElementById("enable-section").style.display = "none";
    document.getElementById("qr-section").style.display = "block";
}

// VERIFY OTP - after scanning QR on dashboard (first time setup)
async function verifyOTP() {
    const username = localStorage.getItem("username");
    const code = document.getElementById("otp").value;

    if (!code) {
        alert("Please enter OTP");
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
        // Hide QR section, show success
        document.getElementById("qr-section").style.display = "none";
        document.getElementById("verified-section").style.display = "block";
    } else {
        alert(result.error || "Invalid OTP");
    }
}

// VERIFY LOGIN OTP - on verify page (when 2FA already enabled)
async function verifyLogin() {
    const username = localStorage.getItem("username");
    const code = document.getElementById("otp-code").value;

    if (!code) {
        alert("Please enter OTP");
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
        window.location.href = "/dashboard-page";
    } else {
        alert(result.error || "Invalid OTP");
    }
}

// PROTECT DASHBOARD - check if logged in
function checkLogin() {
    const username = localStorage.getItem("username");
    if (!username) {
        window.location.href = "/login-page";
        return;
    }
    const welcome = document.getElementById("welcome");
    if (welcome) {
        welcome.innerText = "Welcome, " + username + "!";
    }
}

// LOGOUT
function logout() {
    localStorage.removeItem("username");
    window.location.href = "/login-page";
}