export default class Cl_mEstudio {
    static listaEstudios = [];
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
    static obtenerTodos() {
        return [...this.listaEstudios];
    }
    static limpiar() {
        this.listaEstudios = [];
    }
    static agregarEstudio(estudio) {
        this.listaEstudios.push(estudio);
    }
    static buscarPorNombre(nombre) {
        return this.listaEstudios.find(estudio => estudio.nombre === nombre);
    }
    static buscarPorId(id) {
        return this.listaEstudios.find(estudio => estudio.id === id);
    }
    static calcularPrecioTotal(nombresEstudios) {
        let total = 0;
        for (let nombre of nombresEstudios) {
            const estudio = this.buscarPorNombre(nombre);
            if (estudio) {
                total += estudio.precio;
            }
        }
        return total;
    }
    static obtenerValoresReferencia(nombreEstudio) {
        const estudio = this.buscarPorNombre(nombreEstudio);
        return estudio ? estudio.valoresReferencia : "No especificado";
    }
    static obtenerUnidad(nombreEstudio) {
        const estudio = this.buscarPorNombre(nombreEstudio);
        return estudio ? estudio.unidad : "";
    }
}
//# sourceMappingURL=Cl_mEstudio.js.map