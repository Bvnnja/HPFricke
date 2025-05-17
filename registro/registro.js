document.getElementById('registerForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const nombre = document.getElementById('registerNombre').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  let users = JSON.parse(localStorage.getItem('users') || '[]');
  if (users.find(u => u.email === email)) {
    alert('El correo ya está registrado');
    return;
  }

  users.push({ nombre, email, password });
  localStorage.setItem('users', JSON.stringify(users));
  alert('Registro exitoso');
  window.location.href = '../login/login.html';
});
