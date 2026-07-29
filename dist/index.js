// src/index.ts
import Cl_vLogin from './views/Cl_vLogin.js';
import Cl_cLogin from './controllers/Cl_cLogin.js';
import { testConnection } from './config/index.js';
async function iniciarAplicacion() {
    try {
        console.log('🔌 Iniciando sistema de Laboratorio Clínico...');
        console.log('🔌 Probando conexión a PostgreSQL...');
        const conectado = await testConnection();
        if (!conectado) {
            console.warn('⚠️ No se pudo conectar a PostgreSQL. El sistema funcionará en modo offline.');
        }
        else {
            console.log('✅ Conexión a PostgreSQL establecida correctamente');
        }
        const vistaLogin = new Cl_vLogin();
        new Cl_cLogin(vistaLogin);
        console.log('🏥 Sistema de Laboratorio Clínico iniciado');
        console.log('📋 Credenciales: admin / admin123 | bioanalista / bio123');
    }
    catch (error) {
        console.error('❌ Error al iniciar la aplicación:', error);
        const mensajeError = error instanceof Error ? error.message : 'Error desconocido';
        document.body.innerHTML = `
            <div style="text-align:center; padding:50px; font-family:Arial;">
                <h1 style="color:#c0392b;">❌ Error de conexión</h1>
                <p>No se pudo conectar a la base de datos PostgreSQL.</p>
                <p style="color:#666; font-size:14px;">${mensajeError}</p>
                <button onclick="location.reload()" style="padding:10px 20px; margin-top:20px; cursor:pointer; background:#1a5f7a; color:white; border:none; border-radius:5px;">
                    Reintentar
                </button>
            </div>
        `;
    }
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        void iniciarAplicacion();
    });
}
else {
    void iniciarAplicacion();
}
//# sourceMappingURL=index.js.map