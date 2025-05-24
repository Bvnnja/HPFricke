document.addEventListener('DOMContentLoaded', () => {
  const tablaPacientes = document.getElementById('tablaPacientes').querySelector('tbody');
  const medicoLogueado = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}').nombre || 'Desconocido';
  let temporizadores = {};

  function getUsuarioKey() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
    return usuario && usuario.nombre ? `configUsuario_${usuario.nombre}` : 'configUsuario_default';
  }

  function getConfigUsuario() {
    const key = getUsuarioKey();
    return JSON.parse(localStorage.getItem(key) || '{}');
  }

  function reproducirAlertaSonoraPersonalizada() {
    const config = getConfigUsuario();
    let url;
    switch (config.sonido || 'default') {
      case 'beep':
        url = 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b4bfa.mp3';
        break;
      case 'bell':
        url = 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b4bfa.mp3';
        break;
      default:
        url = 'https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa1c82.mp3';
    }
    const audio = new Audio(url);
    audio.play();
  }

  function cargarPacientes() {
    const pacientes = JSON.parse(localStorage.getItem('pacientes') || '[]');
    tablaPacientes.innerHTML = '';

    // Obtener paciente a resaltar (si existe)
    let pacienteResaltado = localStorage.getItem('pacienteResaltado');
    const config = getConfigUsuario();
    const color = config.color || '#d32f2f';

    pacientes.forEach((paciente, index) => {
      const fila = document.createElement('tr');
      fila.className = paciente.cambioPostural;

      // Colores por estado
      if (paciente.cambioPostural === 'critico') {
        if (
          pacienteResaltado &&
          paciente.nombre === pacienteResaltado
        ) {
          fila.style.background = '#ffbdbd';
          fila.style.borderColor = '#d32f2f';
          // Resaltado rojo especial por 30 segundos, pero si el temporizador cambia el estado, el color se actualizará en el siguiente render
          setTimeout(() => {
            // Solo quitar el color si sigue en crítico y sigue siendo el resaltado
            if (
              fila.className === 'critico' &&
              localStorage.getItem('pacienteResaltado') === paciente.nombre
            ) {
              fila.style.background = color + '22';
              fila.style.borderColor = color;
            }
          }, 30000); // 30 segundos
        } else {
          fila.style.background = color + '22';
          fila.style.borderColor = color;
        }
      } else if (paciente.cambioPostural === 'realizado') {
        fila.style.background = '#d0f5e8';
        fila.style.borderColor = '#388e3c';
      } else if (paciente.cambioPostural === 'pendiente') {
        fila.style.background = '#fff9c4';
        fila.style.borderColor = '#ffb300';
      }

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
        <td id="medico-${index}">${paciente.medico || 'N/A'}</td>
      `;
      tablaPacientes.appendChild(fila);
    });

    // Eliminar el resaltado solo si el paciente ya no está en estado crítico
    if (pacienteResaltado) {
      const idx = pacientes.findIndex(p => p.nombre === pacienteResaltado);
      if (idx !== -1 && pacientes[idx].cambioPostural !== 'critico') {
        localStorage.removeItem('pacienteResaltado');
      }
    }

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

  function formatearTiempo(segundosTotales) {
    const horas = Math.floor(Math.abs(segundosTotales) / 3600);
    const minutos = Math.floor((Math.abs(segundosTotales) % 3600) / 60);
    const segundos = Math.abs(segundosTotales) % 60;
    return `${segundosTotales < 0 ? '-' : ''}${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
  }

  function actualizarEstadoCambioPostural(index, estado) {
    const pacientes = JSON.parse(localStorage.getItem('pacientes') || '[]');
    const usuario = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
    pacientes[index].cambioPostural = estado;

    // Reinicia el temporizador y registra el médico si es "realizado"
    if (estado === 'realizado') {
      pacientes[index].tiempoRestante = (pacientes[index].horas * 3600) + (pacientes[index].minutos * 60); // Reinicia el temporizador
      pacientes[index].medico = usuario.nombre || 'Desconocido';
    }

    // Guardar en historial con fecha/hora actual y nombre exacto del paciente
    guardarHistorialCambioPostural({
      paciente: pacientes[index].nombre.trim(),
      fechaHora: new Date().toISOString(),
      estado: estado, // Registra cualquier estado, incluido "critico"
      responsable: pacientes[index].medico || usuario.nombre || 'Desconocido',
      postura: pacientes[index].postura || pacientes[index].cambioPostural
    });

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

  function guardarHistorialCambioPostural({ paciente, fechaHora, estado, responsable, postura }) {
    let historial = JSON.parse(localStorage.getItem('historialCambios') || '[]');
    historial.push({
      paciente: paciente.trim(), // Asegura que no haya espacios extra
      fechaHora,
      estado,
      responsable,
      postura
    });
    localStorage.setItem('historialCambios', JSON.stringify(historial));
  }

  // Ejemplo de uso cuando se realiza un cambio postural desde la UI:
  function marcarCambioPostural(idx, nuevoEstado, nuevaPostura) {
    const pacientes = obtenerPacientes();
    const usuario = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
    pacientes[idx].cambioPostural = nuevoEstado;
    if (nuevaPostura) pacientes[idx].postura = nuevaPostura;
    guardarPacientes(pacientes);

    // Guardar en historial con postura
    guardarHistorialCambioPostural({
      paciente: pacientes[idx].nombre,
      fechaHora: new Date().toLocaleString(),
      estado: nuevoEstado,
      responsable: usuario.nombre || 'Desconocido',
      postura: nuevaPostura || pacientes[idx].postura || pacientes[idx].cambioPostural
    });

    // ...actualiza la UI, muestra mensaje, etc...
  }

  function iniciarTemporizadores() {
    // Limpia todos los temporizadores previos para evitar múltiples intervalos por paciente
    Object.values(temporizadores).forEach(intervalId => clearInterval(intervalId));
    temporizadores = {};

    let pacientes = JSON.parse(localStorage.getItem('pacientes') || '[]');

    pacientes.forEach((paciente, index) => {
      // Asegura que tiempoRestante sea un número válido
      if (typeof paciente.tiempoRestante !== 'number' || isNaN(paciente.tiempoRestante)) {
        paciente.tiempoRestante = (paciente.horas * 3600) + (paciente.minutos * 60) || 3600;
      }
      if (typeof paciente.alertaMostrada === 'undefined') {
        paciente.alertaMostrada = false;
      }

      temporizadores[index] = setInterval(() => {
        // Recarga el array de pacientes para mantener sincronía
        let pacientesActualizados = JSON.parse(localStorage.getItem('pacientes') || '[]');
        let pacienteActual = pacientesActualizados[index];
        if (!pacienteActual) return;

        // Si está en realizado, sigue decrementando el temporizador normalmente
        if (pacienteActual.cambioPostural === 'realizado') {
          pacienteActual.tiempoRestante--;
        } else {
          // Siempre decrementa, incluso si es negativo
          pacienteActual.tiempoRestante--;
        }

        // Actualiza solo el temporizador en el DOM, no recarga toda la tabla
        const temporizadorDisplay = document.getElementById(`temporizador-${index}`);
        if (temporizadorDisplay) {
          temporizadorDisplay.textContent = formatearTiempo(pacienteActual.tiempoRestante);
        }

        // ALERTA AUTOMÁTICA (con personalización)
        const config = getConfigUsuario();
        if ((pacienteActual.tiempoRestante <= 0) && !pacienteActual.alertaMostrada) {
          pacienteActual.alertaMostrada = true;
          const mensajePersonalizado = config.mensaje;
          const mensaje = mensajePersonalizado && mensajePersonalizado.trim().length > 0
            ? mensajePersonalizado
            : `¡Alerta! Es necesario cambiar la posición del paciente: ${pacienteActual.nombre} (Habitación: ${pacienteActual.habitacion})`;
          alert(mensaje);
          reproducirAlertaSonoraPersonalizada();
        }

        // Cambia a pendiente en 0, y a crítico en negativo
        if (pacienteActual.tiempoRestante === 0) {
          pacienteActual.cambioPostural = 'pendiente';
        }
        if (pacienteActual.tiempoRestante < 0) {
          pacienteActual.cambioPostural = 'critico';
        }

        // Si el usuario selecciona "realizado", reinicia el temporizador y la alerta
        if (pacienteActual.cambioPostural === 'realizado' && pacienteActual.tiempoRestante <= 0) {
          pacienteActual.tiempoRestante = (pacienteActual.horas * 3600) + (pacienteActual.minutos * 60) || 3600;
          pacienteActual.alertaMostrada = false;
        }

        // Guarda y actualiza solo si hay cambios relevantes
        pacientesActualizados[index] = pacienteActual;
        localStorage.setItem('pacientes', JSON.stringify(pacientesActualizados));

        // Si el estado cambió, recarga la tabla para actualizar colores y lógica
        if (pacienteActual.tiempoRestante === 0 || pacienteActual.tiempoRestante === -10) {
          cargarPacientes();
        }
      }, 1000);
    });

    // Llama a la función global mostrarDashboardCriticos si existe
    if (typeof window.mostrarDashboardCriticos === 'function') {
      window.mostrarDashboardCriticos();
    }
  }

  cargarPacientes();
  iniciarTemporizadores();

  // Notificación visual personalizada si la URL contiene 192.168.1.95:500
  if (window.location.href.includes('192.168.1.95:500')) {
    setTimeout(() => {
      if (!document.getElementById('noti-localhost')) {
        const noti = document.createElement('div');
        noti.id = 'noti-localhost';
        noti.textContent = 'Estás accediendo al sistema desde la red local (192.168.1.95:500). Si tienes problemas de acceso, consulta con el administrador.';
        noti.style.position = 'fixed';
        noti.style.top = '50%';
        noti.style.left = '50%';
        noti.style.transform = 'translate(-50%, -50%)';
        noti.style.background = '#1976d2';
        noti.style.color = '#fff';
        noti.style.padding = '22px 32px';
        noti.style.borderRadius = '14px';
        noti.style.fontSize = '18px';
        noti.style.fontWeight = '600';
        noti.style.boxShadow = '0 4px 24px rgba(33,150,243,0.18)';
        noti.style.zIndex = '99999';
        noti.style.textAlign = 'center';
        noti.style.maxWidth = '90vw';
        noti.style.display = 'flex';
        noti.style.flexDirection = 'column';
        noti.style.gap = '18px';

        const btn = document.createElement('button');
        btn.textContent = 'Cerrar';
        btn.style.margin = '0 auto';
        btn.style.marginTop = '14px';
        btn.style.background = '#fff';
        btn.style.color = '#1976d2';
        btn.style.border = 'none';
        btn.style.borderRadius = '7px';
        btn.style.padding = '8px 28px';
        btn.style.fontSize = '16px';
        btn.style.fontWeight = '600';
        btn.style.cursor = 'pointer';
        btn.style.boxShadow = '0 1px 4px #e3f2fd';
        btn.onmouseover = () => { btn.style.background = '#e3f2fd'; };
        btn.onmouseout = () => { btn.style.background = '#fff'; };
        btn.onclick = () => noti.remove();

        noti.appendChild(btn);
        document.body.appendChild(noti);
      }
    }, 500);
  }
});
