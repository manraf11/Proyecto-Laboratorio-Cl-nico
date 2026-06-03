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
      if (!this.listaExamenes[i].estaFinalizado) {
        pendientes.push(this.listaExamenes[i]);
      }
    }
    return pendientes;
  }

  public obtenerFinalizados(): Cl_mExamen[] {
    let finalizados: Cl_mExamen[] = [];
    for (let i = 0; i < this.listaExamenes.length; i++) {
      if (this.listaExamenes[i].estaFinalizado) {
        finalizados.push(this.listaExamenes[i]);
      }
    }
    return finalizados;
  }
}