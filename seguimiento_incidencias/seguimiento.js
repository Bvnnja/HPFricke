document.addEventListener('DOMContentLoaded', function () {
  const seguimiento = JSON.parse(localStorage.getItem('seguimientoIncidencias') || '[]');
  const tbody = document.getElementById('tablaSeguimientoIncidencias').querySelector('tbody');
  tbody.innerHTML = '';

  if (seguimiento.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="color:#888;text-align:center;">No hay historial de incidencias.</td></tr>';
    return;
  }

  seguimiento.forEach(item => {
    let fecha = '';
    let hora = '';
    if (item.fechaHora) {
      const dateObj = new Date(item.fechaHora);
      if (!isNaN(dateObj.getTime())) {
        fecha = dateObj.toLocaleDateString();
        hora = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (item.fechaHora.includes(' ')) {
        const partes = item.fechaHora.split(' ');
        fecha = partes[0];
        hora = partes[1] || '';
      } else {
        fecha = item.fechaHora;
        hora = '';
      }
    }
    let fechaCambio = '';
    let horaCambio = '';
    if (item.fechaCambio) {
      const dateCambio = new Date(item.fechaCambio);
      if (!isNaN(dateCambio.getTime())) {
        fechaCambio = dateCambio.toLocaleDateString();
        horaCambio = dateCambio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    }
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.medico || ''}</td>
      <td>${item.paciente || ''}</td>
      <td>${item.edad || ''}</td>
      <td>${item.diagnostico || ''}</td>
      <td>${item.habitacion || ''}</td>
      <td>
        <div style="display:flex;flex-direction:column;align-items:center;">
          <span style="font-weight:bold;">${fecha}</span>
          <span style="font-size:0.93em;color:#b71c1c;">${hora}</span>
        </div>
      </td>
      <td>${item.nivelUrgencia || ''}</td>
      <td>${item.descripcion || ''}</td>
      <td>${item.estado || ''}</td>
      <td>
        <div style="display:flex;flex-direction:column;align-items:center;">
          <span style="font-weight:bold;">${fechaCambio}</span>
          <span style="font-size:0.93em;color:#b71c1c;">${horaCambio}</span>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
});
