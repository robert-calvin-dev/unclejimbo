document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorMsg = document.getElementById('errorMsg');

  const validEmail = 'kaglarochelle@gmail.com';
  const validPassword = 'unclejimbo2024'; // You can change this

  if (email === validEmail && password === validPassword) {
    // Save login flag in sessionStorage
    sessionStorage.setItem('kimLoggedIn', 'true');
    window.location.href = '/blog/editor.html';
  } else {
    errorMsg.textContent = 'Invalid credentials. Try again.';
  }
});
