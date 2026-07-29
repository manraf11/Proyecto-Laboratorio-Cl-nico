import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://ofhovlgfaghbqbfzagmc.supabase.co';
const supabaseKey = 'sb_publishable_izpbUwlI7NVGVjeUwPV1AQ_mMratSBB';
const supabase = createClient(supabaseUrl, supabaseKey);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

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

        console.log('📥 Datos recibidos:', { usuario, password });

        if (!usuario || !password) {
          sendJson(res, 400, { success: false, mensaje: 'Usuario y contraseña son requeridos' });
          return true;
        }

        const usuarioInput = usuario.trim().toLowerCase();
        const passwordInput = password.trim();

        console.log(`🔍 API Auth: Intentando login para ${usuarioInput}`);

        // Buscar en Supabase
        const { data, error } = await supabase
          .from('usuarios')
          .select('id, nombre_usuario, nombre_completo, email, password_hash, rol, activo')
          .ilike('nombre_usuario', usuarioInput)
          .eq('activo', true)
          .limit(1);

        if (error || !data || data.length === 0) {
          console.warn(`❌ API Auth: Usuario no encontrado: ${usuarioInput}`);
          sendJson(res, 401, { success: false, mensaje: 'Usuario o contraseña incorrectos' });
          return true;
        }

        const row = data[0];
        
        // Generar hash de la contraseña ingresada
        const passwordHash = Buffer.from(passwordInput).toString('base64');
        console.log(`🔐 Hash en BD: "${row.password_hash}"`);
        console.log(`🔐 Hash generado: "${passwordHash}"`);
        console.log(`🔐 ¿Coinciden?: ${row.password_hash === passwordHash ? 'SÍ ✅' : 'NO ❌'}`);
        
        // Comparación exacta
        if (row.password_hash !== passwordHash) {
          console.warn(`❌ API Auth: Contraseña incorrecta para: ${usuarioInput}`);
          sendJson(res, 401, { success: false, mensaje: 'Usuario o contraseña incorrectos' });
          return true;
        }

        // Actualizar último acceso
        await supabase
          .from('usuarios')
          .update({ ultimo_acceso: new Date().toISOString() })
          .eq('id', row.id);

        console.log(`✅ API Auth: Login exitoso para ${row.nombre_usuario} (${row.rol})`);

        sendJson(res, 200, {
          success: true,
          usuario: {
            id: String(row.id),
            nombreUsuario: row.nombre_usuario,
            nombreCompleto: row.nombre_completo,
            email: row.email,
            rol: row.rol,
            activo: row.activo
          },
          mensaje: `Bienvenido ${row.nombre_completo}`
        });
        return true;
      } catch (error) {
        console.error('❌ Error en API Auth:', error);
        sendJson(res, 500, { success: false, mensaje: 'Error interno del servidor: ' + error.message });
        return true;
      }
    }
  }
  return false;
}

// ============================================
// API: USUARIOS (GESTIÓN DE USUARIOS - ADMIN)
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

    // GET - Listar todos los usuarios
    if (req.method === 'GET') {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('id, nombre_usuario, nombre_completo, email, rol, activo, ultimo_acceso, created_at')
          .order('id');

        if (error) {
          console.error('❌ Error al listar usuarios:', error);
          sendJson(res, 500, { success: false, mensaje: 'Error al listar usuarios' });
          return true;
        }

        sendJson(res, 200, data || []);
        return true;
      } catch (error) {
        console.error('❌ Error al listar usuarios:', error);
        sendJson(res, 500, { success: false, mensaje: 'Error al listar usuarios' });
        return true;
      }
    }

    // POST - Crear nuevo usuario
    if (req.method === 'POST') {
      try {
        const datos = await readJsonBody(req);
        const { nombreUsuario, nombreCompleto, email, password, rol } = datos;

        if (!nombreUsuario || !nombreCompleto || !email || !password || !rol) {
          sendJson(res, 400, { success: false, mensaje: 'Todos los campos son requeridos' });
          return true;
        }

        const rolesValidos = ['admin', 'bioanalista', 'recepcionista'];
        if (!rolesValidos.includes(rol)) {
          sendJson(res, 400, { success: false, mensaje: 'Rol inválido' });
          return true;
        }

        const usuarioInput = nombreUsuario.trim().toLowerCase();
        const emailInput = email.trim().toLowerCase();

        // Verificar si ya existe
        const { data: existente } = await supabase
          .from('usuarios')
          .select('id')
          .or(`nombre_usuario.ilike.${usuarioInput},email.ilike.${emailInput}`)
          .limit(1);

        if (existente && existente.length > 0) {
          sendJson(res, 400, { success: false, mensaje: 'El usuario o email ya existe' });
          return true;
        }

        const passwordHash = Buffer.from(password.trim()).toString('base64');
        const { data, error } = await supabase
          .from('usuarios')
          .insert({
            nombre_usuario: usuarioInput,
            nombre_completo: nombreCompleto.trim(),
            email: emailInput,
            password_hash: passwordHash,
            rol: rol,
            activo: true
          })
          .select('id, nombre_usuario, nombre_completo, email, rol, activo, created_at')
          .single();

        if (error) {
          console.error('❌ Error al crear usuario:', error);
          sendJson(res, 500, { success: false, mensaje: 'Error al crear usuario' });
          return true;
        }

        console.log(`✅ Usuario creado: ${usuarioInput} (${rol})`);
        sendJson(res, 201, { success: true, usuario: data, mensaje: 'Usuario creado exitosamente' });
        return true;
      } catch (error) {
        console.error('❌ Error al crear usuario:', error);
        sendJson(res, 500, { success: false, mensaje: 'Error al crear usuario' });
        return true;
      }
    }

    // PUT - Cambiar contraseña /api/usuarios/:id/password
    if (req.method === 'PUT' && pathname.endsWith('/password')) {
      try {
        const id = pathname.split('/')[3]; // /api/usuarios/{id}/password
        const datos = await readJsonBody(req);
        const { password } = datos;

        if (!password || password.trim().length < 4) {
          sendJson(res, 400, { success: false, mensaje: 'La contraseña debe tener al menos 4 caracteres' });
          return true;
        }

        const passwordHash = Buffer.from(password.trim()).toString('base64');
        const { error } = await supabase
          .from('usuarios')
          .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) {
          console.error('❌ Error al cambiar contraseña:', error);
          sendJson(res, 500, { success: false, mensaje: 'Error al cambiar contraseña' });
          return true;
        }

        console.log(`✅ Contraseña actualizada para usuario ID: ${id}`);
        sendJson(res, 200, { success: true, mensaje: 'Contraseña actualizada exitosamente' });
        return true;
      } catch (error) {
        console.error('❌ Error al cambiar contraseña:', error);
        sendJson(res, 500, { success: false, mensaje: 'Error al cambiar contraseña' });
        return true;
      }
    }

    // DELETE - Eliminar usuario /api/usuarios/:id
    if (req.method === 'DELETE') {
      try {
        const id = pathname.split('/').pop();
        if (!id || isNaN(parseInt(id))) {
          sendJson(res, 400, { success: false, mensaje: 'ID inválido' });
          return true;
        }

        const { error } = await supabase
          .from('usuarios')
          .delete()
          .eq('id', parseInt(id));

        if (error) {
          console.error('❌ Error al eliminar usuario:', error);
          sendJson(res, 500, { success: false, mensaje: 'Error al eliminar usuario' });
          return true;
        }

        console.log(`✅ Usuario ID ${id} eliminado`);
        sendJson(res, 200, { success: true, mensaje: 'Usuario eliminado exitosamente' });
        return true;
      } catch (error) {
        console.error('❌ Error al eliminar usuario:', error);
        sendJson(res, 500, { success: false, mensaje: 'Error al eliminar usuario' });
        return true;
      }
    }
  }
  return false;
}

// ============================================
// API: CÉDULA (PROXY AL CNE)
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

      console.log(`🌐 Consultando CNE: ${API_URL}`);

      try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.error === true) {
          sendJson(res, 404, { error: true, error_str: data.error_str || 'No se encontraron datos' });
          return true;
        }

        if (data.data) {
          const primerNombre = data.data.primer_nombre || '';
          const primerApellido = data.data.primer_apellido || '';
          const nombreCompleto = [primerNombre, primerApellido].filter(p => p && p.trim() !== '').join(' ');
          
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
        sendJson(res, 500, { error: true, error_str: 'Error al consultar la API: ' + error.message });
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
          .select('id, nombre, precio, unidad, valores_referencia')
          .order('id');

        if (error) {
          console.error('❌ Error al consultar estudios:', error);
          sendJson(res, 500, { error: true, message: error.message });
          return true;
        }

        sendJson(res, 200, data || []);
        return true;
      } catch (error) {
        console.error('❌ Error:', error);
        sendJson(res, 500, { error: true, message: error.message });
      }
      return true;
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
          .select('id, nombre, precio, unidad, valores_referencia')
          .single();

        if (error) {
          console.error('❌ Error POST estudio:', error);
          sendJson(res, 500, { error: true, message: error.message });
          return true;
        }

        sendJson(res, 201, data);
        return true;
      } catch (error) {
        console.error('❌ Error POST estudio:', error);
        sendJson(res, 500, { error: true, message: error.message });
      }
      return true;
    }

    if (req.method === 'PUT') {
      try {
        const id = pathname.split('/').pop();
        const datos = await readJsonBody(req);
        
        const { data, error } = await supabase
          .from('estudios')
          .update({
            nombre: datos.nombre,
            precio: datos.precio,
            unidad: datos.unidad,
            valores_referencia: datos.valoresReferencia || datos.valores_referencia,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select('id, nombre, precio, unidad, valores_referencia')
          .single();

        if (error) {
          console.error('❌ Error PUT estudio:', error);
          sendJson(res, 500, { error: true, message: error.message });
          return true;
        }

        sendJson(res, 200, data || { ok: true });
        return true;
      } catch (error) {
        console.error('❌ Error PUT estudio:', error);
        sendJson(res, 500, { error: true, message: error.message });
      }
      return true;
    }

    if (req.method === 'DELETE') {
      try {
        const id = pathname.split('/').pop();
        const { error } = await supabase
          .from('estudios')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('❌ Error DELETE estudio:', error);
          sendJson(res, 500, { error: true, message: error.message });
          return true;
        }

        sendJson(res, 200, { ok: true });
        return true;
      } catch (error) {
        console.error('❌ Error DELETE estudio:', error);
        sendJson(res, 500, { error: true, message: error.message });
      }
      return true;
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

    // GET - Obtener exámenes
    if (req.method === 'GET') {
      try {
        const cedula = url.searchParams.get('cedula');
        let query = supabase
          .from('examenes')
          .select('*')
          .order('fecha_registro', { ascending: false });

        if (cedula) {
          query = query.ilike('cedula_paciente', cedula.trim());
        }

        const { data, error } = await query;

        if (error) {
          console.error('❌ Error GET exámenes:', error);
          sendJson(res, 500, { error: true, message: error.message });
          return true;
        }

        sendJson(res, 200, data || []);
        return true;
      } catch (error) {
        console.error('❌ Error GET exámenes:', error);
        sendJson(res, 500, { error: true, message: error.message });
      }
      return true;
    }

    // POST - Crear examen
    if (req.method === 'POST') {
      try {
        const datos = await readJsonBody(req);
        
        const { data, error } = await supabase
          .from('examenes')
          .insert({
            nombre_paciente: datos.nombrePaciente || '',
            cedula_paciente: datos.cedulaPaciente || '',
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
          console.error('❌ Error al crear examen:', error);
          sendJson(res, 500, { error: true, message: error.message });
          return true;
        }

        sendJson(res, 201, data);
        return true;
      } catch (error) {
        console.error('❌ Error al crear examen:', error);
        sendJson(res, 500, { error: true, message: error.message });
      }
      return true;
    }

    // PUT - Actualizar examen
    if (req.method === 'PUT') {
      try {
        const id = pathname.split('/').pop();
        const datos = await readJsonBody(req);
        
        console.log(`🔄 Actualizando examen ID: ${id}`);
        console.log(`📋 Datos recibidos:`, datos);

        if (!id || isNaN(parseInt(id))) {
          sendJson(res, 400, { error: true, message: 'ID de examen inválido' });
          return true;
        }

        const { data, error } = await supabase
          .from('examenes')
          .update({
            nombre_paciente: datos.nombrePaciente || '',
            cedula_paciente: datos.cedulaPaciente || '',
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
          console.error('❌ Error al actualizar examen:', error);
          sendJson(res, 500, { error: true, message: error.message });
          return true;
        }

        console.log(`✅ Examen ${id} actualizado correctamente`);
        sendJson(res, 200, data || { ok: true, id: id });
        return true;
      } catch (error) {
        console.error('❌ Error al actualizar examen:', error);
        sendJson(res, 500, { error: true, message: error.message });
      }
      return true;
    }

    // DELETE - Eliminar examen
    if (req.method === 'DELETE') {
      try {
        const id = pathname.split('/').pop();
        if (!id) {
          sendJson(res, 400, { error: true, message: 'Falta el id del examen' });
          return true;
        }

        const { error } = await supabase
          .from('examenes')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('❌ Error DELETE examen:', error);
          sendJson(res, 500, { error: true, message: error.message });
          return true;
        }

        sendJson(res, 200, { ok: true });
        return true;
      } catch (error) {
        console.error('❌ Error DELETE examen:', error);
        sendJson(res, 500, { error: true, message: error.message });
      }
      return true;
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
  if (fullPath.startsWith(__dirname) && fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) return fullPath;
  const candidate = path.join(__dirname, normalizedPath + '.html');
  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  return null;
}

async function startServer() {
  try {
    // Probar conexión con Supabase
    const { error } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1);

    if (error) {
      console.warn('⚠️ No se pudo conectar con Supabase:', error.message);
    } else {
      console.log('✅ Conectado a Supabase');
    }

    const server = http.createServer(async (req, res) => {
      setCors(res);
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      // Manejar APIs en orden
      if (await handleApiAuth(req, res)) return;
      if (await handleApiUsuarios(req, res)) return;
      if (await handleApiCedula(req, res)) return;
      if (await handleApiEstudios(req, res)) return;
      if (await handleApiExamenes(req, res)) return;

      // Servir archivos estáticos
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
      console.log(`🚀 Servidor en http://localhost:${PORT}`);
      console.log(`📊 Usando Supabase`);
      console.log(`🔍 API de cédula disponible en /api/cedula.js`);
      console.log(`📋 API de estudios disponible en /api/estudios`);
      console.log(`📋 API de exámenes disponible en /api/examenes`);
      console.log(`🔐 API de autenticación disponible en /api/auth/login`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

startServer();