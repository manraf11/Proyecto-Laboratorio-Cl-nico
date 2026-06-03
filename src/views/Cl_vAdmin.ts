import { I_vAdmin } from "../interfaces/I_vAdmin.js";
import Cl_mExamen from "../models/Cl_mExamen.js";

export default class Cl_vAdmin implements I_vAdmin {
  private divFinalizados: HTMLElement;
  private divFormulario: HTMLElement;
  private botonNuevoExamen: HTMLButtonElement | null = null;
  private avisarImprimir: ((idExamen: string) => void) | null = null;

  constructor() {
    this.divFinalizados = document.getElementById("admin_finalizados") as HTMLElement;
    this.divFormulario = document.getElementById("admin_formulario") as HTMLElement;
    this.mostrarFormulario();
  }

  public cuandoClicEnNuevoExamen(avisar: () => void): void {
    if (this.botonNuevoExamen) this.botonNuevoExamen.onclick = avisar;
  }

  public cuandoClicEnImprimir(avisar: (idExamen: string) => void): void {
    this.avisarImprimir = avisar;
  }

  public mostrarFormulario(): void {
    if (!this.divFormulario) return;
    this.divFormulario.innerHTML = `
      <button id="botonAbrirModal" style="width:100%; padding:12px; background:linear-gradient(135deg, #764ba2 0%, #667eea 100%); color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer; font-size:1rem;">
        + Registrar Orden de Examen
      </button>
    `;
    this.botonNuevoExamen = document.getElementById("botonAbrirModal") as HTMLButtonElement;
  }

  public mostrarFinalizados(datos: { examenes: Cl_mExamen[] }): void {
    if (!this.divFinalizados) return;
    if (datos.examenes.length === 0) {
      this.divFinalizados.innerHTML = "<div class='mensaje-vacio'>No hay exámenes listos para imprimir el día de hoy.</div>";
      return;
    }

    let html = `
      <table style="width:100%; border-collapse:collapse; text-align:left;">
        <thead>
          <tr style="background:#f4f6f9; border-bottom:2px solid #eee;">
            <th style="padding:12px;">Paciente</th>
            <th style="padding:12px;">Cédula</th>
            <th style="padding:12px;">Estudios Realizados</th>
            <th style="padding:12px;">Total Cobrado</th>
            <th style="padding:12px; text-align:center;">Acciones</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (let i = 0; i < datos.examenes.length; i++) {
      let ex = datos.examenes[i];
      html += `
        <tr style="border-bottom:1px solid #f9f9f9;">
          <td style="padding:12px; font-weight:500;">${ex.nombrePaciente}</td>
          <td style="padding:12px; color:#666;">${ex.cedulaPaciente}</td>
          <td style="padding:12px;"><span style="background:#e8eaf6; color:#3f51b5; padding:4px 10px; border-radius:12px; font-size:0.85rem; font-weight:500;">${ex.nombreEstudio}</span></td>
          <td style="padding:12px; font-weight:bold; color:#2e7d32;">$${ex.precioEstudio}.00</td>
          <td style="padding:12px; text-align:center;">
            <button class="btn-imprimir" data-id="${ex.id}" style="padding:6px 14px; background:#764ba2; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">
              Imprimir Reporte
            </button>
          </td>
        </tr>
      `;
    }
    html += "</tbody></table>";
    this.divFinalizados.innerHTML = html;

    let botones = this.divFinalizados.querySelectorAll(".btn-imprimir");
    let yoMismo = this;
    for (let i = 0; i < botones.length; i++) {
      let btn = botones[i] as HTMLButtonElement;
      btn.onclick = function() {
        let id = btn.getAttribute("data-id") || "";
        if (yoMismo.avisarImprimir) yoMismo.avisarImprimir(id);
      };
    }
  }

  public mostrarReporte(reporte: string): void {
    let ventana = window.open("", "_blank");
    if (ventana) {
      ventana.document.write(`<html><head><title>Impresión de Resultados</title></head><body>${reporte}</body></html>`);
      ventana.document.close();
      ventana.print();
    }
  }
}