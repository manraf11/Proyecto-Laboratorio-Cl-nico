// models/Cl_mEstudio.ts
export default class Cl_mEstudio {
  private static listaEstudios: Cl_mEstudio[] = [];
  
  public id: string;
  private _nombre: string;
  private _precio: number;
  private _unidad: string;
  private _valoresReferencia: string;

  constructor(datos: {
    id?: string;
    nombre: string;
    precio: number;
    unidad: string;
    valoresReferencia: string;
  }) {
    this.id = datos.id || "";  
    this._nombre = datos.nombre;
    this._precio = datos.precio;
    this._unidad = datos.unidad;
    this._valoresReferencia = datos.valoresReferencia;
  }

  get nombre(): string { return this._nombre; }
  get precio(): number { return this._precio; }
  get unidad(): string { return this._unidad; }
  get valoresReferencia(): string { return this._valoresReferencia; }
  
  set nombre(valor: string) { this._nombre = valor; }
  set precio(valor: number) { this._precio = valor; }
  set unidad(valor: string) { this._unidad = valor; }
  set valoresReferencia(valor: string) { this._valoresReferencia = valor; }

  static obtenerTodos(): Cl_mEstudio[] {
    return [...this.listaEstudios];
  }

  static limpiar(): void {
    this.listaEstudios = [];
  }

  static agregarEstudio(estudio: Cl_mEstudio): void {
    this.listaEstudios.push(estudio);
  }

  static actualizarEstudio(id: string, estudioActualizado: Cl_mEstudio): boolean {
    const index = this.listaEstudios.findIndex(e => e.id === id);
    if (index !== -1) {
      this.listaEstudios[index] = estudioActualizado;
      return true;
    }
    return false;
  }

  static eliminarEstudio(id: string): boolean {
    const index = this.listaEstudios.findIndex(e => e.id === id);
    if (index !== -1) {
      this.listaEstudios.splice(index, 1);
      return true;
    }
    return false;
  }

  static buscarPorNombre(nombre: string): Cl_mEstudio | undefined {
    return this.listaEstudios.find(estudio => estudio.nombre === nombre);
  }

  static buscarPorId(id: string): Cl_mEstudio | undefined {
    return this.listaEstudios.find(estudio => estudio.id === id);
  }

  static calcularPrecioTotal(nombresEstudios: string[]): number {
    let total = 0;
    for (let nombre of nombresEstudios) {
      const estudio = this.buscarPorNombre(nombre);
      if (estudio) {
        total += estudio.precio;
      }
    }
    return total;
  }

  static obtenerValoresReferencia(nombreEstudio: string): string {
    const estudio = this.buscarPorNombre(nombreEstudio);
    return estudio ? estudio.valoresReferencia : "No especificado";
  }

  static obtenerUnidad(nombreEstudio: string): string {
    const estudio = this.buscarPorNombre(nombreEstudio);
    return estudio ? estudio.unidad : "";
  }

  static parseValoresReferencia(nombreEstudio: string): { min?: number; max?: number; operador?: string; valor?: number } | null {
    const valorRef = this.obtenerValoresReferencia(nombreEstudio);
    if (!valorRef || typeof valorRef !== 'string') return null;
    
    const texto = valorRef.trim().toLowerCase();
    
    if (texto.startsWith("<")) {
      const num = parseFloat(texto.substring(1));
      if (!isNaN(num)) {
        return { max: num, operador: "<", valor: num };
      }
    }
    
    if (texto.startsWith(">")) {
      const num = parseFloat(texto.substring(1));
      if (!isNaN(num)) {
        return { min: num, operador: ">", valor: num };
      }
    }
    
    if (texto.startsWith("<=")) {
      const num = parseFloat(texto.substring(2));
      if (!isNaN(num)) {
        return { max: num, operador: "<=", valor: num };
      }
    }
    
    if (texto.startsWith(">=")) {
      const num = parseFloat(texto.substring(2));
      if (!isNaN(num)) {
        return { min: num, operador: ">=", valor: num };
      }
    }
    
    if (texto.includes("-")) {
      const partes = texto.split('-').map(p => p.trim());
      const min = parseFloat(partes[0]);
      const max = parseFloat(partes[1]);
      if (!isNaN(min) && !isNaN(max)) {
        return { min, max, operador: "rango" };
      }
    }
    
    const numExacto = parseFloat(texto);
    if (!isNaN(numExacto)) {
      return { min: numExacto, max: numExacto, operador: "exacto", valor: numExacto };
    }
    
    return null;
  }

  static evaluarResultado(nombreEstudio: string, valorResultado: number): { esAlto: boolean; esBajo: boolean; mensaje: string } {
    const referencia = this.parseValoresReferencia(nombreEstudio);
    
    if (!referencia) {
      return { esAlto: false, esBajo: false, mensaje: "" };
    }
    
    if (referencia.operador === "<") {
      if (valorResultado >= referencia.valor!) {
        return { esAlto: true, esBajo: false, mensaje: `ALTO (debe ser < ${referencia.valor})` };
      }
      return { esAlto: false, esBajo: false, mensaje: "" };
    }
    
    if (referencia.operador === "<=") {
      if (valorResultado > referencia.valor!) {
        return { esAlto: true, esBajo: false, mensaje: `ALTO (debe ser ≤ ${referencia.valor})` };
      }
      return { esAlto: false, esBajo: false, mensaje: "" };
    }
    
    if (referencia.operador === ">") {
      if (valorResultado <= referencia.valor!) {
        return { esBajo: true, esAlto: false, mensaje: `BAJO (debe ser > ${referencia.valor})` };
      }
      return { esAlto: false, esBajo: false, mensaje: "" };
    }
    
    if (referencia.operador === ">=") {
      if (valorResultado < referencia.valor!) {
        return { esBajo: true, esAlto: false, mensaje: `BAJO (debe ser ≥ ${referencia.valor})` };
      }
      return { esAlto: false, esBajo: false, mensaje: "" };
    }
    
    if (referencia.operador === "rango" && referencia.min !== undefined && referencia.max !== undefined) {
      if (valorResultado < referencia.min) {
        return { esBajo: true, esAlto: false, mensaje: `BAJO (referencia: ${referencia.min} - ${referencia.max})` };
      }
      if (valorResultado > referencia.max) {
        return { esAlto: true, esBajo: false, mensaje: `ALTO (referencia: ${referencia.min} - ${referencia.max})` };
      }
      return { esAlto: false, esBajo: false, mensaje: "" };
    }
    
    return { esAlto: false, esBajo: false, mensaje: "" };
  }
}