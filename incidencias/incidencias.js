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

  // Mostrar incidencias en la lista
  function mostrarIncidencias() {
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
            (incidencia, index) => `
          <tr>
            <td>${incidencia.medico}</td>
            <td>${incidencia.paciente}</td>
            <td>${incidencia.edad || 'N/A'}</td>
            <td>${incidencia.diagnostico || 'N/A'}</td>
            <td>${incidencia.habitacion || 'N/A'}</td>
            <td>${incidencia.fechaHora}</td>
            <td>${incidencia.nivelUrgencia}</td>
            <td>${incidencia.descripcion}</td>
            <td><button onclick="eliminarIncidencia(${index})">Eliminar</button></td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    `;
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
      alert('Por favor, completa todos los campos.');
      return;
    }

    const nuevaIncidencia = { medico, paciente, edad, diagnostico, habitacion, fechaHora, nivelUrgencia, descripcion };
    const incidencias = obtenerIncidencias();
    incidencias.push(nuevaIncidencia);
    guardarIncidencias(incidencias);

    formIncidencias.reset();
    mostrarIncidencias();
    alert('Incidencia registrada correctamente.');
  });

  // Eliminar incidencia
  window.eliminarIncidencia = (index) => {
    const incidencias = obtenerIncidencias();
    incidencias.splice(index, 1);
    guardarIncidencias(incidencias);
    mostrarIncidencias();
    alert('Incidencia eliminada correctamente.');
  };

  // Inicializar
  medicoInput.value = obtenerMedicoLogueado();
  llenarListaPacientes();
  mostrarIncidencias();
});
