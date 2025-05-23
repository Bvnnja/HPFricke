document.addEventListener('DOMContentLoaded', function() {
  let editIndex = null;

  function obtenerPacientes() {
    const data = localStorage.getItem('pacientes');
    try {
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error al leer pacientes de localStorage', e);
      return [];
    }
  }

  function guardarPacientes(pacientes) {
    try {
      localStorage.setItem('pacientes', JSON.stringify(pacientes));
    } catch (e) {
      console.error('Error al guardar pacientes en localStorage', e);
    }
  }

  function limpiarFormulario() {
    document.getElementById('nombre').value = '';
    document.getElementById('rut').value = '';
    document.getElementById('edad').value = '';
    document.getElementById('sexo').value = '';
    document.getElementById('diagnostico').value = '';
    document.getElementById('habitacion').value = '';
    document.getElementById('fechaIngreso').value = '';
    document.getElementById('observaciones').value = '';
    document.getElementById('guardarBtn').textContent = 'Registrar Paciente';
    document.getElementById('cancelarBtn').style.display = 'none';
    editIndex = null;
  }

  function mostrarPacientes() {
    const pacientes = obtenerPacientes();
    const tbody = document.getElementById('tablaPacientes').querySelector('tbody');
    tbody.innerHTML = '';
    pacientes.forEach((p, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.nombre}</td>
        <td>${p.rut || ''}</td>
        <td>${p.edad}</td>
        <td>${p.sexo || ''}</td>
        <td>${p.diagnostico}</td>
        <td>${p.habitacion}</td>
        <td>${p.fechaIngreso || ''}</td>
        <td>${p.observaciones || ''}</td>
        <td>
          <button type="button" onclick="editarPaciente(${idx})">Editar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  document.getElementById('pacienteForm').addEventListener('submit', function(e) {
    e.preventDefault();
    // Validaciones personalizadas
    const nombre = document.getElementById('nombre').value.trim();
    const rut = document.getElementById('rut').value.trim();
    const edad = document.getElementById('edad').value.trim();
    const sexo = document.getElementById('sexo').value;
    const diagnostico = document.getElementById('diagnostico').value.trim();
    const habitacion = document.getElementById('habitacion').value.trim();
    const fechaIngreso = document.getElementById('fechaIngreso').value;
    const observaciones = document.getElementById('observaciones').value.trim();

    // Validación de nombre: solo letras y espacios, mínimo 3 caracteres
    if (!nombre || nombre.length < 3 || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(nombre)) {
      alert('Ingrese un nombre válido (solo letras y mínimo 3 caracteres, sin números ni caracteres especiales).');
      document.getElementById('nombre').focus();
      return;
    }

    // Validación y formateo de RUT chileno
    function formatearRut(rut) {
      rut = rut.replace(/[^\dkK]/g, '').toUpperCase();
      if (rut.length < 2) return rut;
      let cuerpo = rut.slice(0, -1);
      let dv = rut.slice(-1);
      cuerpo = cuerpo.replace(/^0+/, '');
      let formatted = '';
      let i = 0;
      for (let j = cuerpo.length - 1; j >= 0; j--) {
        formatted = cuerpo[j] + formatted;
        i++;
        if (i % 3 === 0 && j !== 0) formatted = '.' + formatted;
      }
      return formatted + '-' + dv;
    }
    const rutFormateado = formatearRut(rut);
    document.getElementById('rut').value = rutFormateado;
    if (!/^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]{1}$/.test(rutFormateado)) {
      alert('Ingrese un RUT válido y ordenado (Ej: 12.345.678-9).');
      document.getElementById('rut').focus();
      return;
    }

    // Validación de edad
    if (!edad || isNaN(edad) || edad < 0 || edad > 120) {
      alert('Ingrese una edad válida (0 a 120).');
      document.getElementById('edad').focus();
      return;
    }

    // Validación de sexo
    if (!sexo) {
      alert('Seleccione el sexo.');
      document.getElementById('sexo').focus();
      return;
    }
    // Diagnóstico
    if (!diagnostico || diagnostico.length < 3) {
      alert('Ingrese un diagnóstico válido (mínimo 3 caracteres).');
      document.getElementById('diagnostico').focus();
      return;
    }
    // Validación de habitación única
    let pacientes = obtenerPacientes();
    const habitacionOcupada = pacientes.some((p, idx) =>
      p.habitacion && p.habitacion.toLowerCase() === habitacion.toLowerCase() && idx !== editIndex
    );
    if (!habitacion) {
      alert('Ingrese la habitación.');
      document.getElementById('habitacion').focus();
      return;
    }
    if (habitacionOcupada) {
      // Notificación visual en el centro si la habitación está ocupada
      if (!document.getElementById('noti-habitacion')) {
        const noti = document.createElement('div');
        noti.id = 'noti-habitacion';
        noti.textContent = 'La habitación ya está asignada a otro paciente. Ingrese una habitación diferente.';
        noti.style.position = 'fixed';
        noti.style.top = '50%';
        noti.style.left = '50%';
        noti.style.transform = 'translate(-50%, -50%)';
        noti.style.background = '#d32f2f';
        noti.style.color = '#fff';
        noti.style.padding = '22px 32px';
        noti.style.borderRadius = '14px';
        noti.style.fontSize = '18px';
        noti.style.fontWeight = '600';
        noti.style.boxShadow = '0 4px 24px rgba(211,47,47,0.18)';
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
        btn.style.color = '#d32f2f';
        btn.style.border = 'none';
        btn.style.borderRadius = '7px';
        btn.style.padding = '8px 28px';
        btn.style.fontSize = '16px';
        btn.style.fontWeight = '600';
        btn.style.cursor = 'pointer';
        btn.style.boxShadow = '0 1px 4px #ffcdd2';
        btn.onmouseover = () => { btn.style.background = '#ffeaea'; };
        btn.onmouseout = () => { btn.style.background = '#fff'; };
        btn.onclick = () => noti.remove();

        noti.appendChild(btn);
        document.body.appendChild(noti);
      }
      document.getElementById('habitacion').focus();
      return;
    }
    // Fecha de ingreso
    if (!fechaIngreso) {
      alert('Seleccione la fecha de ingreso.');
      document.getElementById('fechaIngreso').focus();
      return;
    }
    const hoy = new Date();
    const fechaIng = new Date(fechaIngreso);
    if (fechaIng > hoy) {
      alert('La fecha de ingreso no puede ser futura.');
      document.getElementById('fechaIngreso').focus();
      return;
    }
    // Observaciones (opcional, pero máximo 200 caracteres)
    if (observaciones.length > 200) {
      alert('Las observaciones no pueden superar 200 caracteres.');
      document.getElementById('observaciones').focus();
      return;
    }

    if (editIndex !== null) {
      pacientes[editIndex] = {
        ...pacientes[editIndex],
        nombre,
        rut: rutFormateado,
        edad,
        sexo,
        diagnostico,
        habitacion,
        fechaIngreso,
        observaciones
      };
    } else {
      pacientes.push({
        nombre,
        rut: rutFormateado,
        edad,
        sexo,
        diagnostico,
        habitacion,
        fechaIngreso,
        observaciones,
        cambioPostural: 'realizado',
        horas: 1,
        minutos: 0,
        tiempoRestante: 3600,
        alertaMostrada: false,
        medico: ''
      });
    }

    guardarPacientes(pacientes);
    limpiarFormulario();
    mostrarPacientes();
  });

  window.editarPaciente = function(idx) {
    const pacientes = obtenerPacientes();
    const p = pacientes[idx];
    document.getElementById('nombre').value = p.nombre;
    document.getElementById('rut').value = p.rut || '';
    document.getElementById('edad').value = p.edad;
    document.getElementById('sexo').value = p.sexo || '';
    document.getElementById('diagnostico').value = p.diagnostico;
    document.getElementById('habitacion').value = p.habitacion;
    document.getElementById('fechaIngreso').value = p.fechaIngreso || '';
    document.getElementById('observaciones').value = p.observaciones || '';
    document.getElementById('guardarBtn').textContent = 'Guardar Cambios';
    document.getElementById('cancelarBtn').style.display = 'inline-block';
    editIndex = idx;
  };

  document.getElementById('cancelarBtn').addEventListener('click', function() {
    limpiarFormulario();
  });

  mostrarPacientes();

  // Solo permitir letras y espacios en el input de nombre
  document.getElementById('nombre').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]+/g, '');
  });

  // Formatear automáticamente el RUT mientras se escribe y limitar largo máximo (Ej: 12.345.678-9 = 12)
  document.getElementById('rut').addEventListener('input', function(e) {
    let rut = this.value.replace(/[^\dkK]/gi, '').toUpperCase();
    rut = rut.slice(0, 9); // máximo 8 dígitos + 1 dv
    if (rut.length > 1) {
      let cuerpo = rut.slice(0, -1);
      let dv = rut.slice(-1);
      cuerpo = cuerpo.replace(/^0+/, '');
      let formatted = '';
      let i = 0;
      for (let j = cuerpo.length - 1; j >= 0; j--) {
        formatted = cuerpo[j] + formatted;
        i++;
        if (i % 3 === 0 && j !== 0) formatted = '.' + formatted;
      }
      this.value = formatted + '-' + dv;
    } else {
      this.value = rut;
    }
    // Limitar largo total del input (máximo 12 caracteres con puntos y guion)
    if (this.value.length > 12) this.value = this.value.slice(0, 12);
  });

  // No permitir edades negativas ni decimales y limitar a 3 dígitos (máx 120)
  document.getElementById('edad').addEventListener('input', function(e) {
    let val = this.value.replace(/[^0-9]/g, '');
    if (val.length > 3) val = val.slice(0, 3);
    if (val.length > 0 && val[0] === '0') val = val.replace(/^0+/, '');
    if (val === '') val = '0';
    let num = Math.max(0, Math.min(120, parseInt(val, 10) || 0));
    this.value = num;
  });

  // Limitar habitación a máximo 1000 (solo números)
  document.getElementById('habitacion').addEventListener('input', function(e) {
    let val = this.value.replace(/[^0-9]/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    let num = Math.max(1, Math.min(1000, parseInt(val, 10) || 1));
    this.value = num;
  });
});
