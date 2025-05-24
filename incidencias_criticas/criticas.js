const esSupervisor = true;

function obtenerIncidenciasCriticas() {
  const incidencias = JSON.parse(localStorage.getItem('incidencias') || '[]');
  // Solo las críticas
  return incidencias
    .map((inc, idx) => ({ ...inc, _id: idx }))
    .filter(inc => inc.nivelUrgencia && inc.nivelUrgencia.toLowerCase() === 'critico');
}

function obtenerSeguimientoIncidencias() {
  return JSON.parse(localStorage.getItem('seguimientoIncidencias') || '[]');
}

function guardarSeguimientoIncidencias(seguimiento) {
  localStorage.setItem('seguimientoIncidencias', JSON.stringify(seguimiento));
}

function getRolUsuario() {
  const usuario = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
  return usuario.rol || '';
}

function renderizarTablaCriticas(filtroEstado = '', filtroPaciente = '') {
  const tbody = document.getElementById('tablaIncidenciasRegistradas').querySelector('tbody');
  tbody.innerHTML = '';
  const criticas = obtenerIncidenciasCriticas().filter(inc => {
    let match = true;
    if (filtroEstado) match = inc.estado === filtroEstado;
    if (filtroPaciente) match = match && inc.paciente.toLowerCase().includes(filtroPaciente.toLowerCase());
    return match;
  });
  const rol = getRolUsuario();
  criticas.forEach((inc, idx) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${inc.medico}</td>
      <td>${inc.paciente}</td>
      <td>${inc.edad || 'N/A'}</td>
      <td>${inc.diagnostico || 'N/A'}</td>
      <td>${inc.habitacion || 'N/A'}</td>
      <td>${inc.fechaHora}</td>
      <td><span class="badge-estado badge-${inc.estado?.toLowerCase() || 'pendiente'}">${inc.nivelUrgencia}</span></td>
      <td>${inc.descripcion}</td>
      <td>
        <button class="btn btn-historial" onclick="verHistorialIncidencia(${inc._id})" ${rol !== 'supervisor' ? 'disabled' : ''}>Ver historial</button>
        <button class="btn btn-cambiar" onclick="abrirModalCambioEstado(${inc._id})" ${rol !== 'supervisor' ? 'disabled' : ''}>Cambiar estado</button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

window.verHistorialIncidencia = function(idx) {
  // HU-14: Mostrar historial de cambios de estado de la incidencia
  const seguimiento = obtenerSeguimientoIncidencias().filter(s => s.incidenciaId == idx);
  const lista = document.getElementById('listaHistorialIncidencia');
  lista.innerHTML = '';
  if (seguimiento.length === 0) {
    lista.innerHTML = '<li>No hay historial de cambios para esta incidencia.</li>';
  } else {
    seguimiento.forEach(s => {
      const li = document.createElement('li');
      li.textContent = `${new Date(s.fecha).toLocaleString()} - Estado: ${s.nuevoEstado} (por ${s.responsable})`;
      lista.appendChild(li);
    });
  }
  document.getElementById('modalHistorialIncidencia').style.display = 'block';
};

window.abrirModalCambioEstado = function(idx) {
  const modal = document.getElementById('modalCambioEstado');
  const select = document.getElementById('nuevoEstado');
  modal.dataset.idx = idx;
  select.value = '';
  modal.style.display = 'block';
};

document.getElementById('cerrarModalCambioEstado').onclick = function () {
  document.getElementById('modalCambioEstado').style.display = 'none';
};

document.getElementById('guardarCambioEstado').onclick = function () {
  const idx = document.getElementById('modalCambioEstado').dataset.idx;
  const nuevoEstado = document.getElementById('nuevoEstado').value;
  if (!nuevoEstado) {
    document.getElementById('msgCambioEstado').textContent = 'Selecciona un estado válido.';
    return;
  }
  cambiarEstadoIncidencia(parseInt(idx), nuevoEstado);
  document.getElementById('modalCambioEstado').style.display = 'none';
  document.getElementById('msgCambioEstado').textContent = '';
};

window.cambiarEstadoIncidencia = function(idx, nuevoEstado) {
  const incidencias = JSON.parse(localStorage.getItem('incidencias') || '[]');
  const incidencia = incidencias[idx];
  if (!incidencia) return;
  if (nuevoEstado && nuevoEstado !== (incidencia.estado || 'Pendiente')) {
    incidencia.estado = nuevoEstado;
    localStorage.setItem('incidencias', JSON.stringify(incidencias));
    let seguimientos = obtenerSeguimientoIncidencias();
    const usuario = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
    seguimientos.push({
      incidenciaId: idx,
      nuevoEstado,
      fecha: new Date().toISOString(),
      responsable: usuario.nombre || 'Desconocido'
    });
    guardarSeguimientoIncidencias(seguimientos);
    mostrarMensaje('Estado actualizado y seguimiento registrado.', 'success');
    renderizarTablaCriticas();
    // Actualiza la tabla de seguimiento si existe
    if (document.getElementById('tablaSeguimientoIncidencias')) {
      const tbody = document.getElementById('tablaSeguimientoIncidencias').querySelector('tbody');
      tbody.innerHTML = '';
      seguimientos.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${item.incidenciaId}</td><td>${item.nuevoEstado}</td><td>${new Date(item.fecha).toLocaleString()}</td><td>${item.responsable}</td>`;
        tbody.appendChild(tr);
      });
    }
  }
};

function mostrarMensaje(msg, tipo) {
  let div = document.getElementById('msgGlobal');
  if (!div) {
    div = document.createElement('div');
    div.id = 'msgGlobal';
    div.className = 'msg-global';
    document.body.appendChild(div);
  }
  div.textContent = msg;
  div.className = 'msg-global ' + (tipo === 'success' ? 'msg-success' : 'msg-error');
  div.style.display = 'block';
  setTimeout(() => { div.style.display = 'none'; }, 2500);
}

// Filtros
document.getElementById('filtroEstado').addEventListener('change', function() {
  renderizarTablaCriticas(this.value, document.getElementById('filtroPaciente').value);
});
document.getElementById('filtroPaciente').addEventListener('input', function() {
  renderizarTablaCriticas(document.getElementById('filtroEstado').value, this.value);
});

// Inicialización
renderizarTablaCriticas();
