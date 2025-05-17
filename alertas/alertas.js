const pacientes = [
  { id: 1, nombre: 'Ana Gonzalez', horasDesdeUltimoCambio: 3 },
  { id: 2, nombre: 'Joaquin Ramirez', horasDesdeUltimoCambio: 2 },
  { id: 3, nombre: 'Luis Martinez', horasDesdeUltimoCambio: 4 },
];

const listaPacientes = document.getElementById('pacientes');
const modal = document.getElementById('modal');
const modalTexto = document.getElementById('mensajeModal');
const cerrarModalBtn = document.getElementById('cerrarModal');
const audioAlerta = document.getElementById('audioAlerta');

function mostrarPacientes() {
  listaPacientes.innerHTML = '';
  pacientes.forEach(paciente => {
    const li = document.createElement('li');
    li.dataset.id = paciente.id;

    // Crear texto y contenedor para ícono
    const textoSpan = document.createElement('span');
    textoSpan.textContent = `${paciente.nombre} - Último cambio: ${paciente.horasDesdeUltimoCambio} hora${paciente.horasDesdeUltimoCambio !== 1 ? 's' : ''}`;

    const iconoAlerta = document.createElement('span');
    iconoAlerta.classList.add('icono-alerta');
    iconoAlerta.textContent = '⚠️';
    iconoAlerta.style.display = 'none'; // Oculto por defecto
    iconoAlerta.style.marginLeft = '8px';

    li.appendChild(textoSpan);
    li.appendChild(iconoAlerta);

    listaPacientes.appendChild(li);

    li.addEventListener('click', () => {
      // Ocultar todos los iconos de alerta
      document.querySelectorAll('.icono-alerta').forEach(i => i.style.display = 'none');
      // Mostrar solo el icono del paciente seleccionado
      iconoAlerta.style.display = 'inline';

      mostrarModal(paciente);
    });
  });
}

function mostrarModal(paciente) {
  modalTexto.textContent = `Alerta: Es necesario cambiar la posición de ${paciente.nombre} para evitar complicaciones médicas.`;
  modal.style.display = 'block';
  audioAlerta.play();

  // Cerrar automáticamente el modal y audio después de 1 minuto (60,000 ms)
  setTimeout(() => {
    if(modal.style.display === 'block') {
      cerrarModal();
    }
  }, 60000);
}

function cerrarModal() {
  modal.style.display = 'none';
  audioAlerta.pause();
  audioAlerta.currentTime = 0;
  // Ocultar todos los iconos de alerta al cerrar modal
  document.querySelectorAll('.icono-alerta').forEach(i => i.style.display = 'none');
}

cerrarModalBtn.onclick = cerrarModal;

window.onclick = (event) => {
  if(event.target === modal) {
    cerrarModal();
  }
};

mostrarPacientes();
