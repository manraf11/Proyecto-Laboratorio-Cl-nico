// services/Cl_sEstudio.ts
import Cl_mEstudio from "../models/Cl_mEstudio.js";
const API_URL = "/api/estudios";
export default class Cl_sEstudio {
    static async cargarCatálogo() {
        try {
            const respuesta = await fetch(API_URL);
            if (!respuesta.ok) {
                console.error(`❌ Error HTTP: ${respuesta.status}`);
                return false;
            }
            const datos = await respuesta.json();
            if (!Array.isArray(datos)) {
                console.error('❌ La respuesta no es un array');
                return false;
            }
            // Limpiar la lista estática
            Cl_mEstudio.limpiar();
            // Agregar cada estudio a la lista estática
            for (const item of datos) {
                const estudio = new Cl_mEstudio({
                    id: String(item.id ?? ''),
                    nombre: item.nombre ?? '',
                    precio: Number(item.precio ?? 0),
                    unidad: item.unidad ?? '',
                    valoresReferencia: item.valores_referencia ?? item.valoresReferencia ?? ''
                });
                Cl_mEstudio.agregarEstudio(estudio);
            }
            console.log(`✅ Cargados ${datos.length} estudios desde Supabase`);
            console.log(`📋 Estudios en memoria: ${Cl_mEstudio.obtenerTodos().length}`);
            return true;
        }
        catch (error) {
            console.error('❌ Error al cargar estudios:', error);
            return false;
        }
    }
    static async guardarNuevoEstudio(estudio) {
        try {
            const respuesta = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: estudio.nombre,
                    precio: estudio.precio,
                    unidad: estudio.unidad,
                    valoresReferencia: estudio.valoresReferencia
                })
            });
            if (!respuesta.ok) {
                throw new Error(`HTTP ${respuesta.status}`);
            }
            const datos = await respuesta.json();
            if (datos.id) {
                estudio.id = String(datos.id);
                Cl_mEstudio.agregarEstudio(estudio);
            }
            return true;
        }
        catch (error) {
            console.error('❌ Error al guardar estudio:', error);
            return false;
        }
    }
    static async actualizarEstudio(estudio) {
        try {
            const respuesta = await fetch(`${API_URL}/${estudio.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: estudio.nombre,
                    precio: estudio.precio,
                    unidad: estudio.unidad,
                    valoresReferencia: estudio.valoresReferencia
                })
            });
            if (!respuesta.ok) {
                throw new Error(`HTTP ${respuesta.status}`);
            }
            // Actualizar en memoria
            Cl_mEstudio.actualizarEstudio(estudio.id, estudio);
            return true;
        }
        catch (error) {
            console.error('❌ Error al actualizar estudio:', error);
            return false;
        }
    }
    static async eliminarEstudio(id) {
        try {
            const respuesta = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            if (!respuesta.ok) {
                throw new Error(`HTTP ${respuesta.status}`);
            }
            Cl_mEstudio.eliminarEstudio(id);
            return true;
        }
        catch (error) {
            console.error('❌ Error al eliminar estudio:', error);
            return false;
        }
    }
}
//# sourceMappingURL=Cl_sEstudio.js.map