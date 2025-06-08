const esSupervisor = true;

function obtenerIncidenciasCriticas() {
  const incidencias = JSON.parse(localStorage.getItem('incidencias') || '[]');
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

function guardarIncidencias(incidencias) {
  localStorage.setItem('incidencias', JSON.stringify(incidencias));
}

function renderizarTablaCriticas(filtroEstado = '', filtroPaciente = '', filtroUrgencia = '') {
  const tbody = document.getElementById('tablaIncidenciasRegistradas').querySelector('tbody');
  tbody.innerHTML = '';

  const incidencias = JSON.parse(localStorage.getItem('incidencias') || '[]');
  // Agregar _id temporal para identificar la posición real en el array
  const criticas = incidencias
    .map((inc, idx) => ({ ...inc, _id: idx }))
    .filter(inc => {
      let match = inc.nivelUrgencia && inc.nivelUrgencia.toLowerCase() === 'critico';
      if (filtroEstado) match = match && inc.estado === filtroEstado;
      if (filtroPaciente) match = match && inc.paciente.toLowerCase().includes(filtroPaciente.toLowerCase());
      return match;
    });

  if (criticas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:#888;">No hay incidencias críticas.</td></tr>';
    return;
  }

  criticas.forEach(inc => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${inc.medico}</td>
      <td>${inc.paciente}</td>
      <td>${inc.edad || 'N/A'}</td>
      <td>${inc.diagnostico || 'N/A'}</td>
      <td>${inc.habitacion || 'N/A'}</td>
      <td>${inc.fechaHora}</td>
      <td><span class="badge-estado badge-${inc.nivelUrgencia.toLowerCase()}">${inc.nivelUrgencia}</span></td>
      <td>${inc.descripcion}</td>
      <td>
        <select class="estado-selector" data-id="${inc._id}">
          <option value="Pendiente" ${inc.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value="En proceso" ${inc.estado === 'En proceso' ? 'selected' : ''}>En proceso</option>
          <option value="Resuelto" ${inc.estado === 'Resuelto' ? 'selected' : ''}>Resuelto</option>
        </select>
      </td>
      <td>
        <button class="btn-eliminar" data-id="${inc._id}" title="Eliminar incidencia" style="color:#fff;background:#d32f2f;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;">Eliminar</button>
      </td>
    `;
    tbody.appendChild(fila);
  });

  agregarEventos();
}

function buscarIndiceIncidenciaPorClaves(incidenciaReferencia) {
  const incidencias = JSON.parse(localStorage.getItem('incidencias') || '[]');
  return incidencias.findIndex(inc =>
    inc.medico === incidenciaReferencia.medico &&
    inc.paciente === incidenciaReferencia.paciente &&
    inc.fechaHora === incidenciaReferencia.fechaHora
  );
}

function agregarEventos() {
  // Ahora el cambio de estado se realiza directamente en el evento change del select
  document.querySelectorAll('.estado-selector').forEach(select => {
    select.addEventListener('change', function () {
      const idxTemp = parseInt(this.dataset.id, 10);
      const fila = this.closest('tr');
      const medico = fila.children[0].textContent;
      const paciente = fila.children[1].textContent;
      const fechaHora = fila.children[5].textContent;
      const incidenciaReferencia = { medico, paciente, fechaHora };

      const idx = buscarIndiceIncidenciaPorClaves(incidenciaReferencia);
      const nuevoEstado = this.value;
      let incidencias = JSON.parse(localStorage.getItem('incidencias') || '[]');
      if (idx !== -1 && ["Pendiente", "En proceso", "Resuelto"].includes(nuevoEstado)) {
        incidencias[idx].estado = nuevoEstado;
        localStorage.setItem('incidencias', JSON.stringify(incidencias));
        // Guardar historial de cambios en seguimientoIncidencias
        let historial = JSON.parse(localStorage.getItem('seguimientoIncidencias') || '[]');
        historial.push({
          medico: incidencias[idx].medico,
          paciente: incidencias[idx].paciente,
          edad: incidencias[idx].edad,
          diagnostico: incidencias[idx].diagnostico,
          habitacion: incidencias[idx].habitacion,
          fechaHora: incidencias[idx].fechaHora,
          nivelUrgencia: incidencias[idx].nivelUrgencia,
          descripcion: incidencias[idx].descripcion,
          estado: nuevoEstado,
          fechaCambio: new Date().toISOString()
        });
        guardarSeguimientoIncidencias(historial);
        renderizarTablaCriticas(
          document.getElementById('filtroEstado').value,
          document.getElementById('filtroPaciente').value
        );
      }
    });
  });

  // Evento para eliminar incidencia
  document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', function () {
      const idx = parseInt(this.dataset.id, 10);
      let incidencias = JSON.parse(localStorage.getItem('incidencias') || '[]');
      incidencias.splice(idx, 1);
      localStorage.setItem('incidencias', JSON.stringify(incidencias));
      renderizarTablaCriticas(
        document.getElementById('filtroEstado').value,
        document.getElementById('filtroPaciente').value
      );
    });
  });
}

// HU-14: Mostrar historial de cambios de estado de la incidencia
window.verHistorialIncidencia = function(idx) {
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
  modal.dataset.idx = idx; // Guardar el índice correctamente en el dataset del modal
  select.value = '';
  modal.style.display = 'block';
};

document.getElementById('cerrarModalCambioEstado').onclick = function () {
  document.getElementById('modalCambioEstado').style.display = 'none';
};

document.getElementById('guardarCambioEstado').onclick = function () {
  const idx = parseInt(document.getElementById('modalCambioEstado').dataset.idx, 10); // Asegurar que el índice sea un número
  const nuevoEstado = document.getElementById('nuevoEstado').value;

  if (!nuevoEstado) {
    document.getElementById('msgCambioEstado').textContent = 'Debes seleccionar un nuevo estado.';
    return;
  }

  const incidencias = JSON.parse(localStorage.getItem('incidencias') || '[]');
  const incidencia = incidencias.find(inc => inc._id === idx); // Comparar correctamente con el índice

  if (incidencia) {
    incidencia.estado = nuevoEstado; // Actualizar el estado de la incidencia
    localStorage.setItem('incidencias', JSON.stringify(incidencias)); // Guardar incidencias actualizadas en localStorage

    let seguimientos = JSON.parse(localStorage.getItem('seguimientoIncidencias') || '[]');
    const usuario = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
    seguimientos.push({
      incidenciaId: idx,
      nuevoEstado,
      fecha: new Date().toISOString(),
      responsable: usuario.nombre || 'Desconocido'
    });
    localStorage.setItem('seguimientoIncidencias', JSON.stringify(seguimientos)); // Guardar seguimiento actualizado

    document.getElementById('msgCambioEstado').textContent = 'Estado cambiado con éxito.';
    setTimeout(() => {
      document.getElementById('modalCambioEstado').style.display = 'none';
      renderizarTablaCriticas(); // Actualizar la tabla de incidencias
      mostrarSeguimientoIncidenciasResueltas(); // Actualizar seguimiento de incidencias resueltas
    }, 1500);
  } else {
    document.getElementById('msgCambioEstado').textContent = 'No se encontró la incidencia seleccionada.';
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

function mostrarSeguimientoIncidenciasResueltas() {
  const seguimiento = JSON.parse(localStorage.getItem('seguimientoIncidencias') || '[]').filter(s => s.nuevoEstado === 'Resuelto');
  const tbody = document.getElementById('tablaSeguimientoIncidencias').querySelector('tbody');
  tbody.innerHTML = ''; // Limpiar la tabla antes de llenarla

  if (seguimiento.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#888;">No hay incidencias resueltas.</td></tr>';
    return;
  }

  seguimiento.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.incidenciaId}</td>
      <td>${item.nuevoEstado}</td>
      <td>${new Date(item.fecha).toLocaleString()}</td>
      <td>${item.responsable}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Inicialización
document.addEventListener('DOMContentLoaded', function () {
  const tablaIncidencias = document.getElementById('tablaIncidenciasRegistradas');
  const filtroEstado = document.getElementById('filtroEstado');
  const filtroPaciente = document.getElementById('filtroPaciente');

  function obtenerIncidencias() {
    return JSON.parse(localStorage.getItem('incidencias') || '[]');
  }

  function guardarIncidencias(incidencias) {
    localStorage.setItem('incidencias', JSON.stringify(incidencias));
  }

  function obtenerSeguimientoIncidencias() {
    return JSON.parse(localStorage.getItem('seguimientoIncidencias') || '[]');
  }

  function guardarSeguimientoIncidencias(seguimiento) {
    localStorage.setItem('seguimientoIncidencias', JSON.stringify(seguimiento));
  }

  function renderizarTablaCriticas(filtroEstado = '', filtroPaciente = '') {
    const incidencias = obtenerIncidencias();
    const tbody = tablaIncidencias.querySelector('tbody');
    tbody.innerHTML = ''; // Limpiar la tabla

    const criticas = incidencias.filter(inc => {
      let match = inc.nivelUrgencia.toLowerCase() === 'critico';
      if (filtroEstado) match = match && inc.estado === filtroEstado;
      if (filtroPaciente) match = match && inc.paciente.toLowerCase().includes(filtroPaciente.toLowerCase());
      return match;
    });

    if (criticas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#888;">No hay incidencias críticas.</td></tr>';
      return;
    }

    criticas.forEach(inc => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${inc.medico}</td>
        <td>${inc.paciente}</td>
        <td>${inc.edad || 'N/A'}</td>
        <td>${inc.diagnostico || 'N/A'}</td>
        <td>${inc.habitacion || 'N/A'}</td>
        <td>${inc.fechaHora}</td>
        <td><span class="badge-estado badge-${inc.nivelUrgencia.toLowerCase()}">${inc.nivelUrgencia}</span></td>
        <td>${inc.descripcion}</td>
        <td>
          <select class="estado-selector" data-id="${inc._id}">
            <option value="Pendiente" ${inc.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="En proceso" ${inc.estado === 'En proceso' ? 'selected' : ''}>En proceso</option>
            <option value="Resuelto" ${inc.estado === 'Resuelto' ? 'selected' : ''}>Resuelto</option>
          </select>
        </td>
      `;
      tbody.appendChild(fila);
    });

    agregarEventos();
  }

  function agregarEventos() {
    // Ahora el cambio de estado se realiza directamente en el evento change del select
    document.querySelectorAll('.estado-selector').forEach(select => {
      select.addEventListener('change', function () {
        const idxTemp = parseInt(this.dataset.id, 10);
        const fila = this.closest('tr');
        const medico = fila.children[0].textContent;
        const paciente = fila.children[1].textContent;
        const fechaHora = fila.children[5].textContent;
        const incidenciaReferencia = { medico, paciente, fechaHora };

        const idx = buscarIndiceIncidenciaPorClaves(incidenciaReferencia);
        const nuevoEstado = this.value;
        let incidencias = JSON.parse(localStorage.getItem('incidencias') || '[]');
        if (idx !== -1 && ["Pendiente", "En proceso", "Resuelto"].includes(nuevoEstado)) {
          incidencias[idx].estado = nuevoEstado;
          localStorage.setItem('incidencias', JSON.stringify(incidencias));
          // Guardar historial de cambios en seguimientoIncidencias
          let historial = JSON.parse(localStorage.getItem('seguimientoIncidencias') || '[]');
          historial.push({
            medico: incidencias[idx].medico,
            paciente: incidencias[idx].paciente,
            edad: incidencias[idx].edad,
            diagnostico: incidencias[idx].diagnostico,
            habitacion: incidencias[idx].habitacion,
            fechaHora: incidencias[idx].fechaHora,
            nivelUrgencia: incidencias[idx].nivelUrgencia,
            descripcion: incidencias[idx].descripcion,
            estado: nuevoEstado,
            fechaCambio: new Date().toISOString()
          });
          guardarSeguimientoIncidencias(historial);
          renderizarTablaCriticas(
            document.getElementById('filtroEstado').value,
            document.getElementById('filtroPaciente').value
          );
        }
      });
    });

    // Evento para eliminar incidencia
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
      btn.addEventListener('click', function () {
        const idx = parseInt(this.dataset.id, 10);
        let incidencias = JSON.parse(localStorage.getItem('incidencias') || '[]');
        incidencias.splice(idx, 1);
        localStorage.setItem('incidencias', JSON.stringify(incidencias));
        renderizarTablaCriticas(
          document.getElementById('filtroEstado').value,
          document.getElementById('filtroPaciente').value
        );
      });
    });
  }

  filtroEstado.addEventListener('change', () => {
    renderizarTablaCriticas(filtroEstado.value, filtroPaciente.value);
  });

  filtroPaciente.addEventListener('input', () => {
    renderizarTablaCriticas(filtroEstado.value, filtroPaciente.value);
  });

  renderizarTablaCriticas();
});

let incidenciaSeleccionada;

document.getElementById('tablaIncidenciasRegistradas').addEventListener('click', function (event) {
  if (event.target.classList.contains('btn-cambiar')) {
    const fila = event.target.closest('tr');
    if (!fila) return;

    const incidenciaId = fila.querySelector('td:nth-child(1)').textContent.trim(); // Obtener ID de la incidencia
    const modal = document.getElementById('modalCambioEstado');
    modal.dataset.idx = incidenciaId; // Guardar el ID en el dataset del modal

    const select = document.getElementById('nuevoEstado');
    select.value = ''; // Resetear el valor del select

    modal.style.display = 'block'; // Mostrar el modal
  }
});

// Sobrescribe o agrega esta función para actualizar seguimientoIncidencias correctamente
function actualizarSeguimientoIncidencias() {
  const incidencias = JSON.parse(localStorage.getItem('incidencias') || '[]');
  const soloResueltos = incidencias
    .filter(inc => inc.estado === "Resuelto")
    .map(inc => ({
      medico: inc.medico,
      paciente: inc.paciente,
      edad: inc.edad,
      diagnostico: inc.diagnostico,
      habitacion: inc.habitacion,
      fechaHora: inc.fechaHora,
      nivelUrgencia: inc.nivelUrgencia,
      descripcion: inc.descripcion,
      estado: inc.estado
    }));
  localStorage.setItem('seguimientoIncidencias', JSON.stringify(soloResueltos));
}

// Busca la parte donde se actualiza el estado de la incidencia (por ejemplo, en el evento de guardar cambio de estado)
// Después de actualizar el estado y guardar en localStorage, si el nuevo estado es "Resuelto", llama a la función:
if (incidencia && nuevoEstado === "Resuelto") {
  // ...ya actualizaste incidencia.estado y guardaste incidencias...
  actualizarSeguimientoIncidencias();
}
