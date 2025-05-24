document.getElementById('registerForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const nombre = document.getElementById('registerNombre').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const rol = document.getElementById('registerRol').value;

  let users = JSON.parse(localStorage.getItem('users') || '[]');
  if (users.find(u => u.email === email)) {
    alert('El correo ya está registrado');
    return;
  }

  if (!rol) {
    alert('Debes seleccionar un rol');
    return;
  }

  users.push({ nombre, email, password, rol });
  localStorage.setItem('users', JSON.stringify(users));
  alert('Registro exitoso');
  window.location.href = '../login/login.html';
});

// Mostrar usuarios y permitir cambiar rol si es administrador
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
  cont.innerHTML = '<h3>Usuarios Registrados</h3><table style="width:100%;margin-top:10px;"><thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Cambiar Rol</th></tr></thead><tbody>' +
    users.map((u, i) => `
      <tr>
        <td>${u.nombre}</td>
        <td>${u.email}</td>
        <td>${u.rol}</td>
        <td>
          <select data-index="${i}" class="select-rol">
            <option value="enfermero" ${u.rol === 'enfermero' ? 'selected' : ''}>Enfermero</option>
            <option value="medico" ${u.rol === 'medico' ? 'selected' : ''}>Médico</option>
            <option value="supervisor" ${u.rol === 'supervisor' ? 'selected' : ''}>Supervisor</option>
            <option value="administrador" ${u.rol === 'administrador' ? 'selected' : ''}>Administrador</option>
          </select>
        </td>
      </tr>
    `).join('') + '</tbody></table>';
  cont.querySelectorAll('.select-rol').forEach(sel => {
    sel.onchange = function() {
      const idx = parseInt(this.dataset.index);
      users[idx].rol = this.value;
      localStorage.setItem('users', JSON.stringify(users));
      alert('Rol actualizado');
      mostrarUsuarios();
    };
  });
}

document.addEventListener('DOMContentLoaded', mostrarUsuarios);
