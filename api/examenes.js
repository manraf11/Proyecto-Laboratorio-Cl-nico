import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://ofhovlgfaghbqbfzagmc.supabase.co';
const supabaseKey = 'sb_publishable_izpbUwlI7NVGVjeUwPV1AQ_mMratSBB';
const supabase = createClient(supabaseUrl, supabaseKey);

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
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
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('examenes')
        .select('*')
        .order('fecha_registro', { ascending: false });

      if (error) {
        console.error('❌ Error al consultar Supabase:', error);
        res.status(500).json({ error: true, message: error.message });
        return;
      }

      res.status(200).json(data || []);
      return;
    }

    const datos = await parseBody(req);

    if (req.method === 'POST') {
      const { data, error } = await supabase
        .from('examenes')
        .insert({
          nombre_paciente: datos.nombrePaciente,
          cedula_paciente: datos.cedulaPaciente,
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

      if (error) {
        console.error('❌ Error al insertar en Supabase:', error);
        res.status(500).json({ error: true, message: error.message });
        return;
      }

      res.status(201).json(data);
      return;
    }

    if (req.method === 'PUT') {
      const id = datos.id || req.query?.id || req.url?.split('/').pop();
      if (!id) {
        res.status(400).json({ error: 'Falta el id del examen' });
        return;
      }

      const { data, error } = await supabase
        .from('examenes')
        .update({
          nombre_paciente: datos.nombrePaciente,
          cedula_paciente: datos.cedulaPaciente,
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

      if (error) {
        console.error('❌ Error al actualizar en Supabase:', error);
        res.status(500).json({ error: true, message: error.message });
        return;
      }

      res.status(200).json(data || { ok: true });
      return;
    }

    if (req.method === 'DELETE') {
      const id = req.query?.id || req.url?.split('/').pop();
      if (!id) {
        res.status(400).json({ error: 'Falta el id del examen' });
        return;
      }

      const { error } = await supabase
        .from('examenes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error al eliminar en Supabase:', error);
        res.status(500).json({ error: true, message: error.message });
        return;
      }

      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('❌ Error en /api/examenes:', error);
    res.status(500).json({ error: true, message: error.message || 'Error inesperado' });
  }
}