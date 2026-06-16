// views/Cl_vBioanalista.ts
import { I_vBioanalista } from "../interfaces/I_vBioanalista.js";
import Cl_mExamen from "../models/Cl_mExamen.js";
import Cl_mEstudio from "../models/Cl_mEstudio.js";

export default class Cl_vBioanalista implements I_vBioanalista {
  private avisarCargarResultados: ((id: string, resultados: string[]) => void) | null = null;
  private avisarFinalizar: ((id: string) => void) | null = null;
  private avisarFiltrar: ((estado: string) => void) | null = null;
  private avisarBuscar: ((id: string) => void) | null = null;
  private avisarNuevoEstudio: ((estudio: Cl_mEstudio) => void) | null = null;
  private avisarEditarEstudio: ((estudio: Cl_mEstudio) => void) | null = null;
  private avisarEliminarEstudio: ((id: string) => void) | null = null;

  private examenes: Cl_mExamen[] = [];
  private estudios: Cl_mEstudio[] = [];
  private examenActual: Cl_mExamen | null = null;
  private estudioActual: Cl_mEstudio | null = null;
  private filtroEstadoActual: string = "todos";

  constructor() {
    this.inicializarEventos();
  }

  private inicializarEventos(): void {
    // Filtro por estado - SOLO pasa el valor al Controlador
    const selectEstado = document.getElementById("selectEstado") as HTMLSelectElement;
    if (selectEstado) {
      selectEstado.onchange = () => {
        this.filtroEstadoActual = selectEstado.value;
        if (this.avisarFiltrar) this.avisarFiltrar(selectEstado.value);
      };
    }

    // Buscar por ID - SOLO pasa el valor al Controlador
    const btnBuscar = document.getElementById("btnBuscar");
    const btnLimpiar = document.getElementById("btnLimpiar");
    const inputBuscar = document.getElementById("inputBuscarId") as HTMLInputElement;

    if (btnBuscar) {
      btnBuscar.onclick = () => {
        if (this.avisarBuscar) this.avisarBuscar(inputBuscar.value);
      };
    }

    if (btnLimpiar) {
      btnLimpiar.onclick = () => {
        inputBuscar.value = "";
        if (this.avisarBuscar) this.avisarBuscar("");
      };
    }

    // Modal Estudios
    const btnGestionar = document.getElementById("btnGestionarEstudios");
    const modalEstudios = document.getElementById("modalEstudios");
    const cerrarEstudios = document.getElementById("cerrarModalEstudios");

    if (btnGestionar) btnGestionar.onclick = () => this.mostrarModal("modalEstudios");
    if (cerrarEstudios) cerrarEstudios.onclick = () => this.ocultarModal("modalEstudios");
    if (modalEstudios) modalEstudios.onclick = (e) => { if (e.target === modalEstudios) this.ocultarModal("modalEstudios"); };

    // Modal Nuevo Estudio - SOLO recolecta datos
    const btnAbrirNuevo = document.getElementById("btnAbrirNuevoEstudio");
    const modalNuevo = document.getElementById("modalNuevoEstudio");
    const cerrarNuevo = document.getElementById("cerrarNuevoEstudio");
    const cancelarNuevo = document.getElementById("cancelarNuevo");
    const guardarNuevo = document.getElementById("guardarNuevo");

    if (btnAbrirNuevo) btnAbrirNuevo.onclick = () => this.mostrarModal("modalNuevoEstudio");
    if (cerrarNuevo) cerrarNuevo.onclick = () => this.ocultarModal("modalNuevoEstudio");
    if (cancelarNuevo) cancelarNuevo.onclick = () => this.ocultarModal("modalNuevoEstudio");
    if (modalNuevo) modalNuevo.onclick = (e) => { if (e.target === modalNuevo) this.ocultarModal("modalNuevoEstudio"); };
    if (guardarNuevo) guardarNuevo.onclick = () => this.guardarNuevoEstudio();

    // Modal Editar Estudio
    const modalEditar = document.getElementById("modalEditarEstudio");
    const cerrarEditar = document.getElementById("cerrarEditar");
    const cancelarEditar = document.getElementById("cancelarEditar");
    const guardarEditar = document.getElementById("guardarEditar");

    if (cerrarEditar) cerrarEditar.onclick = () => this.ocultarModal("modalEditarEstudio");
    if (cancelarEditar) cancelarEditar.onclick = () => this.ocultarModal("modalEditarEstudio");
    if (modalEditar) modalEditar.onclick = (e) => { if (e.target === modalEditar) this.ocultarModal("modalEditarEstudio"); };
    if (guardarEditar) guardarEditar.onclick = () => this.guardarEditarEstudio();

    // Modal Resultados
    const modalResultados = document.getElementById("modalResultados");
    const cerrarResultados = document.getElementById("cerrarResultados");
    const cancelarResultados = document.getElementById("cancelarResultados");
    const guardarResultados = document.getElementById("guardarResultados");

    if (cerrarResultados) cerrarResultados.onclick = () => this.ocultarModal("modalResultados");
    if (cancelarResultados) cancelarResultados.onclick = () => this.ocultarModal("modalResultados");
    if (modalResultados) modalResultados.onclick = (e) => { if (e.target === modalResultados) this.ocultarModal("modalResultados"); };
    if (guardarResultados) guardarResultados.onclick = () => this.guardarResultados();
  }

  private mostrarModal(id: string): void {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "flex";
  }

  private ocultarModal(id: string): void {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "none";
  }

  // ============ MÉTODOS QUE RECOLECTAN DATOS Y PASAN AL CONTROLADOR ============
  
  private guardarNuevoEstudio(): void {
    // SOLO recolecta datos, NO valida
    const datos = this.obtenerDatosNuevoEstudio();
    if (this.avisarNuevoEstudio) {
      this.avisarNuevoEstudio(new Cl_mEstudio({
        nombre: datos.nombre,
        precio: datos.precio,
        unidad: datos.unidad,
        valoresReferencia: datos.referencia
      }));
    }
    
    // Limpiar campos
    (document.getElementById("nuevoNombre") as HTMLInputElement).value = "";
    (document.getElementById("nuevoPrecio") as HTMLInputElement).value = "";
    (document.getElementById("nuevoUnidad") as HTMLInputElement).value = "";
    (document.getElementById("nuevoReferencia") as HTMLInputElement).value = "";
    
    this.ocultarModal("modalNuevoEstudio");
  }

  private obtenerDatosNuevoEstudio(): { nombre: string; precio: number; unidad: string; referencia: string } {
    return {
      nombre: (document.getElementById("nuevoNombre") as HTMLInputElement).value.trim(),
      precio: parseFloat((document.getElementById("nuevoPrecio") as HTMLInputElement).value),
      unidad: (document.getElementById("nuevoUnidad") as HTMLInputElement).value.trim(),
      referencia: (document.getElementById("nuevoReferencia") as HTMLInputElement).value.trim()
    };
  }

  private guardarEditarEstudio(): void {
    const datos = this.obtenerDatosEditarEstudio();
    
    if (this.avisarEditarEstudio && this.estudioActual) {
      const estudioEditado = new Cl_mEstudio({
        id: this.estudioActual.id,
        nombre: datos.nombre,
        precio: datos.precio,
        unidad: datos.unidad,
        valoresReferencia: datos.referencia
      });
      this.avisarEditarEstudio(estudioEditado);
      this.estudioActual = null;
    }

    this.ocultarModal("modalEditarEstudio");
  }

  private obtenerDatosEditarEstudio(): { nombre: string; precio: number; unidad: string; referencia: string } {
    return {
      nombre: (document.getElementById("editarNombre") as HTMLInputElement).value.trim(),
      precio: parseFloat((document.getElementById("editarPrecio") as HTMLInputElement).value),
      unidad: (document.getElementById("editarUnidad") as HTMLInputElement).value.trim(),
      referencia: (document.getElementById("editarReferencia") as HTMLInputElement).value.trim()
    };
  }

  private guardarResultados(): void {
    if (!this.examenActual) return;

    const resultados = this.obtenerResultadosDelModal();
    
    if (this.avisarCargarResultados) {
      this.avisarCargarResultados(this.examenActual.id, resultados);
    }

    this.examenActual = null;
    this.ocultarModal("modalResultados");
  }

  private obtenerResultadosDelModal(): string[] {
    if (!this.examenActual) return [];
    
    const estudios = this.examenActual.obtenerArregloEstudios();
    const resultados: string[] = [];

    for (let i = 0; i < estudios.length; i++) {
      const input = document.getElementById(`res_${i}`) as HTMLInputElement;
      resultados.push(input?.value.trim() || "");
    }
    
    return resultados;
  }

  // ============ MÉTODOS DE RENDERIZADO ============
  
  public mostrarPendientes(datos: { examenes: Cl_mExamen[]; filtroActual?: string; busquedaId?: string }): void {
    this.examenes = datos.examenes;
    this.pintarTabla();
  }

  public mostrarListaEstudios(estudios: Cl_mEstudio[]): void {
    this.estudios = estudios;
    this.pintarTablaEstudios();
  }

  private pintarTabla(): void {
    const contenedor = document.getElementById("listaPendientes");
    if (!contenedor) return;

    if (this.examenes.length === 0) {
      let mensaje = "";
      if (this.filtroEstadoActual === "preparacion") {
        mensaje = "📭 No hay órdenes en estado PREPARACIÓN";
      } else if (this.filtroEstadoActual === "pendiente") {
        mensaje = "📭 No hay órdenes en estado PENDIENTE";
      } else {
        mensaje = "📭 No hay órdenes pendientes (PREPARACIÓN o PENDIENTE)";
      }
      contenedor.innerHTML = `<div class="mensaje-vacio">${mensaje}</div>`;
      return;
    }

    let html = '<table style="width:100%; border-collapse:collapse;">';
    html += '<thead><tr style="background:#1a5f7a; color:white;">';
    html += '<th style="padding:12px;">ID</th>';
    html += '<th style="padding:12px;">Paciente</th>';
    html += '<th style="padding:12px;">Cédula</th>';
    html += '<th style="padding:12px;">Estudios</th>';
    html += '<th style="padding:12px;">Estado</th>';
    html += '<th style="padding:12px;">Fecha</th>';
    html += '<th style="padding:12px;">Acciones</th>';
    html += '</tr></thead><tbody>';

    for (const ex of this.examenes) {
      const idMostrar = ex.id ? ex.id : "N/A";
      const estadoClass = ex.estado === "preparacion" ? "badge-preparacion" : "badge-pendiente";
      const estadoTexto = ex.estado === "preparacion" ? "PREPARACIÓN" : "PENDIENTE";

      let estudiosHtml = "";
      for (const est of ex.obtenerArregloEstudios()) {
        estudiosHtml += `<span style="background:#eef3fc; padding:3px 8px; border-radius:12px; font-size:0.7rem; margin:2px; display:inline-block;">${this.escapeHtml(est)}</span>`;
      }

      const puedeFinalizar = ex.puedeFinalizar();
      const mostrarBotonFinalizar = ex.estado === "pendiente" && puedeFinalizar;

      html += `<tr style="border-bottom:1px solid #eee;">
        <td style="padding:12px; font-family:monospace;">${idMostrar}</td>
        <td style="padding:12px;">${this.escapeHtml(ex.nombrePaciente)}</td>
        <td style="padding:12px;">${this.escapeHtml(ex.cedulaPaciente)}</td>
        <td style="padding:12px;">${estudiosHtml}</td>
        <td style="padding:12px;"><span class="${estadoClass}">${estadoTexto}</span></td>
        <td style="padding:12px;">${new Date(ex.fechaRegistro).toLocaleDateString()}</td>
        <td style="padding:12px;">
          <button class="btn-azul btn-cargar" data-id="${ex.id}">📝 Resultados</button>
          ${mostrarBotonFinalizar ? `<button class="btn-verde btn-finalizar" data-id="${ex.id}">✅ Finalizar</button>` : ''}
          ${ex.estado === "preparacion" ? '<button class="btn-finalizar" disabled style="opacity:0.5; background:#ccc;" title="Debe cargar resultados primero">✅ Finalizar</button>' : ''}
        </td>
      </tr>`;
    }

    html += '</tbody></table>';
    contenedor.innerHTML = html;

    // Eventos de los botones
    document.querySelectorAll(".btn-cargar").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = (e.target as HTMLButtonElement).getAttribute("data-id");
        const examen = this.examenes.find(ex => ex.id === id);
        if (examen) {
          this.examenActual = examen;
          this.cargarModalResultados(examen);
          this.mostrarModal("modalResultados");
        }
      });
    });

    document.querySelectorAll(".btn-finalizar").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = (e.target as HTMLButtonElement).getAttribute("data-id");
        // La confirmación es UI, está bien en la Vista
        if (confirm("¿Finalizar esta orden? El examen pasará a estado LISTO y estará disponible para impresión.")) {
          if (this.avisarFinalizar && id) this.avisarFinalizar(id);
        }
      });
    });
  }

  private cargarModalResultados(examen: Cl_mExamen): void {
    const body = document.getElementById("resultadosBody");
    if (!body) return;

    const estudios = examen.obtenerArregloEstudios();
    const resultadosGuardados = examen.obtenerArregloResultados();

    let html = `<p><strong>👤 Paciente:</strong> ${this.escapeHtml(examen.nombrePaciente)}</p>`;
    html += `<p><strong>🆔 Cédula:</strong> ${this.escapeHtml(examen.cedulaPaciente)}</p><hr>`;

    for (let i = 0; i < estudios.length; i++) {
      const estudio = estudios[i];
      const referencia = Cl_mEstudio.obtenerValoresReferencia(estudio);
      const unidad = Cl_mEstudio.obtenerUnidad(estudio);
      const valorPrevio = resultadosGuardados[i] || "";

      html += `
        <div style="margin-bottom: 15px; padding: 10px; background: #f9f9f9; border-left: 3px solid #2c9cd4;">
          <label><strong>🔬 ${this.escapeHtml(estudio)}</strong></label>
          <div style="display: flex; gap: 10px; margin-top: 5px;">
            <input type="text" id="res_${i}" value="${this.escapeHtml(valorPrevio)}" placeholder="Resultado" style="flex:1; padding: 8px; border:1px solid #ddd; border-radius:5px;">
            <span style="padding: 8px;">${unidad}</span>
          </div>
          <small style="color:#666;">Referencia: ${referencia}</small>
        </div>
      `;
    }

    body.innerHTML = html;
  }

  private pintarTablaEstudios(): void {
    const contenedor = document.getElementById("tablaEstudios");
    if (!contenedor) return;

    if (this.estudios.length === 0) {
      contenedor.innerHTML = '<div class="mensaje-vacio">📭 No hay estudios registrados</div>';
      return;
    }

    let html = '<table style="width:100%; border-collapse:collapse;">';
    html += '<thead><tr style="background:#764ba2; color:white;">';
    html += '<th style="padding:12px;">ID</th>';
    html += '<th style="padding:12px;">Nombre</th>';
    html += '<th style="padding:12px;">Precio</th>';
    html += '<th style="padding:12px;">Unidad</th>';
    html += '<th style="padding:12px;">Referencia</th>';
    html += '<th style="padding:12px;">Acciones</th>';
    html += '</tr></thead><tbody>';

    for (const est of this.estudios) {
      const idFormateado = est.id ? `E${est.id.padStart(2, '0')}` : "N/A";

      html += `<tr style="border-bottom:1px solid #eee;">
        <td style="padding:12px; font-family:monospace;">${idFormateado}</td>
        <td style="padding:12px;">${this.escapeHtml(est.nombre)}</td>
        <td style="padding:12px;">$${est.precio}</td>
        <td style="padding:12px;">${this.escapeHtml(est.unidad)}</td>
        <td style="padding:12px;">${this.escapeHtml(est.valoresReferencia)}</td>
        <td style="padding:12px;">
          <button class="btn-amarillo btn-editar" data-id="${est.id}">✏️ Editar</button>
          <button class="btn-rojo btn-eliminar" data-id="${est.id}">🗑️ Eliminar</button>
        </td>
      </tr>`;
    }

    html += '</tbody></table>';
    contenedor.innerHTML = html;

    // Eventos editar
    document.querySelectorAll(".btn-editar").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = (e.target as HTMLButtonElement).getAttribute("data-id");
        const estudio = this.estudios.find(e => e.id === id);
        if (estudio) {
          this.estudioActual = estudio;
          this.cargarModalEditar(estudio);
          this.mostrarModal("modalEditarEstudio");
        }
      });
    });

    // Eventos eliminar
    document.querySelectorAll(".btn-eliminar").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = (e.target as HTMLButtonElement).getAttribute("data-id");
        // La confirmación es UI, está bien en la Vista
        if (confirm("¿Eliminar este estudio?")) {
          if (this.avisarEliminarEstudio && id) this.avisarEliminarEstudio(id);
        }
      });
    });
  }

  private cargarModalEditar(estudio: Cl_mEstudio): void {
    (document.getElementById("editarNombre") as HTMLInputElement).value = estudio.nombre;
    (document.getElementById("editarPrecio") as HTMLInputElement).value = estudio.precio.toString();
    (document.getElementById("editarUnidad") as HTMLInputElement).value = estudio.unidad;
    (document.getElementById("editarReferencia") as HTMLInputElement).value = estudio.valoresReferencia;
  }

  // ============ CALLBACKS ============
  
  public cuandoCargarResultados(callback: (id: string, resultados: string[]) => void): void {
    this.avisarCargarResultados = callback;
  }
  public cuandoFinalizarExamen(callback: (id: string) => void): void {
    this.avisarFinalizar = callback;
  }
  public cuandoCambiarFiltroEstado(callback: (estado: string) => void): void {
    this.avisarFiltrar = callback;
  }
  public cuandoBuscarPorId(callback: (id: string) => void): void {
    this.avisarBuscar = callback;
  }
  public cuandoRegistrenNuevoEstudio(callback: (estudio: Cl_mEstudio) => void): void {
    this.avisarNuevoEstudio = callback;
  }
  public cuandoEditarEstudio(callback: (estudio: Cl_mEstudio) => void): void {
    this.avisarEditarEstudio = callback;
  }
  public cuandoEliminarEstudio(callback: (id: string) => void): void {
    this.avisarEliminarEstudio = callback;
  }

  private escapeHtml(text: string): string {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}