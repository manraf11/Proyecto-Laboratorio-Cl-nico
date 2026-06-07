// services/Cl_sLaboratorio.ts
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
                    estado: examen.estado, // ✅ CAMBIADO: usar estado en lugar de estaFinalizado
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
                    // ✅ Convertir el campo legacy "estaFinalizado" a "estado" si existe
                    let estadoExamen = "preparacion";
                    if (c.estado) {
                        estadoExamen = c.estado;
                    }
                    else if (c.estaFinalizado !== undefined) {
                        // Compatibilidad con datos antiguos
                        estadoExamen = c.estaFinalizado ? "listo" : "pendiente";
                    }
                    let examen = new Cl_mExamen({
                        id: c.id,
                        nombrePaciente: c.nombrePaciente,
                        cedulaPaciente: c.cedulaPaciente,
                        telefonoPaciente: c.telefonoPaciente,
                        nombreEstudio: c.nombreEstudio,
                        resultadoExamen: c.resultadoExamen,
                        precioEstudio: c.precioEstudio,
                        formaPago: c.formaPago,
                        estado: estadoExamen, // ✅ USAR estado
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
                    estado: examen.estado, // ✅ CAMBIADO: usar estado
                    fechaRegistro: examen.fechaRegistro
                })
            });
            return { ok: respuesta.ok };
        }
        catch {
            return { ok: false };
        }
    }
    static async contarEstudiosPorTipoYFecha(tipoEstudio, fechaSeleccionada) {
        try {
            let respuesta = await fetch(this.direccionWeb);
            if (!respuesta.ok) {
                return { ok: false, cantidad: 0, mensaje: "No se pudo obtener los registros desde MockAPI." };
            }
            let datosCrudos = await respuesta.json();
            let fechaBusqueda = fechaSeleccionada.trim().slice(0, 10);
            let tipoBusqueda = tipoEstudio.trim().toLowerCase();
            let cantidad = 0;
            for (let i = 0; i < datosCrudos.length; i++) {
                let registro = datosCrudos[i];
                if (!registro.fechaRegistro || !registro.nombreEstudio) {
                    continue;
                }
                let fechaRegistro = this.obtenerFechaISO(registro.fechaRegistro);
                if (fechaRegistro !== fechaBusqueda) {
                    continue;
                }
                let estudios = String(registro.nombreEstudio)
                    .split(",")
                    .map((item) => item.trim())
                    .filter((item) => item.length > 0);
                for (let j = 0; j < estudios.length; j++) {
                    if (estudios[j].toLowerCase() === tipoBusqueda) {
                        cantidad++;
                    }
                }
            }
            return { ok: true, cantidad };
        }
        catch {
            return { ok: false, cantidad: 0, mensaje: "Error de comunicación con MockAPI." };
        }
    }
    static obtenerFechaISO(valor) {
        try {
            return new Date(valor).toISOString().slice(0, 10);
        }
        catch {
            return "";
        }
    }
}
//# sourceMappingURL=Cl_sLaboratorio.js.map