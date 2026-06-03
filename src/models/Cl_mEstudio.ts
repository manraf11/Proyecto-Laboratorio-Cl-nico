export default class Cl_mEstudio {
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
}