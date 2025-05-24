document.addEventListener('DOMContentLoaded', () => {
  const formIncidencias = document.getElementById('formIncidencias');
  const listaIncidencias = document.getElementById('listaIncidencias');
  const listaPacientes = document.getElementById('listaPacientes');
  const medicoInput = document.getElementById('medico');

  // Recuperar incidencias desde localStorage
  function obtenerIncidencias() {
    return JSON.parse(localStorage.getItem('incidencias') || '[]');
  }

  // Guardar incidencias en localStorage
  function guardarIncidencias(incidencias) {
    localStorage.setItem('incidencias', JSON.stringify(incidencias));
  }

  // Recuperar pacientes registrados desde localStorage
  function obtenerPacientesRegistrados() {
    return JSON.parse(localStorage.getItem('pacientes') || '[]');
  }

  // Recuperar médico logueado desde localStorage
  function obtenerMedicoLogueado() {
    const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
    return usuarioLogueado.nombre || 'N/A';
  }

  // Llenar lista desplegable de pacientes registrados
  function llenarListaPacientes() {
    const pacientes = obtenerPacientesRegistrados();
    pacientes.forEach((paciente) => {
      const option = document.createElement('option');
      option.value = paciente.nombre;
      option.dataset.edad = paciente.edad;
      option.dataset.diagnostico = paciente.diagnostico;
      option.dataset.habitacion = paciente.habitacion;
      option.textContent = paciente.nombre;
      listaPacientes.appendChild(option);
    });
  }

  function mostrarMensajeIncidencia(msg, tipo) {
    const div = document.getElementById('msgIncidencia');
    div.textContent = msg;
    div.className = 'msg-global ' + (tipo === 'success' ? 'msg-success' : 'msg-error');
    div.style.display = 'block';
    setTimeout(() => { div.style.display = 'none'; }, 2500);
  }

  // Mostrar incidencias en la lista
  function mostrarIncidencias(filtroUrgencia = '', filtroPaciente = '') {
    const incidencias = obtenerIncidencias();
    listaIncidencias.innerHTML = `
      <thead>
        <tr>
          <th>Médico</th>
          <th>Paciente</th>
          <th>Edad</th>
          <th>Diagnóstico</th>
          <th>Habitación</th>
          <th>Fecha y Hora</th>
          <th>Nivel de Urgencia</th>
          <th>Descripción</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${incidencias
          .map(
            (incidencia, index) => {
              if ((filtroUrgencia && incidencia.nivelUrgencia !== filtroUrgencia) ||
                  (filtroPaciente && !incidencia.paciente.toLowerCase().includes(filtroPaciente.toLowerCase()))) {
                return '';
              }
              let badgeClass = 'badge-urgencia badge-' + (incidencia.nivelUrgencia || '').toLowerCase();
              return `
              <tr>
                <td>${incidencia.medico}</td>
                <td>${incidencia.paciente}</td>
                <td>${incidencia.edad || 'N/A'}</td>
                <td>${incidencia.diagnostico || 'N/A'}</td>
                <td>${incidencia.habitacion || 'N/A'}</td>
                <td>${incidencia.fechaHora}</td>
                <td><span class="${badgeClass}">${incidencia.nivelUrgencia}</span></td>
                <td>${incidencia.descripcion}</td>
                <td><button onclick="eliminarIncidencia(${index})">Eliminar</button></td>
              </tr>
            `;
            }
          )
          .join('')}
      </tbody>
    `;
  }

  // Guardar en historial de cambios posturales (HU-12)
  function guardarHistorialCambio({ paciente, fechaHora, nivelUrgencia, medico }) {
    let historial = JSON.parse(localStorage.getItem('historialCambios') || '[]');
    historial.push({
      paciente,
      fechaHora,
      estado: nivelUrgencia === 'critico' ? 'critico' : 'registrado',
      responsable: medico
    });
    localStorage.setItem('historialCambios', JSON.stringify(historial));
  }

  // Registrar nueva incidencia
  formIncidencias.addEventListener('submit', (e) => {
    e.preventDefault();
    const medico = medicoInput.value;
    const pacienteSeleccionado = listaPacientes.selectedOptions[0];
    const paciente = pacienteSeleccionado ? pacienteSeleccionado.value : '';
    const edad = pacienteSeleccionado ? pacienteSeleccionado.dataset.edad : '';
    const diagnostico = pacienteSeleccionado ? pacienteSeleccionado.dataset.diagnostico : '';
    const habitacion = pacienteSeleccionado ? pacienteSeleccionado.dataset.habitacion : '';
    const fechaHora = document.getElementById('fechaHora').value;
    const nivelUrgencia = document.getElementById('nivelUrgencia').value;
    const descripcion = document.getElementById('descripcion').value.trim();

    if (!medico || !paciente || !fechaHora || !nivelUrgencia || !descripcion) {
      mostrarMensajeIncidencia('Por favor, completa todos los campos.', 'error');
      return;
    }

    const nuevaIncidencia = { medico, paciente, edad, diagnostico, habitacion, fechaHora, nivelUrgencia, descripcion };
    const incidencias = obtenerIncidencias();
    incidencias.push(nuevaIncidencia);
    guardarIncidencias(incidencias);

    guardarHistorialCambio({ paciente, fechaHora, nivelUrgencia, medico });

    if (nivelUrgencia.toLowerCase() === 'critico') {
      let notis = JSON.parse(localStorage.getItem('notificaciones') || '[]');
      notis.push({
        tipo: 'incidencia_critica',
        mensaje: `Incidencia crítica registrada para ${paciente}: ${descripcion}`,
        fecha: new Date().toISOString()
      });
      localStorage.setItem('notificaciones', JSON.stringify(notis));
      mostrarMensajeIncidencia('¡Incidencia crítica! Se notificó a los médicos responsables.', 'success');
    } else {
      mostrarMensajeIncidencia('Incidencia registrada correctamente.', 'success');
    }

    formIncidencias.reset();
    mostrarIncidencias();
  });

  // Eliminar incidencia
  window.eliminarIncidencia = (index) => {
    const incidencias = obtenerIncidencias();
    incidencias.splice(index, 1);
    guardarIncidencias(incidencias);
    mostrarIncidencias();
    mostrarMensajeIncidencia('Incidencia eliminada correctamente.', 'success');
  };

  // Filtros
  document.getElementById('filtroUrgencia').addEventListener('change', function() {
    mostrarIncidencias(this.value, document.getElementById('filtroPacienteInc').value);
  });
  document.getElementById('filtroPacienteInc').addEventListener('input', function() {
    mostrarIncidencias(document.getElementById('filtroUrgencia').value, this.value);
  });

  // Inicializar
  medicoInput.value = obtenerMedicoLogueado();
  llenarListaPacientes();
  mostrarIncidencias();
});
