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
            const resultado = await Cl_sAuth.login(usuario, password);
            if (resultado.success && resultado.usuario) {
                sessionStorage.setItem('labUser', JSON.stringify({
                    usuario: resultado.usuario.nombreUsuario,
                    rol: resultado.usuario.rol,
                    timestamp: Date.now()
                }));
                this.vista.redirigirSegunRol(resultado.usuario.rol);
            }
            else {
                this.vista.mostrarError(resultado.mensaje || 'Error al iniciar sesión');
                this.vista.ocultarCargando();
            }
        }
        catch (error) {
            console.error('Error en login:', error);
            this.vista.mostrarError('Error de conexión con el servidor');
            this.vista.ocultarCargando();
        }
    }
}
//# sourceMappingURL=Cl_cLogin.js.map