import Cl_mExamen from "../models/Cl_mExamen.js";
import Cl_sEstudio from "../services/Cl_sEstudio.js";
export default class Cl_cExamen {
    pantallaExamen;
    avisar = null;
    constructor(pantallaExamen) {
        this.pantallaExamen = pantallaExamen;
        let yoMismo = this;
        this.pantallaExamen.cuandoDenCancelar(() => yoMismo.alCancelar());
        this.pantallaExamen.cuandoDenAceptar((datos) => yoMismo.alAceptar(datos));
        // Eliminado: ya no hay cuandoRegistrenNuevoEstudio aquí
    }
    async pedirDatosExamen(avisar) {
        this.avisar = avisar;
        await Cl_sEstudio.cargarCatálogo();
        this.pantallaExamen.mostrar();
    }
    alCancelar() {
        if (this.avisar)
            this.avisar(null);
        this.pantallaExamen.ocultar();
    }
    alAceptar(datos) {
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
//# sourceMappingURL=Cl_cExamen.js.map