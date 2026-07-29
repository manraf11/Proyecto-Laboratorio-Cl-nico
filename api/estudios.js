import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL || 'postgresql://FAMJ:UCLA2026@localhost:5432/laboratorio_clinico',
  ssl: process.env.POSTGRES_URL || process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

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
      const resultado = await pool.query(`
        SELECT id, nombre, precio, unidad, valores_referencia
        FROM estudios
        ORDER BY id
      `);

      res.status(200).json(resultado.rows.map((fila) => ({
        id: fila.id,
        nombre: fila.nombre,
        precio: fila.precio,
        unidad: fila.unidad,
        valores_referencia: fila.valores_referencia,
      })));
      return;
    }

    const datos = await parseBody(req);

    if (req.method === 'POST') {
      const resultado = await pool.query(
        `INSERT INTO estudios (nombre, precio, unidad, valores_referencia)
         VALUES ($1, $2, $3, $4)
         RETURNING id, nombre, precio, unidad, valores_referencia`,
        [datos.nombre, datos.precio, datos.unidad, datos.valoresReferencia ?? datos.valores_referencia]
      );

      res.status(201).json(resultado.rows[0]);
      return;
    }

    if (req.method === 'PUT') {
      const id = datos.id;
      if (!id) {
        res.status(400).json({ error: 'Falta el id del estudio' });
        return;
      }

      const resultado = await pool.query(
        `UPDATE estudios
         SET nombre = $1, precio = $2, unidad = $3, valores_referencia = $4, updated_at = NOW()
         WHERE id = $5
         RETURNING id, nombre, precio, unidad, valores_referencia`,
        [datos.nombre, datos.precio, datos.unidad, datos.valoresReferencia ?? datos.valores_referencia, id]
      );

      res.status(200).json(resultado.rows[0] || { ok: true });
      return;
    }

    if (req.method === 'DELETE') {
      const id = req.query?.id || req.url?.split('/').pop();
      if (!id) {
        res.status(400).json({ error: 'Falta el id del estudio' });
        return;
      }

      await pool.query('DELETE FROM estudios WHERE id = $1', [id]);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('❌ Error en /api/estudios:', error);
    res.status(500).json({ error: true, message: error.message || 'Error inesperado' });
  }
}
