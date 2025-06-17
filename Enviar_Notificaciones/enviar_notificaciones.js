// Agrega una notificación al localStorage
function enviarNotificacion({ tipo = 'interna', mensaje, para }) {
  if (!mensaje || !para) return false;
  const notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');
  notificaciones.push({
    tipo,
    mensaje,
    para,
    fecha: new Date().toISOString(),
    leido: false // Marcar como no leído inicialmente
  });
  localStorage.setItem('notificaciones', JSON.stringify(notificaciones));
  return true;
}

// Obtiene todas las notificaciones del localStorage
function obtenerNotificaciones() {
  return JSON.parse(localStorage.getItem('notificaciones') || '[]');
}

// Muestra las notificaciones en un elemento UL dado su id
function mostrarNotificaciones(idLista, filtro = () => true) {
  const lista = document.getElementById(idLista);
  if (!lista) return;
  const notificaciones = obtenerNotificaciones().filter(filtro);
  lista.innerHTML = '';
  if (notificaciones.length === 0) {
    lista.innerHTML = '<li style="color:#888;">No hay notificaciones.</li>';
    return;
  }
  notificaciones.forEach(n => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${n.para}</strong> <span style="color:#1976d2;">${new Date(n.fecha).toLocaleString()}</span><br>${n.mensaje}`;
    lista.appendChild(li);
  });
}

// Llenar el select de destinatarios con los usuarios registrados
document.addEventListener('DOMContentLoaded', function() {
  const selectPara = document.getElementById('para');
  if (selectPara) {
    // Limpia el select y agrega opción "Todos"
    selectPara.innerHTML = '<option value="todos">Todos</option>';
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.forEach(u => {
      if (u.email) {
        const opt = document.createElement('option');
        opt.value = u.email;
        opt.textContent = u.nombre ? `${u.nombre} (${u.email})` : u.email;
        selectPara.appendChild(opt);
      }
    });
  }

  const form = document.getElementById('formNotificacion');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const para = document.getElementById('para').value;
      const mensaje = document.getElementById('mensaje').value.trim();
      if (enviarNotificacion({ mensaje, para })) {
        mostrarNotificaciones('lista-notificaciones', n => n.tipo === 'interna');
        form.reset();
        const resultado = document.getElementById('resultado');
        if (resultado) resultado.textContent = 'Notificación enviada correctamente.';
      }
    });
  }
  // Mostrar notificaciones al cargar
  mostrarNotificaciones('lista-notificaciones', n => n.tipo === 'interna');
});
