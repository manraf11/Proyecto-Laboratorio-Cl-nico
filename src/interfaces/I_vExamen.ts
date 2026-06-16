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
  
  mostrarBuscandoCedula?: () => void;
  mostrarConsultandoAPI?: () => void;
  mostrarDatosPaciente?: (datos: { nombre: string; telefono: string; origen: string }) => void;
  mostrarMensajeExito?: (mensaje: string) => void;
  mostrarErrorBusqueda?: (mensaje: string) => void;
  enfocarCampoNombre?: () => void;
  restaurarPlaceholder?: () => void;
}