import Cl_mEstudio from "../models/Cl_mEstudio.js";

export interface I_vExamen {
  cuandoDenCancelar(callback: () => void): void;
  cuandoDenAceptar(callback: (datos: {
    nombrePaciente: string;
    cedulaPaciente: string;
    telefonoPaciente?: string;
    estudiosSeleccionados: string[];
    formaPago: string;
  }) => void): void;
  mostrar(): void;
  ocultar(): void;
  cuandoRegistrenNuevoEstudio?: (callback: (estudio: Cl_mEstudio) => void) => void;
}