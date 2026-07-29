// services/Cl_sAuth.ts
import Cl_mUsuario from '../models/Cl_mUsuario.js';
import { supabase } from '../config/index.js';
// Función para hacer hash de la contraseña (usando btoa para simplicidad)
function hashPassword(password) {
    return btoa(password);
}
// Función para verificar si estamos en el navegador o en Node.js
function isBrowser() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}
// Funciones para localStorage (solo en navegador)
function obtenerUsuariosLocales() {
    if (!isBrowser())
        return [];
    try {
        const datos = localStorage.getItem('labUsers');
        if (!datos)
            return [];
        const parsed = JSON.parse(datos);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
}
function guardarUsuariosLocales(usuarios) {
    if (!isBrowser())
        return;
    localStorage.setItem('labUsers', JSON.stringify(usuarios));
}
export default class Cl_sAuth {
    static usuarioActual = null;
    // ============================================
    // MÉTODO PRINCIPAL DE LOGIN
    // ============================================
    static async login(nombreUsuario, password) {
        try {
            const usuarioInput = nombreUsuario.trim().toLowerCase();
            const passwordInput = password.trim();
            console.log(`🔍 Intentando login para usuario: ${usuarioInput}`);
            // ============================================
            // PASO 1: Verificar en Supabase
            // ============================================
            console.log('📊 Consultando tabla usuarios en Supabase...');
            try {
                const passwordHash = hashPassword(passwordInput);
                const { data, error } = await supabase
                    .from('usuarios')
                    .select('id, nombre_usuario, nombre_completo, email, password_hash, rol, activo, ultimo_acceso, created_at, updated_at')
                    .ilike('nombre_usuario', usuarioInput)
                    .eq('activo', true)
                    .limit(1);
                if (error) {
                    console.error('❌ Error al consultar Supabase:', error.message);
                }
                else if (data && data.length > 0) {
                    const row = data[0];
                    if (row.password_hash === passwordHash) {
                        console.log(`✅ Usuario encontrado en Supabase: ${row.nombre_usuario} (${row.rol})`);
                        // Actualizar último acceso
                        await supabase
                            .from('usuarios')
                            .update({ ultimo_acceso: new Date().toISOString() })
                            .eq('id', row.id);
                        const usuario = new Cl_mUsuario({
                            id: String(row.id),
                            nombreUsuario: row.nombre_usuario,
                            nombreCompleto: row.nombre_completo,
                            email: row.email,
                            passwordHash: row.password_hash,
                            rol: row.rol,
                            activo: row.activo,
                            ultimoAcceso: row.ultimo_acceso,
                            createdAt: row.created_at,
                            updatedAt: row.updated_at
                        });
                        this.usuarioActual = usuario;
                        return {
                            success: true,
                            usuario,
                            mensaje: `Bienvenido ${usuario.nombreCompleto} (${usuario.getRolLabel()})`
                        };
                    }
                    else {
                        console.warn('❌ Contraseña incorrecta para usuario:', usuarioInput);
                        return { success: false, mensaje: 'Contraseña incorrecta' };
                    }
                }
                else {
                    console.warn(`❌ Usuario no encontrado en Supabase: ${usuarioInput}`);
                }
            }
            catch (dbError) {
                console.error('❌ Error al consultar Supabase:', dbError);
            }
            // ============================================
            // PASO 2: Verificar en usuarios demo (fallback)
            // ============================================
            const DEMO_USERS = {
                admin: { password: 'admin123', rol: 'admin', nombreCompleto: 'Administrador' },
                bioanalista: { password: 'bio123', rol: 'bioanalista', nombreCompleto: 'Bioanalista' },
                recepcion: { password: 'rec123', rol: 'recepcionista', nombreCompleto: 'Recepcionista' }
            };
            const demo = DEMO_USERS[usuarioInput];
            if (demo && passwordInput === demo.password) {
                console.log(`✅ Usuario demo encontrado: ${usuarioInput} (${demo.rol})`);
                const usuario = new Cl_mUsuario({
                    id: `demo-${usuarioInput}`,
                    nombreUsuario: usuarioInput,
                    nombreCompleto: demo.nombreCompleto,
                    email: `${usuarioInput}@laboratorio.local`,
                    passwordHash: hashPassword(passwordInput),
                    rol: demo.rol,
                    activo: true
                });
                this.usuarioActual = usuario;
                return {
                    success: true,
                    usuario,
                    mensaje: `Bienvenido ${usuario.nombreCompleto} (modo demo)`
                };
            }
            // ============================================
            // PASO 3: Verificar en localStorage
            // ============================================
            if (isBrowser()) {
                const usuariosLocales = obtenerUsuariosLocales();
                const local = usuariosLocales.find((u) => u.nombreUsuario.toLowerCase() === usuarioInput && u.password === passwordInput);
                if (local) {
                    console.log(`✅ Usuario local encontrado: ${usuarioInput} (${local.rol})`);
                    const usuario = new Cl_mUsuario({
                        id: `local-${usuarioInput}`,
                        nombreUsuario: usuarioInput,
                        nombreCompleto: local.nombreCompleto,
                        email: `${usuarioInput}@laboratorio.local`,
                        passwordHash: hashPassword(passwordInput),
                        rol: local.rol,
                        activo: true
                    });
                    this.usuarioActual = usuario;
                    return {
                        success: true,
                        usuario,
                        mensaje: `Bienvenido ${usuario.nombreCompleto}`
                    };
                }
            }
            console.warn(`❌ Usuario no encontrado: ${usuarioInput}`);
            return {
                success: false,
                mensaje: 'Usuario o contraseña incorrectos'
            };
        }
        catch (error) {
            console.error('❌ Error en login:', error);
            return {
                success: false,
                mensaje: 'Error al iniciar sesión. Verifique la conexión a la base de datos.'
            };
        }
    }
    static logout() {
        this.usuarioActual = null;
        if (isBrowser()) {
            sessionStorage.removeItem('labUser');
        }
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
    static esRecepcionista() {
        return this.usuarioActual?.rol === 'recepcionista';
    }
    static async registrarUsuario(nombreUsuario, nombreCompleto, email, password, rol) {
        try {
            const usuarioInput = nombreUsuario.trim().toLowerCase();
            // Verificar en Supabase
            try {
                const { data: existente } = await supabase
                    .from('usuarios')
                    .select('id')
                    .or(`nombre_usuario.ilike.${usuarioInput},email.ilike.${email.toLowerCase()}`)
                    .limit(1);
                if (existente && existente.length > 0) {
                    return { success: false, mensaje: 'El usuario o email ya está registrado' };
                }
                const passwordHash = hashPassword(password);
                const { data, error } = await supabase
                    .from('usuarios')
                    .insert({
                    nombre_usuario: usuarioInput,
                    nombre_completo: nombreCompleto,
                    email: email.toLowerCase(),
                    password_hash: passwordHash,
                    rol: rol,
                    activo: true
                })
                    .select('id, nombre_usuario, nombre_completo, email, rol, activo, created_at')
                    .single();
                if (error) {
                    console.error('❌ Error al registrar en Supabase:', error.message);
                }
                else if (data) {
                    const usuario = new Cl_mUsuario({
                        id: String(data.id),
                        nombreUsuario: data.nombre_usuario,
                        nombreCompleto: data.nombre_completo,
                        email: data.email,
                        passwordHash: passwordHash,
                        rol: data.rol,
                        activo: data.activo,
                        createdAt: data.created_at
                    });
                    return { success: true, usuario, mensaje: 'Usuario registrado exitosamente' };
                }
            }
            catch (dbError) {
                console.error('❌ Error al registrar en Supabase:', dbError);
            }
            // Fallback a localStorage en el navegador
            if (isBrowser()) {
                const usuariosLocales = obtenerUsuariosLocales();
                const existe = usuariosLocales.some((u) => u.nombreUsuario.toLowerCase() === usuarioInput);
                if (existe) {
                    return { success: false, mensaje: 'El usuario ya está registrado' };
                }
                usuariosLocales.push({
                    nombreUsuario: usuarioInput,
                    password,
                    rol,
                    nombreCompleto
                });
                guardarUsuariosLocales(usuariosLocales);
                const usuario = new Cl_mUsuario({
                    id: `local-${usuarioInput}`,
                    nombreUsuario: usuarioInput,
                    nombreCompleto,
                    email: email.toLowerCase(),
                    passwordHash: hashPassword(password),
                    rol,
                    activo: true
                });
                return { success: true, usuario, mensaje: 'Usuario registrado exitosamente' };
            }
            return { success: false, mensaje: 'No se pudo registrar el usuario' };
        }
        catch (error) {
            console.error('❌ Error al registrar usuario:', error);
            return { success: false, mensaje: 'Error al registrar usuario' };
        }
    }
    static async cambiarPassword(usuarioId, passwordActual, passwordNuevo) {
        try {
            // Verificar en Supabase
            try {
                const passwordHashActual = hashPassword(passwordActual);
                const { data } = await supabase
                    .from('usuarios')
                    .select('id')
                    .eq('id', usuarioId)
                    .eq('password_hash', passwordHashActual)
                    .limit(1);
                if (!data || data.length === 0) {
                    return { success: false, mensaje: 'Contraseña actual incorrecta' };
                }
                const nuevoHash = hashPassword(passwordNuevo);
                await supabase
                    .from('usuarios')
                    .update({
                    password_hash: nuevoHash,
                    updated_at: new Date().toISOString()
                })
                    .eq('id', usuarioId);
                return { success: true, mensaje: 'Contraseña actualizada exitosamente' };
            }
            catch (dbError) {
                console.error('❌ Error al cambiar password en Supabase:', dbError);
            }
            // Fallback a localStorage en el navegador
            if (isBrowser()) {
                const usuariosLocales = obtenerUsuariosLocales();
                const index = usuariosLocales.findIndex((u) => u.nombreUsuario.toLowerCase() === usuarioId.toLowerCase());
                if (index === -1) {
                    return { success: false, mensaje: 'Usuario no encontrado' };
                }
                if (usuariosLocales[index].password !== passwordActual) {
                    return { success: false, mensaje: 'Contraseña actual incorrecta' };
                }
                usuariosLocales[index].password = passwordNuevo;
                guardarUsuariosLocales(usuariosLocales);
                return { success: true, mensaje: 'Contraseña actualizada exitosamente' };
            }
            return { success: false, mensaje: 'No se pudo cambiar la contraseña' };
        }
        catch (error) {
            console.error('❌ Error al cambiar password:', error);
            return { success: false, mensaje: 'Error al cambiar la contraseña' };
        }
    }
}
//# sourceMappingURL=Cl_sAuth.js.map