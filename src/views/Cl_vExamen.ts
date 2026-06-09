import { I_vExamen } from "../interfaces/I_vExamen.js";
import Cl_mEstudio from "../models/Cl_mEstudio.js";

export default class Cl_vExamen implements I_vExamen {
  private modal: HTMLElement | null;
  private contenidoModal: HTMLElement | null;
  private botonCancelar: HTMLButtonElement | null;
  private botonAceptar: HTMLButtonElement | null;
  private avisarAceptar: ((datos: {
    nombrePaciente: string;
    cedulaPaciente: string;
    telefonoPaciente?: string;
    estudiosSeleccionados: string[];
    formaPago: string;
  }) => void) | null = null;
  private avisarCancelar: (() => void) | null = null;

  constructor() {
    this.modal = document.getElementById("modalExamen");
    this.contenidoModal = document.getElementById("modal_contenido");
    this.botonCancelar = document.getElementById("modal_btnCancelar") as HTMLButtonElement;
    this.botonAceptar = document.getElementById("modal_btnAceptar") as HTMLButtonElement;

    if (this.modal) this.modal.style.display = "none";

    let yoMismo = this;
    if (this.botonCancelar) {
      this.botonCancelar.onclick = function() {
        if (yoMismo.avisarCancelar) yoMismo.avisarCancelar();
        yoMismo.ocultar();
      };
    }

    if (this.botonAceptar) {
      this.botonAceptar.onclick = function() {
        let nombre = (document.getElementById("modal_nombre") as HTMLInputElement)?.value || "";
        let cedula = (document.getElementById("modal_cedula") as HTMLInputElement)?.value || "";
        let telefono = (document.getElementById("modal_telefono") as HTMLInputElement)?.value || "";
        let metodoPago = (document.getElementById("modal_metodoPago") as HTMLSelectElement)?.value || "";

        let estudiosMarcados: string[] = [];
        let checkboxes = document.querySelectorAll(".modal-check-estudio:checked");
        for (let i = 0; i < checkboxes.length; i++) {
          estudiosMarcados.push((checkboxes[i] as HTMLInputElement).value);
        }

        // Validación de nombre
        if (nombre.trim() === "") {
          alert("⚠️ El nombre del paciente es obligatorio.");
          const inputNombre = document.getElementById("modal_nombre");
          if (inputNombre) {
            inputNombre.classList.add("error");
            inputNombre.focus();
          }
          return;
        }
        
        // Validación de cédula
        if (cedula.trim() === "") {
          alert("⚠️ La cédula del paciente es obligatoria.");
          const inputCedula = document.getElementById("modal_cedula");
          if (inputCedula) {
            inputCedula.classList.add("error");
            inputCedula.focus();
          }
          return;
        }
        
        // Validación de teléfono - AHORA ES REQUERIDO
        if (telefono.trim() === "") {
          alert("⚠️ El número de teléfono es obligatorio.");
          const inputTelefono = document.getElementById("modal_telefono");
          if (inputTelefono) {
            inputTelefono.classList.add("error");
            inputTelefono.focus();
          }
          return;
        }
        
        // Validación de formato de teléfono venezolano (acepta 0 al principio)
        const telefonoValido = yoMismo.validarTelefonoVenezuela(telefono);
        if (!telefonoValido.valido) {
          alert(telefonoValido.mensaje);
          const inputTelefono = document.getElementById("modal_telefono");
          if (inputTelefono) {
            inputTelefono.classList.add("error");
            inputTelefono.focus();
          }
          return;
        }
        
        // Validación de estudios seleccionados
        if (estudiosMarcados.length === 0) {
          alert("⚠️ Debe seleccionar al menos un estudio clínico para el paciente.");
          return;
        }

        if (yoMismo.avisarAceptar) {
          yoMismo.avisarAceptar({
            nombrePaciente: nombre,
            cedulaPaciente: cedula,
            telefonoPaciente: telefono,
            estudiosSeleccionados: estudiosMarcados,
            formaPago: metodoPago
          });
        }
      };
    }
  }

  /**
   * Valida números de teléfono venezolanos
   * Acepta formatos:
   * - 0412XXXXXXX
   * - 412XXXXXXX 
   * - +58412XXXXXXX 
   * - 58412XXXXXXX 
   */
  private validarTelefonoVenezuela(telefono: string): { valido: boolean; mensaje: string } {
    if (!telefono || telefono.trim() === "") {
      return { valido: false, mensaje: "El número de teléfono es obligatorio." };
    }
    
    // Limpiar espacios, guiones y puntos
    let telefonoLimpio = telefono.trim().replace(/[\s\-\.]/g, "");
    
    // Quitar prefijo +58 o 58 si existe
    let numeroLimpio = telefonoLimpio;
    if (telefonoLimpio.startsWith("+58")) {
      numeroLimpio = telefonoLimpio.substring(3);
    } else if (telefonoLimpio.startsWith("58")) {
      numeroLimpio = telefonoLimpio.substring(2);
    }
    
    // Verificar que solo tenga números
    if (!/^\d+$/.test(numeroLimpio)) {
      return { valido: false, mensaje: "El teléfono solo debe contener números y opcionalmente el prefijo +58" };
    }
    
    // Prefijos válidos de Venezuela (3 dígitos sin el 0)
    const prefijosValidos = ["412", "414", "424", "426", "416", "422"];
    
    // Caso 1: 10 dígitos (412 + 7 números) - formato sin 0
    if (numeroLimpio.length === 10) {
      const prefijo = numeroLimpio.substring(0, 3);
      if (prefijosValidos.includes(prefijo)) {
        return { valido: true, mensaje: "" };
      }
      return { valido: false, mensaje: "Prefijo no válido. Use: 0412, 0414, 0424, 0426, 0416 o 0422" };
    }
    
    // Caso 2: 11 dígitos (0412 + 7 números) - formato con 0 inicial (el más común en Venezuela)
    if (numeroLimpio.length === 11 && numeroLimpio.startsWith("0")) {
      const prefijo = numeroLimpio.substring(1, 4); // Toma los 3 dígitos después del 0
      if (prefijosValidos.includes(prefijo)) {
        return { valido: true, mensaje: "" };
      }
      return { valido: false, mensaje: "numero no válido. Use: 0412, 0414, 0424, 0426, 0416 o 0422" };
    }
    
    // Caso 3: 7 dígitos (solo números, sin prefijo)
    if (numeroLimpio.length === 7) {
      return { valido: true, mensaje: "" };
    }
    
    return { 
      valido: false, 
      mensaje: "Telefono invalido. Use: 0412XXXXXXX  o 412XXXXXXX" 
    };
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
  }) => void): void { 
    this.avisarAceptar = callback; 
  }

  public mostrar(): void {
    if (!this.contenidoModal || !this.modal) return;

    // Limpiar clases de error
    const inputNombre = document.getElementById("modal_nombre");
    const inputCedula = document.getElementById("modal_cedula");
    const inputTelefono = document.getElementById("modal_telefono");
    
    if (inputNombre) inputNombre.classList.remove("error");
    if (inputCedula) inputCedula.classList.remove("error");
    if (inputTelefono) inputTelefono.classList.remove("error");

    let checkboxesHtml = "";
    let estudios = Cl_mEstudio.obtenerTodos();
    
    for (let i = 0; i < estudios.length; i++) {
      let est = estudios[i];
      checkboxesHtml += `
        <div style="margin-bottom: 8px;">
          <input type="checkbox" class="modal-check-estudio" id="mod_est_${est.id}" value="${est.nombre}" data-precio="${est.precio}" style="margin-right: 8px; cursor: pointer;">
          <label for="mod_est_${est.id}" style="cursor: pointer;">${est.nombre} ($${est.precio})</label>
        </div>
      `;
    }

    if (estudios.length === 0) {
      checkboxesHtml = "<p style='color:#999; font-size:0.9rem;'>Cargando catálogo desde la nube...</p>";
    }

    this.contenidoModal.innerHTML = `
      <div style="margin-bottom: 12px;">
        <label style="display:block; margin-bottom:4px; font-weight:bold;">Nombre Completo: <span style="color:#c0392b;">*</span></label>
        <input type="text" id="modal_nombre" placeholder="Ej: Manuel Flores" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; box-sizing:border-box;">
      </div>
      <div style="margin-bottom: 12px;">
        <label style="display:block; margin-bottom:4px; font-weight:bold;">Cédula de Identidad: <span style="color:#c0392b;">*</span></label>
        <input type="text" id="modal_cedula" placeholder="Ej: V-12345678" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; box-sizing:border-box;">
      </div>
      <div style="margin-bottom: 12px;">
        <label style="display:block; margin-bottom:4px; font-weight:bold;">Teléfono: <span style="color:#c0392b;">*</span></label>
        <input type="tel" id="modal_telefono" placeholder="Ej: 04121234567" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; box-sizing:border-box;">
        <small style="color: #6c757d; font-size: 0.7rem;">numeros validos: 0412, 0414, 0424, 0426, 0416, 0422 </small>
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="display:block; margin-bottom:4px; font-weight:bold;">Estudios Solicitados: <span style="color:#c0392b;">*</span></label>
        <div style="background:#f9f9f9; padding:10px; border:1px solid #ddd; border-radius:6px; max-height:130px; overflow-y:auto;">
          ${checkboxesHtml}
        </div>
      </div>

      <div style="margin-bottom: 12px;">
        <label style="display:block; margin-bottom:4px; font-weight:bold;">Total Provisional ($):</label>
        <input type="number" id="modal_precio" value="0" readonly style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; background:#f0f0f0; font-weight:bold; color:#2e7d32; box-sizing:border-box;">
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="display:block; margin-bottom:4px; font-weight:bold;">Método de Pago: <span style="color:#c0392b;">*</span></label>
        <select id="modal_metodoPago" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; background:white; box-sizing:border-box;">
          <option value="Efectivo">Efectivo</option>
          <option value="Transferencia">Transferencia</option>
          <option value="Pago Móvil">Pago Móvil</option>
        </select>
      </div>
    `;

    let inputPrecio = document.getElementById("modal_precio") as HTMLInputElement;
    let checkboxes = document.querySelectorAll(".modal-check-estudio");
    
    for (let i = 0; i < checkboxes.length; i++) {
      let chk = checkboxes[i] as HTMLInputElement;
      chk.onchange = function() {
        let totalAcumulado = 0;
        let marcados = document.querySelectorAll(".modal-check-estudio:checked");
        for (let j = 0; j < marcados.length; j++) {
          let chkMarcado = marcados[j] as HTMLInputElement;
          totalAcumulado += parseFloat(chkMarcado.getAttribute("data-precio") || "0");
        }
        if (inputPrecio) inputPrecio.value = totalAcumulado.toString();
      };
    }

    this.modal.style.display = "flex";
  }

  public ocultar(): void {
    if (this.modal) this.modal.style.display = "none";
  }
}