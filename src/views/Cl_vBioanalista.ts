import { I_vBioanalista } from "../interfaces/I_vBioanalista.js";
import Cl_mExamen from "../models/Cl_mExamen.js";
import Cl_mEstudio from "../models/Cl_mEstudio.js";

export default class Cl_vBioanalista implements I_vBioanalista {
  private divPendientes: HTMLElement;
  private avisarCargar: ((idExamen: string, resultados: string[]) => void) | null = null;
  private avisarFinalizar: ((idExamen: string) => void) | null = null;
  private avisarNuevoEstudio: ((estudio: Cl_mEstudio) => void) | null = null;

  constructor() {
    this.divPendientes = document.getElementById("listaPendientes") as HTMLElement;
    this.crearBotonNuevoEstudio();
  }

  private crearBotonNuevoEstudio(): void {
    // Crear contenedor para el botón
    const headerContainer = document.createElement("div");
    headerContainer.style.display = "flex";
    headerContainer.style.justifyContent = "flex-end";
    headerContainer.style.marginBottom = "20px";
    
    const btnNuevoEstudio = document.createElement("button");
    btnNuevoEstudio.textContent = "➕ Agregar Nuevo Estudio";
    btnNuevoEstudio.style.background = "#764ba2";
    btnNuevoEstudio.style.color = "white";
    btnNuevoEstudio.style.border = "none";
    btnNuevoEstudio.style.padding = "10px 20px";
    btnNuevoEstudio.style.borderRadius = "40px";
    btnNuevoEstudio.style.cursor = "pointer";
    btnNuevoEstudio.style.fontWeight = "600";
    btnNuevoEstudio.style.fontSize = "0.9rem";
    btnNuevoEstudio.style.transition = "all 0.2s";
    
    btnNuevoEstudio.onmouseenter = () => {
      btnNuevoEstudio.style.background = "#5a367a";
      btnNuevoEstudio.style.transform = "translateY(-1px)";
    };
    btnNuevoEstudio.onmouseleave = () => {
      btnNuevoEstudio.style.background = "#764ba2";
      btnNuevoEstudio.style.transform = "translateY(0)";
    };
    
    btnNuevoEstudio.onclick = () => this.mostrarModalNuevoEstudio();
    
    headerContainer.appendChild(btnNuevoEstudio);
    
    // Insertar al inicio del divPendientes
    if (this.divPendientes) {
      this.divPendientes.parentNode?.insertBefore(headerContainer, this.divPendientes);
    }
  }

  private mostrarModalNuevoEstudio(): void {
    // Crear modal si no existe
    let modal = document.getElementById("modalNuevoEstudioBio");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "modalNuevoEstudioBio";
      modal.style.position = "fixed";
      modal.style.top = "0";
      modal.style.left = "0";
      modal.style.width = "100%";
      modal.style.height = "100%";
      modal.style.background = "rgba(0,0,0,0.5)";
      modal.style.display = "none";
      modal.style.alignItems = "center";
      modal.style.justifyContent = "center";
      modal.style.zIndex = "1001";
      
      modal.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 28px; width: 450px; max-width: 92%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 35px rgba(0,0,0,0.2);">
          <h3 style="margin-bottom: 20px; color: #764ba2; border-left: 5px solid #ffc107; padding-left: 14px; font-weight: 600;">🧪 Registrar Nuevo Estudio Clínico</h3>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #2c3e50;">Nombre del Estudio:</label>
            <input type="text" id="nuevoEstudioNombre" placeholder="Ej: Hemoglobina" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #2c3e50;">Precio ($):</label>
            <input type="number" id="nuevoEstudioPrecio" placeholder="Ej: 25" step="0.01" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #2c3e50;">Unidad de Medida:</label>
            <input type="text" id="nuevoEstudioUnidad" placeholder="Ej: %, mg/dL, mmol/L" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #2c3e50;">Valores de Referencia:</label>
            <input type="text" id="nuevoEstudioReferencia" placeholder="Ej: 4.0 - 5.6 %" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px;">
          </div>
          
          <div id="estudioErrorBio" class="error-message" style="display: none; color: #c0392b; margin-bottom: 15px;"></div>
          
          <div style="display: flex; gap: 12px; margin-top: 10px;">
            <button id="modalEstudioCancelarBio" style="flex:1; padding: 10px; background: #eef2f7; border: 1px solid #cbd5e1; border-radius: 40px; cursor: pointer; font-weight: 600; color: #2c3e50;">Cancelar</button>
            <button id="modalEstudioGuardarBio" style="flex:1; padding: 10px; background: #764ba2; color: white; border: none; border-radius: 40px; cursor: pointer; font-weight: 600; transition: 0.2s;">Guardar Estudio</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    
    // Limpiar formulario
    const nombreInput = document.getElementById("nuevoEstudioNombre") as HTMLInputElement;
    const precioInput = document.getElementById("nuevoEstudioPrecio") as HTMLInputElement;
    const unidadInput = document.getElementById("nuevoEstudioUnidad") as HTMLInputElement;
    const referenciaInput = document.getElementById("nuevoEstudioReferencia") as HTMLInputElement;
    const errorDiv = document.getElementById("estudioErrorBio");
    
    if (nombreInput) nombreInput.value = "";
    if (precioInput) precioInput.value = "";
    if (unidadInput) unidadInput.value = "";
    if (referenciaInput) referenciaInput.value = "";
    if (errorDiv) errorDiv.style.display = "none";
    
    modal.style.display = "flex";
    
    // Configurar eventos
    const btnCancelar = document.getElementById("modalEstudioCancelarBio");
    const btnGuardar = document.getElementById("modalEstudioGuardarBio");
    
    const cerrarModal = () => { modal.style.display = "none"; };
    
    if (btnCancelar) {
      btnCancelar.onclick = cerrarModal;
    }
    
    if (btnGuardar) {
      btnGuardar.onclick = () => {
        const nombre = (document.getElementById("nuevoEstudioNombre") as HTMLInputElement)?.value.trim() || "";
        const precio = parseFloat((document.getElementById("nuevoEstudioPrecio") as HTMLInputElement)?.value || "0");
        const unidad = (document.getElementById("nuevoEstudioUnidad") as HTMLInputElement)?.value.trim() || "";
        const referencia = (document.getElementById("nuevoEstudioReferencia") as HTMLInputElement)?.value.trim() || "";
        
        if (!nombre) {
          if (errorDiv) {
            errorDiv.textContent = "El nombre del estudio es obligatorio";
            errorDiv.style.display = "block";
          }
          return;
        }
        
        if (isNaN(precio) || precio <= 0) {
          if (errorDiv) {
            errorDiv.textContent = "El precio debe ser un número mayor a 0";
            errorDiv.style.display = "block";
          }
          return;
        }
        
        if (!unidad) {
          if (errorDiv) {
            errorDiv.textContent = "La unidad de medida es obligatoria";
            errorDiv.style.display = "block";
          }
          return;
        }
        
        if (!referencia) {
          if (errorDiv) {
            errorDiv.textContent = "Los valores de referencia son obligatorios";
            errorDiv.style.display = "block";
          }
          return;
        }
        
        if (this.avisarNuevoEstudio) {
          const nuevoEstudio = new Cl_mEstudio({
            nombre: nombre,
            precio: precio,
            unidad: unidad,
            valoresReferencia: referencia
          });
          this.avisarNuevoEstudio(nuevoEstudio);
          cerrarModal();
        }
      };
    }
    
    // Cerrar al hacer clic fuera del modal
    modal.onclick = (e) => {
      if (e.target === modal) cerrarModal();
    };
  }

  public cuandoCargarResultados(callback: (idExamen: string, resultados: string[]) => void): void {
    this.avisarCargar = callback;
  }

  public cuandoFinalizarExamen(callback: (idExamen: string) => void): void {
    this.avisarFinalizar = callback;
  }

  public cuandoRegistrenNuevoEstudio(callback: (estudio: Cl_mEstudio) => void): void {
    this.avisarNuevoEstudio = callback;
  }

  public mostrarPendientes(datos: { examenes: Cl_mExamen[] }): void {
    if (!this.divPendientes) return;
    if (datos.examenes.length === 0) {
      this.divPendientes.innerHTML = '<div class="mensaje-vacio">No hay muestras analíticas pendientes en cola.</div>';
      return;
    }

    this.divPendientes.innerHTML = "";

    for (let i = 0; i < datos.examenes.length; i++) {
      let examen = datos.examenes[i];
      let listaEstudios = examen.obtenerArregloEstudios();
      let listaResultadosGuardados = examen.obtenerArregloResultados();

      let card = document.createElement("div");
      card.className = "orden-card";
      card.style.background = "white";
      card.style.border = "1px solid #e1e4e6";
      card.style.borderRadius = "12px";
      card.style.padding = "20px";
      card.style.marginBottom = "20px";
      card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";

      let htmlCamposEstudios = "";
      for (let j = 0; j < listaEstudios.length; j++) {
        let nombreEstudio = listaEstudios[j];
        let valorPrevio = listaResultadosGuardados[j] || "";

        htmlCamposEstudios += `
          <div style="margin-bottom: 12px; display: grid; grid-template-columns: 140px 1fr; align-items: center; gap: 10px;">
            <label style="font-weight: bold; color: #495057;">${this.escapeHtml(nombreEstudio)}:</label>
            <input type="text" class="resultado-input-${examen.id}" data-indice="${j}" value="${this.escapeHtml(valorPrevio)}" placeholder="Ingrese valor analítico obtenido" style="padding: 8px 12px; border: 1px solid #ced4da; border-radius: 6px; width: 100%; box-sizing: border-box;">
          </div>
        `;
      }

      let estadoBadge = "";
      if (examen.estado === "preparacion") {
        estadoBadge = '<span class="badge-pendiente" style="background:#ffc107; color:#1a3e4c;">PREPARACIÓN</span>';
      } else if (examen.estado === "pendiente") {
        estadoBadge = '<span class="badge-pendiente" style="background:#17a2b8; color:white;">PENDIENTE</span>';
      }

      card.innerHTML = `
        <div class="orden-header" style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; margin-bottom: 12px; border-bottom: 1px solid #e9f0f5; padding-bottom: 10px;">
          <div>
            <span class="orden-paciente" style="font-weight: 700; color: #0b3b4f; font-size: 1.1rem;">👤 ${this.escapeHtml(examen.nombrePaciente)}</span>
            ${estadoBadge}
          </div>
          <div class="orden-fecha" style="font-size: 0.75rem; color: #2c6e8f;">📅 ${new Date(examen.fechaRegistro).toLocaleDateString()}</div>
        </div>
        <div style="margin-bottom: 8px; font-size: 0.85rem; color: #5e7a93;">
          <strong>Cédula:</strong> ${this.escapeHtml(examen.cedulaPaciente)} | 
          <strong>Teléfono:</strong> ${this.escapeHtml(examen.telefonoPaciente || "No registrado")}
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #f1f3f5; margin-bottom: 15px;">
          <h4 style="margin: 0 0 12px 0; color: #495057; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">📊 Carga de Resultados Clínicos</h4>
          ${htmlCamposEstudios}
        </div>

        <div class="orden-acciones" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 14px; border-top: 1px solid #f0f4f9; padding-top: 14px;">
          <button class="btn-cargar" data-id="${examen.id}" style="flex: 1; padding: 10px; background: #007bff; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
            💾 Guardar Progreso
          </button>
          <button class="btn-finalizar" data-id="${examen.id}" style="flex: 1; padding: 10px; background: #28a745; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
            ✅ Finalizar Orden
          </button>
        </div>
      `;

      this.divPendientes.appendChild(card);

      let btnCargar = card.querySelector(".btn-cargar") as HTMLButtonElement;
      let btnFinalizar = card.querySelector(".btn-finalizar") as HTMLButtonElement;
      let yoMismo = this;

      btnCargar.onclick = function() {
        let inputs = card.querySelectorAll(`.resultado-input-${examen.id}`);
        let resultadosArreglo: string[] = [];

        for (let k = 0; k < inputs.length; k++) {
          let inp = inputs[k] as HTMLInputElement;
          resultadosArreglo.push(inp.value.trim() || "No realizado");
        }

        if (yoMismo.avisarCargar) yoMismo.avisarCargar(examen.id, resultadosArreglo);
      };

      btnFinalizar.onclick = function() {
        let inputs = card.querySelectorAll(`.resultado-input-${examen.id}`);
        for (let k = 0; k < inputs.length; k++) {
          if ((inputs[k] as HTMLInputElement).value.trim() === "") {
            alert(" rellenar todos los resultados antes finalizar.");
            return;
          }
        }
        if (confirm(`¿Está seguro de finalizar la orden de ${examen.nombrePaciente}?`)) {
          if (yoMismo.avisarFinalizar) yoMismo.avisarFinalizar(examen.id);
        }
      };
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}