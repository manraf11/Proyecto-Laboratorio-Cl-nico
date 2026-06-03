import { I_vBioanalista } from "../interfaces/I_vBioanalista.js";
import Cl_mExamen from "../models/Cl_mExamen.js";

export default class Cl_vBioanalista implements I_vBioanalista {
  private divPendientes: HTMLElement;
  private avisarCargar: ((idExamen: string, resultados: string[]) => void) | null = null;
  private avisarFinalizar: ((idExamen: string) => void) | null = null;

  constructor() {
    this.divPendientes = document.getElementById("listaPendientes") as HTMLElement;
  }

  public cuandoCargarResultados(callback: (idExamen: string, resultados: string[]) => void): void {
    this.avisarCargar = callback;
  }

  public cuandoFinalizarExamen(callback: (idExamen: string) => void): void {
    this.avisarFinalizar = callback;
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
      card.className = "card-paciente";
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
            <label style="font-weight: bold; color: #495057;">${nombreEstudio}:</label>
            <input type="text" class="resultado-input-${examen.id}" data-indice="${j}" value="${valorPrevio}" placeholder="Ingrese valor analítico obtenido" style="padding: 8px 12px; border: 1px solid #ced4da; border-radius: 6px; width: 100%; box-sizing: border-box;">
          </div>
        `;
      }

      card.innerHTML = `
        <div style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
          <h3 style="color: #007bff; margin: 0 0 5px 0;">Paciente: ${examen.nombrePaciente}</h3>
          <p style="margin: 0; font-size: 0.9rem; color: #6c757d;"><strong>Cédula:</strong> ${examen.cedulaPaciente} | <strong>Teléfono:</strong> ${examen.telefonoPaciente}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #f1f3f5; margin-bottom: 15px;">
          <h4 style="margin: 0 0 12px 0; color: #495057; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">Carga de Resultados Clínicos</h4>
          ${htmlCamposEstudios}
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn-cargar" data-id="${examen.id}" style="flex: 1; padding: 10px; background: #007bff; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
            Guardar Progreso
          </button>
          <button class="btn-finalizar" data-id="${examen.id}" style="flex: 1; padding: 10px; background: #28a745; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
            Finalizar Orden
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
            alert("Atención: Debe rellenar todos los resultados analíticos antes de poder finalizar la orden médica.");
            return;
          }
        }
        if (confirm(`¿Está seguro de cerrar permanentemente la orden de ${examen.nombrePaciente}?`)) {
          if (yoMismo.avisarFinalizar) yoMismo.avisarFinalizar(examen.id);
        }
      };
    }
  }
}