// views/Cl_vExamen.ts
import { I_vExamen } from "../interfaces/I_vExamen.js";
import Cl_mEstudio from "../models/Cl_mEstudio.js";
import Cl_sLaboratorio from "../services/Cl_sLaboratorio.js";
import Cl_sCedula from "../services/Cl_sCedula.js";

export default class Cl_vExamen implements I_vExamen {
  private modal: HTMLElement | null;
  private botonCancelar: HTMLButtonElement | null;
  private botonAceptar: HTMLButtonElement | null;
  private avisarAceptar: ((datos: {
    nombrePaciente: string;
    cedulaPaciente: string;
    telefonoPaciente?: string;
    estudiosSeleccionados: string[];
    formaPago: string;
    referencia?: string;
  }) => void) | null = null;
  private avisarCancelar: (() => void) | null = null;

  private inputCedula: HTMLInputElement | null;
  private inputNombre: HTMLInputElement | null;
  private inputTelefono: HTMLInputElement | null;
  private inputReferencia: HTMLInputElement | null;
  private selectMetodoPago: HTMLSelectElement | null;
  private campoReferencia: HTMLElement | null;
  private inputPrecio: HTMLInputElement | null;
  private checkboxesContainer: HTMLElement | null;

  constructor() {
    this.modal = document.getElementById("modalExamen");
    this.botonCancelar = document.getElementById("modal_btnCancelar") as HTMLButtonElement;
    this.botonAceptar = document.getElementById("modal_btnAceptar") as HTMLButtonElement;
    
    this.inputCedula = document.getElementById("modal_cedula") as HTMLInputElement;
    this.inputNombre = document.getElementById("modal_nombre") as HTMLInputElement;
    this.inputTelefono = document.getElementById("modal_telefono") as HTMLInputElement;
    this.inputReferencia = document.getElementById("modal_referencia") as HTMLInputElement;
    this.selectMetodoPago = document.getElementById("modal_metodoPago") as HTMLSelectElement;
    this.campoReferencia = document.getElementById("campo_referencia");
    this.inputPrecio = document.getElementById("modal_precio") as HTMLInputElement;
    this.checkboxesContainer = document.getElementById("modal_checkboxes");

    if (this.modal) this.modal.style.display = "none";

    this.configurarEventListeners();
  }

  
  public obtenerDatosFormulario(): {
    nombrePaciente: string;
    cedulaPaciente: string;
    telefonoPaciente: string;
    estudiosSeleccionados: string[];
    formaPago: string;
    referencia: string;
  } {
    return {
      nombrePaciente: this.inputNombre?.value || "",
      cedulaPaciente: this.inputCedula?.value || "",
      telefonoPaciente: this.inputTelefono?.value || "",
      estudiosSeleccionados: this.obtenerEstudiosSeleccionados(),
      formaPago: this.selectMetodoPago?.value || "",
      referencia: this.inputReferencia?.value || ""
    };
  }

  private obtenerEstudiosSeleccionados(): string[] {
    const seleccionados: string[] = [];
    if (this.checkboxesContainer) {
      const checkboxes = this.checkboxesContainer.querySelectorAll(".modal-check-estudio:checked");
      for (let i = 0; i < checkboxes.length; i++) {
        seleccionados.push((checkboxes[i] as HTMLInputElement).value);
      }
    }
    return seleccionados;
  }

  
  public mostrarErrores(errores: string[]): void {
    if (errores.length === 0) return;
    alert("⚠️ " + errores.join("\n"));
  }

  
  private configurarEventListeners(): void {
    let yoMismo = this;
    
    if (this.botonCancelar) {
      this.botonCancelar.onclick = () => {
        if (yoMismo.avisarCancelar) yoMismo.avisarCancelar();
        yoMismo.ocultar();
      };
    }

    if (this.botonAceptar) {
      this.botonAceptar.onclick = () => {
        const datos = yoMismo.obtenerDatosFormulario();
        if (yoMismo.avisarAceptar) {
          yoMismo.avisarAceptar(datos);
        }
      };
    }

    if (this.checkboxesContainer) {
      this.checkboxesContainer.addEventListener("change", (e) => {
        const target = e.target as HTMLInputElement;
        if (target.classList.contains("modal-check-estudio")) {
          this.actualizarTotal();
        }
      });
    }

    
    if (this.selectMetodoPago) {
      this.selectMetodoPago.onchange = () => {
        const v = this.selectMetodoPago?.value;
        if (v === "Transferencia" || v === "Pago Móvil") {
          if (this.campoReferencia) this.campoReferencia.style.display = "block";
        } else {
          if (this.campoReferencia) this.campoReferencia.style.display = "none";
          if (this.inputReferencia) this.inputReferencia.value = "";
        }
      };
    }

    if (this.inputCedula) {
      this.inputCedula.addEventListener('keydown', async (ev) => {
        if (ev.key === 'Enter') {
          const ced = this.inputCedula?.value.trim() || "";
          if (!ced) return;
          
          // Notificar al Controlador que se presionó Enter en la cédula
          if (this.avisarBuscarCedula) {
            this.avisarBuscarCedula(ced);
          }
        }
      });
    }
  }

 
  
  private avisarBuscarCedula: ((cedula: string) => void) | null = null;

  public cuandoBusquenCedula(callback: (cedula: string) => void): void {
    this.avisarBuscarCedula = callback;
  }

 
  
  private actualizarTotal(): void {
    if (!this.checkboxesContainer || !this.inputPrecio) return;
    
    let total = 0;
    const checkboxes = this.checkboxesContainer.querySelectorAll(".modal-check-estudio:checked");
    for (let i = 0; i < checkboxes.length; i++) {
      const chk = checkboxes[i] as HTMLInputElement;
      const precio = parseFloat(chk.getAttribute("data-precio") || "0");
      total += precio;
    }
    this.inputPrecio.value = total.toString();
  }

  public cargarCatalogoEstudios(): void {
    if (!this.checkboxesContainer) return;

    const estudios = Cl_mEstudio.obtenerTodos();
    
    if (estudios.length === 0) {
      this.checkboxesContainer.innerHTML = "<p>Cargando catálogo...</p>";
      return;
    }

    let checkboxesHtml = "";
    for (let i = 0; i < estudios.length; i++) {
      const est = estudios[i];
      checkboxesHtml += `
        <div class="checkbox-item">
          <input type="checkbox" class="modal-check-estudio" id="mod_est_${est.id}" value="${est.nombre}" data-precio="${est.precio}">
          <label for="mod_est_${est.id}">${this.escapeHtml(est.nombre)} ($${est.precio})</label>
        </div>
      `;
    }
    this.checkboxesContainer.innerHTML = checkboxesHtml;
  }

  public limpiarFormulario(): void {
    if (this.inputCedula) this.inputCedula.value = "";
    if (this.inputNombre) this.inputNombre.value = "";
    if (this.inputTelefono) this.inputTelefono.value = "";
    if (this.inputReferencia) this.inputReferencia.value = "";
    if (this.inputPrecio) this.inputPrecio.value = "0";
    if (this.selectMetodoPago) this.selectMetodoPago.value = "Efectivo";
    if (this.campoReferencia) this.campoReferencia.style.display = "none";
    
    if (this.checkboxesContainer) {
      const checkboxes = this.checkboxesContainer.querySelectorAll(".modal-check-estudio");
      for (let i = 0; i < checkboxes.length; i++) {
        (checkboxes[i] as HTMLInputElement).checked = false;
      }
    }
  }

  
  public cuandoDenCancelar(callback: () => void): void { 
    this.avisarCancelar = callback; 
  }
  
  public cuandoDenAceptar(callback: (datos: {
    nombrePaciente: string;
    cedulaPaciente: string;
    telefonoPaciente?: string;
    estudiosSeleccionados: string[];
    formaPago: string;
    referencia?: string;
  }) => void): void { 
    this.avisarAceptar = callback; 
  }

  public mostrar(): void {
    this.limpiarFormulario();
    this.cargarCatalogoEstudios();
    if (this.modal) this.modal.style.display = "flex";
    setTimeout(() => this.inputCedula?.focus(), 100);
  }

  public ocultar(): void {
    if (this.modal) this.modal.style.display = "none";
  }

  private escapeHtml(text: string): string {
    if (!text) return "";
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}