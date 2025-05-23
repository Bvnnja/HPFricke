function getUsuarioKey() {
  const usuario = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
  return usuario && usuario.nombre ? `configUsuario_${usuario.nombre}` : 'configUsuario_default';
}

function getConfigUsuario() {
  const key = getUsuarioKey();
  return JSON.parse(localStorage.getItem(key) || '{}');
}

function setConfigUsuario(config) {
  const key = getUsuarioKey();
  localStorage.setItem(key, JSON.stringify(config));
}

function mostrarDashboardCriticos() {
  const pacientes = JSON.parse(localStorage.getItem('pacientes') || '[]');
  const listaNavbar = document.getElementById('lista-notificaciones-navbar');
  const notiCont = document.getElementById('navbar-notificacion-contador');
  const notiDiv = document.getElementById('navbar-notificacion-critica');
  const criticos = pacientes.filter(p => p.cambioPostural === 'critico');

  // Actualiza el contador de notificaciones en el navbar
  if (notiCont && notiDiv) {
    if (criticos.length > 0) {
      notiCont.textContent = criticos.length;
      notiCont.style.display = 'inline-block';
      notiDiv.title = criticos.length === 1 ? '1 paciente en estado crítico' : criticos.length + ' pacientes en estado crítico';
    } else {
      notiCont.style.display = 'none';
      notiDiv.title = '';
    }
  }

  // Llenar el modal de notificaciones críticas en el navbar
  if (listaNavbar) {
    listaNavbar.innerHTML = '';
    if (criticos.length === 0) {
      listaNavbar.innerHTML = '<li style="color:#888;">No hay pacientes en estado crítico.</li>';
    } else {
      criticos.forEach((p, idx) => {
        let tiempoCritico = '';
        if (typeof p.tiempoRestante !== 'undefined' && p.tiempoRestante < 0) {
          const abs = Math.abs(p.tiempoRestante);
          const horas = Math.floor(abs / 3600);
          const minutos = Math.floor((abs % 3600) / 60);
          const segundos = abs % 60;
          tiempoCritico = `Hace <span class="tiempo-critico-navbar" data-nombre="${encodeURIComponent(p.nombre)}">${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}</span>`;
        }
        listaNavbar.innerHTML += `
          <li class="noti-critica-li">
            <a href="#" class="noti-critica-navbar" data-nombre="${encodeURIComponent(p.nombre)}" style="text-decoration:none;color:inherit;">
              <strong>${p.nombre}</strong> (Habitación: ${p.habitacion})<br>
              Diagnóstico: ${p.diagnostico}<br>
              <span class="noti-critica-estado">Estado crítico</span>
              ${tiempoCritico ? `<br>${tiempoCritico}` : ''}
            </a>
          </li>
        `;
      });
    }
    // Click en notificación del modal para ir a pacientes.html y resaltar
    listaNavbar.querySelectorAll('.noti-critica-navbar').forEach(el => {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        const nombre = decodeURIComponent(this.dataset.nombre);
        localStorage.setItem('pacienteResaltado', nombre);
        window.location.href = '../pacientes/pacientes.html';
      });
    });
  }

  // Aplica color personalizado a las notificaciones críticas del modal
  const config = getConfigUsuario();
  const color = config.color || '#d32f2f';
  document.querySelectorAll('.noti-critica-li').forEach(li => {
    li.style.borderColor = color;
    li.style.background = color + '22';
  });
  document.querySelectorAll('.noti-critica-estado').forEach(span => {
    span.style.background = color;
  });

  // Actualizar los segundos en el modal cada segundo
  if (window._intervalNavbarCriticos) clearInterval(window._intervalNavbarCriticos);
  window._intervalNavbarCriticos = setInterval(() => {
    const pacientes = JSON.parse(localStorage.getItem('pacientes') || '[]');
    document.querySelectorAll('.tiempo-critico-navbar').forEach(span => {
      const nombre = decodeURIComponent(span.getAttribute('data-nombre'));
      const paciente = pacientes.find(p => p.nombre === nombre && p.cambioPostural === 'critico');
      if (paciente && typeof paciente.tiempoRestante !== 'undefined' && paciente.tiempoRestante < 0) {
        const abs = Math.abs(paciente.tiempoRestante);
        const horas = Math.floor(abs / 3600);
        const minutos = Math.floor((abs % 3600) / 60);
        const segundos = abs % 60;
        span.textContent = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
      }
    });
  }, 1000);
}

function cargarNavbar() {
  fetch('../Navbar/navbar.html')
    .then(res => res.text())
    .then(html => {
      const navbarDiv = document.createElement('div');
      navbarDiv.innerHTML = html;
      document.body.insertBefore(navbarDiv, document.body.firstChild);
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '../Navbar/navbar.css';
      document.head.appendChild(link);

      setTimeout(() => {
        const usuarioLogueado = localStorage.getItem('usuarioLogueado');
        const usuario = usuarioLogueado ? JSON.parse(usuarioLogueado) : null;

        // Ocultar botones de login y registro si hay sesión
        if (usuario && usuario.nombre) {
          const navLogin = document.getElementById('nav-login');
          const navRegistro = document.getElementById('nav-registro');
          const navRegistrarPaciente = document.getElementById('nav-registrar-paciente');
          const navRegistrarIncidencias = document.getElementById('nav-registrar-incidencias');
          const navPacientes = document.getElementById('nav-pacientes');
          if (navLogin) navLogin.style.display = 'none';
          if (navRegistro) navRegistro.style.display = 'none';
          if (navRegistrarPaciente) navRegistrarPaciente.style.display = 'block';
          if (navRegistrarIncidencias) navRegistrarIncidencias.style.display = 'block';
          if (navPacientes) navPacientes.style.display = 'block';

          // Mostrar nombre de usuario
          const usuarioDiv = document.getElementById('navbar-usuario');
          const usuarioNombre = document.getElementById('usuario-nombre');
          if (usuarioDiv && usuarioNombre) {
            usuarioNombre.textContent = usuario.nombre;
            usuarioDiv.style.display = 'flex';

            // Agregar funcionalidad de menú desplegable
            usuarioDiv.addEventListener('click', () => {
              const menu = document.getElementById('usuario-menu');
              if (menu) {
                menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
              }
            });

            // Cerrar sesión
            const cerrarSesion = document.getElementById('cerrarSesion');
            if (cerrarSesion) {
              cerrarSesion.addEventListener('click', () => {
                localStorage.removeItem('usuarioLogueado');
                window.location.href = '../login/login.html';
              });
            }
          }
        } else {
          const navLogin = document.getElementById('nav-login');
          const navRegistro = document.getElementById('nav-registro');
          const navRegistrarPaciente = document.getElementById('nav-registrar-paciente');
          const navRegistrarIncidencias = document.getElementById('nav-registrar-incidencias');
          const navPacientes = document.getElementById('nav-pacientes');
          const usuarioDiv = document.getElementById('navbar-usuario');
          if (navLogin) navLogin.style.display = 'block';
          if (navRegistro) navRegistro.style.display = 'block';
          if (navRegistrarPaciente) navRegistrarPaciente.style.display = 'none';
          if (navRegistrarIncidencias) navRegistrarIncidencias.style.display = 'none';
          if (navPacientes) navPacientes.style.display = 'none';
          if (usuarioDiv) usuarioDiv.style.display = 'none';
        }

        // Modal notificaciones críticas
        const notiDiv = document.getElementById('navbar-notificacion-critica');
        const modal = document.getElementById('modal-notificaciones-criticas');
        const cerrar = document.getElementById('cerrar-modal-notificaciones');
        const engranaje = document.getElementById('abrir-configuracion-alerta');
        const formConfig = document.getElementById('form-configuracion-alerta');
        const inputColor = document.getElementById('color-notificacion');
        const btnCancelar = document.getElementById('cancelar-configuracion-alerta');

        if (notiDiv && modal) {
          notiDiv.onclick = function() {
            modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
            mostrarDashboardCriticos();
          };
        }
        if (cerrar && modal) {
          cerrar.onclick = function() {
            modal.style.display = 'none';
          };
        }

        // Configuración de color personalizada
        const config = getConfigUsuario();
        if (inputColor) inputColor.value = config.color || '#d32f2f';

        if (engranaje && formConfig) {
          engranaje.onclick = function() {
            formConfig.style.display = formConfig.style.display === 'none' ? 'block' : 'none';
            if (inputColor) inputColor.focus();
          };
        }
        if (btnCancelar && formConfig) {
          btnCancelar.onclick = function() {
            formConfig.style.display = 'none';
          };
        }
        if (formConfig && inputColor) {
          inputColor.oninput = function() {
            setConfigUsuario({
              color: inputColor.value
            });
            mostrarDashboardCriticos();
          };
          formConfig.onsubmit = function(e) {
            e.preventDefault();
            setConfigUsuario({
              color: inputColor.value
            });
            formConfig.style.display = 'none';
            mostrarDashboardCriticos();
          };
        }

        // Carga inicial de notificaciones críticas
        mostrarDashboardCriticos();
      }, 100);
    });
}
cargarNavbar();
