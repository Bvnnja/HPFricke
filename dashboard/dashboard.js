function badgeCumplimiento(estado) {
  if (estado === 'realizado' || estado === 'cumplido') return '<span class="badge-dash badge-cumplido">Cumplido</span>';
  if (estado === 'critico') return '<span class="badge-dash badge-critico">Crítico</span>';
  if (estado === 'pendiente') return '<span class="badge-dash badge-pendiente">Pendiente</span>';
  if (estado === 'registrado') return '<span class="badge-dash badge-registrado">Registrado</span>';
  return `<span class="badge-dash">${estado}</span>`;
}

function renderizarDashboard(filtroEstado = '', filtroPaciente = '') {
  const pacientes = JSON.parse(localStorage.getItem('pacientes') || '[]');
  const historial = JSON.parse(localStorage.getItem('historialCambios') || '[]');
  const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
  const medicoLogueado = usuarioLogueado.nombre || '';
  const tbody = document.getElementById('tablaDashboard').querySelector('tbody');
  tbody.innerHTML = '';
  let estadoContador = {};

  pacientes.forEach(p => {
    // Buscar el cambio más reciente para este paciente (de cualquier estado)
    const cambiosPaciente = historial
      .filter(h => h.paciente && p.nombre && h.paciente.trim().toLowerCase() === p.nombre.trim().toLowerCase() && h.fechaHora)
      .sort((a, b) => {
        // Ordenar por fecha real descendente
        const da = new Date(a.fechaHora);
        const db = new Date(b.fechaHora);
        return db - da;
      });
    const ultCambio = cambiosPaciente.length > 0 ? cambiosPaciente[0] : null;

    // Determinar el estado real de cumplimiento (el estado actual de la postura manda)
    let cumplimiento = 'registrado';
    let estadoActual = (p.cambioPostural || '').toLowerCase();
    let estadoHistorial = ultCambio ? (ultCambio.estado || '').toLowerCase() : '';
    let medicoUltimo = ultCambio && ultCambio.responsable && ultCambio.responsable !== 'Desconocido'
      ? ultCambio.responsable
      : (p.medico || medicoLogueado || '');

    // La fecha/hora más reciente de cambio (siempre el cambio más reciente, no solo "realizado")
    let fechaUltCambio = ultCambio && ultCambio.fechaHora ? ultCambio.fechaHora : '';

    if (estadoActual === 'realizado' || estadoActual === 'cumplido') {
      cumplimiento = 'realizado';
    } else if (estadoActual === 'critico') {
      cumplimiento = 'critico';
    } else if (estadoActual === 'pendiente') {
      cumplimiento = 'pendiente';
    } else if (estadoActual === 'registrado') {
      cumplimiento = 'registrado';
    } else if (estadoHistorial) {
      cumplimiento = estadoHistorial;
    }

    estadoContador[cumplimiento] = (estadoContador[cumplimiento] || 0) + 1;

    if ((filtroEstado && cumplimiento !== filtroEstado) ||
        (filtroPaciente && !p.nombre.toLowerCase().includes(filtroPaciente.toLowerCase()))) {
      return;
    }

    // Mostrar fecha y hora separadas si es posible
    let fecha = '';
    let hora = '';
    if (fechaUltCambio) {
      const dt = new Date(fechaUltCambio);
      if (!isNaN(dt.getTime())) {
        fecha = dt.toLocaleDateString();
        hora = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      } else {
        const partes = fechaUltCambio.split(',');
        if (partes.length === 2) {
          fecha = partes[0].trim();
          hora = partes[1].trim();
        } else {
          fecha = fechaUltCambio;
        }
      }
    } else {
      fecha = '';
      hora = '';
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.habitacion}</td>
      <td>${p.diagnostico}</td>
      <td>${p.cambioPostural || ''}</td>
      <td>${medicoUltimo}</td>
      <td>${fecha}${hora ? ' | ' + hora : ''}</td>
      <td>${badgeCumplimiento(cumplimiento)}</td>
    `;
    tbody.appendChild(tr);
  });

  // Métricas visuales: muestra todos los estados encontrados
  let metricasHtml = '';
  Object.keys(estadoContador).forEach(estado => {
    let clase = 'metric-card';
    if (estado === 'realizado' || estado === 'cumplido') clase += ' metric-cumplido';
    else if (estado === 'critico') clase += ' metric-critico';
    else if (estado === 'pendiente') clase += ' metric-pendiente';
    else if (estado === 'registrado') clase += ' metric-registrado';
    metricasHtml += `<div class="${clase}">${estado.charAt(0).toUpperCase() + estado.slice(1)}: <b>${estadoContador[estado]}</b></div>`;
  });
  document.getElementById('metricasDashboard').innerHTML = metricasHtml;
}

document.getElementById('filtroEstadoDash').addEventListener('change', function() {
  renderizarDashboard(this.value, document.getElementById('filtroPacienteDash').value);
});
document.getElementById('filtroPacienteDash').addEventListener('input', function() {
  renderizarDashboard(document.getElementById('filtroEstadoDash').value, this.value);
});

renderizarDashboard();
