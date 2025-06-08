document.getElementById('registerForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const nombre = document.getElementById('registerNombre').value.trim();
  const apellido = document.getElementById('registerApellido').value.trim();
  const edad = document.getElementById('registerEdad').value.trim();
  const telefono = document.getElementById('registerTelefono').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;
  const genero = document.getElementById('registerGenero').value;
  const direccion = document.getElementById('registerDireccion').value.trim();

  let isValid = true;

  if (!nombre || !/^[a-zA-Z\s]{2,50}$/.test(nombre)) {
    showError('errorNombre', 'El nombre debe tener entre 2 y 50 caracteres y no contener números ni caracteres especiales');
    isValid = false;
  }

  if (!apellido || !/^[a-zA-Z\s]{2,50}$/.test(apellido)) {
    showError('errorApellido', 'El apellido debe tener entre 2 y 50 caracteres y no contener números ni caracteres especiales');
    isValid = false;
  }

  if (!edad || !/^\d+$/.test(edad) || edad < 18 || edad > 100) {
    showError('errorEdad', 'La edad debe ser un número entre 18 y 100');
    isValid = false;
  }

  if (!telefono || !/^\+569\d{8}$/.test(telefono)) {
    showError('errorTelefono', 'El número de teléfono debe comenzar con +569 y contener 8 dígitos adicionales');
    isValid = false;
  }

  if (!email || !/^[^\s@]+@gmail\.com$/.test(email)) {
    showError('errorEmail', 'El correo electrónico debe ser válido y terminar en @gmail.com');
    isValid = false;
  }

  if (!password || password.length < 6) {
    showError('errorPassword', 'La contraseña debe tener al menos 6 caracteres');
    isValid = false;
  }

  if (password !== confirmPassword) {
    showError('errorConfirmPassword', 'Las contraseñas no coinciden');
    isValid = false;
  }

  if (!genero) {
    showError('errorGenero', 'Debes seleccionar tu género');
    isValid = false;
  }

  if (!direccion || direccion.length < 5) {
    showError('errorDireccion', 'La dirección debe tener al menos 5 caracteres');
    isValid = false;
  }

  if (!isValid) return;

  let users = JSON.parse(localStorage.getItem('users') || '[]');
  if (users.find(u => u.email === email)) {
    showError('errorEmail', 'El correo ya está registrado');
    return;
  }

  users.push({ nombre, apellido, edad, telefono, email, password, genero, direccion });
  localStorage.setItem('users', JSON.stringify(users));
  alert('Registro exitoso');
  window.location.href = '../login/login.html';
});

const showError = (id, message) => {
  const errorElement = document.getElementById(id);
  errorElement.textContent = message;
  errorElement.classList.add('active'); // Mostrar el mensaje
};

const clearError = (id) => {
  const errorElement = document.getElementById(id);
  errorElement.textContent = '';
  errorElement.classList.remove('active'); // Ocultar el mensaje
};

// Validaciones en tiempo real
document.getElementById('registerNombre').addEventListener('input', function () {
  const nombre = this.value.trim();
  if (!nombre || !/^[a-zA-Z\s]{2,50}$/.test(nombre)) {
    showError('errorNombre', 'El nombre debe tener entre 2 y 50 caracteres y no contener números ni caracteres especiales');
  } else {
    clearError('errorNombre');
  }
});

document.getElementById('registerApellido').addEventListener('input', function () {
  const apellido = this.value.trim();
  if (!apellido || !/^[a-zA-Z\s]{2,50}$/.test(apellido)) {
    showError('errorApellido', 'El apellido debe tener entre 2 y 50 caracteres y no contener números ni caracteres especiales');
  } else {
    clearError('errorApellido');
  }
});

document.getElementById('registerEdad').addEventListener('input', function () {
  const edad = this.value.trim();
  if (!edad || !/^\d+$/.test(edad) || edad < 18 || edad > 100) {
    showError('errorEdad', 'La edad debe ser un número entre 18 y 100');
  } else {
    clearError('errorEdad');
  }
});

document.getElementById('registerTelefono').addEventListener('input', function () {
  const telefono = this.value.trim();
  if (!telefono || !/^\+569\d{8}$/.test(telefono)) {
    showError('errorTelefono', 'El número de teléfono debe comenzar con +569 y contener 8 dígitos adicionales');
  } else {
    clearError('errorTelefono');
  }
});

document.getElementById('registerEmail').addEventListener('input', function () {
  const email = this.value.trim();
  if (!email || !/^[^\s@]+@gmail\.com$/.test(email)) {
    showError('errorEmail', 'El correo electrónico debe ser válido y terminar en @gmail.com');
  } else {
    clearError('errorEmail');
  }
});

document.getElementById('registerPassword').addEventListener('input', function () {
  const password = this.value;
  if (!password || password.length < 6) {
    showError('errorPassword', 'La contraseña debe tener al menos 6 caracteres');
  } else {
    clearError('errorPassword');
  }
});

document.getElementById('registerConfirmPassword').addEventListener('input', function () {
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = this.value;
  if (password !== confirmPassword) {
    showError('errorConfirmPassword', 'Las contraseñas no coinciden');
  } else {
    clearError('errorConfirmPassword');
  }
});

document.getElementById('registerGenero').addEventListener('change', function () {
  const genero = this.value;
  if (!genero) {
    showError('errorGenero', 'Debes seleccionar tu género');
  } else {
    clearError('errorGenero');
  }
});

document.getElementById('registerDireccion').addEventListener('input', function () {
  const direccion = this.value.trim();
  if (!direccion || direccion.length < 5) {
    showError('errorDireccion', 'La dirección debe tener al menos 5 caracteres');
  } else {
    clearError('errorDireccion');
  }
});

// Mostrar usuarios sin descripción personal
function mostrarUsuarios() {
  const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
  if (usuarioLogueado.rol !== 'administrador') return;
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  let cont = document.getElementById('usuariosRegistrados');
  if (!cont) {
    cont = document.createElement('div');
    cont.id = 'usuariosRegistrados';
    cont.style.marginTop = '30px';
    document.querySelector('.registro-container').appendChild(cont);
  }
  cont.innerHTML = '<h3>Usuarios Registrados</h3><table style="width:100%;margin-top:10px;"><thead><tr><th>Nombre</th><th>Apellido</th><th>Edad</th><th>Teléfono</th><th>Email</th><th>Género</th><th>Dirección</th></tr></thead><tbody>' +
    users.map(u => `
      <tr>
        <td>${u.nombre}</td>
        <td>${u.apellido}</td>
        <td>${u.edad}</td>
        <td>${u.telefono}</td>
        <td>${u.email}</td>
        <td>${u.genero}</td>
        <td>${u.direccion}</td>
      </tr>
    `).join('') + '</tbody></table>';
}

document.addEventListener('DOMContentLoaded', mostrarUsuarios);
