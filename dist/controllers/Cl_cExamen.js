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
        if (this.pantallaExamen.cuandoRegistrenNuevoEstudio) {
            this.pantallaExamen.cuandoRegistrenNuevoEstudio((nuevoEstudio) => {
                yoMismo.alRegistrarEstudioCatalogo(nuevoEstudio);
            });
        }
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
    async alRegistrarEstudioCatalogo(estudio) {
        let exito = await Cl_sEstudio.guardarNuevoEstudio(estudio);
        if (exito) {
            alert(`¡Estudio "${estudio.nombre}" registrado con éxito en MockAPI!`);
            await Cl_sEstudio.cargarCatálogo();
            let inputNombre = document.getElementById("modal_nombre")?.value;
            let inputCedula = document.getElementById("modal_cedula")?.value;
            let inputTelef = document.getElementById("modal_telefono")?.value;
            this.pantallaExamen.mostrar();
            if (inputNombre)
                document.getElementById("modal_nombre").value = inputNombre;
            if (inputCedula)
                document.getElementById("modal_cedula").value = inputCedula;
            if (inputTelef)
                document.getElementById("modal_telefono").value = inputTelef;
        }
        else {
            alert("Error de comunicación: No se pudo almacenar el estudio clínico en MockAPI.");
        }
    }
}
//# sourceMappingURL=Cl_cExamen.js.map