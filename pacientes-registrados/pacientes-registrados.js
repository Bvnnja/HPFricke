document.addEventListener('DOMContentLoaded', function() {
  function obtenerPacientes() {
    return JSON.parse(localStorage.getItem('pacientes') || '[]');
  }
  function mostrarPacientes() {
    const pacientes = obtenerPacientes();
    const tbody = document.getElementById('tablaPacientes').querySelector('tbody');
    tbody.innerHTML = '';
    pacientes.forEach((p, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.nombre}</td>
        <td>${p.rut || ''}</td>
        <td>${p.edad}</td>
        <td>${p.sexo || ''}</td>
        <td>${p.diagnostico}</td>
        <td>${p.habitacion}</td>
        <td>${p.fechaIngreso || ''}</td>
        <td>${p.observaciones || ''}</td>
        <td>
          <button type="button" onclick="editarPacienteRegistrado(${idx})">Editar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
  window.editarPacienteRegistrado = function(idx) {
    window.location.href = `../Editar-Datos-paciente/editar-datos-paciente.html?paciente=${idx}`;
  };
  mostrarPacientes();
});
