import pg from 'pg';
const { Pool } = pg;
export const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'laboratorio_clinico',
    user: 'FAMJ',
    password: 'UCLA2026',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
pool.on('error', (err) => {
    console.error('❌ Error en PostgreSQL:', err);
});
export async function testConnection() {
    try {
        const client = await pool.connect();
        await client.query('SELECT NOW() as time');
        client.release();
        console.log('✅ Conectado a PostgreSQL');
        return true;
    }
    catch (error) {
        console.error('❌ Error de conexión:', error);
        return false;
    }
}
export default { pool, testConnection };
//# sourceMappingURL=database.js.map