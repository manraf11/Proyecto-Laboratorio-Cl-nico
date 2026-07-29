// api/auth/login.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://ofhovlgfaghbqbfzagmc.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_izpbUwlI7NVGVjeUwPV1AQ_mMratSBB';

const supabase = createClient(supabaseUrl, supabaseKey);

function hashPassword(password) {
    return Buffer.from(password).toString('base64');
}

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Responder a preflight OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Solo aceptar POST
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            mensaje: 'Método no permitido' 
        });
    }

    try {
        const { usuario, password } = req.body;

        if (!usuario || !password) {
            return res.status(400).json({ 
                success: false, 
                mensaje: 'Usuario y contraseña son requeridos' 
            });
        }

        const usuarioInput = usuario.trim().toLowerCase();
        const passwordInput = password.trim();

        console.log(`🔍 Intentando login para: ${usuarioInput}`);

        // Buscar en Supabase
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('nombre_usuario', usuarioInput)
            .eq('activo', true)
            .maybeSingle();

        if (error) {
            console.error('❌ Error en Supabase:', error);
            return res.status(500).json({ 
                success: false, 
                mensaje: 'Error de conexión con la base de datos' 
            });
        }

        // Usuario encontrado
        if (data) {
            const passwordHash = hashPassword(passwordInput);
            
            if (data.password_hash === passwordHash) {
                // Actualizar último acceso
                await supabase
                    .from('usuarios')
                    .update({ ultimo_acceso: new Date().toISOString() })
                    .eq('id', data.id);

                console.log(`✅ Login exitoso: ${data.nombre_usuario} (${data.rol})`);

                return res.status(200).json({
                    success: true,
                    usuario: {
                        id: String(data.id),
                        nombreUsuario: data.nombre_usuario,
                        nombreCompleto: data.nombre_completo,
                        email: data.email,
                        rol: data.rol,
                        activo: data.activo
                    },
                    mensaje: `Bienvenido ${data.nombre_completo}`
                });
            } else {
                console.warn('❌ Contraseña incorrecta');
                return res.status(401).json({ 
                    success: false, 
                    mensaje: 'Contraseña incorrecta' 
                });
            }
        }

        // Fallback: Usuarios demo (para pruebas)
        const DEMO_USERS = {
            admin: { password: 'admin123', rol: 'admin', nombreCompleto: 'Administrador' },
            bioanalista: { password: 'bio123', rol: 'bioanalista', nombreCompleto: 'Bioanalista' },
            recepcion: { password: 'rec123', rol: 'recepcionista', nombreCompleto: 'Recepcionista' }
        };

        const demo = DEMO_USERS[usuarioInput];
        if (demo && passwordInput === demo.password) {
            console.log(`✅ Login demo: ${usuarioInput}`);
            return res.status(200).json({
                success: true,
                usuario: {
                    id: `demo-${usuarioInput}`,
                    nombreUsuario: usuarioInput,
                    nombreCompleto: demo.nombreCompleto,
                    email: `${usuarioInput}@laboratorio.local`,
                    rol: demo.rol,
                    activo: true
                },
                mensaje: `Bienvenido ${demo.nombreCompleto} (modo demo)`
            });
        }

        console.warn(`❌ Usuario no encontrado: ${usuarioInput}`);
        return res.status(401).json({ 
            success: false, 
            mensaje: 'Usuario o contraseña incorrectos' 
        });

    } catch (error) {
        console.error('❌ Error en login:', error);
        return res.status(500).json({ 
            success: false, 
            mensaje: 'Error interno del servidor' 
        });
    }
}