import Cl_mEstudio from "../models/Cl_mEstudio.js";
export default class Cl_sEstudio {
    static direccionWeb = "https://6a14b55c91ff9a63de06fced.mockapi.io/estudios";
    static async cargarCatálogo() {
        try {
            let respuesta = await fetch(this.direccionWeb);
            if (respuesta.ok) {
                let datosCrudos = await respuesta.json();
                Cl_mEstudio.limpiar();
                for (let i = 0; i < datosCrudos.length; i++) {
                    let e = datosCrudos[i];
                    Cl_mEstudio.agregarEstudio(new Cl_mEstudio({
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
        }
        catch {
            return false;
        }
    }
    static async guardarNuevoEstudio(estudio) {
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
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=Cl_sEstudio.js.map