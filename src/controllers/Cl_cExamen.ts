import { I_vExamen } from "../interfaces/I_vExamen.js";
import Cl_mExamen from "../models/Cl_mExamen.js";
import Cl_mEstudio from "../models/Cl_mEstudio.js";
import Cl_sEstudio from "../services/Cl_sEstudio.js";

export default class Cl_cExamen {
  private pantallaExamen: I_vExamen;
  private avisar: ((examen: Cl_mExamen | null) => void) | null = null;

  constructor(pantallaExamen: I_vExamen) {
    this.pantallaExamen = pantallaExamen;
    let yoMismo = this;
    
    this.pantallaExamen.cuandoDenCancelar(() => yoMismo.alCancelar());
    this.pantallaExamen.cuandoDenAceptar((datos: {
      nombrePaciente: string;
      cedulaPaciente: string;
      telefonoPaciente?: string;
      estudiosSeleccionados: string[];
      formaPago: string;
    }) => yoMismo.alAceptar(datos));
    // Eliminado: ya no hay cuandoRegistrenNuevoEstudio aquí
  }

  public async pedirDatosExamen(avisar: (examen: Cl_mExamen | null) => void) {
    this.avisar = avisar;
    await Cl_sEstudio.cargarCatálogo();
    this.pantallaExamen.mostrar();
  }

  private alCancelar() {
    if (this.avisar) this.avisar(null);
    this.pantallaExamen.ocultar();
  }

  private alAceptar(datos: {
    nombrePaciente: string;
    cedulaPaciente: string;
    telefonoPaciente?: string;
    estudiosSeleccionados: string[];
    formaPago: string;
  }) {
    if (this.avisar) {
      let nuevoExamen = new Cl_mExamen({
        nombrePaciente: datos.nombrePaciente,
        cedulaPaciente: datos.cedulaPaciente,
        telefonoPaciente: datos.telefonoPaciente,
        estudiosSeleccionados: datos.estudiosSeleccionados,
        formaPago: datos.formaPago
      });
      this.avisar(nuevoExamen);
    }
    this.pantallaExamen.ocultar();
  }
}