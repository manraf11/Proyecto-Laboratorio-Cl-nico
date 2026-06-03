export default class Cl_mEstudio {
    id;
    _nombre;
    _precio;
    _unidad;
    _valoresReferencia;
    constructor(datos) {
        this.id = datos.id || "";
        this._nombre = datos.nombre;
        this._precio = datos.precio;
        this._unidad = datos.unidad;
        this._valoresReferencia = datos.valoresReferencia;
    }
    get nombre() { return this._nombre; }
    get precio() { return this._precio; }
    get unidad() { return this._unidad; }
    get valoresReferencia() { return this._valoresReferencia; }
}
//# sourceMappingURL=Cl_mEstudio.js.map