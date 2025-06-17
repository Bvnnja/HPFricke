document.addEventListener('DOMContentLoaded', function() {
  const lista = document.getElementById('lista-notificaciones');
  const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
  const notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');

  if (!usuarioLogueado || !usuarioLogueado.email) {
    lista.innerHTML = '<li style="color:#888;">No hay usuario logueado.</li>';
    return;
  }

  const notificacionesFiltradas = notificaciones.filter(n =>
    n.para === usuarioLogueado.email || n.para === 'todos'
  );

  if (notificacionesFiltradas.length === 0) {
    lista.innerHTML = '<li style="color:#888;">No tienes notificaciones.</li>';
    return;
  }

  notificacionesFiltradas.forEach(n => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${n.para === 'todos' ? 'Para todos' : n.para}</strong><br>
      <span style="color:#1976d2;">${new Date(n.fecha).toLocaleString()}</span><br>
      ${n.mensaje}
    `;
    lista.appendChild(li);
  });
});
