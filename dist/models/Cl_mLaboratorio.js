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
            if (!this.listaExamenes[i].estaFinalizado) {
                pendientes.push(this.listaExamenes[i]);
            }
        }
        return pendientes;
    }
    obtenerFinalizados() {
        let finalizados = [];
        for (let i = 0; i < this.listaExamenes.length; i++) {
            if (this.listaExamenes[i].estaFinalizado) {
                finalizados.push(this.listaExamenes[i]);
            }
        }
        return finalizados;
    }
}
//# sourceMappingURL=Cl_mLaboratorio.js.map