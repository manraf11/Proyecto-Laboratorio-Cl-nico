import Cl_mExamen from "../models/Cl_mExamen.js";
export interface I_vBioanalista {
  cuandoCargarResultados(callback: (idExamen: string, resultados: string[]) => void): void;
  cuandoFinalizarExamen(callback: (idExamen: string) => void): void;
  mostrarPendientes(datos: { examenes: Cl_mExamen[] }): void;
}