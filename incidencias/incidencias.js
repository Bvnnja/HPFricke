const form = document.getElementById('formIncidencia');
const listaIncidencias = document.getElementById('listaIncidencias');

let incidencias = JSON.parse(localStorage.getItem('incidencias')) || [];
let editarId = null;

// Mostrar incidencias guardadas en localStorage
function mostrarIncidencias() {
  listaIncidencias.innerHTML = '';

  if(incidencias.length === 0) {
    listaIncidencias.innerHTML = '<li>No hay incidencias registradas.</li>';
    return;
  }

  incidencias.forEach(incidencia => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>Fecha y Hora:</strong> ${incidencia.fecha} ${incidencia.hora}<br/>
      <strong>Descripción:</strong> ${incidencia.descripcion}<br/>
      <strong>Nivel de urgencia:</strong> ${incidencia.nivelUrgencia}<br/>
      ${incidencia.archivoNombre ? `<strong>Archivo:</strong> <a href="${incidencia.archivoURL}" target="_blank">${incidencia.archivoNombre}</a><br/>` : ''}
      <button class="edit-btn" onclick="editarIncidencia(${incidencia.id})">Editar</button>
      <button onclick="eliminarIncidencia(${incidencia.id})">Eliminar</button>
    `;
    listaIncidencias.appendChild(li);
  });
}

// Validar fecha y hora
function validarFechaHora(fecha, hora) {
  const fechaHora = new Date(`${fecha}T${hora}`);
  const ahora = new Date();
  return fechaHora <= ahora; // No debe ser fecha/hora futura
}

// Validar nivel de urgencia
function validarNivelUrgencia(nivel) {
  const nivelesValidos = ['Alta', 'Media', 'Baja'];
  return nivelesValidos.includes(nivel);
}

// Guardar archivo en base64 para simplificar almacenamiento local
function leerArchivo(file) {
  return new Promise((resolve, reject) => {
    if (!file) resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject('Error leyendo archivo');
    reader.readAsDataURL(file);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fecha = form.fecha.value;
  const hora = form.hora.value;
  const descripcion = form.descripcion.value.trim();
  const nivelUrgencia = form.nivelUrgencia.value;
  const archivo = form.archivo.files[0];

  // Validaciones
  if(!validarFechaHora(fecha, hora)) {
    alert('Fecha y hora no pueden ser futuras.');
    return;
  }
  if(!validarNivelUrgencia(nivelUrgencia)) {
    alert('Seleccione un nivel de urgencia válido.');
    return;
  }
  if(descripcion === '') {
    alert('Descripción no puede estar vacía.');
    return;
  }

  const archivoBase64 = await leerArchivo(archivo);

  if (editarId !== null) {
    // Editar incidencia
    incidencias = incidencias.map(i => {
      if(i.id === editarId) {
        return {
          ...i,
          fecha,
          hora,
          descripcion,
          nivelUrgencia,
          archivoURL: archivoBase64 || i.archivoURL,
          archivoNombre: archivo ? archivo.name : i.archivoNombre,
        };
      }
      return i;
    });
    editarId = null;
  } else {
    // Crear nueva incidencia
    const nuevaIncidencia = {
      id: Date.now(),
      fecha,
      hora,
      descripcion,
      nivelUrgencia,
      archivoURL: archivoBase64,
      archivoNombre: archivo ? archivo.name : null,
    };
    incidencias.push(nuevaIncidencia);
  }

  localStorage.setItem('incidencias', JSON.stringify(incidencias));
  form.reset();
  mostrarIncidencias();
});

function editarIncidencia(id) {
  const incidencia = incidencias.find(i => i.id === id);
  if(!incidencia) return;

  form.fecha.value = incidencia.fecha;
  form.hora.value = incidencia.hora;
  form.descripcion.value = incidencia.descripcion;
  form.nivelUrgencia.value = incidencia.nivelUrgencia;
  // No vamos a pre cargar el archivo porque no es posible en input file por seguridad.

  editarId = id;
}

function eliminarIncidencia(id) {
  if(confirm('¿Seguro que quieres eliminar esta incidencia?')) {
    incidencias = incidencias.filter(i => i.id !== id);
    localStorage.setItem('incidencias', JSON.stringify(incidencias));
    mostrarIncidencias();
  }
}

// Inicializar lista en carga
mostrarIncidencias();
