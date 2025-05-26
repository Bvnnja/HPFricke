document.addEventListener('DOMContentLoaded', () => {
  const tablaPacientes = document.getElementById('tablaPacientes').querySelector('tbody');
  let temporizadores = {};

  function obtenerPacientes() {
    return JSON.parse(localStorage.getItem('pacientes') || '[]');
  }

  function guardarPacientes(pacientes) {
    localStorage.setItem('pacientes', JSON.stringify(pacientes));
  }

  function cargarPacientes() {
    const pacientes = obtenerPacientes();
    tablaPacientes.innerHTML = '';

    pacientes.forEach((paciente, index) => {
      const fila = document.createElement('tr');

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
          <span id="temporizador-${index}">${formatearTiempo(paciente.tiempoRestante)}</span>
        </td>
        <td>
          <select data-index="${index}" class="configurar-horas">
            ${Array.from({ length: 24 }, (_, i) => `<option value="${i}" ${paciente.horas === i ? 'selected' : ''}>${String(i).padStart(2, '0')}</option>`).join('')}
          </select> :
          <select data-index="${index}" class="configurar-minutos">
            ${Array.from({ length: 60 }, (_, i) => `<option value="${i}" ${paciente.minutos === i ? 'selected' : ''}>${String(i).padStart(2, '0')}</option>`).join('')}
          </select>
        </td>
        <td>${paciente.medico || 'N/A'}</td>
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
  }

  function formatearTiempo(segundosTotales) {
    const horas = Math.floor(Math.abs(segundosTotales) / 3600);
    const minutos = Math.floor((Math.abs(segundosTotales) % 3600) / 60);
    const segundos = Math.abs(segundosTotales) % 60;
    return `${segundosTotales < 0 ? '-' : ''}${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
  }

  function actualizarEstadoCambioPostural(index, estado) {
    const pacientes = obtenerPacientes();
    const paciente = pacientes[index];

    if (estado === 'realizado') {
      paciente.tiempoRestante = (paciente.horas * 3600) + (paciente.minutos * 60); // Reinicia el temporizador
    }

    paciente.cambioPostural = estado;
    guardarPacientes(pacientes);
    cargarPacientes();
    iniciarTemporizadores(); // Asegura que el temporizador se reinicie
  }

  function actualizarTiempo(index) {
    const pacientes = obtenerPacientes();
    const horas = document.querySelector(`.configurar-horas[data-index="${index}"]`).value;
    const minutos = document.querySelector(`.configurar-minutos[data-index="${index}"]`).value;

    pacientes[index].horas = parseInt(horas, 10);
    pacientes[index].minutos = parseInt(minutos, 10);
    pacientes[index].tiempoRestante = (pacientes[index].horas * 3600) + (pacientes[index].minutos * 60);

    // Reinicia el temporizador automáticamente con el nuevo tiempo configurado
    pacientes[index].cambioPostural = 'realizado';

    guardarPacientes(pacientes);
    cargarPacientes();
    iniciarTemporizadores(); // Asegura que el temporizador inicie automáticamente
  }

  function iniciarTemporizadores() {
    // Detener todos los temporizadores existentes
    Object.values(temporizadores).forEach(intervalId => clearInterval(intervalId));
    temporizadores = {};

    const pacientes = obtenerPacientes();

    pacientes.forEach((paciente, index) => {
      // Asegurar que el tiempo restante esté inicializado correctamente
      if (typeof paciente.tiempoRestante !== 'number' || isNaN(paciente.tiempoRestante)) {
        paciente.tiempoRestante = (paciente.horas * 3600) + (paciente.minutos * 60);
      }

      temporizadores[index] = setInterval(() => {
        // Reducir el tiempo restante solo si el cambio postural no está en "realizado"
        paciente.tiempoRestante--;

        if (paciente.tiempoRestante === 0) {
          paciente.cambioPostural = 'pendiente';
        } else if (paciente.tiempoRestante === -10) {
          if (paciente.cambioPostural !== 'critico') {
            paciente.cambioPostural = 'critico';

            // Agregar notificación al localStorage
            let notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');
            notificaciones.push({
              tipo: 'critico',
              mensaje: `El paciente ${paciente.nombre} (Habitación: ${paciente.habitacion}) ha pasado a estado crítico.`,
              fecha: new Date().toISOString()
            });
            localStorage.setItem('notificaciones', JSON.stringify(notificaciones));
          }
        }

        guardarPacientes(pacientes);

        // Actualizar el temporizador en el DOM
        const temporizadorDisplay = document.getElementById(`temporizador-${index}`);
        if (temporizadorDisplay) {
          temporizadorDisplay.textContent = formatearTiempo(paciente.tiempoRestante);
        }

      }, 1000);
    });
  }

  cargarPacientes();
  iniciarTemporizadores();
});
