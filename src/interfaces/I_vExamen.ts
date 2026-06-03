export interface I_vExamen {
  cuandoDenCancelar(callback: () => void): void;
  cuandoDenAceptar(callback: (datos: any) => void): void;
  mostrar(): void;
  ocultar(): void;
}