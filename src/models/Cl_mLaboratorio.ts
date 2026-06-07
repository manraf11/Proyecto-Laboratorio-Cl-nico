// models/Cl_mLaboratorio.ts
import Cl_mExamen from "./Cl_mExamen.js";

export default class Cl_mLaboratorio {
  private listaExamenes: Cl_mExamen[] = [];

  constructor() {
    this.listaExamenes = [];
  }

  public agregarExamen(examen: Cl_mExamen): void {
    this.listaExamenes.push(examen);
  }

  public buscarPorId(id: string): Cl_mExamen | null {
    for (let i = 0; i < this.listaExamenes.length; i++) {
      if (this.listaExamenes[i].id === id) {
        return this.listaExamenes[i];
      }
    }
    return null;
  }

  public obtenerPendientes(): Cl_mExamen[] {
    let pendientes: Cl_mExamen[] = [];
    for (let i = 0; i < this.listaExamenes.length; i++) {
      if (this.listaExamenes[i].estado !== "listo") {
        pendientes.push(this.listaExamenes[i]);
      }
    }
    return pendientes;
  }

  public obtenerFinalizados(): Cl_mExamen[] {
    let finalizados: Cl_mExamen[] = [];
    for (let i = 0; i < this.listaExamenes.length; i++) {
      if (this.listaExamenes[i].estado === "listo") {
        finalizados.push(this.listaExamenes[i]);
      }
    }
    return finalizados;
  }

  // obteniene examenes por estados
  public obtenerPorEstados(estados: ("preparacion" | "pendiente" | "listo")[]): Cl_mExamen[] {
    let filtrados: Cl_mExamen[] = [];
    for (let i = 0; i < this.listaExamenes.length; i++) {
      if (estados.includes(this.listaExamenes[i].estado)) {
        filtrados.push(this.listaExamenes[i]);
      }
    }
    return filtrados;
  }

  public contarEstudiosPorTipoYFecha(tipoEstudio: string, fechaSeleccionada: string): number {
    let tipoBusqueda = tipoEstudio.trim().toLowerCase();
    let fechaBusqueda = fechaSeleccionada.trim().slice(0, 10);
    let cantidad = 0;

    if (fechaBusqueda.length !== 10) {
      return 0;
    }

    for (let i = 0; i < this.listaExamenes.length; i++) {
      let examen = this.listaExamenes[i];
      if (this.normalizarFecha(examen.fechaRegistro) !== fechaBusqueda) {
        continue;
      }

      let estudios = examen.obtenerArregloEstudios();
      for (let j = 0; j < estudios.length; j++) {
        if (estudios[j].toLowerCase() === tipoBusqueda) {
          cantidad++;
        }
      }
    }

    return cantidad;
  }

  private normalizarFecha(fecha: string): string {
    let fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
      return "";
    }

    let year = fechaObj.getFullYear();
    let month = String(fechaObj.getMonth() + 1).padStart(2, "0");
    let day = String(fechaObj.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }
}