export default class Cl_mCatalogoEstudios {
    listaEstudios = [];
    agregarEstudio(estudio) {
        this.listaEstudios.push(estudio);
    }
    obtenerTodos() {
        return [...this.listaEstudios];
    }
    limpiar() {
        this.listaEstudios = [];
    }
    buscarPorNombre(nombre) {
        return this.listaEstudios.find(estudio => estudio.nombre === nombre);
    }
    buscarPorId(id) {
        return this.listaEstudios.find(estudio => estudio.id === id);
    }
    calcularPrecioTotal(nombresEstudios) {
        let total = 0;
        for (let nombre of nombresEstudios) {
            const estudio = this.buscarPorNombre(nombre);
            if (estudio) {
                total += estudio.precio;
            }
        }
        return total;
    }
    obtenerValoresReferencia(nombreEstudio) {
        const estudio = this.buscarPorNombre(nombreEstudio);
        return estudio ? estudio.valoresReferencia : "No especificado";
    }
    obtenerUnidad(nombreEstudio) {
        const estudio = this.buscarPorNombre(nombreEstudio);
        return estudio ? estudio.unidad : "";
    }
}
//# sourceMappingURL=Cl_mCatalogoEstudios.js.map