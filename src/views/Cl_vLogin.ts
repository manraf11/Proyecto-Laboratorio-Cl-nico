// src/views/Cl_vLogin.ts
import I_vLogin from '../interfaces/I_vLogin.js';

export default class Cl_vLogin implements I_vLogin {
    private form: HTMLFormElement;
    private inputUsuario: HTMLInputElement;
    private inputPassword: HTMLInputElement;
    private btnLogin: HTMLButtonElement;
    private mensajeError: HTMLElement;
    private avisarLogin: ((usuario: string, password: string) => void) | null = null;

    constructor() {
        this.form = document.getElementById('loginForm') as HTMLFormElement;
        this.inputUsuario = document.getElementById('usuario') as HTMLInputElement;
        this.inputPassword = document.getElementById('password') as HTMLInputElement;
        this.btnLogin = document.getElementById('btnLogin') as HTMLButtonElement;
        this.mensajeError = document.getElementById('mensajeError') as HTMLElement;

        this.configurarEventos();
        console.log('%c🏥 Laboratorio Clínico - Login', 'font-size:18px; font-weight:800; color:#1a5f7a;');
    }

    private configurarEventos(): void {
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
            item.addEventListener('click', function() {
                const user = this.getAttribute('data-user');
                const pass = this.getAttribute('data-pass');
                if (user && pass) {
                    const inputUsuario = document.getElementById('usuario') as HTMLInputElement;
                    const inputPassword = document.getElementById('password') as HTMLInputElement;
                    inputUsuario.value = user;
                    inputPassword.value = pass;
                    inputPassword.focus();
                    inputPassword.select();
                }
            });
        });
    }

    public cuandoDenLogin(callback: (usuario: string, password: string) => void): void {
        this.avisarLogin = callback;
    }

    public mostrarError(mensaje: string): void {
        const textoError = document.getElementById('textoError');
        if (textoError) textoError.textContent = mensaje;
        this.mensajeError.style.display = 'flex';
    }

    public limpiarError(): void {
        this.mensajeError.style.display = 'none';
    }

    public mostrarCargando(): void {
        this.btnLogin.disabled = true;
        this.btnLogin.innerHTML = '⏳ Cargando...';
    }

    public ocultarCargando(): void {
        this.btnLogin.disabled = false;
        this.btnLogin.innerHTML = '<span class="btn-icon">🚀</span> Iniciar Sesión';
    }

    public redirigirSegunRol(rol: 'admin' | 'bioanalista' | 'recepcionista'): void {
        let destino = 'administrador.html';
        if (rol === 'bioanalista') {
            destino = 'index_bioanalista.html';
        } else if (rol === 'recepcionista') {
            destino = 'index_recepcionista.html';
        }
        console.log(`🔄 Redirigiendo a: ${destino} (rol: ${rol})`);
        setTimeout(() => {
            window.location.href = destino;
        }, 500);
    }
}