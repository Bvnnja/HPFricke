function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

let editIndex = getQueryParam('paciente');
if (editIndex !== null) editIndex = parseInt(editIndex);

function obtenerPacientes() {
  return JSON.parse(localStorage.getItem('pacientes') || '[]');
}

function guardarPacientes(pacientes) {
  localStorage.setItem('pacientes', JSON.stringify(pacientes));
}

function cargarDatosPaciente() {
  if (typeof editIndex === 'number' && !isNaN(editIndex)) {
    const pacientes = obtenerPacientes();
    const paciente = pacientes[editIndex];
    if (paciente) {
      document.getElementById('editNombre').value = paciente.nombre || '';
      document.getElementById('editRut').value = paciente.rut || '';
      document.getElementById('editEdad').value = paciente.edad || '';
      document.getElementById('editDiagnostico').value = paciente.diagnostico || '';
      document.getElementById('editHabitacion').value = paciente.habitacion || '';
      if (document.getElementById('editSexo')) document.getElementById('editSexo').value = paciente.sexo || '';
      if (document.getElementById('editFechaIngreso')) document.getElementById('editFechaIngreso').value = paciente.fechaIngreso || '';
      if (document.getElementById('editObservaciones')) document.getElementById('editObservaciones').value = paciente.observaciones || '';
    }
  }
}

document.getElementById('editarPacienteForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const nombre = document.getElementById('editNombre').value.trim();
  const edad = document.getElementById('editEdad').value.trim();
  const diagnostico = document.getElementById('editDiagnostico').value.trim();
  const habitacion = document.getElementById('editHabitacion').value.trim();

  if (!nombre || !edad || !diagnostico || !habitacion) return;

  let pacientes = obtenerPacientes();
  if (typeof editIndex === 'number' && !isNaN(editIndex) && pacientes[editIndex]) {
    pacientes[editIndex] = { nombre, edad, diagnostico, habitacion };
    guardarPacientes(pacientes);
    alert('Paciente actualizado correctamente');
    window.location.href = '../registrar-paciente/registrar-paciente.html';
  }
});

document.getElementById('cancelarEditarBtn').addEventListener('click', function() {
  window.location.href = '../registrar-paciente/registrar-paciente.html';
});

cargarDatosPaciente();
