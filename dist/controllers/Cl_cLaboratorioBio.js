// controllers/Cl_cLaboratorioBio.ts
import Cl_mLaboratorio from "../models/Cl_mLaboratorio.js";
import Cl_mEstudio from "../models/Cl_mEstudio.js";
import Cl_sLaboratorio from "../services/Cl_sLaboratorio.js";
import Cl_sEstudio from "../services/Cl_sEstudio.js";
export default class Cl_cLaboratorioBio {
    laboratorio;
    pantallaBioanalista;
    filtroEstadoActual = "todos";
    busquedaIdActual = "";
    constructor(pantallaBioanalista) {
        this.pantallaBioanalista = pantallaBioanalista;
        this.laboratorio = new Cl_mLaboratorio();
        let yoMismo = this;
        this.cargarExamenes();
        this.cargarEstudios();
        this.pantallaBioanalista.cuandoCargarResultados((id, resultados) => yoMismo.guardarResultados(id, resultados));
        this.pantallaBioanalista.cuandoFinalizarExamen((id) => yoMismo.terminarExamen(id));
        this.pantallaBioanalista.cuandoCambiarFiltroEstado((estado) => yoMismo.cambiarFiltroEstado(estado));
        this.pantallaBioanalista.cuandoBuscarPorId((id) => yoMismo.buscarPorId(id));
        this.pantallaBioanalista.cuandoRegistrenNuevoEstudio((estudio) => yoMismo.registrarNuevoEstudio(estudio));
        this.pantallaBioanalista.cuandoEditarEstudio((estudio) => yoMismo.editarEstudio(estudio));
        this.pantallaBioanalista.cuandoEliminarEstudio((id) => yoMismo.eliminarEstudio(id));
    }
    async cargarExamenes() {
        let resultado = await Cl_sLaboratorio.traerDesdeNube();
        if (resultado.ok) {
            this.laboratorio = resultado.laboratorio;
            this.refrescarPantalla();
        }
    }
    async cargarEstudios() {
        await Cl_sEstudio.cargarCatálogo();
        this.pantallaBioanalista.mostrarListaEstudios(Cl_mEstudio.obtenerTodos());
    }
    refrescarPantalla() {
        let estados = [];
        if (this.filtroEstadoActual === "todos") {
            estados = ["preparacion", "pendiente"];
        }
        else if (this.filtroEstadoActual === "preparacion") {
            estados = ["preparacion"];
        }
        else if (this.filtroEstadoActual === "pendiente") {
            estados = ["pendiente"];
        }
        const examenesAMostrar = this.laboratorio.obtenerPorEstadosYId(estados, this.busquedaIdActual);
        this.pantallaBioanalista.mostrarPendientes({
            examenes: examenesAMostrar,
            filtroActual: this.filtroEstadoActual,
            busquedaId: this.busquedaIdActual
        });
    }
    cambiarFiltroEstado(estado) {
        this.filtroEstadoActual = estado;
        this.refrescarPantalla();
    }
    buscarPorId(id) {
        this.busquedaIdActual = id;
        this.refrescarPantalla();
    }
    async guardarResultados(idExamen, resultados) {
        let examen = this.laboratorio.buscarPorId(idExamen);
        if (examen && examen.id) {
            examen.resultadoExamen = resultados.join(", ");
            // CORRECCIÓN: Al guardar resultados, cambiar a estado "pendiente", NO a "listo"
            // Solo debe pasar a "listo" cuando el bioanalista haga clic en "Finalizar"
            examen.cambiarEstado("pendiente");
            let exito = await Cl_sLaboratorio.actualizarEnNube(examen.id, examen);
            if (exito.ok) {
                alert("✅ Resultados guardados correctamente. El examen ahora está en estado PENDIENTE.");
                await this.cargarExamenes();
            }
            else {
                alert("❌ Error al guardar los resultados.");
            }
        }
    }
    async terminarExamen(idExamen) {
        let examen = this.laboratorio.buscarPorId(idExamen);
        if (examen && examen.id) {
            if (!examen.puedeFinalizar()) {
                alert("⚠️ Debe cargar todos los resultados antes de finalizar.");
                return;
            }
            // CORRECCIÓN: Solo aquí se cambia a "listo"
            examen.cambiarEstado("listo");
            let exito = await Cl_sLaboratorio.actualizarEnNube(examen.id, examen);
            if (exito.ok) {
                alert(`✅ Orden de ${examen.nombrePaciente} completada exitosamente.`);
                await this.cargarExamenes();
            }
            else {
                alert("❌ Error al finalizar la orden.");
            }
        }
    }
    async registrarNuevoEstudio(estudio) {
        let exito = await Cl_sEstudio.guardarNuevoEstudio(estudio);
        if (exito) {
            alert(`✅ Estudio "${estudio.nombre}" registrado exitosamente.`);
            await this.cargarEstudios();
            await this.cargarExamenes();
        }
        else {
            alert("❌ Error: No se pudo almacenar el estudio.");
        }
    }
    async editarEstudio(estudio) {
        let exito = await Cl_sEstudio.actualizarEstudio(estudio);
        if (exito) {
            alert(`✅ Estudio "${estudio.nombre}" actualizado correctamente.`);
            await this.cargarEstudios();
            await this.cargarExamenes();
        }
        else {
            alert("❌ Error al actualizar el estudio.");
        }
    }
    async eliminarEstudio(id) {
        if (confirm("¿Está seguro de eliminar este estudio? Esta acción no se puede deshacer.")) {
            let exito = await Cl_sEstudio.eliminarEstudio(id);
            if (exito) {
                alert("✅ Estudio eliminado correctamente.");
                await this.cargarEstudios();
                await this.cargarExamenes();
            }
            else {
                alert("❌ Error al eliminar el estudio.");
            }
        }
    }
}
//# sourceMappingURL=Cl_cLaboratorioBio.js.map