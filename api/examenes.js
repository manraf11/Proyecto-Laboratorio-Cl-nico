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
    // GET - Listar exámenes
    if (req.method === 'GET') {
      const { cedula } = req.query;
      let query = supabase
        .from('examenes')
        .select('*')
        .order('fecha_registro', { ascending: false });

      if (cedula) {
        query = query.ilike('cedula_paciente', cedula.trim());
      }

      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    // POST - Crear examen
    if (req.method === 'POST') {
      const datos = req.body;

      const { data, error } = await supabase
        .from('examenes')
        .insert({
          nombre_paciente: datos.nombrePaciente || '',
          cedula_paciente: datos.cedulaPaciente || '',
          telefono_paciente: datos.telefonoPaciente || '',
          nombre_estudio: datos.nombreEstudio || '',
          resultado_examen: datos.resultadoExamen || '',
          precio_estudio: datos.precioEstudio || '',
          forma_pago: datos.formaPago || '',
          referencia: datos.referencia || '',
          estado: datos.estado || 'preparacion',
          fecha_registro: datos.fechaRegistro || new Date().toISOString(),
          usuario_registra: datos.usuarioRegistra || 'Sistema',
          usuario_id: datos.usuarioId || null
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    }

    // PUT - Actualizar examen (por ID en URL)
    if (req.method === 'PUT') {
      const id = req.url.split('/').pop();
      const datos = req.body;

      const { data, error } = await supabase
        .from('examenes')
        .update({
          nombre_paciente: datos.nombrePaciente || '',
          cedula_paciente: datos.cedulaPaciente || '',
          telefono_paciente: datos.telefonoPaciente || '',
          nombre_estudio: datos.nombreEstudio || '',
          resultado_examen: datos.resultadoExamen || '',
          precio_estudio: datos.precioEstudio || '',
          forma_pago: datos.formaPago || '',
          referencia: datos.referencia || '',
          estado: datos.estado || 'preparacion',
          fecha_registro: datos.fechaRegistro || new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data || { ok: true });
    }

    // DELETE - Eliminar examen
    if (req.method === 'DELETE') {
      const id = req.url.split('/').pop();

      const { error } = await supabase
        .from('examenes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Método no permitido' });

  } catch (error) {
    console.error('Error en /api/examenes:', error);
    return res.status(500).json({ error: true, message: error.message });
  }
}