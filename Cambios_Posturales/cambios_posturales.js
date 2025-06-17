document.addEventListener('DOMContentLoaded', function() {
  const tabla = document.getElementById('tablaCambiosPosturales').querySelector('tbody');
  const pacientes = JSON.parse(localStorage.getItem('pacientes') || '[]');
  const usuarios = JSON.parse(localStorage.getItem('users') || '[]'); // Obtener usuarios registrados

  const pacientesCriticos = pacientes.filter(paciente => paciente.cambioPostural === 'critico'); // Filtrar solo los críticos

  if (pacientesCriticos.length === 0) {
    const fila = document.createElement('tr');
    fila.innerHTML = '<td colspan="8" style="text-align:center; color:#888;">No hay pacientes en estado crítico.</td>';
    tabla.appendChild(fila);
    return;
  }

  pacientesCriticos.forEach((paciente, index) => {
    const medico = usuarios.find(u => u.nombre === paciente.medico);
    const medicoNombreCompleto = medico ? `${medico.nombre} ${medico.apellido}` : 'Sin médico'; // Obtener nombre completo del médico
    const medicoEmail = medico?.email || 'Sin correo'; // Obtener correo del médico
    const fila = document.createElement('tr');
    fila.className = 'critico'; // Clase específica para estado crítico
    fila.innerHTML = `
      <td>${paciente.nombre || 'Sin nombre'}</td>
      <td>${paciente.habitacion || 'Sin habitación'}</td>
      <td title="${paciente.diagnostico || 'Sin diagnóstico'}">${paciente.diagnostico || 'Sin diagnóstico'}</td>
      <td class="${paciente.cambioPostural === 'critico' ? 'estado-critico' : ''}">${paciente.cambioPostural || 'Sin estado'}</td>
      <td>${paciente.tiempoRestante ? `${Math.floor(paciente.tiempoRestante / 60)} min` : 'N/A'}</td>
      <td>${medicoNombreCompleto}</td>
      <td><button class="avisar" onclick="avisarMedico('${paciente.nombre}', '${medicoEmail}', '${paciente.habitacion}')">Avisar a Médico</button></td>
    `;
    tabla.appendChild(fila);
  });
});

function resolverCambioPostural(index) {
  const pacientes = JSON.parse(localStorage.getItem('pacientes') || '[]');
  const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
  const paciente = pacientes[index];

  if (paciente) {
    paciente.cambioPostural = 'realizado'; // Cambia el estado a "realizado"
    paciente.medico = usuarioLogueado.nombre || 'Desconocido'; // Asigna el médico actual como el último que realizó el cambio
    paciente.tiempoRestante = (paciente.horas * 3600) + (paciente.minutos * 60); // Reinicia el temporizador

    // Guardar en historial de cambios posturales
    let historial = JSON.parse(localStorage.getItem('historialCambios') || '[]');
    historial.unshift({
      paciente: paciente.nombre,
      fechaHora: new Date().toISOString(),
      estado: 'realizado',
      responsable: usuarioLogueado.nombre || 'Desconocido'
    });
    localStorage.setItem('historialCambios', JSON.stringify(historial));

    // Eliminar notificaciones críticas de este paciente
    let notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');
    notificaciones = notificaciones.filter(n =>
      !(n.tipo === 'critico' && n.mensaje.includes(paciente.nombre) && n.mensaje.includes(paciente.habitacion))
    );
    localStorage.setItem('notificaciones', JSON.stringify(notificaciones));

    localStorage.setItem('pacientes', JSON.stringify(pacientes));
    alert(`Cambio postural de ${paciente.nombre} marcado como realizado por ${paciente.medico}.`);
    location.reload();
  }
}

function avisarMedico(nombrePaciente, medicoEmail, habitacion) {
  if (!medicoEmail || medicoEmail === 'Sin correo') {
    alert('No se puede enviar la notificación porque no hay un correo asignado al médico.');
    return;
  }

  const mensaje = `El paciente ${nombrePaciente} necesita un cambio postural urgente en la SALA ${habitacion || 'desconocida'}. Por favor, atienda esta solicitud.`;
  const notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');
  notificaciones.push({
    tipo: 'interna',
    mensaje,
    para: medicoEmail,
    fecha: new Date().toISOString(),
    leido: false
  });
  localStorage.setItem('notificaciones', JSON.stringify(notificaciones));
  alert(`Se ha enviado una notificación al médico con correo ${medicoEmail} sobre el paciente ${nombrePaciente}.`);
}
