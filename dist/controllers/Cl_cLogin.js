// controllers/Cl_cLogin.ts
import Cl_sAuth from '../services/Cl_sAuth.js';
export default class Cl_cLogin {
    vista;
    constructor(vista) {
        this.vista = vista;
        this.vista.cuandoDenLogin((usuario, password) => {
            this.iniciarSesion(usuario, password);
        });
    }
    async iniciarSesion(usuario, password) {
        this.vista.mostrarCargando();
        this.vista.limpiarError();
        try {
            // ============================================
            // PASO 1: Intentar autenticar contra la API del servidor
            // ============================================
            const resultadoApi = await this.autenticarViaAPI(usuario, password);
            if (resultadoApi.success && resultadoApi.usuario) {
                console.log(`✅ Login exitoso vía API: ${resultadoApi.usuario.nombreUsuario} (${resultadoApi.usuario.rol})`);
                sessionStorage.setItem('labUser', JSON.stringify({
                    id: resultadoApi.usuario.id,
                    usuario: resultadoApi.usuario.nombreUsuario,
                    rol: resultadoApi.usuario.rol,
                    nombreCompleto: resultadoApi.usuario.nombreCompleto,
                    timestamp: Date.now()
                }));
                this.vista.redirigirSegunRol(resultadoApi.usuario.rol);
                return;
            }
            // ============================================
            // PASO 2: Fallback - Intentar autenticar localmente
            // ============================================
            console.log('🔄 Fallback: Intentando autenticación local...');
            const resultadoLocal = await Cl_sAuth.login(usuario, password);
            if (resultadoLocal.success && resultadoLocal.usuario) {
                console.log(`✅ Login exitoso local: ${resultadoLocal.usuario.nombreUsuario} (${resultadoLocal.usuario.rol})`);
                sessionStorage.setItem('labUser', JSON.stringify({
                    usuario: resultadoLocal.usuario.nombreUsuario,
                    rol: resultadoLocal.usuario.rol,
                    nombreCompleto: resultadoLocal.usuario.nombreCompleto,
                    timestamp: Date.now()
                }));
                this.vista.redirigirSegunRol(resultadoLocal.usuario.rol);
            }
            else {
                this.vista.mostrarError(resultadoLocal.mensaje || 'Error al iniciar sesión');
                this.vista.ocultarCargando();
            }
        }
        catch (error) {
            console.error('❌ Error en login:', error);
            this.vista.mostrarError('Error de conexión con el servidor');
            this.vista.ocultarCargando();
        }
    }
    async autenticarViaAPI(usuario, password) {
        try {
            console.log(`🌐 Intentando autenticación vía API para: ${usuario}`);
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, password })
            });
            const data = await response.json();
            console.log(`📊 Respuesta API:`, data);
            return data;
        }
        catch (error) {
            console.error('❌ Error en autenticación vía API:', error);
            return { success: false, mensaje: 'Error al conectar con el servidor' };
        }
    }
}
//# sourceMappingURL=Cl_cLogin.js.map