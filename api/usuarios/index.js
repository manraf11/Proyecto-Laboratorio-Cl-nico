import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://ofhovlgfaghbqbfzagmc.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_izpbUwlI7NVGVjeUwPV1AQ_mMratSBB';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET - Listar usuarios
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nombre_usuario, nombre_completo, email, rol, activo, ultimo_acceso, created_at')
        .order('id');

      if (error) throw error;
      return res.status(200).json(data || []);
    } catch (error) {
      console.error('Error GET usuarios:', error);
      return res.status(500).json({ success: false, mensaje: 'Error al listar usuarios' });
    }
  }

  // POST - Crear usuario
  if (req.method === 'POST') {
    try {
      const { nombreUsuario, nombreCompleto, email, password, rol } = req.body;

      if (!nombreUsuario || !nombreCompleto || !email || !password || !rol) {
        return res.status(400).json({ success: false, mensaje: 'Todos los campos son requeridos' });
      }

      const passwordHash = Buffer.from(password.trim()).toString('base64');

      const { data, error } = await supabase
        .from('usuarios')
        .insert({
          nombre_usuario: nombreUsuario.trim().toLowerCase(),
          nombre_completo: nombreCompleto.trim(),
          email: email.trim().toLowerCase(),
          password_hash: passwordHash,
          rol: rol,
          activo: true
        })
        .select('id, nombre_usuario, nombre_completo, email, rol, activo, created_at')
        .single();

      if (error) throw error;

      return res.status(201).json({ success: true, usuario: data, mensaje: 'Usuario creado exitosamente' });

    } catch (error) {
      console.error('Error POST usuario:', error);
      return res.status(500).json({ success: false, mensaje: 'Error al crear usuario' });
    }
  }

  return res.status(405).json({ success: false, mensaje: 'Método no permitido' });
}