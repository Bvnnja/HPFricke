document.addEventListener('DOMContentLoaded', function() {
  const lista = document.getElementById('lista-notificaciones');
  const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
  const notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');

  if (!usuarioLogueado || !usuarioLogueado.email) {
    lista.innerHTML = '<li style="color:#888;">No hay usuario logueado.</li>';
    return;
  }

  // Marcar mensajes como leídos
  const notificacionesFiltradas = notificaciones.filter(n =>
    n.para === usuarioLogueado.email || n.para === 'todos'
  );
  notificacionesFiltradas.forEach(n => {
    n.leido = true;
  });
  localStorage.setItem('notificaciones', JSON.stringify(notificaciones));

  // Reiniciar el contador de mensajes en el navbar
  const contadorChat = document.getElementById('navbar-chat-contador');
  if (contadorChat) {
    contadorChat.textContent = '0';
    contadorChat.style.display = 'none';
  }

  if (notificacionesFiltradas.length === 0) {
    lista.innerHTML = '<li style="color:#888;">No tienes notificaciones.</li>';
  } else {
    notificacionesFiltradas.forEach(n => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${n.para === 'todos' ? 'Para todos' : n.para}</strong><br>
        <span style="color:#1976d2;">${new Date(n.fecha).toLocaleString()}</span><br>
        ${n.mensaje}
      `;
      lista.appendChild(li);
    });
  }

  // Llenar el select de destinatarios
  const selectDestinatario = document.getElementById('destinatario');
  if (selectDestinatario) {
    selectDestinatario.innerHTML = '<option value="todos">Todos</option>';
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.forEach(u => {
      if (u.email) {
        const opt = document.createElement('option');
        opt.value = u.email;
        opt.textContent = u.nombre ? `${u.nombre} (${u.email})` : u.email;
        selectDestinatario.appendChild(opt);
      }
    });
  }

  // Enviar mensaje desde el formulario
  const formChat = document.getElementById('formChat');
  if (formChat) {
    formChat.addEventListener('submit', function(e) {
      e.preventDefault();
      const destinatario = document.getElementById('destinatario').value;
      const mensajeChat = document.getElementById('mensajeChat').value.trim();
      if (mensajeChat && destinatario) {
        notificaciones.push({
          tipo: 'interna',
          mensaje: mensajeChat,
          para: destinatario,
          fecha: new Date().toISOString(),
          leido: false
        });
        localStorage.setItem('notificaciones', JSON.stringify(notificaciones));
        formChat.reset();
        const resultadoChat = document.getElementById('resultadoChat');
        if (resultadoChat) resultadoChat.textContent = 'Mensaje enviado correctamente.';
        lista.innerHTML = ''; // Actualizar la lista de notificaciones
        notificacionesFiltradas.forEach(n => {
          const li = document.createElement('li');
          li.innerHTML = `
            <strong>${n.para === 'todos' ? 'Para todos' : n.para}</strong><br>
            <span style="color:#1976d2;">${new Date(n.fecha).toLocaleString()}</span><br>
            ${n.mensaje}
          `;
          lista.appendChild(li);
        });
      }
    });
  }
});
