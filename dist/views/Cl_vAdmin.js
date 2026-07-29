import Cl_mEstudio from "../models/Cl_mEstudio.js";
export default class Cl_vAdmin {
    divFinalizados;
    divFormulario;
    botonNuevoExamen = null;
    botonFiltrarEstudios = null;
    botonCalcularPorcentaje = null;
    botonObtenernombres = null;
    inputFiltroFecha = null;
    selectFiltroTipo = null;
    selectPorcentajeTipo = null;
    selectNombresTipo = null;
    avisarImprimir = null;
    avisarWhatsApp = null;
    avisarFiltrarEstudios = null;
    avisarCalcularPorcentaje = null;
    avisarObtenerNombres = null;
    botonObtenerTotalPorEstudio = null;
    selectTotalPorEstudioTipo = null;
    avisarObtenerTotalPorEstudio = null;
    avisarVerEstadisticasEstudio = null;
    avisarCalcularPorcentajeFinalizados = null;
    avisarCalcularPromedioEstudio = null;
    selectEstadisticasTipo = null;
    selectPromedioTipo = null;
    botonVerEstadisticas = null;
    botonPorcentajeFinalizados = null;
    botonCalcularPromedio = null;
    // Variables para gestión de usuarios
    avisarMostrarCrearUsuario = null;
    avisarRecargarUsuarios = null;
    avisarGuardarNuevoUsuario = null;
    avisarCancelarCrearUsuario = null;
    avisarGuardarCambioPassword = null;
    avisarCancelarCambioPassword = null;
    constructor() {
        this.divFinalizados = document.getElementById("admin_finalizados");
        this.divFormulario = document.getElementById("admin_formulario");
        this.mostrarFormulario();
    }
    cuandoClicEnVerEstadisticasEstudio(avisar) {
        this.avisarVerEstadisticasEstudio = avisar;
    }
    cuandoClicEnCalcularPorcentajeFinalizados(avisar) {
        this.avisarCalcularPorcentajeFinalizados = avisar;
    }
    cuandoClicEnCalcularPromedioEstudio(avisar) {
        this.avisarCalcularPromedioEstudio = avisar;
    }
    cuandoClicEnNuevoExamen(avisar) {
        if (this.botonNuevoExamen)
            this.botonNuevoExamen.onclick = avisar;
    }
    cuandoClicEnFiltrarEstudios(avisar) {
        this.avisarFiltrarEstudios = avisar;
    }
    cuandoClicEnCalcularPorcentaje(avisar) {
        this.avisarCalcularPorcentaje = avisar;
    }
    cuandoCLicEnObtenerNombres(avisar) {
        this.avisarObtenerNombres = avisar;
    }
    cuandoClicEnObtenerTotalPorEstudio(avisar) {
        this.avisarObtenerTotalPorEstudio = avisar;
    }
    cuandoClicEnImprimir(avisar) {
        this.avisarImprimir = avisar;
    }
    cuandoClicEnEnviarWhatsApp(avisar) {
        this.avisarWhatsApp = avisar;
    }
    mostrarEstadisticasEstudio(datos) {
        const divResultado = document.getElementById("resultadoEstadisticasEstudio");
        if (!divResultado)
            return;
        divResultado.innerHTML = `
      <div class="resultado-item" style="background:#e3f2fd; border-left-color:#1a5f7a;">
        <strong>📊 Estadísticas del estudio "${datos.tipoEstudio}":</strong><br>
        📋 Solicitudes: <strong>${datos.cantidad}</strong><br>
        💰 Ingreso total: <strong>$${datos.total.toFixed(2)}</strong>
      </div>
    `;
    }
    mostrarPorcentajeFinalizados(porcentaje) {
        const divResultado = document.getElementById("resultadoPorcentajeFinalizados");
        if (!divResultado)
            return;
        divResultado.innerHTML = `
      <div class="resultado-item" style="background:#e8f5e9; border-left-color:#4caf50;">
        ✅ <strong>${porcentaje}%</strong> de los exámenes están <strong>FINALIZADOS</strong>
      </div>
    `;
    }
    mostrarPromedioEstudio(datos) {
        const divResultado = document.getElementById("resultadoPromedioEstudio");
        if (!divResultado)
            return;
        divResultado.innerHTML = `
      <div class="resultado-item" style="background:#fff3e0; border-left-color:#ff9800;">
        📈 <strong>Promedio General del estudio "${datos.tipoEstudio}":</strong><br>
        📊 Promedio: <strong>${datos.promedio.toFixed(2)}</strong><br>
        📋 Basado en <strong>${datos.cantidad}</strong> resultados
      </div>
    `;
    }
    mostrarResultadoFiltro(cantidad, tipoEstudio, fechaSeleccionada) {
        const divResultado = document.getElementById("resultadoFiltroEstudios");
        if (!divResultado)
            return;
        divResultado.innerHTML = `
      <div class="resultado-item">
        <strong>${cantidad}</strong> estudio(s) de tipo <strong>${tipoEstudio}</strong> en fecha <strong>${fechaSeleccionada}</strong>
      </div>
    `;
    }
    mostrarResultadoPorcentaje(porcentaje, tipoEstudio) {
        const divResultado = document.getElementById("resultadoPorcentajeEstudios");
        if (!divResultado)
            return;
        divResultado.innerHTML = `
      <div class="resultado-item" style="background:#e8f5e9; border-left-color:#4caf50;">
        📊 <strong>${porcentaje}%</strong> de los estudios son <strong>${tipoEstudio}</strong>
      </div>
    `;
    }
    mostrarResultadoTotalPorEstudio(resultado) {
        const divResultado = document.getElementById("resultadoTotalPorEstudio");
        if (!divResultado)
            return;
        divResultado.innerHTML = `
      <div class="resultado-item" style="background:#f0f4ff; border-left-color:#3b82f6;">
        ${resultado}
      </div>
    `;
    }
    mostrarResultadosobteneNombrePacientesPorEstudio(datos) {
        const divResultado = document.getElementById("resultadoNombrePacientesPorEstudio");
        if (!divResultado)
            return;
        if (datos.nombres.length === 0) {
            divResultado.innerHTML = `
        <div class="resultado-item">
          No hay pacientes registrados para el estudio seleccionado.
        </div>
      `;
        }
        else {
            divResultado.innerHTML = `
        <div class="resultado-item">
          <strong>Pacientes para el estudio ${datos.tipoEstudio}:</strong>
          <ul>
            ${datos.nombres.map(nombre => `<li>${nombre}</li>`).join('')}
          </ul>
        </div>
      `;
        }
    }
    mostrarFinalizados(datos) {
        if (!this.divFinalizados)
            return;
        if (datos.examenes.length === 0) {
            this.divFinalizados.innerHTML = "<div class='mensaje-vacio'>📭 No hay exámenes listos</div>";
            return;
        }
        let html = `
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="background:#1a5f7a; color:white;">
            <th style="padding:12px;">ID</th>
            <th style="padding:12px;">Paciente</th>
            <th style="padding:12px;">Cédula</th>
            <th style="padding:12px;">Teléfono</th>
            <th style="padding:12px;">Estado</th>
            <th style="padding:12px;">Estudios</th>
            <th style="padding:12px;">Total</th>
            <th style="padding:12px;">Acciones</th>
           </tr>
        </thead>
        <tbody>
    `;
        for (const ex of datos.examenes) {
            const idMostrar = ex.id ? (ex.id.length > 6 ? ex.id.slice(-6) : ex.id) : "N/A";
            html += `
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:12px; font-family:monospace;">#${idMostrar}</td>
          <td style="padding:12px;">${this.escapeHtml(ex.nombrePaciente)}</td>
          <td style="padding:12px;">${this.escapeHtml(ex.cedulaPaciente)}</td>
          <td style="padding:12px;">${ex.telefonoPaciente || "No registrado"}</td>
          <td style="padding:12px;"><span style="background:#28a745; color:white; padding:4px 10px; border-radius:12px;">LISTO</span></td>
          <td style="padding:12px;"><span style="background:#e8eaf6; padding:4px 10px; border-radius:12px;">${this.escapeHtml(ex.nombreEstudio)}</span></td>
          <td style="padding:12px;">$${ex.calcularTotal().toFixed(2)}</td>
          <td style="padding:12px;">
            <button class="btn-imprimir" data-id="${ex.id}">📄 Imprimir</button>
            <button class="btn-whatsapp" data-id="${ex.id}">💬 WhatsApp</button>
          </td>
        </tr>
      `;
        }
        html += "</tbody></table>";
        this.divFinalizados.innerHTML = html;
        const yoMismo = this;
        document.querySelectorAll(".btn-imprimir").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id") || "";
                if (yoMismo.avisarImprimir)
                    yoMismo.avisarImprimir(id);
            });
        });
        document.querySelectorAll(".btn-whatsapp").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id") || "";
                if (yoMismo.avisarWhatsApp)
                    yoMismo.avisarWhatsApp(id);
            });
        });
    }
    mostrarReporte(reporte) {
        const ventana = window.open("", "_blank");
        if (ventana) {
            ventana.document.write(`<html><head><title>Resultados</title></head><body>${reporte}</body></html>`);
            ventana.document.close();
            ventana.print();
        }
    }
    mostrarMensajeExitoConId(idExamen) {
        const idCorto = idExamen.length > 6 ? idExamen.slice(-6) : idExamen;
        alert(`✅ Examen registrado con éxito!\nNúmero de orden: #${idCorto}`);
    }
    mostrarFormulario() {
        if (!this.divFormulario)
            return;
        this.botonNuevoExamen = document.getElementById("botonAbrirModal");
        this.botonFiltrarEstudios = document.getElementById("botonFiltrarEstudios");
        this.botonCalcularPorcentaje = document.getElementById("botonCalcularPorcentaje");
        this.botonObtenernombres = document.getElementById("botonObtenerNombres");
        this.inputFiltroFecha = document.getElementById("filtro_fecha");
        this.selectFiltroTipo = document.getElementById("filtro_tipo_estudio");
        this.selectPorcentajeTipo = document.getElementById("porcentaje_tipo_estudio");
        this.selectNombresTipo = document.getElementById("nombre_pacientes_tipo_estudio");
        this.selectTotalPorEstudioTipo = document.getElementById("total_tipo_estudio");
        this.botonObtenerTotalPorEstudio = document.getElementById("botonObtenerTotalPorEstudio");
        this.selectEstadisticasTipo = document.getElementById("estadisticas_tipo_estudio");
        this.selectPromedioTipo = document.getElementById("promedio_tipo_estudio");
        this.botonVerEstadisticas = document.getElementById("botonVerEstadisticasEstudio");
        this.botonPorcentajeFinalizados = document.getElementById("botonPorcentajeFinalizados");
        this.botonCalcularPromedio = document.getElementById("botonCalcularPromedioEstudio");
        this.actualizarListaEstudios();
        if (this.botonVerEstadisticas) {
            this.botonVerEstadisticas.onclick = () => {
                const tipo = this.selectEstadisticasTipo?.value || "";
                if (this.avisarVerEstadisticasEstudio)
                    this.avisarVerEstadisticasEstudio(tipo);
            };
        }
        if (this.botonPorcentajeFinalizados) {
            this.botonPorcentajeFinalizados.onclick = () => {
                if (this.avisarCalcularPorcentajeFinalizados)
                    this.avisarCalcularPorcentajeFinalizados();
            };
        }
        if (this.botonCalcularPromedio) {
            this.botonCalcularPromedio.onclick = () => {
                const tipo = this.selectPromedioTipo?.value || "";
                if (this.avisarCalcularPromedioEstudio)
                    this.avisarCalcularPromedioEstudio(tipo);
            };
        }
        if (this.botonFiltrarEstudios) {
            this.botonFiltrarEstudios.onclick = () => {
                const tipo = this.selectFiltroTipo?.value || "";
                const fecha = this.inputFiltroFecha?.value || "";
                if (this.avisarFiltrarEstudios)
                    this.avisarFiltrarEstudios(tipo, fecha);
            };
        }
        if (this.botonCalcularPorcentaje) {
            this.botonCalcularPorcentaje.onclick = () => {
                const tipo = this.selectPorcentajeTipo?.value || "";
                if (this.avisarCalcularPorcentaje)
                    this.avisarCalcularPorcentaje(tipo);
            };
        }
        if (this.botonObtenerTotalPorEstudio) {
            this.botonObtenerTotalPorEstudio.onclick = () => {
                const tipo = this.selectTotalPorEstudioTipo?.value || "";
                if (this.avisarObtenerTotalPorEstudio)
                    this.avisarObtenerTotalPorEstudio(tipo);
            };
        }
        if (this.botonObtenernombres) {
            this.botonObtenernombres.onclick = () => {
                const tipo = this.selectNombresTipo?.value || "";
                if (this.avisarObtenerNombres)
                    this.avisarObtenerNombres(tipo);
            };
        }
        // ============================================
        // INICIALIZAR EVENTOS DE GESTIÓN DE USUARIOS
        // ============================================
        this.inicializarEventosUsuarios();
    }
    inicializarEventosUsuarios() {
        const btnMostrarCrear = document.getElementById("btnMostrarCrearUsuario");
        const btnRecargar = document.getElementById("btnRecargarUsuarios");
        const btnGuardarNuevo = document.getElementById("btnGuardarNuevoUsuario");
        const btnCancelarCrear = document.getElementById("btnCancelarCrearUsuario");
        const btnGuardarPassword = document.getElementById("btnGuardarCambioPassword");
        const btnCancelarPassword = document.getElementById("btnCancelarCambioPassword");
        if (btnMostrarCrear) {
            btnMostrarCrear.onclick = () => {
                if (this.avisarMostrarCrearUsuario)
                    this.avisarMostrarCrearUsuario();
            };
        }
        if (btnRecargar) {
            btnRecargar.onclick = () => {
                if (this.avisarRecargarUsuarios)
                    this.avisarRecargarUsuarios();
            };
        }
        if (btnGuardarNuevo) {
            btnGuardarNuevo.onclick = () => {
                if (this.avisarGuardarNuevoUsuario)
                    this.avisarGuardarNuevoUsuario();
            };
        }
        if (btnCancelarCrear) {
            btnCancelarCrear.onclick = () => {
                if (this.avisarCancelarCrearUsuario)
                    this.avisarCancelarCrearUsuario();
            };
        }
        if (btnGuardarPassword) {
            btnGuardarPassword.onclick = () => {
                if (this.avisarGuardarCambioPassword)
                    this.avisarGuardarCambioPassword();
            };
        }
        if (btnCancelarPassword) {
            btnCancelarPassword.onclick = () => {
                if (this.avisarCancelarCambioPassword)
                    this.avisarCancelarCambioPassword();
            };
        }
    }
    actualizarListaEstudios() {
        const estudios = Cl_mEstudio.obtenerTodos();
        const selects = [
            this.selectFiltroTipo,
            this.selectPorcentajeTipo,
            this.selectNombresTipo,
            this.selectTotalPorEstudioTipo,
            this.selectEstadisticasTipo,
            this.selectPromedioTipo
        ];
        const valores = [
            this.selectFiltroTipo?.value || "",
            this.selectPorcentajeTipo?.value || "",
            this.selectNombresTipo?.value || "",
            this.selectTotalPorEstudioTipo?.value || "",
            this.selectEstadisticasTipo?.value || "",
            this.selectPromedioTipo?.value || ""
        ];
        selects.forEach((select, index) => {
            if (select) {
                select.innerHTML = '<option value="">-- Seleccione un estudio --</option>';
                for (let i = 0; i < estudios.length; i++) {
                    const option = document.createElement("option");
                    option.value = estudios[i].nombre;
                    option.textContent = `${estudios[i].nombre} ($${estudios[i].precio})`;
                    select.appendChild(option);
                }
                if (valores[index] && select.querySelector(`option[value="${valores[index]}"]`)) {
                    select.value = valores[index];
                }
            }
        });
    }
    // ============================================
    // MÉTODOS DE GESTIÓN DE USUARIOS
    // ============================================
    cuandoClicEnMostrarCrearUsuario(callback) {
        this.avisarMostrarCrearUsuario = callback;
    }
    cuandoClicEnRecargarUsuarios(callback) {
        this.avisarRecargarUsuarios = callback;
    }
    cuandoClicEnGuardarNuevoUsuario(callback) {
        this.avisarGuardarNuevoUsuario = callback;
    }
    cuandoClicEnCancelarCrearUsuario(callback) {
        this.avisarCancelarCrearUsuario = callback;
    }
    cuandoClicEnGuardarCambioPassword(callback) {
        this.avisarGuardarCambioPassword = callback;
    }
    cuandoClicEnCancelarCambioPassword(callback) {
        this.avisarCancelarCambioPassword = callback;
    }
    mostrarTablaUsuarios(usuarios) {
        const divTabla = document.getElementById("tablaUsuarios");
        if (!divTabla)
            return;
        if (usuarios.length === 0) {
            divTabla.innerHTML = '<div class="mensaje-vacio">📭 No hay usuarios registrados</div>';
            return;
        }
        const rolLabels = {
            admin: '🔧 Administrador',
            bioanalista: '🧪 Bioanalista',
            recepcionista: '📋 Recepcionista'
        };
        let html = `
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="background:#1a5f7a; color:white;">
            <th style="padding:10px;">ID</th>
            <th style="padding:10px;">Usuario</th>
            <th style="padding:10px;">Nombre Completo</th>
            <th style="padding:10px;">Email</th>
            <th style="padding:10px;">Rol</th>
            <th style="padding:10px;">Estado</th>
            <th style="padding:10px;">Último Acceso</th>
            <th style="padding:10px;">Acciones</th>
          </tr>
        </thead>
        <tbody>
    `;
        for (const u of usuarios) {
            const estadoHtml = u.activo
                ? '<span style="background:#28a745; color:white; padding:2px 8px; border-radius:10px; font-size:0.8rem;">Activo</span>'
                : '<span style="background:#dc3545; color:white; padding:2px 8px; border-radius:10px; font-size:0.8rem;">Inactivo</span>';
            const ultimoAcceso = u.ultimo_acceso
                ? new Date(u.ultimo_acceso).toLocaleString()
                : 'Nunca';
            html += `
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:10px; font-family:monospace;">${u.id}</td>
          <td style="padding:10px; font-weight:600;">${this.escapeHtml(u.nombre_usuario)}</td>
          <td style="padding:10px;">${this.escapeHtml(u.nombre_completo)}</td>
          <td style="padding:10px;">${this.escapeHtml(u.email)}</td>
          <td style="padding:10px;">${rolLabels[u.rol] || u.rol}</td>
          <td style="padding:10px;">${estadoHtml}</td>
          <td style="padding:10px; font-size:0.85rem;">${ultimoAcceso}</td>
          <td style="padding:10px;">
            <button class="btn-cambiar-password" data-id="${u.id}" data-nombre="${this.escapeHtml(u.nombre_usuario)}" style="background:#ffc107; color:#333; border:none; padding:5px 10px; border-radius:6px; cursor:pointer; font-size:0.75rem;">🔑 Cambiar Pass</button>
          </td>
        </tr>
      `;
        }
        html += "</tbody></table>";
        divTabla.innerHTML = html;
        // Asignar eventos a los botones de cambiar contraseña
        const yoMismo = this;
        document.querySelectorAll(".btn-cambiar-password").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                const nombre = btn.getAttribute("data-nombre") || "";
                if (id) {
                    yoMismo.mostrarModalCambiarPassword(parseInt(id), nombre);
                }
            });
        });
    }
    mostrarErrorUsuarios(mensaje) {
        const divTabla = document.getElementById("tablaUsuarios");
        if (!divTabla)
            return;
        divTabla.innerHTML = `<div class="resultado-item" style="background:#ffe8e5; border-left-color:#c0392b;">❌ ${this.escapeHtml(mensaje)}</div>`;
    }
    mostrarResultadoCrearUsuario(mensaje, esError) {
        const divResultado = document.getElementById("resultadoCrearUsuario");
        if (!divResultado)
            return;
        const bgColor = esError ? '#ffe8e5' : '#e8f5e9';
        const borderColor = esError ? '#c0392b' : '#4caf50';
        divResultado.innerHTML = `<div class="resultado-item" style="background:${bgColor}; border-left-color:${borderColor}; padding:10px;">${esError ? '❌' : '✅'} ${this.escapeHtml(mensaje)}</div>`;
    }
    mostrarResultadoCambiarPassword(mensaje, esError) {
        const divResultado = document.getElementById("resultadoCambiarPassword");
        if (!divResultado)
            return;
        const bgColor = esError ? '#ffe8e5' : '#e8f5e9';
        const borderColor = esError ? '#c0392b' : '#4caf50';
        divResultado.innerHTML = `<div class="resultado-item" style="background:${bgColor}; border-left-color:${borderColor}; padding:10px;">${esError ? '❌' : '✅'} ${this.escapeHtml(mensaje)}</div>`;
    }
    mostrarModalCambiarPassword(_usuarioId, usuarioNombre) {
        const modal = document.getElementById("modalCambiarPassword");
        const texto = document.getElementById("textoCambiarPassword");
        if (modal)
            modal.style.display = "flex";
        if (texto)
            texto.textContent = `Cambiando contraseña para: ${usuarioNombre}`;
        this.limpiarFormularioCambioPassword();
    }
    ocultarModalCambiarPassword() {
        const modal = document.getElementById("modalCambiarPassword");
        if (modal)
            modal.style.display = "none";
    }
    obtenerDatosNuevoUsuario() {
        const inputUsuario = document.getElementById("inputNuevoUsuario");
        const inputNombre = document.getElementById("inputNuevoNombre");
        const inputEmail = document.getElementById("inputNuevoEmail");
        const inputPassword = document.getElementById("inputNuevoPassword");
        const selectRol = document.getElementById("selectNuevoRol");
        return {
            nombreUsuario: inputUsuario?.value || "",
            nombreCompleto: inputNombre?.value || "",
            email: inputEmail?.value || "",
            password: inputPassword?.value || "",
            rol: selectRol?.value || "bioanalista"
        };
    }
    obtenerDatosCambioPassword() {
        const inputPassword = document.getElementById("inputNuevaPassword");
        const inputConfirmar = document.getElementById("inputConfirmarPassword");
        const password = inputPassword?.value || "";
        const confirmar = inputConfirmar?.value || "";
        if (password !== confirmar) {
            return { password: "" };
        }
        return { password };
    }
    limpiarFormularioCrearUsuario() {
        const inputUsuario = document.getElementById("inputNuevoUsuario");
        const inputNombre = document.getElementById("inputNuevoNombre");
        const inputEmail = document.getElementById("inputNuevoEmail");
        const inputPassword = document.getElementById("inputNuevoPassword");
        const divResultado = document.getElementById("resultadoCrearUsuario");
        if (inputUsuario)
            inputUsuario.value = "";
        if (inputNombre)
            inputNombre.value = "";
        if (inputEmail)
            inputEmail.value = "";
        if (inputPassword)
            inputPassword.value = "";
        if (divResultado)
            divResultado.innerHTML = "";
    }
    limpiarFormularioCambioPassword() {
        const inputPassword = document.getElementById("inputNuevaPassword");
        const inputConfirmar = document.getElementById("inputConfirmarPassword");
        const divResultado = document.getElementById("resultadoCambiarPassword");
        if (inputPassword)
            inputPassword.value = "";
        if (inputConfirmar)
            inputConfirmar.value = "";
        if (divResultado)
            divResultado.innerHTML = "";
    }
    mostrarFormularioCrearUsuario() {
        const form = document.getElementById("formCrearUsuario");
        if (form)
            form.style.display = "block";
    }
    ocultarFormularioCrearUsuario() {
        const form = document.getElementById("formCrearUsuario");
        if (form)
            form.style.display = "none";
        this.limpiarFormularioCrearUsuario();
    }
    escapeHtml(text) {
        if (!text)
            return "";
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
//# sourceMappingURL=Cl_vAdmin.js.map