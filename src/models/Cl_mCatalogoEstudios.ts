import Cl_mEstudio from "./Cl_mEstudio.js";

export default class Cl_mCatalogoEstudios {
  private listaEstudios: Cl_mEstudio[] = [];

  agregarEstudio(estudio: Cl_mEstudio): void {
    this.listaEstudios.push(estudio);
  }

  obtenerTodos(): Cl_mEstudio[] {
    return [...this.listaEstudios];
  }

  limpiar(): void {
    this.listaEstudios = [];
  }

  buscarPorNombre(nombre: string): Cl_mEstudio | undefined {
    return this.listaEstudios.find(estudio => estudio.nombre === nombre);
  }

  buscarPorId(id: string): Cl_mEstudio | undefined {
    return this.listaEstudios.find(estudio => estudio.id === id);
  }

  calcularPrecioTotal(nombresEstudios: string[]): number {
    let total = 0;
    for (let nombre of nombresEstudios) {
      const estudio = this.buscarPorNombre(nombre);
      if (estudio) {
        total += estudio.precio;
      }
    }
    return total;
  }

  obtenerValoresReferencia(nombreEstudio: string): string {
    const estudio = this.buscarPorNombre(nombreEstudio);
    return estudio ? estudio.valoresReferencia : "No especificado";
  }

  obtenerUnidad(nombreEstudio: string): string {
    const estudio = this.buscarPorNombre(nombreEstudio);
    return estudio ? estudio.unidad : "";
  }
}