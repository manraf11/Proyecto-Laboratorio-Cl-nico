import { IDatosExamen } from "./I_Examen.js";

export interface I_vExamen {
  cuandoDenCancelar(callback: () => void): void;
  cuandoDenAceptar(callback: (datos: IDatosExamen) => void): void;
  mostrar(): void;
  ocultar(): void;
}