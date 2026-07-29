import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'laboratorio_clinico',
  user: 'FAMJ',
  password: 'UCLA2026',
  max: 5,
});

async function fixPasswords() {
  const client = await pool.connect();
  try {
    // 1. Ver los hashes actuales
    console.log('=== HASHES ACTUALES ===');
    const current = await client.query('SELECT id, nombre_usuario, password_hash FROM usuarios ORDER BY id');
    for (const row of current.rows) {
      const decoded = Buffer.from(row.password_hash, 'base64').toString('utf-8');
      console.log(`  ${row.nombre_usuario}: hash="${row.password_hash}" → decodificado="${decoded}"`);
    }

    // 2. Actualizar los hashes
    // admin: password "admin123" → btoa("admin123") = "YWRtaW4xMjM="
    await client.query(
      "UPDATE usuarios SET password_hash = 'YWRtaW4xMjM=', updated_at = NOW() WHERE nombre_usuario = 'admin'"
    );
    console.log('✅ admin actualizado (password: admin123)');

    // manuel: password "admin123" → btoa("admin123") = "YWRtaW4xMjM="
    await client.query(
      "UPDATE usuarios SET password_hash = 'YWRtaW4xMjM=', updated_at = NOW() WHERE nombre_usuario = 'manuel'"
    );
    console.log('✅ manuel actualizado (password: admin123)');

    // bioanalista: password "bio123" → btoa("bio123") = "YmlvMTIz"
    await client.query(
      "UPDATE usuarios SET password_hash = 'YmlvMTIz', updated_at = NOW() WHERE nombre_usuario = 'bioanalista'"
    );
    console.log('✅ bioanalista actualizado (password: bio123)');

    // 3. Verificar los cambios
    console.log('\n=== HASHES ACTUALIZADOS ===');
    const updated = await client.query('SELECT id, nombre_usuario, password_hash FROM usuarios ORDER BY id');
    for (const row of updated.rows) {
      const decoded = Buffer.from(row.password_hash, 'base64').toString('utf-8');
      console.log(`  ${row.nombre_usuario}: hash="${row.password_hash}" → decodificado="${decoded}"`);
    }

    console.log('\n✅ Contraseñas corregidas exitosamente!');
    console.log('📋 Credenciales:');
    console.log('   admin       → admin123');
    console.log('   manuel      → admin123');
    console.log('   bioanalista → bio123');
    console.log('   recepcion   → rec123');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixPasswords();