// models/Cl_mLaboratorio.ts
import Cl_mEstudio from "./Cl_mEstudio.js";
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
    buscarPorIdParcial(idParcial) {
        if (!idParcial || idParcial.trim() === "") {
            return [...this.listaExamenes];
        }
        const idBusqueda = idParcial.trim().toLowerCase();
        const resultados = [];
        for (let i = 0; i < this.listaExamenes.length; i++) {
            const examen = this.listaExamenes[i];
            if (!examen.id)
                continue;
            const idCompleto = examen.id.toLowerCase();
            const idCorto = examen.id.length > 6 ? examen.id.slice(-6).toLowerCase() : examen.id.toLowerCase();
            if (idCompleto.includes(idBusqueda) || idCorto.includes(idBusqueda)) {
                resultados.push(examen);
            }
        }
        return resultados;
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
    obtenerPorEstados(estados) {
        let filtrados = [];
        for (let i = 0; i < this.listaExamenes.length; i++) {
            if (estados.includes(this.listaExamenes[i].estado)) {
                filtrados.push(this.listaExamenes[i]);
            }
        }
        return filtrados;
    }
    obtenerPorEstadosYId(estados, idParcial = "") {
        let resultados = this.obtenerPorEstados(estados);
        if (idParcial && idParcial.trim() !== "") {
            const idBusqueda = idParcial.trim().toLowerCase();
            resultados = resultados.filter(examen => {
                if (!examen.id)
                    return false;
                const idCompleto = examen.id.toLowerCase();
                const idCorto = examen.id.length > 6 ? examen.id.slice(-6).toLowerCase() : examen.id.toLowerCase();
                return idCompleto.includes(idBusqueda) || idCorto.includes(idBusqueda);
            });
        }
        return resultados;
    }
    contarEstudiosPorTipo(tipoEstudio) {
        let tipoBusqueda = tipoEstudio.trim().toLowerCase();
        let cantidad = 0;
        for (let i = 0; i < this.listaExamenes.length; i++) {
            let examen = this.listaExamenes[i];
            let estudios = examen.obtenerArregloEstudios();
            for (let j = 0; j < estudios.length; j++) {
                if (estudios[j].toLowerCase() === tipoBusqueda)
                    cantidad++;
            }
        }
        return cantidad;
    }
    contarEstudiosPorFecha(fechaSeleccionada) {
        let fechaBusqueda = fechaSeleccionada.trim().slice(0, 10);
        if (fechaBusqueda.length !== 10)
            return 0;
        let cantidad = 0;
        for (let i = 0; i < this.listaExamenes.length; i++) {
            let examen = this.listaExamenes[i];
            if (this.normalizarFecha(examen.fechaRegistro) === fechaBusqueda) {
                cantidad += examen.obtenerArregloEstudios().length;
            }
        }
        return cantidad;
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
    calcularPorcentajeEstudio(tipoEstudio) {
        let cantidadTipoEstudio = 0;
        let totalEstudios = 0;
        for (let i = 0; i < this.listaExamenes.length; i++) {
            let examen = this.listaExamenes[i];
            let estudios = examen.obtenerArregloEstudios();
            for (let j = 0; j < estudios.length; j++) {
                totalEstudios++;
                if (estudios[j].toLowerCase() === tipoEstudio.toLowerCase()) {
                    cantidadTipoEstudio++;
                }
            }
        }
        if (totalEstudios === 0) {
            return 0;
        }
        let porcentaje = (cantidadTipoEstudio / totalEstudios) * 100;
        return Math.round(porcentaje * 100) / 100;
    }
    nombrepacientesporestudio(tipoEstudio) {
        let pacientes = [];
        let tipoBusqueda = tipoEstudio.trim().toLowerCase();
        for (let i = 0; i < this.listaExamenes.length; i++) {
            let examen = this.listaExamenes[i];
            let estudios = examen.obtenerArregloEstudios();
            for (let m = 0; m < estudios.length; m++) {
                if (estudios[m].toLowerCase() === tipoBusqueda) {
                    if (!pacientes.includes(examen.nombrePaciente)) {
                        pacientes.push(examen.nombrePaciente);
                    }
                }
            }
        }
        return pacientes;
    }
    obtenertotalporestudio(tipoEstudio) {
        let tipoBusqueda = tipoEstudio.trim();
        let cantidad = 0;
        const estudio = Cl_mEstudio.buscarPorNombre(tipoBusqueda);
        if (!estudio) {
            console.warn(`No se encontró el estudio: ${tipoEstudio}`);
            return 0;
        }
        const costoPorEstudio = estudio.precio;
        for (let i = 0; i < this.listaExamenes.length; i++) {
            let examen = this.listaExamenes[i];
            let estudios = examen.obtenerArregloEstudios();
            for (let m = 0; m < estudios.length; m++) {
                if (estudios[m].trim() === tipoBusqueda) {
                    cantidad++;
                }
            }
        }
        return costoPorEstudio * cantidad;
    }
}
//# sourceMappingURL=Cl_mLaboratorio.js.map