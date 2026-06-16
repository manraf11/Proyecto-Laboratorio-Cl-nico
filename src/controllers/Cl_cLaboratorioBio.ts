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
      const estudios = examen.obtenerArregloEstudios();
      const placeholders = ["pendiente", "no realizado", "nr", "-", "n/a", "na"];
      
      let hayResultadosVacios = false;
      for (let i = 0; i < resultados.length; i++) {
        const r = resultados[i]?.trim() || "";
        if (r === "" || placeholders.includes(r.toLowerCase())) {
          hayResultadosVacios = true;
          break;
        }
      }
      
      if (hayResultadosVacios) {
        const confirmar = confirm(
          "⚠️ Algunos resultados están vacíos o tienen valores como 'pendiente'.\n" +
          "¿Desea guardarlos así? El examen permanecerá en PREPARACIÓN."
        );
        if (!confirmar) return;
      }
      
      examen.resultadoExamen = resultados.join(", ");
      
      if (!hayResultadosVacios && resultados.length === estudios.length) {
        examen.cambiarEstado("pendiente");
        alert("✅ Resultados guardados correctamente. El examen ahora está en estado PENDIENTE.");
      } else {
        examen.cambiarEstado("preparacion");
        alert("ℹ️ Resultados guardados. El examen permanece en PREPARACIÓN porque faltan resultados.");
      }
      
      let exito = await Cl_sLaboratorio.actualizarEnNube(examen.id, examen);
      if (exito.ok) {
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
    if (!estudio.nombre || estudio.nombre.trim() === "") {
      alert("❌ El nombre del estudio es obligatorio.");
      return;
    }
    
    if (estudio.precio <= 0) {
      alert("❌ El precio debe ser mayor a 0.");
      return;
    }
    
    if (!estudio.unidad || estudio.unidad.trim() === "") {
      alert("❌ La unidad de medida es obligatoria.");
      return;
    }
    
    if (!estudio.valoresReferencia || estudio.valoresReferencia.trim() === "") {
      alert("❌ Los valores de referencia son obligatorios.");
      return;
    }
    
    const existente = Cl_mEstudio.buscarPorNombre(estudio.nombre);
    if (existente) {
      alert(`❌ Ya existe un estudio con el nombre "${estudio.nombre}".`);
      return;
    }
    
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
    if (!estudio.nombre || estudio.nombre.trim() === "") {
      alert("❌ El nombre del estudio es obligatorio.");
      return;
    }
    
    if (estudio.precio <= 0) {
      alert("❌ El precio debe ser mayor a 0.");
      return;
    }
    
    if (!estudio.unidad || estudio.unidad.trim() === "") {
      alert("❌ La unidad de medida es obligatoria.");
      return;
    }
    
    if (!estudio.valoresReferencia || estudio.valoresReferencia.trim() === "") {
      alert("❌ Los valores de referencia son obligatorios.");
      return;
    }
    
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
    if (!id) {
      alert("❌ ID de estudio inválido.");
      return;
    }
    
    const estudio = Cl_mEstudio.buscarPorId(id);
    if (!estudio) {
      alert("❌ El estudio no existe.");
      return;
    }
    
    const todosLosExamenes = this.laboratorio.obtenerPorEstadosYId(["preparacion", "pendiente", "listo"]);
    let estaEnUso = false;
    for (const ex of todosLosExamenes) {
      const estudios = ex.obtenerArregloEstudios();
      if (estudios.includes(estudio.nombre)) {
        estaEnUso = true;
        break;
      }
    }
    
    if (estaEnUso) {
      const confirmar = confirm(
        `⚠️ El estudio "${estudio.nombre}" está siendo usado en algunos exámenes.\n` +
        `¿Está seguro de eliminarlo? Los exámenes existentes no se verán afectados.`
      );
      if (!confirmar) return;
    }
    
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