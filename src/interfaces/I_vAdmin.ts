import Cl_mExamen from "../models/Cl_mExamen.js";
export interface I_vAdmin {
  cuandoClicEnNuevoExamen(callback: () => void): void;
  cuandoClicEnImprimir(callback: (idExamen: string) => void): void;
  mostrarFinalizados(datos: { examenes: Cl_mExamen[] }): void;
  mostrarReporte(reporte: string): void;
}