// interfaces/I_vExamen.ts
import Cl_mEstudio from "../models/Cl_mEstudio.js";

export interface I_vExamen {
  cuandoDenCancelar(callback: () => void): void;
  cuandoDenAceptar(callback: (datos: {
    nombrePaciente: string;
    cedulaPaciente: string;
    telefonoPaciente?: string;
    estudiosSeleccionados: string[];
    formaPago: string;
    referencia?: string;
  }) => void): void;
  mostrar(): void;
  ocultar(): void;
  cuandoRegistrenNuevoEstudio?: (callback: (estudio: Cl_mEstudio) => void) => void;
  
  mostrarErrores?: (errores: string[]) => void;
  cuandoBusquenCedula?: (callback: (cedula: string) => void) => void;
}