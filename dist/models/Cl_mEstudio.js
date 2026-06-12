// models/Cl_mEstudio.ts
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
    set nombre(valor) { this._nombre = valor; }
    set precio(valor) { this._precio = valor; }
    set unidad(valor) { this._unidad = valor; }
    set valoresReferencia(valor) { this._valoresReferencia = valor; }
    static obtenerTodos() {
        return [...this.listaEstudios];
    }
    static limpiar() {
        this.listaEstudios = [];
    }
    static agregarEstudio(estudio) {
        this.listaEstudios.push(estudio);
    }
    static actualizarEstudio(id, estudioActualizado) {
        const index = this.listaEstudios.findIndex(e => e.id === id);
        if (index !== -1) {
            this.listaEstudios[index] = estudioActualizado;
            return true;
        }
        return false;
    }
    static eliminarEstudio(id) {
        const index = this.listaEstudios.findIndex(e => e.id === id);
        if (index !== -1) {
            this.listaEstudios.splice(index, 1);
            return true;
        }
        return false;
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
    static parseValoresReferencia(nombreEstudio) {
        const valorRef = this.obtenerValoresReferencia(nombreEstudio);
        if (!valorRef || typeof valorRef !== 'string')
            return null;
        const texto = valorRef.trim().toLowerCase();
        if (texto.startsWith("<")) {
            const num = parseFloat(texto.substring(1));
            if (!isNaN(num)) {
                return { max: num, operador: "<", valor: num };
            }
        }
        if (texto.startsWith(">")) {
            const num = parseFloat(texto.substring(1));
            if (!isNaN(num)) {
                return { min: num, operador: ">", valor: num };
            }
        }
        if (texto.startsWith("<=")) {
            const num = parseFloat(texto.substring(2));
            if (!isNaN(num)) {
                return { max: num, operador: "<=", valor: num };
            }
        }
        if (texto.startsWith(">=")) {
            const num = parseFloat(texto.substring(2));
            if (!isNaN(num)) {
                return { min: num, operador: ">=", valor: num };
            }
        }
        if (texto.includes("-")) {
            const partes = texto.split('-').map(p => p.trim());
            const min = parseFloat(partes[0]);
            const max = parseFloat(partes[1]);
            if (!isNaN(min) && !isNaN(max)) {
                return { min, max, operador: "rango" };
            }
        }
        const numExacto = parseFloat(texto);
        if (!isNaN(numExacto)) {
            return { min: numExacto, max: numExacto, operador: "exacto", valor: numExacto };
        }
        return null;
    }
    static evaluarResultado(nombreEstudio, valorResultado) {
        const referencia = this.parseValoresReferencia(nombreEstudio);
        if (!referencia) {
            return { esAlto: false, esBajo: false, mensaje: "" };
        }
        if (referencia.operador === "<") {
            if (valorResultado >= referencia.valor) {
                return { esAlto: true, esBajo: false, mensaje: `ALTO (debe ser < ${referencia.valor})` };
            }
            return { esAlto: false, esBajo: false, mensaje: "" };
        }
        if (referencia.operador === "<=") {
            if (valorResultado > referencia.valor) {
                return { esAlto: true, esBajo: false, mensaje: `ALTO (debe ser ≤ ${referencia.valor})` };
            }
            return { esAlto: false, esBajo: false, mensaje: "" };
        }
        if (referencia.operador === ">") {
            if (valorResultado <= referencia.valor) {
                return { esBajo: true, esAlto: false, mensaje: `BAJO (debe ser > ${referencia.valor})` };
            }
            return { esAlto: false, esBajo: false, mensaje: "" };
        }
        if (referencia.operador === ">=") {
            if (valorResultado < referencia.valor) {
                return { esBajo: true, esAlto: false, mensaje: `BAJO (debe ser ≥ ${referencia.valor})` };
            }
            return { esAlto: false, esBajo: false, mensaje: "" };
        }
        if (referencia.operador === "rango" && referencia.min !== undefined && referencia.max !== undefined) {
            if (valorResultado < referencia.min) {
                return { esBajo: true, esAlto: false, mensaje: `BAJO (referencia: ${referencia.min} - ${referencia.max})` };
            }
            if (valorResultado > referencia.max) {
                return { esAlto: true, esBajo: false, mensaje: `ALTO (referencia: ${referencia.min} - ${referencia.max})` };
            }
            return { esAlto: false, esBajo: false, mensaje: "" };
        }
        return { esAlto: false, esBajo: false, mensaje: "" };
    }
}
//# sourceMappingURL=Cl_mEstudio.js.map