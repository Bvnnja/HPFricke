function mostrarMedicosRegistrados() {
  const usuarios = JSON.parse(localStorage.getItem('users') || '[]');
  const tablaMedicos = document.getElementById('tablaMedicos');

  if (!tablaMedicos) {
    console.error('Elemento tablaMedicos no encontrado.');
    return;
  }

  tablaMedicos.innerHTML = '';

  if (usuarios.length === 0) {
    tablaMedicos.innerHTML = '<tr><td colspan="6">No hay médicos registrados.</td></tr>';
  } else {
    usuarios.forEach(user => {
      tablaMedicos.innerHTML += `
        <tr>
          <td>${user.nombre || 'N/A'} ${user.apellido || 'N/A'}</td>
          <td>${user.email || 'N/A'}</td>
          <td>${user.edad || 'N/A'}</td>
          <td>${user.telefono || 'N/A'}</td>
          <td>${user.rol || 'N/A'}</td>
          <td>
            <select class="rol-select" data-email="${user.email}">
              <option value="medico" ${user.rol === 'medico' ? 'selected' : ''}>Médico</option>
              <option value="enfermero" ${user.rol === 'enfermero' ? 'selected' : ''}>Enfermero</option>
              <option value="administrador" ${user.rol === 'administrador' ? 'selected' : ''}>Administrador</option>
            </select>
          </td>
        </tr>
      `;
    });

    document.querySelectorAll('.rol-select').forEach(select => {
      select.addEventListener('change', function() {
        const email = this.dataset.email;
        const nuevoRol = this.value;

        const usuarios = JSON.parse(localStorage.getItem('users') || '[]');
        const usuario = usuarios.find(u => u.email === email);
        if (usuario) {
          usuario.rol = nuevoRol;
          localStorage.setItem('users', JSON.stringify(usuarios));
          alert(`Rol cambiado a: ${nuevoRol} para ${usuario.nombre} ${usuario.apellido}`);
        }
      });
    });
  }
}

// Llamar a la función para mostrar los médicos al cargar la página
document.addEventListener('DOMContentLoaded', mostrarMedicosRegistrados);
