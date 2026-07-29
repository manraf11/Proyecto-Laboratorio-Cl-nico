// src/interfaces/I_vLogin.ts

export default interface I_vLogin {
    cuandoDenLogin(callback: (usuario: string, password: string) => void): void;
    mostrarError(mensaje: string): void;
    limpiarError(): void;
    mostrarCargando(): void;
    ocultarCargando(): void;
    redirigirSegunRol(rol: 'admin' | 'bioanalista' | 'recepcionista'): void;
}