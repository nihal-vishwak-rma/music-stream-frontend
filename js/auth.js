import { loadTrendingSongs } from "./music.js";
import {
    showSuccessPopup,
    showErrorPopup,
    openSignupModel,
    openLoginModel,
    openForgotPasswordModal,
    openOtpModal,
    closeModal
} from "./ui.js";

// =================  UI RELATED ========================

const loginBtn = document.getElementById("login-btn");

if (loginBtn) {
    loginBtn.addEventListener("click", () => {
        openLoginModel();
    });
}

const signupBtn = document.getElementById("signup-btn");

if (signupBtn) {
    signupBtn.addEventListener("click", () => {
        openSignupModel();
    });
}

document.querySelectorAll(".close-modal").forEach(btn => {
    btn.addEventListener("click", () => {
        const modalId = btn.dataset.modal;
        if (modalId) closeModal(modalId);
    });
});

function cleanErrorMessage(message) {
    if (!message || typeof message !== "string") {
        return "Something went wrong";
    }

    return message
        
        .replace(/\b[1-5]\d{2}\b/g, "")

       
        .replace(
            /\b(UNAUTHORIZED|FORBIDDEN|BAD REQUEST|CONFLICT|NOT FOUND|INTERNAL SERVER ERROR|SERVICE UNAVAILABLE|GATEWAY TIMEOUT|PAYLOAD TOO LARGE|UNSUPPORTED MEDIA TYPE|TOO MANY REQUESTS)\b/gi,
            ""
        )

       
        .replace(/\b(HTTP\/1\.1|HTTP\/2|HTTPS?)\b/gi, "")
        .replace(/\b(ERROR|EXCEPTION|STATUS|FAILED|FAILURE)\b/gi, "")

       
        .replace(/[:\-–|]/g, " ")

       
        .replace(/\s+/g, " ")
        .trim() ||

        
        "Something went wrong";
}




// =============== AUTH LOGIC ==================



// let token = localStorage.getItem('token'); 
document.addEventListener('DOMContentLoaded', () => {

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }



    async function refreshAccessToken() {

        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) return false;

        try {
            const res = await fetch(`${API_URL}/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshtoken: refreshToken })
            });

            if (!res.ok) return false;

            const data = await res.json();

            if (data.success && data.data?.token) {
                localStorage.setItem("token", data.data.token);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }




    async function validateToken() {

        const token = localStorage.getItem("token");

        if (!token) return;

        try {
            const authenticated = await fetch(`${API_URL}/auth/validate`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (authenticated.ok) {

                const res = await authenticated.json();

                if (res.data && res.data.id) {
                    const signupbtn = document.querySelector(".signup-button");
                    signupbtn.innerText = "WELCOME";
                    signupbtn.disabled = true;

                    const loginBtn = document.querySelector(".login-button");
                    loginBtn.innerText = "Logout";

                    loginBtn.onclick = () => {
                        localStorage.removeItem("token");
                        location.reload();
                    };
                }
                

                loadTrendingSongs(null);
            }

            if (authenticated.status === 401) {

                const refreshed = await refreshAccessToken();

                if (refreshed) {
                    return validateToken();
                }
            }



        } catch (err) {
            console.log(err + " token expired or wrong ");
            localStorage.removeItem("token");
        }
    }




    validateToken();



    // oauth2 login


    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const refreshToken = params.get('refreshToken');

    if (token && refreshToken) {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        window.location.href = '/'; 
    }

    const googleLoginBtn = document.getElementById("google-login");
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener("click", () => {
            window.location.href = `${API_URL}/oauth2/authorization/google`;
        });
    }


    //forgot Password

    const forgotPasswordLink = document.getElementById('forgotPassword');
    const forgotPasswordModal = document.getElementById('forgot-password-model');
    const forgotForm = document.getElementById('forgot-password-form');
    const sendForgotOtpBtn = document.getElementById('send-forgot-otp-btn');
    const forgotTimerSpan = document.getElementById('forgot-otp-timer');

    let forgotOtpTimer = null;
    let forgotCountdown = 120; // 2 minutes

    // 🧹 Utility function to clear previous messages
    function clearForgotMessages() {
        forgotError.innerText = "";
        forgotSuccess.innerText = "";
        forgotError.style.display = "none";
        forgotSuccess.style.display = "none";
    }

    const forgotError = document.getElementById('forgot-password-error');
    const forgotSuccess = document.getElementById('forgot-password-success');

    // open forgot password modal
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('login-model');
        openForgotPasswordModal('forgot-password-model');
    });

    // send OTP
    sendForgotOtpBtn.addEventListener('click', async () => {
        const email = document.getElementById('forgot-email').value.trim();

        clearForgotMessages();

        if (!email) {
            forgotError.innerText = "Please enter your email first.";
            forgotError.style.display = "block";
            return;
        }

        try {
            sendForgotOtpBtn.disabled = true;
            const response = await fetch(`${API_URL}/auth/forgot-password-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const result = await response.json();


            clearForgotMessages();

            if (response.ok) {
                forgotSuccess.innerText = "OTP sent successfully!";
                forgotSuccess.style.display = "block";
                startForgotOtpTimer();
            } else {
                forgotError.innerText =  cleanErrorMessage(result.message) || "Failed to send OTP.";
                forgotError.style.display = "block";
                sendForgotOtpBtn.disabled = false;
            }

        } catch (err) {
            clearForgotMessages();
            forgotError.innerText = err.message;
            forgotError.style.display = "block";
            sendForgotOtpBtn.disabled = false;
        }
    });

    function startForgotOtpTimer() {
        // Agar pehle se timer chal raha hai to ignore karo
        if (forgotOtpTimer) return;

        forgotCountdown = 120;
        forgotTimerSpan.textContent = formatTime(forgotCountdown);
        sendForgotOtpBtn.disabled = true;

        forgotOtpTimer = setInterval(() => {
            forgotCountdown--;
            forgotTimerSpan.textContent = formatTime(forgotCountdown);

            if (forgotCountdown <= 0) {
                clearInterval(forgotOtpTimer);
                forgotOtpTimer = null; // reset timer reference
                sendForgotOtpBtn.disabled = false;
                forgotTimerSpan.textContent = "00:00";
            }
        }, 1000);
    }


    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }

    // forgot password form submit
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('forgot-email').value.trim();
        const password = document.getElementById('forgot-password').value.trim();
        const otp = document.getElementById('forgot-otp').value.trim();

        if (!email || !password || !otp) return;

        clearForgotMessages();

        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, otp })
            });

            const result = await response.json();

            clearForgotMessages();

            if (response.ok) {
                forgotSuccess.innerText = result.message || "Password changed successfully!";
                forgotSuccess.style.display = "block";

                setTimeout(() => {
                    closeModal('forgot-password-model');
                    openModal('login-model');
                }, 2000);
            } else {

                forgotError.innerText =  cleanErrorMessage(result.message) || "OTP verification failed.";
                forgotError.style.display = "block";
            }

        } catch (err) {
            clearForgotMessages();

            forgotError.innerText = err.message;
            forgotError.style.display = "block";
        }
    });








    // resend otp function

    const resendBtn = document.getElementById('resend-otp-btn');
    const resendTimer = document.getElementById('resend-timer');
    let timerInterval;
    let countdown = 120;
    // 2 minutes in seconds

    // Disable resend initially
    resendBtn.disabled = true;
    startResendTimer();

    function startResendTimer() {
        resendBtn.disabled = true;
        countdown = 120;
        updateTimerDisplay();
        timerInterval = setInterval(() => {
            countdown--;
            updateTimerDisplay();
            if (countdown <= 0) {
                clearInterval(timerInterval);
                resendBtn.disabled = false;
                resendTimer.innerText = "00:00";
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = String(Math.floor(countdown / 60)).padStart(2, '0');
        const seconds = String(countdown % 60).padStart(2, '0');
        resendTimer.innerText = `${minutes}:${seconds}`;
    }

    // Resend OTP click handler
    resendBtn.addEventListener('click', async () => {
        if (!signupData?.email) return;

        try {
            const response = await fetch(`${API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: signupData.email })
            });

            const result = await response.json();

            if (response.ok) {
                alert("OTP resent successfully!");
                startResendTimer(); // restart timer
            } else {
                document.getElementById('otp-error').innerText =  cleanErrorMessage(result.message) || "Failed to resend OTP";
                document.getElementById('otp-error').style.display = 'block';
            }
        } catch (err) {
            document.getElementById('otp-error').innerText = err.message;
            document.getElementById('otp-error').style.display = 'block';
        }
    });



    //otp function


    const otpForm = document.getElementById('otp-form');

    otpForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const otp = this.querySelector('input[type="text"]').value;
        const payload = { ...signupData, otp };

        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                document.getElementById('otp-error').style.display = 'none';
                closeModal('otp-model');
                alert("Signup successful!");
            } else {
                     document.getElementById('otp-error').innerText =
                    cleanErrorMessage(result.message) || "OTP verification failed";

                document.getElementById('otp-error').style.display = 'block';
            }
        } catch (err) {
            document.getElementById('otp-error').innerText = err.message;
            document.getElementById('otp-error').style.display = 'block';
        }
    });



    // ================ SIGNUP ==================


    const signupForm = document.querySelector('#signup-model form');
    const otpModalId = 'otp-model';
    let signupData = {}; // store temporarily before OTP

    if (signupForm) {
        signupForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;

            signupData = { name, email, password }; // save data

            // Step 1: Send OTP
            try {
                const response = await fetch(`${API_URL}/auth/send-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const result = await response.json();

                if (response.ok) {
                    // Hide signup form and open OTP modal
                    closeModal('signup-model');
                    openOtpModal(); // function to show OTP modal
                } else {
                    document.getElementById('signup-error').innerText = cleanErrorMessage(result.message)  || "OTP send failed";
                    document.getElementById('signup-error').style.display = 'block';
                }
            } catch (err) {
                document.getElementById('signup-error').innerText = err.message;
                document.getElementById('signup-error').style.display = 'block';
            }
        });
    }




    // ================ LOGIN ==================






    const loginForm = document.querySelector('#login-model form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;

            const data = { email, password };

            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    // Store JWT token in localStorage for later API calls

                    localStorage.setItem('token', result.token);
                    localStorage.setItem('refreshToken', result.refreshToken);


                    document.getElementById('login-success').innerText = 'Login Successful!';
                    document.getElementById('login-success').style.display = 'block';
                    document.getElementById('login-error').style.display = 'none';

                    var signupbtn = document.querySelector(".signup-button");

                    signupbtn.innerText = "WELCOME";
                    signupbtn.disabled = true;

                    const loginBtn = document.querySelector(".login-button");
                    loginBtn.innerText = "Logout";

                    loginBtn.onclick = function () {

                        localStorage.removeItem("token");
                        localStorage.removeItem("refreshToken");

                        location.reload(); // page reload hote hi wapas login dikh jaega
                    };

                    loadTrendingSongs(null);

                    setTimeout(function () {
                        closeModal("login-model");

                    }, 1000);



                    console.log(result);
                } else {
                    document.getElementById('login-error').innerText =  cleanErrorMessage(result.message) || "Login failed";
                    document.getElementById('login-error').style.display = 'block';
                    document.getElementById('login-success').style.display = 'none';

                    console.log(result);
                }

            } catch (err) {
                document.getElementById('login-error').innerText =  cleanErrorMessage(err.message);
                document.getElementById('login-error').style.display = 'block';
            }
        });
    }




});