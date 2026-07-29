import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://ofhovlgfaghbqbfzagmc.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_izpbUwlI7NVGVjeUwPV1AQ_mMratSBB';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // GET - Listar estudios
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('estudios')
        .select('id, nombre, precio, unidad, valores_referencia')
        .order('id');

      if (error) throw error;
      return res.status(200).json(data || []);
    }

    // POST - Crear estudio
    if (req.method === 'POST') {
      const { nombre, precio, unidad, valoresReferencia } = req.body;

      const { data, error } = await supabase
        .from('estudios')
        .insert({ nombre, precio, unidad, valores_referencia: valoresReferencia })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    }

    // PUT - Actualizar estudio (por ID en URL)
    if (req.method === 'PUT') {
      const id = req.url.split('/').pop();
      const { nombre, precio, unidad, valoresReferencia } = req.body;

      const { data, error } = await supabase
        .from('estudios')
        .update({
          nombre,
          precio,
          unidad,
          valores_referencia: valoresReferencia,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data || { ok: true });
    }

    // DELETE - Eliminar estudio
    if (req.method === 'DELETE') {
      const id = req.url.split('/').pop();

      const { error } = await supabase
        .from('estudios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Método no permitido' });

  } catch (error) {
    console.error('Error en /api/estudios:', error);
    return res.status(500).json({ error: true, message: error.message });
  }
}