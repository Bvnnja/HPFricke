function cargarNavbar() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('login.html') || path.includes('registro.html')) {
    return; // No cargar navbar en login ni registro
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
        const usuario = JSON.parse(localStorage.getItem('usuarioLogueado') || 'null');
        if (usuario && usuario.nombre) {
          // Ocultar botones de login y registro
          const navLogin = document.getElementById('nav-login');
          const navRegistro = document.getElementById('nav-registro');
          if (navLogin) navLogin.style.display = 'none';
          if (navRegistro) navRegistro.style.display = 'none';
          // Mostrar nombre de usuario
          const usuarioDiv = document.getElementById('navbar-usuario');
          if (usuarioDiv) {
            usuarioDiv.textContent = usuario.nombre;
            usuarioDiv.style.display = 'block';
          }
        }
      }, 100);
    });
}
cargarNavbar();
