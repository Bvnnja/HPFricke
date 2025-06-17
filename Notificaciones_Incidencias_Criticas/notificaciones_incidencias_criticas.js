document.addEventListener('DOMContentLoaded', function() {
  const tabla = document.getElementById('tablaIncidenciasCriticas').querySelector('tbody');
  const incidencias = JSON.parse(localStorage.getItem('incidencias') || '[]');

  const criticas = incidencias.filter(inc => inc.nivelUrgencia && inc.nivelUrgencia.toLowerCase() === 'critico');

  if (criticas.length === 0) {
    const fila = document.createElement('tr');
    fila.innerHTML = '<td colspan="10" style="text-align:center; color:#888;">No hay incidencias críticas.</td>';
    tabla.appendChild(fila);
    return;
  }

  criticas.forEach((inc, index) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${inc.medico || 'N/A'}</td>
      <td>${inc.paciente || 'N/A'}</td>
      <td>${inc.edad || 'N/A'}</td>
      <td>${inc.diagnostico || 'N/A'}</td>
      <td>${inc.habitacion || 'N/A'}</td>
      <td>${inc.fechaHora || 'N/A'}</td>
      <td><span class="badge-estado badge-${inc.nivelUrgencia.toLowerCase()}">${inc.nivelUrgencia}</span></td>
      <td>${inc.descripcion || 'N/A'}</td>
      <td>${inc.estado || 'N/A'}</td>
      <td>
        <button onclick="avisarMedico('${inc.paciente}', '${inc.medico}', '${inc.habitacion}')">Avisar a Médico</button>
      </td>
    `;
    tabla.appendChild(fila);
  });
});

function avisarMedico(nombrePaciente, medico, habitacion) {
  const usuarios = JSON.parse(localStorage.getItem('users') || '[]');
  const medicoEmail = usuarios.find(u => u.nombre === medico)?.email;

  if (!medicoEmail) {
    alert('No se puede enviar la notificación porque no hay un correo asignado al médico.');
    return;
  }

  const mensaje = `La incidencia critica de [${nombrePaciente}] necesita atención urgente en la habitación [${habitacion || 'desconocida'}]. Por favor, atienda la solicitud.`;
  const notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');
  notificaciones.push({
    tipo: 'interna',
    mensaje,
    para: medicoEmail,
    fecha: new Date().toISOString(),
    leido: false
  });
  localStorage.setItem('notificaciones', JSON.stringify(notificaciones));
  alert(`Se ha enviado una notificación al médico ${medico} (${medicoEmail}) sobre el paciente ${nombrePaciente}.`);
}

function resolverIncidencia(index) {
  const pacientes = JSON.parse(localStorage.getItem('pacientes') || '[]');
  const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
  const paciente = pacientes[index];

  if (paciente) {
    paciente.cambioPostural = 'realizado'; // Cambia el estado a "realizado"
    paciente.medico = usuarioLogueado.nombre || 'Desconocido'; // Asigna el médico actual como el último que realizó el cambio
    localStorage.setItem('pacientes', JSON.stringify(pacientes));
    alert(`Incidencia crítica de ${paciente.nombre} marcada como resuelta por ${paciente.medico}.`);
    location.reload();
  }
}
