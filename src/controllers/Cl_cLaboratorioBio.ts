import Cl_mLaboratorio from "../models/Cl_mLaboratorio.js";
import Cl_sLaboratorio from "../services/Cl_sLaboratorio.js";
import { I_vBioanalista } from "../interfaces/I_vBioanalista.js";
import Cl_mCatalogoEstudios from "../models/Cl_mCatalogoEstudios.js";

export default class Cl_cLaboratorioBio {
  private laboratorio: Cl_mLaboratorio;
  private pantallaBioanalista: I_vBioanalista;
  private catalogoEstudios: Cl_mCatalogoEstudios;

  constructor(pantallaBioanalista: I_vBioanalista, catalogoEstudios: Cl_mCatalogoEstudios) {
    this.pantallaBioanalista = pantallaBioanalista;
    this.catalogoEstudios = catalogoEstudios;
    this.laboratorio = new Cl_mLaboratorio();
    
    let yoMismo = this;
    this.cargarExamenes();
    
    this.pantallaBioanalista.cuandoCargarResultados((id, resultados) => yoMismo.guardarResultados(id, resultados));
    this.pantallaBioanalista.cuandoFinalizarExamen((id) => yoMismo.terminarExamen(id));
  }

  private async cargarExamenes() {
    let resultado = await Cl_sLaboratorio.traerDesdeNube(this.catalogoEstudios);
    if (resultado.ok) {
      this.laboratorio = resultado.laboratorio;
      this.refrescarPantalla();
    }
  }

  private refrescarPantalla() {
    this.pantallaBioanalista.mostrarPendientes({ examenes: this.laboratorio.obtenerPendientes() });
  }

  private async guardarResultados(idExamen: string, resultados: string[]) {
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

  private async terminarExamen(idExamen: string) {
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