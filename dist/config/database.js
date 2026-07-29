// src/config/database.ts
import { createClient } from '@supabase/supabase-js';
// Configuración de Supabase
const supabaseUrl = 'https://ofhovlgfaghbqbfzagmc.supabase.co';
const supabaseKey = 'sb_publishable_izpbUwlI7NVGVjeUwPV1AQ_mMratSBB';
export const supabase = createClient(supabaseUrl, supabaseKey);
export async function testConnection() {
    try {
        const { error } = await supabase
            .from('usuarios')
            .select('count')
            .limit(1);
        if (error) {
            console.error('❌ Error al conectar con Supabase:', error.message);
            return false;
        }
        console.log('✅ Conectado a Supabase');
        return true;
    }
    catch (error) {
        console.error('❌ Error de conexión:', error);
        return false;
    }
}
export default { supabase, testConnection };
//# sourceMappingURL=database.js.map