document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  // Simulación de autenticación (puedes reemplazar por lógica real)
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    // Guardar usuario logueado
    localStorage.setItem('usuarioLogueado', JSON.stringify(user));
    // Redirigir al inicio
    window.location.href = '../inicio/inicio.html';
  } else {
    alert('Correo o contraseña incorrectos');
  }
});
