export default class Cl_vLogin {
    form;
    inputUsuario;
    inputPassword;
    btnLogin;
    mensajeError;
    avisarLogin = null;
    constructor() {
        this.form = document.getElementById('loginForm');
        this.inputUsuario = document.getElementById('usuario');
        this.inputPassword = document.getElementById('password');
        this.btnLogin = document.getElementById('btnLogin');
        this.mensajeError = document.getElementById('mensajeError');
        this.configurarEventos();
        console.log('%c🏥 Laboratorio Clínico - Login', 'font-size:18px; font-weight:800; color:#1a5f7a;');
    }
    configurarEventos() {
        const togglePass = document.getElementById('togglePassword');
        if (togglePass) {
            togglePass.addEventListener('click', () => {
                const type = this.inputPassword.getAttribute('type') === 'password' ? 'text' : 'password';
                this.inputPassword.setAttribute('type', type);
                togglePass.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
            });
        }
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.mensajeError.style.display = 'none';
            const usuario = this.inputUsuario.value.trim();
            const password = this.inputPassword.value.trim();
            if (!usuario || !password) {
                this.mostrarError('Por favor, ingresa usuario y contraseña');
                return;
            }
            if (this.avisarLogin) {
                this.avisarLogin(usuario, password);
            }
        });
        // Click en credenciales demo
        document.querySelectorAll('.cred-item').forEach((item) => {
            item.addEventListener('click', function () {
                const user = this.getAttribute('data-user');
                const pass = this.getAttribute('data-pass');
                if (user && pass) {
                    const inputUsuario = document.getElementById('usuario');
                    const inputPassword = document.getElementById('password');
                    inputUsuario.value = user;
                    inputPassword.value = pass;
                    inputPassword.focus();
                    inputPassword.select();
                }
            });
        });
    }
    cuandoDenLogin(callback) {
        this.avisarLogin = callback;
    }
    mostrarError(mensaje) {
        const textoError = document.getElementById('textoError');
        if (textoError)
            textoError.textContent = mensaje;
        this.mensajeError.style.display = 'flex';
    }
    limpiarError() {
        this.mensajeError.style.display = 'none';
    }
    mostrarCargando() {
        this.btnLogin.disabled = true;
        this.btnLogin.innerHTML = '⏳ Cargando...';
    }
    ocultarCargando() {
        this.btnLogin.disabled = false;
        this.btnLogin.innerHTML = '<span class="btn-icon">🚀</span> Iniciar Sesión';
    }
    redirigirSegunRol(rol) {
        let destino = 'administrador.html';
        if (rol === 'bioanalista') {
            destino = 'index_bioanalista.html';
        }
        else if (rol === 'recepcionista') {
            destino = 'index_recepcionista.html';
        }
        console.log(`🔄 Redirigiendo a: ${destino} (rol: ${rol})`);
        setTimeout(() => {
            window.location.href = destino;
        }, 500);
    }
}
//# sourceMappingURL=Cl_vLogin.js.map