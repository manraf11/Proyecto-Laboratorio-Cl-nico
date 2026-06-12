// controllers/Cl_cLaboratorioBio.ts
import Cl_mLaboratorio from "../models/Cl_mLaboratorio.js";
import Cl_mExamen from "../models/Cl_mExamen.js";
import Cl_mEstudio from "../models/Cl_mEstudio.js";
import Cl_sLaboratorio from "../services/Cl_sLaboratorio.js";
import Cl_sEstudio from "../services/Cl_sEstudio.js";
import { I_vBioanalista } from "../interfaces/I_vBioanalista.js";

export default class Cl_cLaboratorioBio {
  private laboratorio: Cl_mLaboratorio;
  private pantallaBioanalista: I_vBioanalista;
  private filtroEstadoActual: string = "todos";
  private busquedaIdActual: string = "";

  constructor(pantallaBioanalista: I_vBioanalista) {
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

  private async cargarExamenes() {
    let resultado = await Cl_sLaboratorio.traerDesdeNube();
    if (resultado.ok) {
      this.laboratorio = resultado.laboratorio;
      this.refrescarPantalla();
    }
  }

  private async cargarEstudios() {
    await Cl_sEstudio.cargarCatálogo();
    this.pantallaBioanalista.mostrarListaEstudios(Cl_mEstudio.obtenerTodos());
  }

  private refrescarPantalla() {
    let estados: ("preparacion" | "pendiente" | "listo")[] = [];
    
    if (this.filtroEstadoActual === "todos") {
      estados = ["preparacion", "pendiente"];
    } else if (this.filtroEstadoActual === "preparacion") {
      estados = ["preparacion"];
    } else if (this.filtroEstadoActual === "pendiente") {
      estados = ["pendiente"];
    }
    
    const examenesAMostrar = this.laboratorio.obtenerPorEstadosYId(estados, this.busquedaIdActual);
    
    this.pantallaBioanalista.mostrarPendientes({ 
      examenes: examenesAMostrar,
      filtroActual: this.filtroEstadoActual,
      busquedaId: this.busquedaIdActual
    });
  }

  private cambiarFiltroEstado(estado: string) {
    this.filtroEstadoActual = estado;
    this.refrescarPantalla();
  }

  private buscarPorId(id: string) {
    this.busquedaIdActual = id;
    this.refrescarPantalla();
  }

  private async guardarResultados(idExamen: string, resultados: string[]) {
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
      } else {
        alert("❌ Error al guardar los resultados.");
      }
    }
  }

  private async terminarExamen(idExamen: string) {
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
      } else {
        alert("❌ Error al finalizar la orden.");
      }
    }
  }

  private async registrarNuevoEstudio(estudio: Cl_mEstudio) {
    let exito = await Cl_sEstudio.guardarNuevoEstudio(estudio);
    if (exito) {
      alert(`✅ Estudio "${estudio.nombre}" registrado exitosamente.`);
      await this.cargarEstudios();
      await this.cargarExamenes();
    } else {
      alert("❌ Error: No se pudo almacenar el estudio.");
    }
  }

  private async editarEstudio(estudio: Cl_mEstudio) {
    let exito = await Cl_sEstudio.actualizarEstudio(estudio);
    if (exito) {
      alert(`✅ Estudio "${estudio.nombre}" actualizado correctamente.`);
      await this.cargarEstudios();
      await this.cargarExamenes();
    } else {
      alert("❌ Error al actualizar el estudio.");
    }
  }

  private async eliminarEstudio(id: string) {
    if (confirm("¿Está seguro de eliminar este estudio? Esta acción no se puede deshacer.")) {
      let exito = await Cl_sEstudio.eliminarEstudio(id);
      if (exito) {
        alert("✅ Estudio eliminado correctamente.");
        await this.cargarEstudios();
        await this.cargarExamenes();
      } else {
        alert("❌ Error al eliminar el estudio.");
      }
    }
  }
}