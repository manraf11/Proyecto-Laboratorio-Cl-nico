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

    let yoMismo = this;
    
    if (this.botonCancelar) {
      this.botonCancelar.onclick = () => {
        if (yoMismo.avisarCancelar) yoMismo.avisarCancelar();
        yoMismo.ocultar();
      };
    }

    if (this.botonAceptar) {
      this.botonAceptar.onclick = () => {
        const nombre = yoMismo.inputNombre?.value || "";
        const cedula = yoMismo.inputCedula?.value || "";
        const telefono = yoMismo.inputTelefono?.value || "";
        const metodoPago = yoMismo.selectMetodoPago?.value || "";
        const referencia = yoMismo.inputReferencia?.value || "";

        const estudiosMarcados: string[] = [];
        if (yoMismo.checkboxesContainer) {
          const checkboxes = yoMismo.checkboxesContainer.querySelectorAll(".modal-check-estudio:checked");
          for (let i = 0; i < checkboxes.length; i++) {
            estudiosMarcados.push((checkboxes[i] as HTMLInputElement).value);
          }
        }

        if (cedula.trim() === "") {
          alert("⚠️ La cédula del paciente es obligatoria.");
          return;
        }
        
        if (nombre.trim() === "") {
          alert("⚠️ El nombre del paciente es obligatorio.");
          return;
        }
        
        if (telefono.trim() === "") {
          alert("⚠️ El número de teléfono es obligatorio.");
          return;
        }
        
        const telefonoValido = yoMismo.validarTelefonoVenezuela(telefono);
        if (!telefonoValido.valido) {
          alert(telefonoValido.mensaje);
          return;
        }

        if ((metodoPago === "Transferencia" || metodoPago === "Pago Móvil") && referencia.trim() === "") {
          alert("⚠️ El número de referencia es obligatorio para el método de pago seleccionado.");
          return;
        }
        
        if (estudiosMarcados.length === 0) {
          alert("⚠️ Debe seleccionar al menos un estudio.");
          return;
        }

        if (yoMismo.avisarAceptar) {
          yoMismo.avisarAceptar({
            nombrePaciente: nombre,
            cedulaPaciente: cedula,
            telefonoPaciente: telefono,
            estudiosSeleccionados: estudiosMarcados,
            formaPago: metodoPago,
            referencia: referencia
          });
        }
      };
    }

    this.configurarEventListeners();
  }

  private configurarEventListeners(): void {
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
          
          // Guardar placeholder original
          const originalPlaceholder = this.inputNombre?.placeholder || "";
          if (this.inputNombre) {
            this.inputNombre.value = "";
            this.inputNombre.placeholder = "🔍 Buscando...";
          }
          
          try {
            // PASO 1: Buscar en mockapi (exámenes existentes)
            const resMockApi = await Cl_sLaboratorio.buscarPorCedula(ced);
            
            if (resMockApi.ok && resMockApi.registro) {
              const r = resMockApi.registro;
              if (this.inputNombre && r.nombrePaciente) this.inputNombre.value = r.nombrePaciente;
              if (this.inputTelefono && r.telefonoPaciente) this.inputTelefono.value = r.telefonoPaciente;
              alert("✅ Datos del paciente cargados automáticamente (desde registros anteriores).");
            } else {
              // PASO 2: Consultar API externa a través del proxy
              if (this.inputNombre) this.inputNombre.placeholder = "🌐 Consultando API...";
              
              const resultadoApi = await Cl_sCedula.consultarPorCedula(ced);
              
              if (resultadoApi.exito && resultadoApi.nombreCompleto) {
                if (this.inputNombre) this.inputNombre.value = resultadoApi.nombreCompleto;
                alert(`✅ Datos obtenidos del CNE:\n👤 ${resultadoApi.nombreCompleto}`);
              } else {
                alert(`ℹ️ ${resultadoApi.mensaje}\nComplete los datos manualmente.`);
                if (this.inputNombre) this.inputNombre.focus();
              }
            }
          } catch (error) {
            console.error("Error en búsqueda de cédula:", error);
            alert("⚠️ Error al consultar. Complete los datos manualmente.");
          } finally {
            if (this.inputNombre) this.inputNombre.placeholder = originalPlaceholder;
          }
        }
      });
    }
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

  private validarTelefonoVenezuela(telefono: string): { valido: boolean; mensaje: string } {
    if (!telefono || telefono.trim() === "") {
      return { valido: false, mensaje: "El teléfono es obligatorio." };
    }
    
    let telefonoLimpio = telefono.trim().replace(/[\s\-\.]/g, "");
    let numeroLimpio = telefonoLimpio;
    
    if (telefonoLimpio.startsWith("+58")) numeroLimpio = telefonoLimpio.substring(3);
    else if (telefonoLimpio.startsWith("58")) numeroLimpio = telefonoLimpio.substring(2);
    
    if (!/^\d+$/.test(numeroLimpio)) {
      return { valido: false, mensaje: "Solo números y opcionalmente +58" };
    }
    
    const prefijosValidos = ["412", "414", "424", "426", "416", "422"];
    
    if (numeroLimpio.length === 10) {
      const prefijo = numeroLimpio.substring(0, 3);
      if (prefijosValidos.includes(prefijo)) return { valido: true, mensaje: "" };
      return { valido: false, mensaje: "Prefijo inválido" };
    }
    
    if (numeroLimpio.length === 11 && numeroLimpio.startsWith("0")) {
      const prefijo = numeroLimpio.substring(1, 4);
      if (prefijosValidos.includes(prefijo)) return { valido: true, mensaje: "" };
      return { valido: false, mensaje: "Prefijo inválido" };
    }
    
    if (numeroLimpio.length === 7) return { valido: true, mensaje: "" };
    
    return { valido: false, mensaje: "Teléfono inválido. Ej: 04121234567" };
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
    // Enfocar en la cédula al abrir el modal
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