// src/services/Cl_sAuth.ts
import Cl_mUsuario from '../models/Cl_mUsuario.js';
// USAR MOCKAPI PARA USUARIOS - TABLA: users
const API_URL = "https://6a697172b2789286ad709109.mockapi.io/user";
// Hash simple para contraseñas (solo para demostración)
function hashPassword(password) {
    return btoa(password);
}
// Usuarios por defecto para inicializar MockAPI
const DEFAULT_USERS = [
    {
        nombre_usuario: 'admin',
        nombre_completo: 'Administrador del Sistema',
        password: 'admin123',
        rol: 'admin',
        activo: true,
        ultimo_acceso: new Date().toISOString()
    },
    {
        nombre_usuario: 'bioanalista',
        nombre_completo: 'Bioanalista Principal',
        password: 'bio123',
        rol: 'bioanalista',
        activo: true,
        ultimo_acceso: new Date().toISOString()
    },
    {
        nombre_usuario: 'recepcion',
        nombre_completo: 'Recepcionista',
        password: 'recep123',
        rol: 'admin',
        activo: true,
        ultimo_acceso: new Date().toISOString()
    }
];
export default class Cl_sAuth {
    static usuarioActual = null;
    // Inicializar usuarios en MockAPI si están vacíos
    static async inicializarUsuarios() {
        try {
            console.log("📥 Verificando usuarios en MockAPI...");
            const respuesta = await fetch(API_URL);
            if (!respuesta.ok) {
                console.error(`❌ Error al verificar usuarios: ${respuesta.status}`);
                return;
            }
            const usuarios = await respuesta.json();
            if (usuarios.length === 0) {
                console.log("📤 Creando usuarios por defecto en MockAPI...");
                for (const user of DEFAULT_USERS) {
                    await fetch(API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(user)
                    });
                }
                console.log("✅ Usuarios por defecto creados en MockAPI");
                console.log(`📋 Credenciales:`);
                DEFAULT_USERS.forEach(u => {
                    console.log(`   👤 ${u.nombre_usuario} / 🔑 ${u.password} (${u.rol})`);
                });
            }
            else {
                console.log(`✅ ${usuarios.length} usuarios encontrados en MockAPI`);
            }
        }
        catch (error) {
            console.error('❌ Error al inicializar usuarios:', error);
        }
    }
    static async login(nombreUsuario, password) {
        try {
            // Inicializar usuarios si es necesario
            await this.inicializarUsuarios();
            const usuarioInput = nombreUsuario.trim().toLowerCase();
            console.log(`🔍 Buscando usuario: ${usuarioInput}`);
            // Buscar en MockAPI filtrando por nombre_usuario
            const respuesta = await fetch(`${API_URL}?nombre_usuario=${encodeURIComponent(usuarioInput)}`);
            if (!respuesta.ok) {
                console.error(`❌ Error HTTP: ${respuesta.status}`);
                return { success: false, mensaje: 'Error al conectar con el servidor' };
            }
            const usuarios = await respuesta.json();
            console.log(`📊 Resultados de búsqueda: ${usuarios.length}`);
            if (!Array.isArray(usuarios) || usuarios.length === 0) {
                console.log(`❌ Usuario no encontrado: ${usuarioInput}`);
                return { success: false, mensaje: 'Usuario no encontrado' };
            }
            const usuarioEncontrado = usuarios[0];
            console.log(`👤 Usuario encontrado: ${usuarioEncontrado.nombre_usuario}`);
            // Verificar si el usuario está activo
            if (usuarioEncontrado.activo === false) {
                console.log(`❌ Usuario inactivo: ${usuarioInput}`);
                return { success: false, mensaje: 'Usuario inactivo' };
            }
            // Verificar contraseña
            if (usuarioEncontrado.password !== password) {
                console.log(`❌ Contraseña incorrecta para: ${usuarioInput}`);
                return { success: false, mensaje: 'Contraseña incorrecta' };
            }
            // Verificar que tenga rol válido
            if (!usuarioEncontrado.rol || !['admin', 'bioanalista'].includes(usuarioEncontrado.rol)) {
                console.log(`❌ Rol inválido: ${usuarioEncontrado.rol}`);
                return { success: false, mensaje: 'Rol de usuario inválido' };
            }
            // Crear objeto usuario
            const usuario = new Cl_mUsuario({
                id: String(usuarioEncontrado.id),
                nombreUsuario: usuarioEncontrado.nombre_usuario,
                nombreCompleto: usuarioEncontrado.nombre_completo || usuarioEncontrado.nombre_usuario,
                email: `${usuarioEncontrado.nombre_usuario}@laboratorio.local`,
                passwordHash: hashPassword(password),
                rol: usuarioEncontrado.rol,
                activo: usuarioEncontrado.activo !== undefined ? usuarioEncontrado.activo : true,
                ultimoAcceso: usuarioEncontrado.ultimo_acceso
            });
            // Actualizar último acceso
            try {
                await fetch(`${API_URL}/${usuarioEncontrado.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...usuarioEncontrado,
                        ultimo_acceso: new Date().toISOString()
                    })
                });
                console.log(`🔄 Último acceso actualizado para: ${usuarioInput}`);
            }
            catch (updateError) {
                console.warn('⚠️ No se pudo actualizar último acceso:', updateError);
            }
            this.usuarioActual = usuario;
            console.log(`✅ Usuario ${usuario.nombreUsuario} autenticado correctamente`);
            console.log(`🎯 Rol: ${usuario.rol}`);
            return {
                success: true,
                usuario,
                mensaje: `Bienvenido ${usuario.nombreCompleto}`
            };
        }
        catch (error) {
            console.error('❌ Error en login:', error);
            return { success: false, mensaje: 'Error al iniciar sesión' };
        }
    }
    static logout() {
        this.usuarioActual = null;
        console.log("👋 Sesión cerrada");
    }
    static getUsuarioActual() {
        return this.usuarioActual;
    }
    static estaAutenticado() {
        return this.usuarioActual !== null;
    }
    static esAdmin() {
        return this.usuarioActual?.rol === 'admin';
    }
    static esBioanalista() {
        return this.usuarioActual?.rol === 'bioanalista';
    }
    static async registrarUsuario(nombreUsuario, nombreCompleto, email, password, rol) {
        try {
            console.log(`📤 Registrando usuario ${nombreUsuario} en MockAPI...`);
            // Verificar si ya existe
            const verificar = await fetch(`${API_URL}?nombre_usuario=${encodeURIComponent(nombreUsuario)}`);
            const existentes = await verificar.json();
            if (Array.isArray(existentes) && existentes.length > 0) {
                console.log(`❌ Usuario ya existe: ${nombreUsuario}`);
                return { success: false, mensaje: 'El usuario ya existe' };
            }
            const nuevoUsuario = {
                nombre_usuario: nombreUsuario,
                nombre_completo: nombreCompleto,
                password: password,
                rol: rol,
                activo: true,
                ultimo_acceso: new Date().toISOString()
            };
            const respuesta = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoUsuario)
            });
            if (!respuesta.ok) {
                throw new Error(`HTTP ${respuesta.status}`);
            }
            const datos = await respuesta.json();
            const usuario = new Cl_mUsuario({
                id: String(datos.id),
                nombreUsuario: datos.nombre_usuario,
                nombreCompleto: datos.nombre_completo,
                email: email,
                passwordHash: hashPassword(password),
                rol: datos.rol,
                activo: datos.activo,
                ultimoAcceso: datos.ultimo_acceso
            });
            console.log(`✅ Usuario ${nombreUsuario} registrado en MockAPI`);
            return { success: true, usuario, mensaje: 'Usuario registrado exitosamente' };
        }
        catch (error) {
            console.error('❌ Error al registrar usuario:', error);
            return { success: false, mensaje: 'Error al registrar usuario' };
        }
    }
    static async cambiarPassword(usuarioId, passwordActual, passwordNuevo) {
        try {
            console.log(`🔄 Cambiando contraseña para usuario ${usuarioId}...`);
            // Obtener usuario actual
            const respuesta = await fetch(`${API_URL}/${usuarioId}`);
            if (!respuesta.ok) {
                return { success: false, mensaje: 'Usuario no encontrado' };
            }
            const usuario = await respuesta.json();
            // Verificar contraseña actual
            if (usuario.password !== passwordActual) {
                return { success: false, mensaje: 'Contraseña actual incorrecta' };
            }
            // Actualizar contraseña
            const update = await fetch(`${API_URL}/${usuarioId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...usuario,
                    password: passwordNuevo
                })
            });
            if (!update.ok) {
                return { success: false, mensaje: 'Error al actualizar contraseña' };
            }
            console.log(`✅ Contraseña actualizada para usuario ${usuarioId}`);
            return { success: true, mensaje: 'Contraseña actualizada exitosamente' };
        }
        catch (error) {
            console.error('❌ Error al cambiar password:', error);
            return { success: false, mensaje: 'Error al cambiar la contraseña' };
        }
    }
    // Método para obtener todos los usuarios (útil para administración)
    static async obtenerTodosUsuarios() {
        try {
            const respuesta = await fetch(API_URL);
            if (!respuesta.ok) {
                throw new Error(`HTTP ${respuesta.status}`);
            }
            const datos = await respuesta.json();
            return datos.map((item) => new Cl_mUsuario({
                id: String(item.id),
                nombreUsuario: item.nombre_usuario,
                nombreCompleto: item.nombre_completo,
                email: `${item.nombre_usuario}@laboratorio.local`,
                passwordHash: '',
                rol: item.rol,
                activo: item.activo,
                ultimoAcceso: item.ultimo_acceso
            }));
        }
        catch (error) {
            console.error('❌ Error al obtener usuarios:', error);
            return [];
        }
    }
}
//# sourceMappingURL=Cl_sAuth.js.map