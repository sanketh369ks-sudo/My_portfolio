const userCredentials = {
    username: 'sankethmlr@gmail.com',
    password: 'password@369',
};

document.getElementById('submit').addEventListener('click', function() {
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    // Validate credentials
    if (usernameInput === userCredentials.username && passwordInput === userCredentials.password) {
        // Redirect to final.htm if credentials are correct
        window.location.href = 'final.html';
    } else {
        alert('Incorrect username or password.');
    }
});