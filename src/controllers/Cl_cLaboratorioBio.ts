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

  constructor(pantallaBioanalista: I_vBioanalista) {
    this.pantallaBioanalista = pantallaBioanalista;
    this.laboratorio = new Cl_mLaboratorio();
    
    let yoMismo = this;
    this.cargarExamenes();
    
    this.pantallaBioanalista.cuandoCargarResultados((id, resultados) => yoMismo.guardarResultados(id, resultados));
    this.pantallaBioanalista.cuandoFinalizarExamen((id) => yoMismo.terminarExamen(id));
    
    // Registrar callback para nuevo estudio
    if (this.pantallaBioanalista.cuandoRegistrenNuevoEstudio) {
      this.pantallaBioanalista.cuandoRegistrenNuevoEstudio((nuevoEstudio) => yoMismo.registrarNuevoEstudio(nuevoEstudio));
    }
  }

  private async cargarExamenes() {
    let resultado = await Cl_sLaboratorio.traerDesdeNube();
    if (resultado.ok) {
      this.laboratorio = resultado.laboratorio;
      this.refrescarPantalla();
    }
  }

  private refrescarPantalla() {
    let examenesTrabajo = this.laboratorio.obtenerPorEstados(["preparacion", "pendiente"]);
    this.pantallaBioanalista.mostrarPendientes({ examenes: examenesTrabajo });
  }

  private async guardarResultados(idExamen: string, resultados: string[]) {
    let examen = this.laboratorio.buscarPorId(idExamen);
    if (examen && examen.id) {
      examen.resultadoExamen = resultados.join(", ");
      
      if (examen.estado === "preparacion" && resultados.some(r => r.trim() !== "" && r !== "No realizado")) {
        examen.cambiarEstado("pendiente");
      }
      
      let exito = await Cl_sLaboratorio.actualizarEnNube(examen.id, examen);
      if (exito.ok) {
        alert("✅ Resultados guardados correctamente.");
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
    let exito = await Cl_sEstudio.guardarNuevoEstudio(estudio);
    if (exito) {
      alert(`✅ Estudio "${estudio.nombre}" registrado exitosamente en el catálogo.`);
      await Cl_sEstudio.cargarCatálogo();
      await this.cargarExamenes();
    } else {
      alert("❌ Error: No se pudo almacenar el estudio en la nube.");
    }
  }
}