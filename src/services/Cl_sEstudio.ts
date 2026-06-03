import Cl_mEstudio from "../models/Cl_mEstudio.js";
import Cl_mCatalogoEstudios from "../models/Cl_mCatalogoEstudios.js";

export default class Cl_sEstudio {
  private static direccionWeb: string = "https://6a14b55c91ff9a63de06fced.mockapi.io/estudios";

  static async cargarCatálogo(catalogo: Cl_mCatalogoEstudios): Promise<boolean> {
    try {
      let respuesta = await fetch(this.direccionWeb);
      if (respuesta.ok) {
        let datosCrudos = await respuesta.json();
        
        catalogo.limpiar();
        
        for (let i = 0; i < datosCrudos.length; i++) {
          let e = datosCrudos[i];
          catalogo.agregarEstudio(new Cl_mEstudio({
            id: e.id,
            nombre: e.nombre,
            precio: Number(e.precio),
            unidad: e.unidad,
            valoresReferencia: e.valoresReferencia
          }));
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  static async guardarNuevoEstudio(estudio: Cl_mEstudio): Promise<boolean> {
    try {
      let respuesta = await fetch(this.direccionWeb, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: estudio.nombre,
          precio: estudio.precio,
          unidad: estudio.unidad,
          valoresReferencia: estudio.valoresReferencia
        })
      });
      return respuesta.ok;
    } catch {
      return false;
    }
  }
}