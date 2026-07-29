// services/Cl_sAuth.ts
import { supabase } from '../config/database.js';
import Cl_mUsuario from '../models/Cl_mUsuario.js';

function hashPassword(password: string): string {
    return btoa(password);
}

function isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export default class Cl_sAuth {
    private static usuarioActual: Cl_mUsuario | null = null;

    static async login(nombreUsuario: string, password: string): Promise<{ 
        success: boolean; 
        usuario?: Cl_mUsuario; 
        mensaje?: string 
    }> {
        try {
            const usuarioInput = nombreUsuario.trim().toLowerCase();
            const passwordInput = password.trim();

            console.log(`🔍 Intentando login para usuario: ${usuarioInput}`);

            // ============================================
            // PASO 1: Verificar en Supabase
            // ============================================
            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('nombre_usuario', usuarioInput)
                .eq('activo', true)
                .maybeSingle();

            if (error) {
                console.error('❌ Error al consultar Supabase:', error);
            }

            if (data) {
                const passwordHash = hashPassword(passwordInput);
                
                if (data.password_hash === passwordHash) {
                    console.log(`✅ Usuario encontrado: ${data.nombre_usuario} (${data.rol})`);
                    
                    await supabase
                        .from('usuarios')
                        .update({ ultimo_acceso: new Date().toISOString() })
                        .eq('id', data.id);

                    const usuario = new Cl_mUsuario({
                        id: String(data.id),
                        nombreUsuario: data.nombre_usuario,
                        nombreCompleto: data.nombre_completo,
                        email: data.email,
                        passwordHash: data.password_hash,
                        rol: data.rol,
                        activo: data.activo,
                        ultimoAcceso: data.ultimo_acceso,
                        createdAt: data.created_at,
                        updatedAt: data.updated_at
                    });

                    this.usuarioActual = usuario;
                    return { 
                        success: true, 
                        usuario, 
                        mensaje: `Bienvenido ${usuario.nombreCompleto} (${usuario.getRolLabel()})` 
                    };
                } else {
                    console.warn('❌ Contraseña incorrecta para usuario:', usuarioInput);
                    return { success: false, mensaje: 'Contraseña incorrecta' };
                }
            }

            // ============================================
            // PASO 2: Usuarios demo (fallback)
            // ============================================
            const DEMO_USERS: Record<string, { password: string; rol: 'admin' | 'bioanalista' | 'recepcionista'; nombreCompleto: string }> = {
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

            console.warn(`❌ Usuario no encontrado: ${usuarioInput}`);
            return { 
                success: false, 
                mensaje: 'Usuario o contraseña incorrectos' 
            };

        } catch (error) {
            console.error('❌ Error en login:', error);
            return { 
                success: false, 
                mensaje: 'Error al iniciar sesión. Verifique la conexión a la base de datos.' 
            };
        }
    }

    static logout(): void {
        this.usuarioActual = null;
        if (isBrowser()) {
            sessionStorage.removeItem('labUser');
        }
    }

    static getUsuarioActual(): Cl_mUsuario | null {
        return this.usuarioActual;
    }

    static estaAutenticado(): boolean {
        return this.usuarioActual !== null;
    }

    static esAdmin(): boolean {
        return this.usuarioActual?.rol === 'admin';
    }

    static esBioanalista(): boolean {
        return this.usuarioActual?.rol === 'bioanalista';
    }

    static esRecepcionista(): boolean {
        return this.usuarioActual?.rol === 'recepcionista';
    }

    static async registrarUsuario(
        nombreUsuario: string,
        nombreCompleto: string,
        email: string,
        password: string,
        rol: 'admin' | 'bioanalista' | 'recepcionista'
    ): Promise<{ success: boolean; mensaje?: string; usuario?: Cl_mUsuario }> {
        try {
            const usuarioInput = nombreUsuario.trim().toLowerCase();
            const passwordHash = hashPassword(password.trim());

            const { data: existe } = await supabase
                .from('usuarios')
                .select('id')
                .or(`nombre_usuario.eq.${usuarioInput},email.eq.${email.toLowerCase()}`)
                .maybeSingle();

            if (existe) {
                return { success: false, mensaje: 'El usuario o email ya está registrado' };
            }

            const { data, error } = await supabase
                .from('usuarios')
                .insert({
                    nombre_usuario: usuarioInput,
                    nombre_completo: nombreCompleto.trim(),
                    email: email.toLowerCase().trim(),
                    password_hash: passwordHash,
                    rol: rol,
                    activo: true
                })
                .select()
                .single();

            if (error) {
                console.error('❌ Error al registrar usuario:', error);
                return { success: false, mensaje: 'Error al registrar usuario: ' + error.message };
            }

            const usuario = new Cl_mUsuario({
                id: String(data.id),
                nombreUsuario: data.nombre_usuario,
                nombreCompleto: data.nombre_completo,
                email: data.email,
                passwordHash: data.password_hash,
                rol: data.rol,
                activo: data.activo,
                createdAt: data.created_at
            });

            return { success: true, usuario, mensaje: 'Usuario registrado exitosamente' };
        } catch (error) {
            console.error('❌ Error al registrar usuario:', error);
            return { success: false, mensaje: 'Error al registrar usuario' };
        }
    }

    static async cambiarPassword(
        usuarioId: string,
        passwordActual: string,
        passwordNuevo: string
    ): Promise<{ success: boolean; mensaje?: string }> {
        try {
            const { data: usuario } = await supabase
                .from('usuarios')
                .select('password_hash')
                .eq('id', parseInt(usuarioId))
                .maybeSingle();

            if (!usuario) {
                return { success: false, mensaje: 'Usuario no encontrado' };
            }

            const hashActual = hashPassword(passwordActual);
            if (usuario.password_hash !== hashActual) {
                return { success: false, mensaje: 'Contraseña actual incorrecta' };
            }

            const nuevoHash = hashPassword(passwordNuevo);
            const { error } = await supabase
                .from('usuarios')
                .update({ 
                    password_hash: nuevoHash,
                    updated_at: new Date().toISOString()
                })
                .eq('id', parseInt(usuarioId));

            if (error) {
                console.error('❌ Error al cambiar password:', error);
                return { success: false, mensaje: 'Error al cambiar la contraseña' };
            }

            return { success: true, mensaje: 'Contraseña actualizada exitosamente' };
        } catch (error) {
            console.error('❌ Error al cambiar password:', error);
            return { success: false, mensaje: 'Error al cambiar la contraseña' };
        }
    }
}