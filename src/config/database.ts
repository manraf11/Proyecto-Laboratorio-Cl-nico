// src/config/database.ts
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase - CON TUS CLAVES REALES
const SUPABASE_URL = 'https://ofhovlgfaghbqbfzagmc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9maG92bGdmYWdoYnFiZnphZ21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNzYxOTksImV4cCI6MjEwMDg1MjE5OX0.RDDYMvDq1oDbvfbEzv9EJg9Id8S964yuckuqFQxWY98';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9maG92bGdmYWdoYnFiZnphZ21jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTI3NjE5OSwiZXhwIjoyMTAwODUyMTk5fQ.2FgzvK0QH3YhM5nR7WjXpQ8sT1vU4wY6zA9bC3dE5fG';

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
            console.error('❌ Error de conexión a Supabase:', error);
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