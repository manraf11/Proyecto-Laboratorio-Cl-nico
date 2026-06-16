// interfaces/I_vAdmin.ts
import Cl_mExamen from "../models/Cl_mExamen.js";

export interface I_vAdmin {
  cuandoClicEnNuevoExamen(callback: () => void): void;
  cuandoClicEnImprimir(callback: (idExamen: string) => void): void;
  cuandoClicEnEnviarWhatsApp(callback: (idExamen: string) => void): void;
  cuandoClicEnFiltrarEstudios(callback: (tipoEstudio: string, fechaSeleccionada: string) => void): void;
  cuandoClicEnCalcularPorcentaje(callback: (tipoEstudio: string) => void): void;
  cuandoCLicEnObtenerNombres(callback: (tipoEstudio: string) => void): void;
  cuandoClicEnObtenerTotalPorEstudio(callback: (tipoEstudio: string) => void): void;
  mostrarFinalizados(datos: { examenes: Cl_mExamen[] }): void;
  mostrarResultadoFiltro(cantidad: number, tipoEstudio: string, fechaSeleccionada: string): void;
  mostrarResultadoPorcentaje(porcentaje: number, tipoEstudio: string): void;
  mostrarResultadoTotalPorEstudio(resultado: string): void;
  mostrarResultadosobtener9yMnTm4NSzvG9rrwjM2ec8xZgh1cafXH8(datos: { nombres: string[], tipoEstudio: string }): void;
  mostrarReporte(reporte: string): void;
  actualizarListaEstudios?(): void; 
  cuandoClicEnVerEstadisticasEstudio(callback: (tipoEstudio: string) => void): void;
  cuandoClicEnCalcularPorcentajeFinalizados(callback: () => void): void;
  cuandoClicEnCalcularPromedioEstudio(callback: (tipoEstudio: string) => void): void;
  
  mostrarEstadisticasEstudio(datos: { tipoEstudio: string; cantidad: number; total: number }): void;
  mostrarPorcentajeFinalizados(porcentaje: number): void;
  mostrarPromedioEstudio(datos: { tipoEstudio: string; promedio: number; cantidad: number }): void;
}