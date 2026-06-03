export default class Cl_mExamen {
    id;
    nombrePaciente;
    cedulaPaciente;
    telefonoPaciente;
    nombreEstudio;
    resultadoExamen;
    precioEstudio;
    formaPago;
    estaFinalizado;
    fechaRegistro;
    constructor(datos, catalogo) {
        this.id = datos.id || "";
        this.nombrePaciente = datos.nombrePaciente || "";
        this.cedulaPaciente = datos.cedulaPaciente || "";
        this.telefonoPaciente = datos.telefonoPaciente || "";
        this.formaPago = datos.formaPago || "";
        this.resultadoExamen = datos.resultadoExamen || "";
        this.estaFinalizado = datos.estaFinalizado || false;
        this.fechaRegistro = datos.fechaRegistro || new Date().toISOString();
        if (datos.estudiosSeleccionados && Array.isArray(datos.estudiosSeleccionados)) {
            this.nombreEstudio = datos.estudiosSeleccionados.join(", ");
            this.precioEstudio = catalogo.calcularPrecioTotal(datos.estudiosSeleccionados);
        }
        else if (datos.nombreEstudio) {
            this.nombreEstudio = datos.nombreEstudio;
            this.precioEstudio = Number(datos.precioEstudio) || 0;
        }
        else {
            this.nombreEstudio = "";
            this.precioEstudio = 0;
        }
    }
    obtenerArregloEstudios() {
        if (!this.nombreEstudio.trim())
            return [];
        return this.nombreEstudio.split(", ").map(item => item.trim());
    }
    obtenerArregloResultados() {
        if (!this.resultadoExamen.trim())
            return [];
        return this.resultadoExamen.split(", ").map(item => item.trim());
    }
}
//# sourceMappingURL=Cl_mExamen.js.map