function cargarNavbar() {
  const path = window.location.pathname.toLowerCase();

  // Permitir acceso al inicio sin sesión
  if (!path.includes('inicio.html') && !path.includes('login.html') && !path.includes('registro.html')) {
    // Verificar si la sesión está iniciada
    const usuarioLogueado = localStorage.getItem('usuarioLogueado');
    if (!usuarioLogueado) {
      alert('Debes iniciar sesión para acceder a esta página.');
      window.location.href = '../login/login.html';
      return;
    }
  }

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

      // Esperar a que el DOM del navbar esté listo
      setTimeout(() => {
        const usuarioLogueado = localStorage.getItem('usuarioLogueado');
        const usuario = usuarioLogueado ? JSON.parse(usuarioLogueado) : null;

        // Ocultar botones de login y registro si hay sesión
        if (usuario && usuario.nombre) {
          const navLogin = document.getElementById('nav-login');
          const navRegistro = document.getElementById('nav-registro');
          const navRegistrarPaciente = document.getElementById('nav-registrar-paciente');
          if (navLogin) navLogin.style.display = 'none';
          if (navRegistro) navRegistro.style.display = 'none';
          if (navRegistrarPaciente) navRegistrarPaciente.style.display = 'block';

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
        }
      }, 100);
    });
}
cargarNavbar();
