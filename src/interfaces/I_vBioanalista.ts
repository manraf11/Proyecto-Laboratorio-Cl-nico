// interfaces/I_vBioanalista.ts
import Cl_mExamen from "../models/Cl_mExamen.js";
import Cl_mEstudio from "../models/Cl_mEstudio.js";

export interface I_vBioanalista {
  cuandoCargarResultados(callback: (idExamen: string, resultados: string[]) => void): void;
  cuandoFinalizarExamen(callback: (idExamen: string) => void): void;
  cuandoCambiarFiltroEstado(callback: (estado: string) => void): void;
  cuandoBuscarPorId(callback: (id: string) => void): void;
  cuandoRegistrenNuevoEstudio(callback: (estudio: Cl_mEstudio) => void): void;
  cuandoEditarEstudio(callback: (estudio: Cl_mEstudio) => void): void;
  cuandoEliminarEstudio(callback: (id: string) => void): void;
  mostrarPendientes(datos: { 
    examenes: Cl_mExamen[];
    filtroActual?: string;
    busquedaId?: string;
  }): void;
  mostrarListaEstudios(estudios: Cl_mEstudio[]): void;
}