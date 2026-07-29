// models/Cl_mUsuario.ts
export default class Cl_mUsuario {
    id;
    nombreUsuario;
    nombreCompleto;
    email;
    passwordHash;
    rol;
    activo;
    ultimoAcceso;
    createdAt;
    updatedAt;
    constructor(datos) {
        this.id = datos.id || '';
        this.nombreUsuario = datos.nombreUsuario;
        this.nombreCompleto = datos.nombreCompleto;
        this.email = datos.email;
        this.passwordHash = datos.passwordHash;
        this.rol = datos.rol;
        this.activo = datos.activo !== undefined ? datos.activo : true;
        this.ultimoAcceso = datos.ultimoAcceso;
        this.createdAt = datos.createdAt;
        this.updatedAt = datos.updatedAt;
    }
    // Verificar si es administrador
    esAdmin() {
        return this.rol === 'admin';
    }
    // Verificar si es bioanalista
    esBioanalista() {
        return this.rol === 'bioanalista';
    }
    // Verificar si el usuario está activo
    estaActivo() {
        return this.activo;
    }
    // Validar datos del usuario
    validar() {
        const errores = [];
        if (!this.nombreUsuario || this.nombreUsuario.trim() === '') {
            errores.push('El nombre de usuario es obligatorio');
        }
        if (this.nombreUsuario && this.nombreUsuario.length < 3) {
            errores.push('El nombre de usuario debe tener al menos 3 caracteres');
        }
        if (!this.nombreCompleto || this.nombreCompleto.trim() === '') {
            errores.push('El nombre completo es obligatorio');
        }
        if (!this.email || this.email.trim() === '') {
            errores.push('El email es obligatorio');
        }
        if (this.email && !this.email.includes('@')) {
            errores.push('El email debe ser válido');
        }
        if (!this.passwordHash || this.passwordHash.trim() === '') {
            errores.push('La contraseña es obligatoria');
        }
        if (this.passwordHash && this.passwordHash.length < 6 && this.passwordHash.length < 20) {
            errores.push('La contraseña debe tener al menos 6 caracteres');
        }
        if (!this.rol || !['admin', 'bioanalista'].includes(this.rol)) {
            errores.push('El rol debe ser admin o bioanalista');
        }
        return {
            valido: errores.length === 0,
            errores: errores
        };
    }
    // Obtener nombre para mostrar
    getDisplayName() {
        return `${this.nombreCompleto} (${this.nombreUsuario})`;
    }
    // Obtener rol en español
    getRolLabel() {
        return this.rol === 'admin' ? 'Administrador' : 'Bioanalista';
    }
}
//# sourceMappingURL=Cl_mUsuario.js.map