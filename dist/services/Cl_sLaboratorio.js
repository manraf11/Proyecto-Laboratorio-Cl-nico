import Cl_mExamen from "../models/Cl_mExamen.js";
import Cl_mLaboratorio from "../models/Cl_mLaboratorio.js";
export default class Cl_sLaboratorio {
    static direccionWeb = "https://6a14b55c91ff9a63de06fced.mockapi.io/examenes";
    static async guardarEnNube(examen) {
        try {
            let respuesta = await fetch(this.direccionWeb, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombrePaciente: examen.nombrePaciente,
                    cedulaPaciente: examen.cedulaPaciente,
                    telefonoPaciente: examen.telefonoPaciente,
                    nombreEstudio: examen.nombreEstudio,
                    resultadoExamen: examen.resultadoExamen,
                    precioEstudio: examen.precioEstudio,
                    formaPago: examen.formaPago,
                    estaFinalizado: examen.estaFinalizado,
                    fechaRegistro: examen.fechaRegistro
                })
            });
            if (respuesta.ok) {
                let datos = await respuesta.json();
                return { ok: true, id: datos.id };
            }
            return { ok: false };
        }
        catch {
            return { ok: false };
        }
    }
    static async traerDesdeNube() {
        try {
            let respuesta = await fetch(this.direccionWeb);
            let laboratorio = new Cl_mLaboratorio();
            if (respuesta.ok) {
                let arregloCrudo = await respuesta.json();
                for (let i = 0; i < arregloCrudo.length; i++) {
                    let c = arregloCrudo[i];
                    let examen = new Cl_mExamen({
                        id: c.id,
                        nombrePaciente: c.nombrePaciente,
                        cedulaPaciente: c.cedulaPaciente,
                        telefonoPaciente: c.telefonoPaciente,
                        nombreEstudio: c.nombreEstudio,
                        resultadoExamen: c.resultadoExamen,
                        precioEstudio: c.precioEstudio,
                        formaPago: c.formaPago,
                        estaFinalizado: c.estaFinalizado,
                        fechaRegistro: c.fechaRegistro
                    });
                    laboratorio.agregarExamen(examen);
                }
                return { ok: true, laboratorio: laboratorio };
            }
            return { ok: false, laboratorio: laboratorio };
        }
        catch {
            return { ok: false, laboratorio: new Cl_mLaboratorio() };
        }
    }
    static async actualizarEnNube(id, examen) {
        try {
            let respuesta = await fetch(`${this.direccionWeb}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombrePaciente: examen.nombrePaciente,
                    cedulaPaciente: examen.cedulaPaciente,
                    telefonoPaciente: examen.telefonoPaciente,
                    nombreEstudio: examen.nombreEstudio,
                    resultadoExamen: examen.resultadoExamen,
                    precioEstudio: examen.precioEstudio,
                    formaPago: examen.formaPago,
                    estaFinalizado: examen.estaFinalizado,
                    fechaRegistro: examen.fechaRegistro
                })
            });
            return { ok: respuesta.ok };
        }
        catch {
            return { ok: false };
        }
    }
}
//# sourceMappingURL=Cl_sLaboratorio.js.map