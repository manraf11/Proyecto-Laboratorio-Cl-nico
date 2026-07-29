// services/Cl_sEstudio.ts
import { supabase } from '../config/database.js';
import Cl_mEstudio from "../models/Cl_mEstudio.js";

export default class Cl_sEstudio {
    static async cargarCatálogo(): Promise<boolean> {
        try {
            const { data, error } = await supabase
                .from('estudios')
                .select('*')
                .order('id');

            if (error) {
                console.error('❌ Error al cargar estudios:', error);
                return false;
            }

            Cl_mEstudio.limpiar();

            for (const item of data || []) {
                const estudio = new Cl_mEstudio({
                    id: String(item.id),
                    nombre: item.nombre || '',
                    precio: Number(item.precio || 0),
                    unidad: item.unidad || '',
                    valoresReferencia: item.valores_referencia || ''
                });
                Cl_mEstudio.agregarEstudio(estudio);
            }

            console.log(`✅ Cargados ${data?.length || 0} estudios desde Supabase`);
            return true;
        } catch (error) {
            console.error('❌ Error al cargar estudios:', error);
            return false;
        }
    }

    static async guardarNuevoEstudio(estudio: Cl_mEstudio): Promise<boolean> {
        try {
            const { data, error } = await supabase
                .from('estudios')
                .insert({
                    nombre: estudio.nombre,
                    precio: estudio.precio,
                    unidad: estudio.unidad,
                    valores_referencia: estudio.valoresReferencia
                })
                .select()
                .single();

            if (error) {
                console.error('❌ Error al guardar estudio:', error);
                return false;
            }

            if (data) {
                (estudio as any).id = String(data.id);
                Cl_mEstudio.agregarEstudio(estudio);
            }
            return true;
        } catch (error) {
            console.error('❌ Error al guardar estudio:', error);
            return false;
        }
    }

    static async actualizarEstudio(estudio: Cl_mEstudio): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('estudios')
                .update({
                    nombre: estudio.nombre,
                    precio: estudio.precio,
                    unidad: estudio.unidad,
                    valores_referencia: estudio.valoresReferencia,
                    updated_at: new Date().toISOString()
                })
                .eq('id', parseInt(estudio.id));

            if (error) {
                console.error('❌ Error al actualizar estudio:', error);
                return false;
            }

            Cl_mEstudio.actualizarEstudio(estudio.id, estudio);
            return true;
        } catch (error) {
            console.error('❌ Error al actualizar estudio:', error);
            return false;
        }
    }

    static async eliminarEstudio(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('estudios')
                .delete()
                .eq('id', parseInt(id));

            if (error) {
                console.error('❌ Error al eliminar estudio:', error);
                return false;
            }

            Cl_mEstudio.eliminarEstudio(id);
            return true;
        } catch (error) {
            console.error('❌ Error al eliminar estudio:', error);
            return false;
        }
    }
}