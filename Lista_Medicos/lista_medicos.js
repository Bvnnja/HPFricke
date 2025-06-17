document.addEventListener('DOMContentLoaded', function() {
  const tablaUsuarios = document.getElementById('tabla-usuarios').querySelector('tbody');
  const usuarios = JSON.parse(localStorage.getItem('users') || '[]');

  if (usuarios.length === 0) {
    const fila = document.createElement('tr');
    fila.innerHTML = '<td colspan="4" style="text-align:center; color:#888;">No hay usuarios registrados.</td>';
    tablaUsuarios.appendChild(fila);
    return;
  }

  usuarios.forEach((usuario, index) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${usuario.nombre +' '+ usuario.apellido || 'Sin nombre'}</td>
      <td>${usuario.email || 'Sin email'}</td>
      <td>${usuario.rol || 'Sin rol'}</td>
      <td>${usuario.telefono || 'Sin Numero'}</td>
      <td>${usuario.genero || 'Sin Genero'}</td>
      <td><button class="btn-borrar" data-index="${index}">Borrar</button></td>
    `;
    tablaUsuarios.appendChild(fila);
  });

  // Agregar evento para borrar usuarios con confirmación
  tablaUsuarios.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-borrar')) {
      const index = e.target.dataset.index;
      const usuario = usuarios[index];
      const confirmacion = confirm(`¿Estás seguro de que deseas eliminar al usuario "${usuario.nombre || 'Sin nombre'}"?`);
      if (confirmacion) {
        usuarios.splice(index, 1);
        localStorage.setItem('users', JSON.stringify(usuarios));
        location.reload(); // Recargar la página para actualizar la tabla
      }
    }
  });
});
