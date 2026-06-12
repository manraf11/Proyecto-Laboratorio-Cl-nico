// services/Cl_sLaboratorio.ts
import Cl_mExamen from "../models/Cl_mExamen.js";
import Cl_mLaboratorio from "../models/Cl_mLaboratorio.js";

export default class Cl_sLaboratorio {
  private static direccionWeb: string = "https://6a14b55c91ff9a63de06fced.mockapi.io/examenes";

  static async guardarEnNube(examen: Cl_mExamen): Promise<{ ok: boolean; id?: string }> {
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
          referencia: examen.referencia || "",
          estado: examen.estado,
          fechaRegistro: examen.fechaRegistro
        })
      });
      if (respuesta.ok) {
        let datos = await respuesta.json();
        return { ok: true, id: datos.id };
      }
      return { ok: false };
    } catch {
      return { ok: false };
    }
  }

  static async traerDesdeNube(): Promise<{ ok: boolean; laboratorio: Cl_mLaboratorio }> {
    try {
      let respuesta = await fetch(this.direccionWeb);
      let laboratorio = new Cl_mLaboratorio();
      if (respuesta.ok) {
        let arregloCrudo = await respuesta.json();
        for (let i = 0; i < arregloCrudo.length; i++) {
          let c = arregloCrudo[i];
          
          let estadoExamen: "preparacion" | "pendiente" | "listo" = "preparacion";
          if (c.estado !== undefined && c.estado !== null) {
            const s = String(c.estado).toLowerCase();
            if (s === "listo" || s.includes("listo") || s.includes("finalizado")) {
              estadoExamen = "listo";
            } else if (s === "pendiente" || s.includes("pendiente")) {
              estadoExamen = "pendiente";
            } else if (s === "preparacion" || s.includes("preparaci")) {
              estadoExamen = "preparacion";
            } else {
              estadoExamen = "preparacion";
            }
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
            referencia: c.referencia || "",
            estado: estadoExamen,
            fechaRegistro: c.fechaRegistro
          });
          
          laboratorio.agregarExamen(examen);
        }
        return { ok: true, laboratorio: laboratorio };
      }
      return { ok: false, laboratorio: laboratorio };
    } catch {
      return { ok: false, laboratorio: new Cl_mLaboratorio() };
    }
  }

  static async actualizarEnNube(id: string, examen: Cl_mExamen): Promise<{ ok: boolean }> {
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
          referencia: examen.referencia || "",
          estado: examen.estado,
          fechaRegistro: examen.fechaRegistro
        })
      });
      return { ok: respuesta.ok };
    } catch {
      return { ok: false };
    }
  }

  static async buscarPorCedula(cedula: string): Promise<{ ok: boolean; registro?: any }> {
    try {
      let respuesta = await fetch(this.direccionWeb);
      if (!respuesta.ok) return { ok: false };
      let datos = await respuesta.json();
      for (let i = 0; i < datos.length; i++) {
        let r = datos[i];
        if (String(r.cedulaPaciente).trim() === String(cedula).trim()) {
          return { ok: true, registro: r };
        }
      }
      return { ok: true };
    } catch {
      return { ok: false };
    }
  }
}