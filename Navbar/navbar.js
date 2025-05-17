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
    });
}
cargarNavbar();
