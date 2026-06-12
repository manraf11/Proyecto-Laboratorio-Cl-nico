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

  constructor() {
    this.divFinalizados = document.getElementById("admin_finalizados") as HTMLElement;
    this.divFormulario = document.getElementById("admin_formulario") as HTMLElement;
    this.mostrarFormulario();
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
    
    if (this.botonObtenernombres) {
      const yoMismo = this;
      this.botonObtenernombres.onclick = () => {
        const tipo = yoMismo.selectNombresTipo?.value || "";
        if (!tipo) { 
          alert("Seleccione un estudio"); 
          return; 
        }
        if (yoMismo.avisarObtenerNombres) {
          yoMismo.avisarObtenerNombres(tipo);
        }
      };
    }
  }

  public cuandoClicEnObtenerTotalPorEstudio(avisar: (tipoEstudio: string) => void): void {
    this.avisarObtenerTotalPorEstudio = avisar;

    if (this.botonObtenerTotalPorEstudio) {
      const yoMismo = this;
      this.botonObtenerTotalPorEstudio.onclick = () => {
        const tipo = yoMismo.selectTotalPorEstudioTipo?.value || "";
        if (!tipo) {
          alert("Seleccione un estudio");
          return;
        }
        if (yoMismo.avisarObtenerTotalPorEstudio) {
          yoMismo.avisarObtenerTotalPorEstudio(tipo);
        }
      };
    }
  }

  public cuandoClicEnImprimir(avisar: (idExamen: string) => void): void {
    this.avisarImprimir = avisar;
  }

  public cuandoClicEnEnviarWhatsApp(avisar: (idExamen: string) => void): void {
    this.avisarWhatsApp = avisar;
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

  public mostrarResultadosobtenerNombrePacientesPorEstudio(datos: { nombres: string[], tipoEstudio: string }): void {
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

  public actualizarListaEstudios(): void {
    const estudios = Cl_mEstudio.obtenerTodos();
    
    const valorActualFiltro = this.selectFiltroTipo ? this.selectFiltroTipo.value : "";
    const valorActualPorcentaje = this.selectPorcentajeTipo ? this.selectPorcentajeTipo.value : "";
    const valorActualNombres = this.selectNombresTipo ? this.selectNombresTipo.value : "";
    const valorActualTotal = this.selectTotalPorEstudioTipo ? this.selectTotalPorEstudioTipo.value : "";
    
    if (this.selectFiltroTipo) {
      this.selectFiltroTipo.innerHTML = '<option value="">-- Seleccione un estudio --</option>';
      for (let i = 0; i < estudios.length; i++) {
        const option = document.createElement("option");
        option.value = estudios[i].nombre;
        option.textContent = `${estudios[i].nombre} ($${estudios[i].precio})`;
        this.selectFiltroTipo.appendChild(option);
      }
      if (valorActualFiltro && this.selectFiltroTipo.querySelector(`option[value="${valorActualFiltro}"]`)) {
        this.selectFiltroTipo.value = valorActualFiltro;
      }
    }
    
    if (this.selectPorcentajeTipo) {
      this.selectPorcentajeTipo.innerHTML = '<option value="">-- Seleccione un estudio --</option>';
      for (let i = 0; i < estudios.length; i++) {
        const option = document.createElement("option");
        option.value = estudios[i].nombre;
        option.textContent = `${estudios[i].nombre} ($${estudios[i].precio})`;
        this.selectPorcentajeTipo.appendChild(option);
      }
      if (valorActualPorcentaje && this.selectPorcentajeTipo.querySelector(`option[value="${valorActualPorcentaje}"]`)) {
        this.selectPorcentajeTipo.value = valorActualPorcentaje;
      }
    }
    
    if (this.selectNombresTipo) {
      this.selectNombresTipo.innerHTML = '<option value="">-- Seleccione un estudio --</option>';
      for (let i = 0; i < estudios.length; i++) {
        const option = document.createElement("option");
        option.value = estudios[i].nombre;
        option.textContent = `${estudios[i].nombre} ($${estudios[i].precio})`;
        this.selectNombresTipo.appendChild(option);
      }
      if (valorActualNombres && this.selectNombresTipo.querySelector(`option[value="${valorActualNombres}"]`)) {
        this.selectNombresTipo.value = valorActualNombres;
      }
    }

    if (this.selectTotalPorEstudioTipo) {
      this.selectTotalPorEstudioTipo.innerHTML = '<option value="">-- Seleccione un estudio --</option>';
      for (let i = 0; i < estudios.length; i++) {
        const option = document.createElement("option");
        option.value = estudios[i].nombre;
        option.textContent = `${estudios[i].nombre} ($${estudios[i].precio})`;
        this.selectTotalPorEstudioTipo.appendChild(option);
      }
      if (valorActualTotal && this.selectTotalPorEstudioTipo.querySelector(`option[value="${valorActualTotal}"]`)) {
        this.selectTotalPorEstudioTipo.value = valorActualTotal;
      }
    }
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

    this.actualizarListaEstudios(); 

    if (this.botonFiltrarEstudios) {
      this.botonFiltrarEstudios.onclick = () => {
        const tipo = this.selectFiltroTipo?.value || "";
        const fecha = this.inputFiltroFecha?.value || "";
        if (!tipo && !fecha) { 
          alert("Seleccione un estudio o una fecha para filtrar"); 
          return; 
        }
        if (this.avisarFiltrarEstudios) this.avisarFiltrarEstudios(tipo, fecha);
      };
    }

    if (this.botonCalcularPorcentaje) {
      this.botonCalcularPorcentaje.onclick = () => {
        const tipo = this.selectPorcentajeTipo?.value || "";
        if (!tipo) { alert("Seleccione un estudio"); return; }
        if (this.avisarCalcularPorcentaje) this.avisarCalcularPorcentaje(tipo);
      };
    }

    if (this.botonObtenerTotalPorEstudio && this.avisarObtenerTotalPorEstudio) {
      const yoMismo = this;
      this.botonObtenerTotalPorEstudio.onclick = () => {
        const tipo = yoMismo.selectTotalPorEstudioTipo?.value || "";
        if (!tipo) {
          alert("Seleccione un estudio");
          return;
        }
        if (yoMismo.avisarObtenerTotalPorEstudio) {
          yoMismo.avisarObtenerTotalPorEstudio(tipo);
        }
      };
    }

    if (this.botonObtenernombres && this.avisarObtenerNombres) {
      const yoMismo = this;
      this.botonObtenernombres.onclick = () => {
        const tipo = yoMismo.selectNombresTipo?.value || "";
        if (!tipo) { 
          alert("Seleccione un estudio"); 
          return; 
        }
        if (yoMismo.avisarObtenerNombres) {
          yoMismo.avisarObtenerNombres(tipo);
        }
      };
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
           </>
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
          <td style="padding:12px;">$${ex.precioEstudio}</td>
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

  private escapeHtml(text: string): string {
    if (!text) return "";
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}