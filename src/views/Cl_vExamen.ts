import { I_vExamen } from "../interfaces/I_vExamen.js";
import Cl_mEstudio from "../models/Cl_mEstudio.js";
import Cl_mCatalogoEstudios from "../models/Cl_mCatalogoEstudios.js";

export default class Cl_vExamen implements I_vExamen {
  private modal: HTMLElement | null;
  private contenidoModal: HTMLElement | null;
  private botonCancelar: HTMLButtonElement | null;
  private botonAceptar: HTMLButtonElement | null;
  private avisarAceptar: any;
  private avisarCancelar: any;
  private avisarNuevoEstudio: ((estudio: Cl_mEstudio) => void) | null = null;
  private catalogoEstudios: Cl_mCatalogoEstudios;

  constructor(catalogoEstudios: Cl_mCatalogoEstudios) {
    this.catalogoEstudios = catalogoEstudios;
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

        if (nombre.trim() === "" || cedula.trim() === "") {
          alert("Debe ingresar obligatoriamente el Nombre y la Cédula del paciente.");
          return;
        }
        if (estudiosMarcados.length === 0) {
          alert("Debe marcar al menos un estudio clínico para el paciente.");
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

  public cuandoDenCancelar(callback: () => void): void { this.avisarCancelar = callback; }
  public cuandoDenAceptar(callback: (datos: any) => void): void { this.avisarAceptar = callback; }
  
  public cuandoRegistrenNuevoEstudio(callback: (estudio: Cl_mEstudio) => void): void {
    this.avisarNuevoEstudio = callback;
  }

  public mostrar(): void {
    if (!this.contenidoModal || !this.modal) return;

    let checkboxesHtml = "";
    let estudios = this.catalogoEstudios.obtenerTodos();
    
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
        <label style="display:block; margin-bottom:4px; font-weight:bold;">Nombre Completo:</label>
        <input type="text" id="modal_nombre" placeholder="Ej: Manuel Flores" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; box-sizing:border-box;">
      </div>
      <div style="margin-bottom: 12px;">
        <label style="display:block; margin-bottom:4px; font-weight:bold;">Cédula de Identidad:</label>
        <input type="text" id="modal_cedula" placeholder="Ej: V-12345678" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; box-sizing:border-box;">
      </div>
      <div style="margin-bottom: 12px;">
        <label style="display:block; margin-bottom:4px; font-weight:bold;">Teléfono:</label>
        <input type="text" id="modal_telefono" placeholder="Ej: 0412-1234567" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; box-sizing:border-box;">
      </div>
      
      <div style="margin-bottom: 12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <label style="font-weight:bold;">Estudios Solicitados:</label>
          <a href="#" id="linkToggleEstudio" style="font-size:0.85rem; color:#764ba2; font-weight:bold; text-decoration:none;">[+] Crear Nuevo Estudio</a>
        </div>
        
        <div id="seccionNuevoEstudio" style="display:none; background:#f0ebf7; padding:12px; border:1px solid #764ba2; border-radius:6px; margin-bottom:10px;">
          <h4 style="margin:0 0 8px 0; color:#764ba2; font-size:0.9rem;">Nuevo Tipo de Estudio Clínico</h4>
          <input type="text" id="add_est_nombre" placeholder="Nombre (Ej: Perfil 20)" style="width:100%; padding:6px; margin-bottom:6px; border:1px solid #ccc; border-radius:4px; font-size:0.85rem;">
          <div style="display:flex; gap:6px; margin-bottom:6px;">
            <input type="number" id="add_est_precio" placeholder="Precio $" style="flex:1; padding:6px; border:1px solid #ccc; border-radius:4px; font-size:0.85rem;">
            <input type="text" id="add_est_unidad" placeholder="Unidad (mg/dL)" style="flex:1; padding:6px; border:1px solid #ccc; border-radius:4px; font-size:0.85rem;">
          </div>
          <input type="text" id="add_est_referencia" placeholder="Valores de Referencia (Ej: 70 - 110)" style="width:100%; padding:6px; margin-bottom:8px; border:1px solid #ccc; border-radius:4px; font-size:0.85rem;">
          <button type="button" id="btnGuardarEstudioCatalogo" style="width:100%; padding:6px; background:#764ba2; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer; font-size:0.85rem;">Guardar en Catálogo</button>
        </div>

        <div style="background:#f9f9f9; padding:10px; border:1px solid #ddd; border-radius:6px; max-height:130px; overflow-y:auto;">
          ${checkboxesHtml}
        </div>
      </div>

      <div style="margin-bottom: 12px;">
        <label style="display:block; margin-bottom:4px; font-weight:bold;">Total Provisional ($):</label>
        <input type="number" id="modal_precio" value="0" readonly style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; background:#f0f0f0; font-weight:bold; color:#2e7d32; box-sizing:border-box;">
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="display:block; margin-bottom:4px; font-weight:bold;">Método de Pago:</label>
        <select id="modal_metodoPago" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; background:white; box-sizing:border-box;">
          <option value="Efectivo">Efectivo</option>
          <option value="Transferencia">Transferencia</option>
          <option value="Pago Móvil">Pago Móvil</option>
        </select>
      </div>
    `;

    let linkToggle = document.getElementById("linkToggleEstudio");
    let seccionNuevo = document.getElementById("seccionNuevoEstudio");
    if (linkToggle && seccionNuevo) {
      linkToggle.onclick = function(e) {
        e.preventDefault();
        seccionNuevo.style.display = seccionNuevo.style.display === "none" ? "block" : "none";
      };
    }

    let btnGuardarEstudio = document.getElementById("btnGuardarEstudioCatalogo");
    let yoMismo = this;
    if (btnGuardarEstudio) {
      btnGuardarEstudio.onclick = function() {
        let nomEst = (document.getElementById("add_est_nombre") as HTMLInputElement).value;
        let preEst = parseFloat((document.getElementById("add_est_precio") as HTMLInputElement).value);
        let uniEst = (document.getElementById("add_est_unidad") as HTMLInputElement).value;
        let refEst = (document.getElementById("add_est_referencia") as HTMLInputElement).value;

        if (!nomEst.trim() || isNaN(preEst) || !uniEst.trim() || !refEst.trim()) {
          alert("Debe rellenar todos los campos del nuevo estudio correctamente.");
          return;
        }

        if (yoMismo.avisarNuevoEstudio) {
          yoMismo.avisarNuevoEstudio(new Cl_mEstudio({
            nombre: nomEst,
            precio: preEst,
            unidad: uniEst,
            valoresReferencia: refEst
          }));
        }
      };
    }

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