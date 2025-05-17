const esSupervisor = true;

const incidencias = [
  {
    id: 1,
    fechaHora: '2025-05-16 08:00',
    descripcion: 'Paciente sin cambio de postura en más de 4 horas.',
    estado: 'Pendiente',
    historial: ['Pendiente']
  },
  {
    id: 2,
    fechaHora: '2025-05-16 10:10',
    descripcion: 'Sensor detectó posición de riesgo para úlceras.',
    estado: 'En proceso',
    historial: ['Pendiente', 'En proceso']
  },
  {
    id: 3,
    fechaHora: '2025-05-16 11:30',
    descripcion: 'Paciente con inclinación riesgosa para caída.',
    estado: 'Pendiente',
    historial: ['Pendiente']
  }
];

function renderizarTabla() {
  const tbody = document.getElementById('tablaIncidencias');
  tbody.innerHTML = '';

  incidencias.forEach(inc => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${inc.fechaHora}</td>
      <td>${inc.descripcion}</td>
      <td>${inc.estado}</td>
      <td>
        <button class="btn btn-historial" onclick="verHistorial(${inc.id})">Ver historial</button>
        ${esSupervisor ? `<button class="btn btn-cambiar" onclick="cambiarEstado(${inc.id})">Cambiar estado</button>` : ''}
      </td>
    `;
    tbody.appendChild(fila);
  });
}

function cambiarEstado(id) {
  const incidencia = incidencias.find(i => i.id === id);
  const nuevoEstado = prompt('Ingrese nuevo estado:', incidencia.estado);
  if (nuevoEstado && nuevoEstado !== incidencia.estado) {
    incidencia.estado = nuevoEstado;
    incidencia.historial.push(nuevoEstado);
    alert('Estado actualizado');
    renderizarTabla();
  }
}

function verHistorial(id) {
  const incidencia = incidencias.find(i => i.id === id);
  const lista = document.getElementById('listaHistorial');
  lista.innerHTML = '';
  incidencia.historial.forEach(e => {
    const li = document.createElement('li');
    li.textContent = e;
    lista.appendChild(li);
  });
  document.getElementById('modalHistorial').style.display = 'block';
}

document.getElementById('cerrarModal').onclick = function () {
  document.getElementById('modalHistorial').style.display = 'none';
};

window.onclick = function (event) {
  if (event.target === document.getElementById('modalHistorial')) {
    document.getElementById('modalHistorial').style.display = 'none';
  }
};

// Auto actualización cada 5 segundos
setInterval(() => {
  renderizarTabla();
}, 5000);

renderizarTabla();
