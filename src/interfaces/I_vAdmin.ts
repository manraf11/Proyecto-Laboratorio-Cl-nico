// interfaces/I_vAdmin.ts - CORREGIDO
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
  mostrarResultadosobteneNombrePacientesPorEstudio(datos: { nombres: string[], tipoEstudio: string }): void;
  actualizarListaEstudios?(): void; 
  cuandoClicEnVerEstadisticasEstudio(callback: (tipoEstudio: string) => void): void;
  cuandoClicEnCalcularPorcentajeFinalizados(callback: () => void): void;
  cuandoClicEnCalcularPromedioEstudio(callback: (tipoEstudio: string) => void): void;
  
  mostrarEstadisticasEstudio(datos: { tipoEstudio: string; cantidad: number; total: number }): void;
  mostrarPorcentajeFinalizados(porcentaje: number): void;
  mostrarPromedioEstudio(datos: { tipoEstudio: string; promedio: number; cantidad: number }): void;

  // Métodos para gestión de usuarios
  cuandoClicEnMostrarCrearUsuario(callback: () => void): void;
  cuandoClicEnRecargarUsuarios(callback: () => void): void;
  cuandoClicEnGuardarNuevoUsuario(callback: () => void): void;
  cuandoClicEnCancelarCrearUsuario(callback: () => void): void;
  cuandoClicEnGuardarCambioPassword(callback: () => void): void;
  cuandoClicEnCancelarCambioPassword(callback: () => void): void;
  mostrarTablaUsuarios(usuarios: Array<{ id: number; nombre_usuario: string; nombre_completo: string; email: string; rol: string; activo: boolean; ultimo_acceso: string }>): void;
  mostrarErrorUsuarios(mensaje: string): void;
  mostrarResultadoCrearUsuario(mensaje: string, esError: boolean): void;
  mostrarResultadoCambiarPassword(mensaje: string, esError: boolean): void;
  mostrarModalCambiarPassword(usuarioId: number, usuarioNombre: string): void;
  ocultarModalCambiarPassword(): void;
  obtenerDatosNuevoUsuario(): { nombreUsuario: string; nombreCompleto: string; email: string; password: string; rol: string };
  obtenerDatosCambioPassword(): { password: string };
  limpiarFormularioCrearUsuario(): void;
  limpiarFormularioCambioPassword(): void;
  mostrarFormularioCrearUsuario(): void;
  ocultarFormularioCrearUsuario(): void;
}
