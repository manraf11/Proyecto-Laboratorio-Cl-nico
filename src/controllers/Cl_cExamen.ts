import { I_vExamen } from "../interfaces/I_vExamen.js";
import Cl_mExamen from "../models/Cl_mExamen.js";
import Cl_mEstudio from "../models/Cl_mEstudio.js";
import Cl_mCatalogoEstudios from "../models/Cl_mCatalogoEstudios.js";
import Cl_sEstudio from "../services/Cl_sEstudio.js";

export default class Cl_cExamen {
  private pantallaExamen: I_vExamen;
  private avisar: any;
  private catalogoEstudios: Cl_mCatalogoEstudios;

  constructor(pantallaExamen: I_vExamen, catalogoEstudios: Cl_mCatalogoEstudios) {
    this.pantallaExamen = pantallaExamen;
    this.catalogoEstudios = catalogoEstudios;
    let yoMismo = this;
    
    this.pantallaExamen.cuandoDenCancelar(() => yoMismo.alCancelar());
    this.pantallaExamen.cuandoDenAceptar((datos: any) => yoMismo.alAceptar(datos));
    
    if ('cuandoRegistrenNuevoEstudio' in this.pantallaExamen) {
      (this.pantallaExamen as any).cuandoRegistrenNuevoEstudio((nuevoEstudio: Cl_mEstudio) => {
        yoMismo.alRegistrarEstudioCatalogo(nuevoEstudio);
      });
    }
  }

  public async pedirDatosExamen(avisar: any) {
    this.avisar = avisar;
    
    await Cl_sEstudio.cargarCatálogo(this.catalogoEstudios);
    
    this.pantallaExamen.mostrar();
  }

  private alCancelar() {
    if (this.avisar) this.avisar(null);
    this.pantallaExamen.ocultar();
  }

  private alAceptar(datos: any) {
    if (this.avisar) {
      let nuevoExamen = new Cl_mExamen({
        nombrePaciente: datos.nombrePaciente,
        cedulaPaciente: datos.cedulaPaciente,
        telefonoPaciente: datos.telefonoPaciente,
        estudiosSeleccionados: datos.estudiosSeleccionados,
        formaPago: datos.formaPago
      }, this.catalogoEstudios);
      this.avisar(nuevoExamen);
    }
    this.pantallaExamen.ocultar();
  }

  private async alRegistrarEstudioCatalogo(estudio: Cl_mEstudio) {
    let exito = await Cl_sEstudio.guardarNuevoEstudio(estudio);
    if (exito) {
      alert(`¡Estudio "${estudio.nombre}" registrado con éxito en MockAPI!`);
      
      await Cl_sEstudio.cargarCatálogo(this.catalogoEstudios);
      
      let inputNombre = (document.getElementById("modal_nombre") as HTMLInputElement)?.value;
      let inputCedula = (document.getElementById("modal_cedula") as HTMLInputElement)?.value;
      let inputTelef = (document.getElementById("modal_telefono") as HTMLInputElement)?.value;
      
      this.pantallaExamen.mostrar();
      
      if (inputNombre) (document.getElementById("modal_nombre") as HTMLInputElement).value = inputNombre;
      if (inputCedula) (document.getElementById("modal_cedula") as HTMLInputElement).value = inputCedula;
      if (inputTelef) (document.getElementById("modal_telefono") as HTMLInputElement).value = inputTelef;
    } else {
      alert("Error de comunicación: No se pudo almacenar el estudio clínico en MockAPI.");
    }
  }
}