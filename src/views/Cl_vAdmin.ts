// views/Cl_vAdmin.ts
import { I_vAdmin } from "../interfaces/I_vAdmin.js";
import Cl_mExamen from "../models/Cl_mExamen.js";
import Cl_mEstudio from "../models/Cl_mEstudio.js";

export default class Cl_vAdmin implements I_vAdmin {
  private divFinalizados: HTMLElement;
  private divFormulario: HTMLElement;
  private botonNuevoExamen: HTMLButtonElement | null = null;
  private botonFiltrarEstudios: HTMLButtonElement | null = null;
  private botonCalcularPorcentaje: HTMLButtonElement | null = null;
  private botonObtenernombres: HTMLButtonElement | null = null;
  private inputFiltroFecha: HTMLInputElement | null = null;
  private selectFiltroTipo: HTMLSelectElement | null = null;
  private selectPorcentajeTipo: HTMLSelectElement | null = null;
  private selectNombresTipo: HTMLSelectElement | null = null;
  private avisarImprimir: ((idExamen: string) => void) | null = null;
  private avisarWhatsApp: ((idExamen: string) => void) | null = null;
  private avisarFiltrarEstudios: ((tipoEstudio: string, fechaSeleccionada: string) => void) | null = null;
  private avisarCalcularPorcentaje: ((tipoEstudio: string) => void) | null = null;
  private avisarObtenerNombres: ((tipoEstudio: string) => void) | null = null;
  private botonObtenerTotalPorEstudio: HTMLButtonElement | null = null;
  private selectTotalPorEstudioTipo: HTMLSelectElement | null = null;
  private avisarObtenerTotalPorEstudio: ((tipoEstudio: string) => void) | null = null;
  private avisarVerEstadisticasEstudio: ((tipoEstudio: string) => void) | null = null;
  private avisarCalcularPorcentajeFinalizados: (() => void) | null = null;
  private avisarCalcularPromedioEstudio: ((tipoEstudio: string) => void) | null = null;
  private selectEstadisticasTipo: HTMLSelectElement | null = null;
  private selectPromedioTipo: HTMLSelectElement | null = null;
  private botonVerEstadisticas: HTMLButtonElement | null = null;
  private botonPorcentajeFinalizados: HTMLButtonElement | null = null;
  private botonCalcularPromedio: HTMLButtonElement | null = null;

  // Variables para gestión de usuarios
  private avisarMostrarCrearUsuario: (() => void) | null = null;
  private avisarRecargarUsuarios: (() => void) | null = null;
  private avisarGuardarNuevoUsuario: (() => void) | null = null;
  private avisarCancelarCrearUsuario: (() => void) | null = null;
  private avisarGuardarCambioPassword: (() => void) | null = null;
  private avisarCancelarCambioPassword: (() => void) | null = null;

  constructor() {
    this.divFinalizados = document.getElementById("admin_finalizados") as HTMLElement;
    this.divFormulario = document.getElementById("admin_formulario") as HTMLElement;
    this.mostrarFormulario();
  }

  
  public cuandoClicEnVerEstadisticasEstudio(avisar: (tipoEstudio: string) => void): void {
    this.avisarVerEstadisticasEstudio = avisar;
  }

  public cuandoClicEnCalcularPorcentajeFinalizados(avisar: () => void): void {
    this.avisarCalcularPorcentajeFinalizados = avisar;
  }

  public cuandoClicEnCalcularPromedioEstudio(avisar: (tipoEstudio: string) => void): void {
    this.avisarCalcularPromedioEstudio = avisar;
  }

  public cuandoClicEnNuevoExamen(avisar: () => void): void {
    if (this.botonNuevoExamen) this.botonNuevoExamen.onclick = avisar;
  }

  public cuandoClicEnFiltrarEstudios(avisar: (tipoEstudio: string, fechaSeleccionada: string) => void): void {
    this.avisarFiltrarEstudios = avisar;
  }

  public cuandoClicEnCalcularPorcentaje(avisar: (tipoEstudio: string) => void): void {
    this.avisarCalcularPorcentaje = avisar;
  }

  public cuandoCLicEnObtenerNombres(avisar: (tipoEstudio: string) => void): void {
    this.avisarObtenerNombres = avisar;
  }

  public cuandoClicEnObtenerTotalPorEstudio(avisar: (tipoEstudio: string) => void): void {
    this.avisarObtenerTotalPorEstudio = avisar;
  }

  public cuandoClicEnImprimir(avisar: (idExamen: string) => void): void {
    this.avisarImprimir = avisar;
  }

  public cuandoClicEnEnviarWhatsApp(avisar: (idExamen: string) => void): void {
    this.avisarWhatsApp = avisar;
  }

  
  public mostrarEstadisticasEstudio(datos: { tipoEstudio: string; cantidad: number; total: number }): void {
    const divResultado = document.getElementById("resultadoEstadisticasEstudio");
    if (!divResultado) return;
    
    divResultado.innerHTML = `
      <div class="resultado-item" style="background:#e3f2fd; border-left-color:#1a5f7a;">
        <strong>📊 Estadísticas del estudio "${datos.tipoEstudio}":</strong><br>
        📋 Solicitudes: <strong>${datos.cantidad}</strong><br>
        💰 Ingreso total: <strong>$${datos.total.toFixed(2)}</strong>
      </div>
    `;
  }

  public mostrarPorcentajeFinalizados(porcentaje: number): void {
    const divResultado = document.getElementById("resultadoPorcentajeFinalizados");
    if (!divResultado) return;
    
    divResultado.innerHTML = `
      <div class="resultado-item" style="background:#e8f5e9; border-left-color:#4caf50;">
        ✅ <strong>${porcentaje}%</strong> de los exámenes están <strong>FINALIZADOS</strong>
      </div>
    `;
  }

  public mostrarPromedioEstudio(datos: { tipoEstudio: string; promedio: number; cantidad: number }): void {
    const divResultado = document.getElementById("resultadoPromedioEstudio");
    if (!divResultado) return;
    
    divResultado.innerHTML = `
      <div class="resultado-item" style="background:#fff3e0; border-left-color:#ff9800;">
        📈 <strong>Promedio General del estudio "${datos.tipoEstudio}":</strong><br>
        📊 Promedio: <strong>${datos.promedio.toFixed(2)}</strong><br>
        📋 Basado en <strong>${datos.cantidad}</strong> resultados
      </div>
    `;
  }

  public mostrarResultadoFiltro(cantidad: number, tipoEstudio: string, fechaSeleccionada: string): void {
    const divResultado = document.getElementById("resultadoFiltroEstudios");
    if (!divResultado) return;

    divResultado.innerHTML = `
      <div class="resultado-item">
        <strong>${cantidad}</strong> estudio(s) de tipo <strong>${tipoEstudio}</strong> en fecha <strong>${fechaSeleccionada}</strong>
      </div>
    `;
  }

  public mostrarResultadoPorcentaje(porcentaje: number, tipoEstudio: string): void {
    const divResultado = document.getElementById("resultadoPorcentajeEstudios");
    if (!divResultado) return;

    divResultado.innerHTML = `
      <div class="resultado-item" style="background:#e8f5e9; border-left-color:#4caf50;">
        📊 <strong>${porcentaje}%</strong> de los estudios son <strong>${tipoEstudio}</strong>
      </div>
    `;
  }

  public mostrarResultadoTotalPorEstudio(resultado: string): void {
    const divResultado = document.getElementById("resultadoTotalPorEstudio");
    if (!divResultado) return;

    divResultado.innerHTML = `
      <div class="resultado-item" style="background:#f0f4ff; border-left-color:#3b82f6;">
        ${resultado}
      </div>
    `;
  }

  public mostrarResultadosobteneNombrePacientesPorEstudio(datos: { nombres: string[], tipoEstudio: string }): void {
    const divResultado = document.getElementById("resultadoNombrePacientesPorEstudio");
    if (!divResultado) return;

    if (datos.nombres.length === 0) {
      divResultado.innerHTML = `
        <div class="resultado-item">
          No hay pacientes registrados para el estudio seleccionado.
        </div>
      `;
    } else {
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

  public mostrarFinalizados(datos: { examenes: Cl_mExamen[] }): void {
    if (!this.divFinalizados) return;
    
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
        if (yoMismo.avisarImprimir) yoMismo.avisarImprimir(id);
      });
    });
    
    document.querySelectorAll(".btn-whatsapp").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id") || "";
        if (yoMismo.avisarWhatsApp) yoMismo.avisarWhatsApp(id);
      });
    });
  }

  public mostrarReporte(reporte: string): void {
    const ventana = window.open("", "_blank");
    if (ventana) {
      ventana.document.write(`<html><head><title>Resultados</title></head><body>${reporte}</body></html>`);
      ventana.document.close();
      ventana.print();
    }
  }

  public mostrarMensajeExitoConId(idExamen: string): void {
    const idCorto = idExamen.length > 6 ? idExamen.slice(-6) : idExamen;
    alert(`✅ Examen registrado con éxito!\nNúmero de orden: #${idCorto}`);
  }

  
  public mostrarFormulario(): void {
    if (!this.divFormulario) return;

    this.botonNuevoExamen = document.getElementById("botonAbrirModal") as HTMLButtonElement;
    this.botonFiltrarEstudios = document.getElementById("botonFiltrarEstudios") as HTMLButtonElement;
    this.botonCalcularPorcentaje = document.getElementById("botonCalcularPorcentaje") as HTMLButtonElement;
    this.botonObtenernombres = document.getElementById("botonObtenerNombres") as HTMLButtonElement;
    this.inputFiltroFecha = document.getElementById("filtro_fecha") as HTMLInputElement;
    this.selectFiltroTipo = document.getElementById("filtro_tipo_estudio") as HTMLSelectElement;
    this.selectPorcentajeTipo = document.getElementById("porcentaje_tipo_estudio") as HTMLSelectElement;
    this.selectNombresTipo = document.getElementById("nombre_pacientes_tipo_estudio") as HTMLSelectElement;
    this.selectTotalPorEstudioTipo = document.getElementById("total_tipo_estudio") as HTMLSelectElement;
    this.botonObtenerTotalPorEstudio = document.getElementById("botonObtenerTotalPorEstudio") as HTMLButtonElement;
    this.selectEstadisticasTipo = document.getElementById("estadisticas_tipo_estudio") as HTMLSelectElement;
    this.selectPromedioTipo = document.getElementById("promedio_tipo_estudio") as HTMLSelectElement;
    this.botonVerEstadisticas = document.getElementById("botonVerEstadisticasEstudio") as HTMLButtonElement;
    this.botonPorcentajeFinalizados = document.getElementById("botonPorcentajeFinalizados") as HTMLButtonElement;
    this.botonCalcularPromedio = document.getElementById("botonCalcularPromedioEstudio") as HTMLButtonElement;
    
    this.actualizarListaEstudios();

    if (this.botonVerEstadisticas) {
      this.botonVerEstadisticas.onclick = () => {
        const tipo = this.selectEstadisticasTipo?.value || "";
        if (this.avisarVerEstadisticasEstudio) this.avisarVerEstadisticasEstudio(tipo);
      };
    }
    
    if (this.botonPorcentajeFinalizados) {
      this.botonPorcentajeFinalizados.onclick = () => {
        if (this.avisarCalcularPorcentajeFinalizados) this.avisarCalcularPorcentajeFinalizados();
      };
    }
    
    if (this.botonCalcularPromedio) {
      this.botonCalcularPromedio.onclick = () => {
        const tipo = this.selectPromedioTipo?.value || "";
        if (this.avisarCalcularPromedioEstudio) this.avisarCalcularPromedioEstudio(tipo);
      };
    }

    if (this.botonFiltrarEstudios) {
      this.botonFiltrarEstudios.onclick = () => {
        const tipo = this.selectFiltroTipo?.value || "";
        const fecha = this.inputFiltroFecha?.value || "";
        if (this.avisarFiltrarEstudios) this.avisarFiltrarEstudios(tipo, fecha);
      };
    }

    if (this.botonCalcularPorcentaje) {
      this.botonCalcularPorcentaje.onclick = () => {
        const tipo = this.selectPorcentajeTipo?.value || "";
        if (this.avisarCalcularPorcentaje) this.avisarCalcularPorcentaje(tipo);
      };
    }

    if (this.botonObtenerTotalPorEstudio) {
      this.botonObtenerTotalPorEstudio.onclick = () => {
        const tipo = this.selectTotalPorEstudioTipo?.value || "";
        if (this.avisarObtenerTotalPorEstudio) this.avisarObtenerTotalPorEstudio(tipo);
      };
    }

    if (this.botonObtenernombres) {
      this.botonObtenernombres.onclick = () => {
        const tipo = this.selectNombresTipo?.value || "";
        if (this.avisarObtenerNombres) this.avisarObtenerNombres(tipo);
      };
    }

    // ============================================
    // INICIALIZAR EVENTOS DE GESTIÓN DE USUARIOS
    // ============================================
    this.inicializarEventosUsuarios();
  }

  private inicializarEventosUsuarios(): void {
    const btnMostrarCrear = document.getElementById("btnMostrarCrearUsuario");
    const btnRecargar = document.getElementById("btnRecargarUsuarios");
    const btnGuardarNuevo = document.getElementById("btnGuardarNuevoUsuario");
    const btnCancelarCrear = document.getElementById("btnCancelarCrearUsuario");
    const btnGuardarPassword = document.getElementById("btnGuardarCambioPassword");
    const btnCancelarPassword = document.getElementById("btnCancelarCambioPassword");

    if (btnMostrarCrear) {
      btnMostrarCrear.onclick = () => {
        if (this.avisarMostrarCrearUsuario) this.avisarMostrarCrearUsuario();
      };
    }

    if (btnRecargar) {
      btnRecargar.onclick = () => {
        if (this.avisarRecargarUsuarios) this.avisarRecargarUsuarios();
      };
    }

    if (btnGuardarNuevo) {
      btnGuardarNuevo.onclick = () => {
        if (this.avisarGuardarNuevoUsuario) this.avisarGuardarNuevoUsuario();
      };
    }

    if (btnCancelarCrear) {
      btnCancelarCrear.onclick = () => {
        if (this.avisarCancelarCrearUsuario) this.avisarCancelarCrearUsuario();
      };
    }

    if (btnGuardarPassword) {
      btnGuardarPassword.onclick = () => {
        if (this.avisarGuardarCambioPassword) this.avisarGuardarCambioPassword();
      };
    }

    if (btnCancelarPassword) {
      btnCancelarPassword.onclick = () => {
        if (this.avisarCancelarCambioPassword) this.avisarCancelarCambioPassword();
      };
    }
  }

  public actualizarListaEstudios(): void {
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

  public cuandoClicEnMostrarCrearUsuario(callback: () => void): void {
    this.avisarMostrarCrearUsuario = callback;
  }

  public cuandoClicEnRecargarUsuarios(callback: () => void): void {
    this.avisarRecargarUsuarios = callback;
  }

  public cuandoClicEnGuardarNuevoUsuario(callback: () => void): void {
    this.avisarGuardarNuevoUsuario = callback;
  }

  public cuandoClicEnCancelarCrearUsuario(callback: () => void): void {
    this.avisarCancelarCrearUsuario = callback;
  }

  public cuandoClicEnGuardarCambioPassword(callback: () => void): void {
    this.avisarGuardarCambioPassword = callback;
  }

  public cuandoClicEnCancelarCambioPassword(callback: () => void): void {
    this.avisarCancelarCambioPassword = callback;
  }

  public mostrarTablaUsuarios(usuarios: Array<{ id: number; nombre_usuario: string; nombre_completo: string; email: string; rol: string; activo: boolean; ultimo_acceso: string }>): void {
    const divTabla = document.getElementById("tablaUsuarios");
    if (!divTabla) return;

    if (usuarios.length === 0) {
      divTabla.innerHTML = '<div class="mensaje-vacio">📭 No hay usuarios registrados</div>';
      return;
    }

    const rolLabels: Record<string, string> = {
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

  public mostrarErrorUsuarios(mensaje: string): void {
    const divTabla = document.getElementById("tablaUsuarios");
    if (!divTabla) return;
    divTabla.innerHTML = `<div class="resultado-item" style="background:#ffe8e5; border-left-color:#c0392b;">❌ ${this.escapeHtml(mensaje)}</div>`;
  }

  public mostrarResultadoCrearUsuario(mensaje: string, esError: boolean): void {
    const divResultado = document.getElementById("resultadoCrearUsuario");
    if (!divResultado) return;
    const bgColor = esError ? '#ffe8e5' : '#e8f5e9';
    const borderColor = esError ? '#c0392b' : '#4caf50';
    divResultado.innerHTML = `<div class="resultado-item" style="background:${bgColor}; border-left-color:${borderColor}; padding:10px;">${esError ? '❌' : '✅'} ${this.escapeHtml(mensaje)}</div>`;
  }

  public mostrarResultadoCambiarPassword(mensaje: string, esError: boolean): void {
    const divResultado = document.getElementById("resultadoCambiarPassword");
    if (!divResultado) return;
    const bgColor = esError ? '#ffe8e5' : '#e8f5e9';
    const borderColor = esError ? '#c0392b' : '#4caf50';
    divResultado.innerHTML = `<div class="resultado-item" style="background:${bgColor}; border-left-color:${borderColor}; padding:10px;">${esError ? '❌' : '✅'} ${this.escapeHtml(mensaje)}</div>`;
  }

  public mostrarModalCambiarPassword(_usuarioId: number, usuarioNombre: string): void {
    const modal = document.getElementById("modalCambiarPassword");
    const texto = document.getElementById("textoCambiarPassword");
    if (modal) modal.style.display = "flex";
    if (texto) texto.textContent = `Cambiando contraseña para: ${usuarioNombre}`;
    this.limpiarFormularioCambioPassword();
  }

  public ocultarModalCambiarPassword(): void {
    const modal = document.getElementById("modalCambiarPassword");
    if (modal) modal.style.display = "none";
  }

  public obtenerDatosNuevoUsuario(): { nombreUsuario: string; nombreCompleto: string; email: string; password: string; rol: string } {
    const inputUsuario = document.getElementById("inputNuevoUsuario") as HTMLInputElement;
    const inputNombre = document.getElementById("inputNuevoNombre") as HTMLInputElement;
    const inputEmail = document.getElementById("inputNuevoEmail") as HTMLInputElement;
    const inputPassword = document.getElementById("inputNuevoPassword") as HTMLInputElement;
    const selectRol = document.getElementById("selectNuevoRol") as HTMLSelectElement;

    return {
      nombreUsuario: inputUsuario?.value || "",
      nombreCompleto: inputNombre?.value || "",
      email: inputEmail?.value || "",
      password: inputPassword?.value || "",
      rol: selectRol?.value || "bioanalista"
    };
  }

  public obtenerDatosCambioPassword(): { password: string } {
    const inputPassword = document.getElementById("inputNuevaPassword") as HTMLInputElement;
    const inputConfirmar = document.getElementById("inputConfirmarPassword") as HTMLInputElement;
    
    const password = inputPassword?.value || "";
    const confirmar = inputConfirmar?.value || "";

    if (password !== confirmar) {
      return { password: "" };
    }

    return { password };
  }

  public limpiarFormularioCrearUsuario(): void {
    const inputUsuario = document.getElementById("inputNuevoUsuario") as HTMLInputElement;
    const inputNombre = document.getElementById("inputNuevoNombre") as HTMLInputElement;
    const inputEmail = document.getElementById("inputNuevoEmail") as HTMLInputElement;
    const inputPassword = document.getElementById("inputNuevoPassword") as HTMLInputElement;
    const divResultado = document.getElementById("resultadoCrearUsuario");

    if (inputUsuario) inputUsuario.value = "";
    if (inputNombre) inputNombre.value = "";
    if (inputEmail) inputEmail.value = "";
    if (inputPassword) inputPassword.value = "";
    if (divResultado) divResultado.innerHTML = "";
  }

  public limpiarFormularioCambioPassword(): void {
    const inputPassword = document.getElementById("inputNuevaPassword") as HTMLInputElement;
    const inputConfirmar = document.getElementById("inputConfirmarPassword") as HTMLInputElement;
    const divResultado = document.getElementById("resultadoCambiarPassword");

    if (inputPassword) inputPassword.value = "";
    if (inputConfirmar) inputConfirmar.value = "";
    if (divResultado) divResultado.innerHTML = "";
  }

  public mostrarFormularioCrearUsuario(): void {
    const form = document.getElementById("formCrearUsuario");
    if (form) form.style.display = "block";
  }

  public ocultarFormularioCrearUsuario(): void {
    const form = document.getElementById("formCrearUsuario");
    if (form) form.style.display = "none";
    this.limpiarFormularioCrearUsuario();
  }

  private escapeHtml(text: string): string {
    if (!text) return "";
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}