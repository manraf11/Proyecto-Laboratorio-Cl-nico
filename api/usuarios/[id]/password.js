import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://ofhovlgfaghbqbfzagmc.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_izpbUwlI7NVGVjeUwPV1AQ_mMratSBB';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, mensaje: 'Método no permitido' });
  }

  try {
    const { id } = req.query;
    const { password } = req.body;

    if (!password || password.trim().length < 4) {
      return res.status(400).json({ success: false, mensaje: 'La contraseña debe tener al menos 4 caracteres' });
    }

    const passwordHash = Buffer.from(password.trim()).toString('base64');

    const { error } = await supabase
      .from('usuarios')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({ success: true, mensaje: 'Contraseña actualizada exitosamente' });

  } catch (error) {
    console.error('Error PUT password:', error);
    return res.status(500).json({ success: false, mensaje: 'Error al cambiar contraseña' });
  }
}