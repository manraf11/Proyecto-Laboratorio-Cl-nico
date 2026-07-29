// src/config/database.ts
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase - CON TUS CLAVES REALES
const SUPABASE_URL = 'https://ofhovlgfaghbqbfzagmc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_izpbUwlI7NVGVjeUwPV1AQ_mMratSBB';
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_GQqufNaCaa16hDWCPD3F7A__DcymhdT';

// Cliente para el frontend (con políticas RLS)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cliente para el backend (con permisos completos)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export const pool = null;

export async function testConnection(): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('usuarios')
            .select('id')
            .limit(1);
        
        if (error) {
            console.error('❌ Error de conexión a Supabase:', error.message);
            return false;
        }
        console.log('✅ Conectado a Supabase correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        return false;
    }
}

export default { supabase, supabaseAdmin, pool, testConnection };