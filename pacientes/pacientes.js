document.addEventListener('DOMContentLoaded', () => {
  const tablaPacientes = document.getElementById('tablaPacientes').querySelector('tbody');
  const medicoLogueado = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}').nombre || 'Desconocido';
  let temporizadores = {};

  function cargarPacientes() {
    const pacientes = JSON.parse(localStorage.getItem('pacientes') || '[]');
    tablaPacientes.innerHTML = '';

    pacientes.forEach((paciente, index) => {
      const fila = document.createElement('tr');
      fila.className = paciente.cambioPostural; // Asigna la clase según el estado

      fila.innerHTML = `
        <td>${paciente.nombre}</td>
        <td>${paciente.edad}</td>
        <td>${paciente.diagnostico}</td>
        <td>${paciente.habitacion}</td>
        <td>
          <select data-index="${index}" class="estado-cambio-postural">
            <option value="realizado" ${paciente.cambioPostural === 'realizado' ? 'selected' : ''}>Realizado</option>
            <option value="pendiente" ${paciente.cambioPostural === 'pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="critico" ${paciente.cambioPostural === 'critico' ? 'selected' : ''}>Crítico</option>
          </select>
        </td>
        <td>
          <span id="temporizador-${index}">--:--</span>
        </td>
        <td>
          <select data-index="${index}" class="configurar-horas">
            ${Array.from({ length: 24 }, (_, i) => `<option value="${i}" ${paciente.horas === i ? 'selected' : ''}>${String(i).padStart(2, '0')}</option>`).join('')}
          </select> :
          <select data-index="${index}" class="configurar-minutos">
            ${Array.from({ length: 60 }, (_, i) => `<option value="${i}" ${paciente.minutos === i ? 'selected' : ''}>${String(i).padStart(2, '0')}</option>`).join('')}
          </select>
        </td>
        <td id="medico-${index}">${paciente.medico || 'N/A'}</td>
      `;
      tablaPacientes.appendChild(fila);
    });

    document.querySelectorAll('.estado-cambio-postural').forEach((select) => {
      select.addEventListener('change', (e) => {
        const index = e.target.dataset.index;
        actualizarEstadoCambioPostural(index, e.target.value);
      });
    });

    document.querySelectorAll('.configurar-horas, .configurar-minutos').forEach((select) => {
      select.addEventListener('change', (e) => {
        const index = e.target.dataset.index;
        actualizarTiempo(index);
      });
    });

    iniciarTemporizadores();
  }

  function actualizarEstadoCambioPostural(index, estado) {
    const pacientes = JSON.parse(localStorage.getItem('pacientes') || '[]');
    pacientes[index].cambioPostural = estado;

    if (estado === 'realizado') {
      pacientes[index].tiempoRestante = (pacientes[index].horas * 3600) + (pacientes[index].minutos * 60); // Reinicia el temporizador
      pacientes[index].medico = medicoLogueado; // Registra el médico que realizó el cambio
    }

    localStorage.setItem('pacientes', JSON.stringify(pacientes));
    cargarPacientes();
  }

  function actualizarTiempo(index) {
    const pacientes = JSON.parse(localStorage.getItem('pacientes') || '[]');
    const horas = document.querySelector(`.configurar-horas[data-index="${index}"]`).value;
    const minutos = document.querySelector(`.configurar-minutos[data-index="${index}"]`).value;

    pacientes[index].horas = parseInt(horas, 10);
    pacientes[index].minutos = parseInt(minutos, 10);
    pacientes[index].tiempoRestante = (pacientes[index].horas * 3600) + (pacientes[index].minutos * 60); // Actualiza el tiempo restante
    localStorage.setItem('pacientes', JSON.stringify(pacientes));
    cargarPacientes();
  }

  function iniciarTemporizadores() {
    const pacientes = JSON.parse(localStorage.getItem('pacientes') || '[]');

    pacientes.forEach((paciente, index) => {
      if (temporizadores[index]) {
        clearInterval(temporizadores[index]);
      }

      if (!paciente.tiempoRestante) {
        paciente.tiempoRestante = (paciente.horas * 3600) + (paciente.minutos * 60) || 3600; // 1 hora por defecto
      }

      temporizadores[index] = setInterval(() => {
        paciente.tiempoRestante--;

        const temporizadorDisplay = document.getElementById(`temporizador-${index}`);
        const horas = Math.floor(Math.abs(paciente.tiempoRestante) / 3600);
        const minutos = Math.floor((Math.abs(paciente.tiempoRestante) % 3600) / 60);
        const segundos = Math.abs(paciente.tiempoRestante) % 60;
        const tiempoFormateado = `${paciente.tiempoRestante < 0 ? '-' : ''}${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
        temporizadorDisplay.textContent = tiempoFormateado;

        if (paciente.tiempoRestante === 0) {
          paciente.cambioPostural = 'pendiente';
        } else if (paciente.tiempoRestante < -60) {
          paciente.cambioPostural = 'critico';
        }

        localStorage.setItem('pacientes', JSON.stringify(pacientes));
      }, 1000);
    });
  }

  cargarPacientes();
});
