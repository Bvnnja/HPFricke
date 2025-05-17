document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  // ...simulación de autenticación...
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    alert('Inicio de sesión exitoso');
    // ...redirección o lógica adicional...
  } else {
    alert('Correo o contraseña incorrectos');
  }
});
