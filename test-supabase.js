import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ofhovlgfaghbqbfzagmc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_izpbUwlI7NVGVjeUwPV1AQ_mMratSBB';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
    console.log('🔌 Probando conexión a Supabase...');
    console.log(`📊 URL: ${SUPABASE_URL}`);
    console.log(`🔑 Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
    
    try {
        // Intentar obtener datos de la tabla usuarios
        const { data, error, count } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact' })
            .limit(1);
        
        if (error) {
            console.error('❌ Error detallado:', error);
            console.error('   Mensaje:', error.message);
            console.error('   Código:', error.code);
            console.error('   Detalles:', error.details);
            return false;
        }
        
        console.log('✅ Conexión exitosa');
        console.log(`📊 Total usuarios: ${count}`);
        if (data && data.length > 0) {
            console.log('👤 Primer usuario:', data[0].nombre_usuario);
        }
        return true;
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        return false;
    }
}

testConnection();