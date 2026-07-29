// models/Cl_mUsuario.ts

export interface IUsuario {
    id?: string;
    nombreUsuario: string;
    nombreCompleto: string;
    email: string;
    passwordHash: string;
    rol: 'admin' | 'bioanalista' | 'recepcionista';
    activo: boolean;
    ultimoAcceso?: string;
    createdAt?: string;
    updatedAt?: string;
}

export default class Cl_mUsuario {
    public id: string;
    public nombreUsuario: string;
    public nombreCompleto: string;
    public email: string;
    public passwordHash: string;
    public rol: 'admin' | 'bioanalista' | 'recepcionista';
    public activo: boolean;
    public ultimoAcceso?: string;
    public createdAt?: string;
    public updatedAt?: string;

    constructor(datos: IUsuario) {
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
    public esAdmin(): boolean {
        return this.rol === 'admin';
    }

    // Verificar si es bioanalista
    public esBioanalista(): boolean {
        return this.rol === 'bioanalista';
    }

    // Verificar si es recepcionista
    public esRecepcionista(): boolean {
        return this.rol === 'recepcionista';
    }

    // Verificar si el usuario está activo
    public estaActivo(): boolean {
        return this.activo;
    }

    // Validar datos del usuario
    public validar(): { valido: boolean; errores: string[] } {
        const errores: string[] = [];

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

        if (!this.rol || !['admin', 'bioanalista', 'recepcionista'].includes(this.rol)) {
            errores.push('El rol debe ser admin, bioanalista o recepcionista');
        }

        return {
            valido: errores.length === 0,
            errores: errores
        };
    }

    // Obtener nombre para mostrar
    public getDisplayName(): string {
        return `${this.nombreCompleto} (${this.nombreUsuario})`;
    }

    // Obtener rol en español
    public getRolLabel(): string {
        if (this.rol === 'admin') return 'Administrador';
        if (this.rol === 'bioanalista') return 'Bioanalista';
        return 'Recepcionista';
    }
}