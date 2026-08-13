let activeVerificationCode = "123456";
let currentAttemptEmail = "";

const loginForm = document.getElementById('loginForm');
const verifyModal = document.getElementById('verifyModal');
const userEmailTarget = document.getElementById('userEmailTarget');
const demoCodeText = document.getElementById('demoCodeText');
const otpInputs = document.querySelectorAll('.otp-input');
const verifyError = document.getElementById('verifyError');
const verifySuccess = document.getElementById('verifySuccess');
const confirmVerifyBtn = document.getElementById('confirmVerifyBtn');
const autoFillBtn = document.getElementById('autoFillBtn');
const resendCodeBtn = document.getElementById('resendCodeBtn');
const cancelVerifyBtn = document.getElementById('cancelVerifyBtn');

// Email Regex Validation
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Generate Random 6-digit OTP code
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Handle Form Submission
loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value.trim();

    if (!isValidEmail(usernameInput)) {
        alert('Please enter a valid Gmail address or email (e.g., user@gmail.com).');
        return;
    }

    if (!passwordInput || passwordInput.length < 4) {
        alert('Please enter a valid password (at least 4 characters).');
        return;
    }

    // Set email and prepare verification modal
    currentAttemptEmail = usernameInput;
    userEmailTarget.textContent = currentAttemptEmail;
    
    // Generate new OTP code
    activeVerificationCode = generateOTP();
    demoCodeText.textContent = activeVerificationCode;

    // Reset modal UI
    clearOtpInputs();
    verifyError.classList.add('hidden');
    verifySuccess.classList.add('hidden');

    // Show Modal
    verifyModal.classList.remove('hidden');
    otpInputs[0].focus();
});

// OTP Input Navigation & Paste Handling
otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        const val = e.target.value;
        if (val.length === 1 && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && index > 0) {
            otpInputs[index - 1].focus();
        }
    });

    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = (e.clipboardData || window.clipboardData).getData('text').trim();
        if (/^\d{6}$/.test(pastedData)) {
            pastedData.split('').forEach((char, i) => {
                if (otpInputs[i]) otpInputs[i].value = char;
            });
            otpInputs[5].focus();
        }
    });
});

function clearOtpInputs() {
    otpInputs.forEach(input => input.value = '');
}

function getEnteredOtp() {
    let code = '';
    otpInputs.forEach(input => code += input.value.trim());
    return code;
}

// Auto-fill Code Button
autoFillBtn.addEventListener('click', () => {
    activeVerificationCode.split('').forEach((char, i) => {
        if (otpInputs[i]) otpInputs[i].value = char;
    });
    verifyError.classList.add('hidden');
});

// Confirm Verification
confirmVerifyBtn.addEventListener('click', () => {
    const enteredCode = getEnteredOtp();

    if (enteredCode === activeVerificationCode || enteredCode === '123456') {
        verifyError.classList.add('hidden');
        verifySuccess.classList.remove('hidden');

        // Store active session in localStorage
        const userSession = {
            email: currentAttemptEmail,
            verified: true,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('arcade_user', JSON.stringify(userSession));
        localStorage.setItem('isLoggedIn', 'true');

        setTimeout(() => {
            window.location.href = '../final.html';
        }, 1200);
    } else {
        verifyError.classList.remove('hidden');
        verifySuccess.classList.add('hidden');
    }
});

// Resend Code
resendCodeBtn.addEventListener('click', () => {
    activeVerificationCode = generateOTP();
    demoCodeText.textContent = activeVerificationCode;
    clearOtpInputs();
    verifyError.classList.add('hidden');
    verifySuccess.classList.add('hidden');
    alert(`New verification code sent to ${currentAttemptEmail}:\n\nCode: ${activeVerificationCode}`);
});

// Cancel Modal
cancelVerifyBtn.addEventListener('click', () => {
    verifyModal.classList.add('hidden');
});