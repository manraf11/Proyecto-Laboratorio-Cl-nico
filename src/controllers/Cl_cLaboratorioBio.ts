// controllers/Cl_cLaboratorioBio.ts
import Cl_mLaboratorio from "../models/Cl_mLaboratorio.js";
import Cl_mExamen from "../models/Cl_mExamen.js";
import Cl_sLaboratorio from "../services/Cl_sLaboratorio.js";
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
  }

  private async cargarExamenes() {
    let resultado = await Cl_sLaboratorio.traerDesdeNube();
    if (resultado.ok) {
      this.laboratorio = resultado.laboratorio;
      this.refrescarPantalla();
    }
  }

  private refrescarPantalla() {
    // El bioanalista ve exámenes en estado "preparacion" (recién registrados) y "pendiente" (en proceso)
    let examenesTrabajo = this.laboratorio.obtenerPorEstados(["preparacion", "pendiente"]);
    this.pantallaBioanalista.mostrarPendientes({ examenes: examenesTrabajo });
  }

  private async guardarResultados(idExamen: string, resultados: string[]) {
    let examen = this.laboratorio.buscarPorId(idExamen);
    if (examen && examen.id) {
      examen.resultadoExamen = resultados.join(", ");
      
      // Si estaba en preparación y ya tiene resultados, pasa a pendiente
      if (examen.estado === "preparacion" && resultados.some(r => r.trim() !== "")) {
        examen.cambiarEstado("pendiente");
      }
      
      let exito = await Cl_sLaboratorio.actualizarEnNube(examen.id, examen);
      if (exito.ok) {
        alert(`Resultados guardados. El examen ahora está en estado: ${examen.estado.toUpperCase()}`);
        await this.cargarExamenes();
      }
    }
  }

  private async terminarExamen(idExamen: string) {
    let examen = this.laboratorio.buscarPorId(idExamen);
    if (examen && examen.id) {
      // Usar la lógica del modelo para verificar si puede finalizar
      if (!examen.puedeFinalizar()) {
        alert("Error: Debe cargar todos los resultados antes de finalizar el examen.");
        return;
      }
      
      // Cambiar a estado "listo" (el administrador luego enviará WhatsApp)
      examen.cambiarEstado("listo");
      
      let exito = await Cl_sLaboratorio.actualizarEnNube(examen.id, examen);
      if (exito.ok) {
        alert(`✅ Orden de ${examen.nombrePaciente} completada y marcada como "LISTO".\nEl administrador se encargará de enviar los resultados por WhatsApp.`);
        await this.cargarExamenes();
      }
    }
  }
}