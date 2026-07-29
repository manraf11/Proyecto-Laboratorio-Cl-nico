import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://ofhovlgfaghbqbfzagmc.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_izpbUwlI7NVGVjeUwPV1AQ_mMratSBB';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, mensaje: 'Método no permitido' });
  }

  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({ success: false, mensaje: 'Usuario y contraseña son requeridos' });
    }

    const usuarioInput = usuario.trim().toLowerCase();
    const passwordInput = password.trim();
    const passwordHash = Buffer.from(passwordInput).toString('base64');

    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre_usuario, nombre_completo, email, password_hash, rol, activo')
      .ilike('nombre_usuario', usuarioInput)
      .eq('activo', true)
      .limit(1);

    if (error || !data || data.length === 0) {
      return res.status(401).json({ success: false, mensaje: 'Usuario o contraseña incorrectos' });
    }

    const row = data[0];

    if (row.password_hash !== passwordHash) {
      return res.status(401).json({ success: false, mensaje: 'Usuario o contraseña incorrectos' });
    }

    // Actualizar último acceso
    await supabase
      .from('usuarios')
      .update({ ultimo_acceso: new Date().toISOString() })
      .eq('id', row.id);

    return res.status(200).json({
      success: true,
      usuario: {
        id: String(row.id),
        nombreUsuario: row.nombre_usuario,
        nombreCompleto: row.nombre_completo,
        email: row.email,
        rol: row.rol,
        activo: row.activo
      },
      mensaje: `Bienvenido ${row.nombre_completo}`
    });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ success: false, mensaje: 'Error interno del servidor' });
  }
}