import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

// ============================================
// CONFIGURACIÓN DE SUPABASE - MISMA QUE FUNCIONÓ EN test-supabase.js
// ============================================
const SUPABASE_URL = 'https://ofhovlgfaghbqbfzagmc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_izpbUwlI7NVGVjeUwPV1AQ_mMratSBB';

console.log('🔌 Conectando a Supabase...');
console.log(`📊 URL: ${SUPABASE_URL}`);
console.log(`🔑 Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);

// Crear cliente EXACTAMENTE igual que en test-supabase.js
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
};

function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res, statusCode, payload) {
    setCors(res);
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try { resolve(body ? JSON.parse(body) : {}); } catch (e) { reject(e); }
        });
        req.on('error', reject);
    });
}

function hashPassword(password) {
    return Buffer.from(password).toString('base64');
}

// ============================================
// API: AUTH - LOGIN
// ============================================
async function handleApiAuth(req, res) {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    if (pathname === '/api/auth/login') {
        if (req.method === 'OPTIONS') {
            setCors(res);
            res.writeHead(200);
            res.end();
            return true;
        }

        if (req.method === 'POST') {
            try {
                const datos = await readJsonBody(req);
                const { usuario, password } = datos;

                console.log(`📥 Login request: ${usuario}`);

                if (!usuario || !password) {
                    sendJson(res, 400, { success: false, mensaje: 'Usuario y contraseña son requeridos' });
                    return true;
                }

                const usuarioInput = usuario.trim().toLowerCase();
                const passwordInput = password.trim();

                console.log(`🔍 Buscando usuario: ${usuarioInput}`);

                const { data, error } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('nombre_usuario', usuarioInput)
                    .eq('activo', true)
                    .maybeSingle();

                if (error) {
                    console.error('❌ Error en consulta:', error);
                    sendJson(res, 500, { 
                        success: false, 
                        mensaje: 'Error de base de datos: ' + error.message 
                    });
                    return true;
                }

                console.log(`📊 Resultado: ${data ? '✅ Encontrado' : '❌ No encontrado'}`);

                if (data) {
                    const passwordHash = hashPassword(passwordInput);
                    
                    if (data.password_hash === passwordHash) {
                        console.log(`✅ Login exitoso: ${data.nombre_usuario} (${data.rol})`);

                        sendJson(res, 200, {
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
                        return true;
                    } else {
                        console.warn('❌ Contraseña incorrecta');
                        sendJson(res, 401, { success: false, mensaje: 'Contraseña incorrecta' });
                        return true;
                    }
                }

                // Fallback demo
                const DEMO_USERS = {
                    admin: { password: 'admin123', rol: 'admin', nombreCompleto: 'Administrador' },
                    bioanalista: { password: 'bio123', rol: 'bioanalista', nombreCompleto: 'Bioanalista' },
                    recepcion: { password: 'rec123', rol: 'recepcionista', nombreCompleto: 'Recepcionista' }
                };

                const demo = DEMO_USERS[usuarioInput];
                if (demo && passwordInput === demo.password) {
                    console.log(`✅ Login demo: ${usuarioInput}`);
                    sendJson(res, 200, {
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
                    return true;
                }

                console.warn(`❌ Usuario no encontrado: ${usuarioInput}`);
                sendJson(res, 401, { success: false, mensaje: 'Usuario o contraseña incorrectos' });
                return true;

            } catch (error) {
                console.error('❌ Error en login:', error);
                sendJson(res, 500, { success: false, mensaje: 'Error interno: ' + error.message });
                return true;
            }
        }
    }
    return false;
}

// ============================================
// API: USUARIOS
// ============================================
async function handleApiUsuarios(req, res) {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    if (pathname === '/api/usuarios' || pathname.startsWith('/api/usuarios/')) {
        if (req.method === 'OPTIONS') {
            setCors(res);
            res.writeHead(200);
            res.end();
            return true;
        }

        if (req.method === 'GET') {
            try {
                const { data, error } = await supabase
                    .from('usuarios')
                    .select('id, nombre_usuario, nombre_completo, email, rol, activo, ultimo_acceso, created_at')
                    .order('id');

                if (error) throw error;
                sendJson(res, 200, data);
                return true;
            } catch (error) {
                console.error('❌ Error al listar usuarios:', error);
                sendJson(res, 500, { success: false, mensaje: 'Error al listar usuarios' });
                return true;
            }
        }

        if (req.method === 'POST') {
            try {
                const datos = await readJsonBody(req);
                const { nombreUsuario, nombreCompleto, email, password, rol } = datos;

                if (!nombreUsuario || !nombreCompleto || !email || !password || !rol) {
                    sendJson(res, 400, { success: false, mensaje: 'Todos los campos son requeridos' });
                    return true;
                }

                const passwordHash = hashPassword(password.trim());
                const usuarioInput = nombreUsuario.trim().toLowerCase();

                const { data, error } = await supabase
                    .from('usuarios')
                    .insert({
                        nombre_usuario: usuarioInput,
                        nombre_completo: nombreCompleto.trim(),
                        email: email.trim().toLowerCase(),
                        password_hash: passwordHash,
                        rol: rol
                    })
                    .select()
                    .single();

                if (error) throw error;

                sendJson(res, 201, { success: true, usuario: data, mensaje: 'Usuario creado' });
                return true;
            } catch (error) {
                console.error('❌ Error al crear usuario:', error);
                sendJson(res, 500, { success: false, mensaje: 'Error al crear usuario' });
                return true;
            }
        }

        if (req.method === 'PUT' && pathname.endsWith('/password')) {
            try {
                const id = pathname.split('/')[3];
                const datos = await readJsonBody(req);
                const { password } = datos;

                if (!password || password.trim().length < 4) {
                    sendJson(res, 400, { success: false, mensaje: 'La contraseña debe tener al menos 4 caracteres' });
                    return true;
                }

                const passwordHash = hashPassword(password.trim());
                const { error } = await supabase
                    .from('usuarios')
                    .update({ password_hash: passwordHash })
                    .eq('id', parseInt(id));

                if (error) throw error;

                sendJson(res, 200, { success: true, mensaje: 'Contraseña actualizada' });
                return true;
            } catch (error) {
                console.error('❌ Error al cambiar contraseña:', error);
                sendJson(res, 500, { success: false, mensaje: 'Error al cambiar contraseña' });
                return true;
            }
        }
    }
    return false;
}

// ============================================
// API: CÉDULA
// ============================================
async function handleApiCedula(req, res) {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    if (pathname === '/api/cedula.js' || pathname === '/api/cedula') {
        if (req.method === 'OPTIONS') {
            setCors(res);
            res.writeHead(200);
            res.end();
            return true;
        }

        if (req.method === 'GET') {
            const cedula = url.searchParams.get('cedula');
            const nacionalidad = url.searchParams.get('nacionalidad') || 'V';

            if (!cedula) {
                sendJson(res, 400, { error: true, error_str: 'Cédula no proporcionada' });
                return true;
            }

            const numeroCedula = String(cedula).replace(/[^0-9]/g, '');
            if (!numeroCedula) {
                sendJson(res, 400, { error: true, error_str: 'Formato de cédula inválido' });
                return true;
            }

            const APP_ID = '9217';
            const TOKEN = '1b0611917be24be6131b02be8be356f4';
            const API_URL = `https://api.cedula.com.ve/api/v1?app_id=${APP_ID}&token=${TOKEN}&nacionalidad=${nacionalidad}&cedula=${numeroCedula}`;

            try {
                const response = await fetch(API_URL);
                const data = await response.json();

                if (data.error === true) {
                    sendJson(res, 404, { error: true, error_str: data.error_str || 'No se encontraron datos' });
                    return true;
                }

                if (data.data) {
                    const nombreCompleto = [data.data.primer_nombre, data.data.primer_apellido]
                        .filter(p => p && p.trim() !== '')
                        .join(' ');

                    sendJson(res, 200, {
                        error: false,
                        data: {
                            nombre_completo: nombreCompleto,
                            estado: data.data.cne?.estado || '',
                            municipio: data.data.cne?.municipio || '',
                            parroquia: data.data.cne?.parroquia || ''
                        }
                    });
                    return true;
                }

                sendJson(res, 404, { error: true, error_str: 'No se encontraron datos' });
                return true;
            } catch (error) {
                console.error('❌ Error al consultar CNE:', error);
                sendJson(res, 500, { error: true, error_str: 'Error al consultar la API' });
                return true;
            }
        }
    }
    return false;
}

// ============================================
// API: ESTUDIOS
// ============================================
async function handleApiEstudios(req, res) {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    if (pathname === '/api/estudios' || pathname.startsWith('/api/estudios/')) {
        if (req.method === 'OPTIONS') {
            setCors(res);
            res.writeHead(200);
            res.end();
            return true;
        }

        if (req.method === 'GET') {
            try {
                const { data, error } = await supabase
                    .from('estudios')
                    .select('*')
                    .order('id');

                if (error) throw error;
                sendJson(res, 200, data);
                return true;
            } catch (error) {
                console.error('❌ Error al listar estudios:', error);
                sendJson(res, 500, { error: true, message: error.message });
                return true;
            }
        }

        if (req.method === 'POST') {
            try {
                const datos = await readJsonBody(req);
                const { data, error } = await supabase
                    .from('estudios')
                    .insert({
                        nombre: datos.nombre,
                        precio: datos.precio,
                        unidad: datos.unidad,
                        valores_referencia: datos.valoresReferencia || datos.valores_referencia
                    })
                    .select()
                    .single();

                if (error) throw error;
                sendJson(res, 201, data);
                return true;
            } catch (error) {
                console.error('❌ Error POST estudio:', error);
                sendJson(res, 500, { error: true, message: error.message });
                return true;
            }
        }

        if (req.method === 'PUT') {
            try {
                const id = pathname.split('/').pop();
                const datos = await readJsonBody(req);
                const { error } = await supabase
                    .from('estudios')
                    .update({
                        nombre: datos.nombre,
                        precio: datos.precio,
                        unidad: datos.unidad,
                        valores_referencia: datos.valoresReferencia || datos.valores_referencia
                    })
                    .eq('id', parseInt(id));

                if (error) throw error;
                sendJson(res, 200, { ok: true });
                return true;
            } catch (error) {
                console.error('❌ Error PUT estudio:', error);
                sendJson(res, 500, { error: true, message: error.message });
                return true;
            }
        }

        if (req.method === 'DELETE') {
            try {
                const id = pathname.split('/').pop();
                const { error } = await supabase
                    .from('estudios')
                    .delete()
                    .eq('id', parseInt(id));

                if (error) throw error;
                sendJson(res, 200, { ok: true });
                return true;
            } catch (error) {
                console.error('❌ Error DELETE estudio:', error);
                sendJson(res, 500, { error: true, message: error.message });
                return true;
            }
        }
    }
    return false;
}

// ============================================
// API: EXÁMENES
// ============================================
async function handleApiExamenes(req, res) {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    if (pathname === '/api/examenes' || pathname.startsWith('/api/examenes/')) {
        if (req.method === 'OPTIONS') {
            setCors(res);
            res.writeHead(200);
            res.end();
            return true;
        }

        if (req.method === 'GET') {
            try {
                const { data, error } = await supabase
                    .from('vista_examenes_completos')
                    .select('*')
                    .order('id', { ascending: false });

                if (error) throw error;
                sendJson(res, 200, data);
                return true;
            } catch (error) {
                console.error('❌ Error GET exámenes:', error);
                sendJson(res, 500, { error: true, message: error.message });
                return true;
            }
        }

        if (req.method === 'POST') {
            try {
                const datos = await readJsonBody(req);

                const { data: examenData, error: examenError } = await supabase
                    .from('examenes')
                    .insert({
                        nombre_paciente: datos.nombrePaciente || '',
                        cedula_paciente: datos.cedulaPaciente || '',
                        telefono_paciente: datos.telefonoPaciente || '',
                        forma_pago: datos.formaPago || '',
                        referencia: datos.referencia || '',
                        estado: datos.estado || 'preparacion',
                        fecha_registro: datos.fechaRegistro || new Date().toISOString(),
                        usuario_registra: datos.usuarioRegistra || 'Sistema',
                        usuario_id: datos.usuarioId || null
                    })
                    .select()
                    .single();

                if (examenError) throw examenError;

                const examenId = examenData.id;
                const estudios = (datos.nombreEstudio || '').split(', ').filter(Boolean);
                const precios = (datos.precioEstudio || '').split(', ').filter(Boolean);

                for (let i = 0; i < estudios.length; i++) {
                    const nombreEstudio = estudios[i]?.trim();
                    if (!nombreEstudio) continue;

                    const { data: estudioData } = await supabase
                        .from('estudios')
                        .select('id')
                        .eq('nombre', nombreEstudio)
                        .maybeSingle();

                    if (!estudioData) continue;

                    await supabase
                        .from('examen_estudios')
                        .insert({
                            examen_id: examenId,
                            estudio_id: estudioData.id,
                            precio: parseFloat(precios[i]) || 0,
                            resultado: '',
                            estado: 'pendiente'
                        });
                }

                sendJson(res, 201, { id: examenId });
                return true;
            } catch (error) {
                console.error('❌ Error POST examen:', error);
                sendJson(res, 500, { error: true, message: error.message });
                return true;
            }
        }

        if (req.method === 'PUT') {
            try {
                const id = pathname.split('/').pop();
                const examenId = parseInt(id);
                const datos = await readJsonBody(req);

                const { error: updateError } = await supabase
                    .from('examenes')
                    .update({
                        nombre_paciente: datos.nombrePaciente || '',
                        cedula_paciente: datos.cedulaPaciente || '',
                        telefono_paciente: datos.telefonoPaciente || '',
                        forma_pago: datos.formaPago || '',
                        referencia: datos.referencia || '',
                        estado: datos.estado || 'preparacion'
                    })
                    .eq('id', examenId);

                if (updateError) throw updateError;

                sendJson(res, 200, { ok: true, id });
                return true;
            } catch (error) {
                console.error('❌ Error PUT examen:', error);
                sendJson(res, 500, { error: true, message: error.message });
                return true;
            }
        }

        if (req.method === 'DELETE') {
            try {
                const id = pathname.split('/').pop();
                const { error } = await supabase
                    .from('examenes')
                    .delete()
                    .eq('id', parseInt(id));

                if (error) throw error;
                sendJson(res, 200, { ok: true });
                return true;
            } catch (error) {
                console.error('❌ Error DELETE examen:', error);
                sendJson(res, 500, { error: true, message: error.message });
                return true;
            }
        }
    }
    return false;
}

// ============================================
// SERVIDOR DE ARCHIVOS ESTÁTICOS
// ============================================
function resolveFilePath(requestPath) {
    const pathname = requestPath === '/' ? '/indexlogin.html' : requestPath;
    const normalizedPath = pathname.replace(/^\/+/, '');
    const fullPath = path.resolve(__dirname, normalizedPath);
    if (!fullPath.startsWith(__dirname)) return null;
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) return fullPath;
    const candidate = path.join(__dirname, normalizedPath + '.html');
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    return null;
}

// ============================================
// INICIAR SERVIDOR
// ============================================
async function startServer() {
    try {
        // Probar conexión exactamente como en test-supabase.js
        console.log('\n📡 Probando conexión a Supabase...');
        
        const { data, error, count } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact' })
            .limit(1);

        if (error) {
            console.error('❌ Error de conexión:', error.message);
        } else {
            console.log('✅ Conectado a Supabase correctamente');
            console.log(`📊 Total usuarios: ${count}`);
            if (data && data.length > 0) {
                console.log(`👤 Primer usuario: ${data[0].nombre_usuario}`);
            }
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    }

    const server = http.createServer(async (req, res) => {
        setCors(res);
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        // APIs
        if (await handleApiAuth(req, res)) return;
        if (await handleApiUsuarios(req, res)) return;
        if (await handleApiCedula(req, res)) return;
        if (await handleApiEstudios(req, res)) return;
        if (await handleApiExamenes(req, res)) return;

        // Archivos estáticos
        const requestPath = new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname;
        const filePath = resolveFilePath(requestPath);
        if (!filePath) {
            res.writeHead(404);
            res.end('404 - No encontrado');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('500 - Error');
                return;
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        });
    });

    server.listen(PORT, () => {
        console.log('');
        console.log('🚀 Servidor en http://localhost:' + PORT);
        console.log('📊 Usando Supabase - Proyecto: ofhovlgfaghbqbfzagmc');
        console.log('🔐 API de autenticación: /api/auth/login');
        console.log('📋 API de estudios: /api/estudios');
        console.log('📋 API de exámenes: /api/examenes');
        console.log('');
        console.log('🔑 Credenciales de prueba:');
        console.log('   admin / admin123 (Administrador)');
        console.log('   bioanalista / bio123 (Bioanalista)');
        console.log('   recepcion / rec123 (Recepcionista)');
        console.log('');
    });
}

startServer().catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});