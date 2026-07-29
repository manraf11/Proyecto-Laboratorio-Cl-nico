// api/estudios.js - Versión con Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://ofhovlgfaghbqbfzagmc.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_izpbUwlI7NVGVjeUwPV1AQ_mMratSBB';

const supabase = createClient(supabaseUrl, supabaseKey);

function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
            try { resolve(body ? JSON.parse(body) : {}); } catch (e) { reject(e); }
        });
        req.on('error', reject);
    });
}

export default async function handler(req, res) {
    setCors(res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // GET - Listar estudios
        if (req.method === 'GET') {
            const { data, error } = await supabase
                .from('estudios')
                .select('*')
                .order('id');

            if (error) throw error;
            res.status(200).json(data);
            return;
        }

        const datos = await parseBody(req);

        // POST - Crear estudio
        if (req.method === 'POST') {
            const { data, error } = await supabase
                .from('estudios')
                .insert({
                    nombre: datos.nombre,
                    precio: datos.precio,
                    unidad: datos.unidad,
                    valores_referencia: datos.valoresReferencia || datos.valores_referencia
                })
                .select()
                .single();

            if (error) throw error;
            res.status(201).json(data);
            return;
        }

        // PUT - Actualizar estudio
        if (req.method === 'PUT') {
            const id = datos.id;
            if (!id) {
                res.status(400).json({ error: 'Falta el id del estudio' });
                return;
            }

            const { data, error } = await supabase
                .from('estudios')
                .update({
                    nombre: datos.nombre,
                    precio: datos.precio,
                    unidad: datos.unidad,
                    valores_referencia: datos.valoresReferencia || datos.valores_referencia,
                    updated_at: new Date().toISOString()
                })
                .eq('id', parseInt(id))
                .select()
                .single();

            if (error) throw error;
            res.status(200).json(data || { ok: true });
            return;
        }

        // DELETE - Eliminar estudio
        if (req.method === 'DELETE') {
            const id = req.query?.id || req.url?.split('/').pop();
            if (!id) {
                res.status(400).json({ error: 'Falta el id del estudio' });
                return;
            }

            const { error } = await supabase
                .from('estudios')
                .delete()
                .eq('id', parseInt(id));

            if (error) throw error;
            res.status(200).json({ ok: true });
            return;
        }

        res.status(405).json({ error: 'Método no permitido' });
    } catch (error) {
        console.error('❌ Error en /api/estudios:', error);
        res.status(500).json({ error: true, message: error.message || 'Error inesperado' });
    }
}