export default class Cl_mEstudio {
  private static listaEstudios: Cl_mEstudio[] = [];
  
  public id: string;
  private _nombre: string;
  private _precio: number;
  private _unidad: string;
  private _valoresReferencia: string;

  constructor(datos: {
    id?: string;
    nombre: string;
    precio: number;
    unidad: string;
    valoresReferencia: string;
  }) {
    this.id = datos.id || "";
    this._nombre = datos.nombre;
    this._precio = datos.precio;
    this._unidad = datos.unidad;
    this._valoresReferencia = datos.valoresReferencia;
  }

  get nombre(): string { return this._nombre; }
  get precio(): number { return this._precio; }
  get unidad(): string { return this._unidad; }
  get valoresReferencia(): string { return this._valoresReferencia; }

  
  static obtenerTodos(): Cl_mEstudio[] {
    return [...this.listaEstudios];
  }

  static limpiar(): void {
    this.listaEstudios = [];
  }

  static agregarEstudio(estudio: Cl_mEstudio): void {
    this.listaEstudios.push(estudio);
  }

  static buscarPorNombre(nombre: string): Cl_mEstudio | undefined {
    return this.listaEstudios.find(estudio => estudio.nombre === nombre);
  }

  static buscarPorId(id: string): Cl_mEstudio | undefined {
    return this.listaEstudios.find(estudio => estudio.id === id);
  }

  static calcularPrecioTotal(nombresEstudios: string[]): number {
    let total = 0;
    for (let nombre of nombresEstudios) {
      const estudio = this.buscarPorNombre(nombre);
      if (estudio) {
        total += estudio.precio;
      }
    }
    return total;
  }

  static obtenerValoresReferencia(nombreEstudio: string): string {
    const estudio = this.buscarPorNombre(nombreEstudio);
    return estudio ? estudio.valoresReferencia : "No especificado";
  }

  static obtenerUnidad(nombreEstudio: string): string {
    const estudio = this.buscarPorNombre(nombreEstudio);
    return estudio ? estudio.unidad : "";
  }
}