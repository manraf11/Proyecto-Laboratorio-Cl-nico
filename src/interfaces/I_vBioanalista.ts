import Cl_mExamen from "../models/Cl_mExamen.js";
import Cl_mEstudio from "../models/Cl_mEstudio.js";

export interface I_vBioanalista {
  cuandoCargarResultados(callback: (idExamen: string, resultados: string[]) => void): void;
  cuandoFinalizarExamen(callback: (idExamen: string) => void): void;
  cuandoRegistrenNuevoEstudio?(callback: (estudio: Cl_mEstudio) => void): void;
  mostrarPendientes(datos: { examenes: Cl_mExamen[] }): void;
}