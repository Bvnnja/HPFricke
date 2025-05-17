function cargarNavbar() {
  fetch('../components/navbar.html')
    .then(res => res.text())
    .then(html => {
      const navbarDiv = document.createElement('div');
      navbarDiv.innerHTML = html;
      document.body.insertBefore(navbarDiv, document.body.firstChild);
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '../components/navbar.css';
      document.head.appendChild(link);
    });
}
cargarNavbar();
