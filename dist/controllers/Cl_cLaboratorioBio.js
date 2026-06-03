import Cl_mLaboratorio from "../models/Cl_mLaboratorio.js";
import Cl_sLaboratorio from "../services/Cl_sLaboratorio.js";
export default class Cl_cLaboratorioBio {
    laboratorio;
    pantallaBioanalista;
    constructor(pantallaBioanalista) {
        this.pantallaBioanalista = pantallaBioanalista;
        this.laboratorio = new Cl_mLaboratorio();
        let yoMismo = this;
        this.cargarExamenes();
        this.pantallaBioanalista.cuandoCargarResultados((id, resultados) => yoMismo.guardarResultados(id, resultados));
        this.pantallaBioanalista.cuandoFinalizarExamen((id) => yoMismo.terminarExamen(id));
    }
    async cargarExamenes() {
        let resultado = await Cl_sLaboratorio.traerDesdeNube();
        if (resultado.ok) {
            this.laboratorio = resultado.laboratorio;
            this.refrescarPantalla();
        }
    }
    refrescarPantalla() {
        this.pantallaBioanalista.mostrarPendientes({ examenes: this.laboratorio.obtenerPendientes() });
    }
    async guardarResultados(idExamen, resultados) {
        let examen = this.laboratorio.buscarPorId(idExamen);
        if (examen && examen.id) {
            examen.resultadoExamen = resultados.join(", ");
            let exito = await Cl_sLaboratorio.actualizarEnNube(examen.id, examen);
            if (exito.ok) {
                alert("Resultados parciales guardados en la orden.");
                await this.cargarExamenes();
            }
        }
    }
    async terminarExamen(idExamen) {
        let examen = this.laboratorio.buscarPorId(idExamen);
        if (examen && examen.id) {
            if (!examen.resultadoExamen.trim()) {
                alert("Error: No se puede finalizar una orden médica que no tiene ningún resultado cargado.");
                return;
            }
            examen.estaFinalizado = true;
            let exito = await Cl_sLaboratorio.actualizarEnNube(examen.id, examen);
            if (exito.ok) {
                alert(`Orden de ${examen.nombrePaciente} completada y enviada a Administración.`);
                await this.cargarExamenes();
            }
        }
    }
}
//# sourceMappingURL=Cl_cLaboratorioBio.js.map