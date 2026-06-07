// interfaces/I_vAdmin.ts
import Cl_mExamen from "../models/Cl_mExamen.js";

export interface I_vAdmin {
  cuandoClicEnNuevoExamen(callback: () => void): void;
  cuandoClicEnImprimir(callback: (idExamen: string) => void): void;
  cuandoClicEnEnviarWhatsApp(callback: (idExamen: string) => void): void;
  cuandoClicEnFiltrarEstudios(callback: (tipoEstudio: string, fechaSeleccionada: string) => void): void;
  mostrarFinalizados(datos: { examenes: Cl_mExamen[] }): void;
  mostrarResultadoFiltro(cantidad: number, tipoEstudio: string, fechaSeleccionada: string): void;
  mostrarReporte(reporte: string): void;
  actualizarListaEstudios?(): void; 
}