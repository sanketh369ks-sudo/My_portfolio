

document.getElementById('submit').addEventListener('click', function (e) {
    if (e) e.preventDefault();
    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value.trim();

    // Validate credentials
    if (usernameInput === userCredentials.username && passwordInput === userCredentials.password) {
        // Redirect to root final.html on success
        window.location.href = '../final.html';
    } else {
        alert('Incorrect username or password.\n\nDemo Credentials:\nEmail: sankethmlr@gmail.com\nPassword: password@369');
    }
});