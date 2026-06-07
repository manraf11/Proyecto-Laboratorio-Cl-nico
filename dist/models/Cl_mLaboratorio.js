export default class Cl_mLaboratorio {
    listaExamenes = [];
    constructor() {
        this.listaExamenes = [];
    }
    agregarExamen(examen) {
        this.listaExamenes.push(examen);
    }
    buscarPorId(id) {
        for (let i = 0; i < this.listaExamenes.length; i++) {
            if (this.listaExamenes[i].id === id) {
                return this.listaExamenes[i];
            }
        }
        return null;
    }
    obtenerPendientes() {
        let pendientes = [];
        for (let i = 0; i < this.listaExamenes.length; i++) {
            if (this.listaExamenes[i].estado !== "listo") {
                pendientes.push(this.listaExamenes[i]);
            }
        }
        return pendientes;
    }
    obtenerFinalizados() {
        let finalizados = [];
        for (let i = 0; i < this.listaExamenes.length; i++) {
            if (this.listaExamenes[i].estado === "listo") {
                finalizados.push(this.listaExamenes[i]);
            }
        }
        return finalizados;
    }
    // ✅ Nuevo método: obtener exámenes por múltiples estados
    obtenerPorEstados(estados) {
        let filtrados = [];
        for (let i = 0; i < this.listaExamenes.length; i++) {
            if (estados.includes(this.listaExamenes[i].estado)) {
                filtrados.push(this.listaExamenes[i]);
            }
        }
        return filtrados;
    }
    contarEstudiosPorTipoYFecha(tipoEstudio, fechaSeleccionada) {
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
    normalizarFecha(fecha) {
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
//# sourceMappingURL=Cl_mLaboratorio.js.map