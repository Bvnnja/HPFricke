let editIndex = null;

function obtenerPacientes() {
  return JSON.parse(localStorage.getItem('pacientes') || '[]');
}

function guardarPacientes(pacientes) {
  localStorage.setItem('pacientes', JSON.stringify(pacientes));
}

function limpiarFormulario() {
  document.getElementById('nombre').value = '';
  document.getElementById('edad').value = '';
  document.getElementById('diagnostico').value = '';
  document.getElementById('habitacion').value = '';
  document.getElementById('guardarBtn').textContent = 'Registrar Paciente';
  document.getElementById('cancelarBtn').style.display = 'none';
  editIndex = null;
}

function mostrarPacientes() {
  const pacientes = obtenerPacientes();
  const tbody = document.getElementById('tablaPacientes').querySelector('tbody');
  tbody.innerHTML = '';
  pacientes.forEach((p, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.edad}</td>
      <td>${p.diagnostico}</td>
      <td>${p.habitacion}</td>
      <td>
        <button onclick="editarPaciente(${idx})">Editar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

document.getElementById('pacienteForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value.trim();
  const edad = document.getElementById('edad').value.trim();
  const diagnostico = document.getElementById('diagnostico').value.trim();
  const habitacion = document.getElementById('habitacion').value.trim();

  if (!nombre || !edad || !diagnostico || !habitacion) return;

  let pacientes = obtenerPacientes();

  if (editIndex !== null) {
    pacientes[editIndex] = { nombre, edad, diagnostico, habitacion };
  } else {
    pacientes.push({ nombre, edad, diagnostico, habitacion });
  }

  guardarPacientes(pacientes);
  limpiarFormulario();
  mostrarPacientes();
});

window.editarPaciente = function(idx) {
  const pacientes = obtenerPacientes();
  const p = pacientes[idx];
  document.getElementById('nombre').value = p.nombre;
  document.getElementById('edad').value = p.edad;
  document.getElementById('diagnostico').value = p.diagnostico;
  document.getElementById('habitacion').value = p.habitacion;
  document.getElementById('guardarBtn').textContent = 'Guardar Cambios';
  document.getElementById('cancelarBtn').style.display = 'inline-block';
  editIndex = idx;
};

document.getElementById('cancelarBtn').addEventListener('click', function() {
  limpiarFormulario();
});

mostrarPacientes();
