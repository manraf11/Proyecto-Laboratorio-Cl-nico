import Cl_mCatalogoEstudios from "./Cl_mCatalogoEstudios.js";

export default class Cl_mExamen {
  public id: string;
  public nombrePaciente: string;
  public cedulaPaciente: string;
  public telefonoPaciente: string;
  public nombreEstudio: string;      
  public resultadoExamen: string;    
  public precioEstudio: number;
  public formaPago: string;
  public estaFinalizado: boolean;
  public fechaRegistro: string;

  constructor(datos: {
    id?: string;
    nombrePaciente?: string;
    cedulaPaciente?: string;
    telefonoPaciente?: string;
    estudiosSeleccionados?: string[];
    nombreEstudio?: string;
    resultadoExamen?: string;
    precioEstudio?: number;
    formaPago?: string;
    estaFinalizado?: boolean;
    fechaRegistro?: string;
  }, catalogo: Cl_mCatalogoEstudios) {
    this.id = datos.id || "";
    this.nombrePaciente = datos.nombrePaciente || "";
    this.cedulaPaciente = datos.cedulaPaciente || "";
    this.telefonoPaciente = datos.telefonoPaciente || "";
    this.formaPago = datos.formaPago || "";
    this.resultadoExamen = datos.resultadoExamen || "";
    this.estaFinalizado = datos.estaFinalizado || false;
    this.fechaRegistro = datos.fechaRegistro || new Date().toISOString();

    if (datos.estudiosSeleccionados && Array.isArray(datos.estudiosSeleccionados)) {
      this.nombreEstudio = datos.estudiosSeleccionados.join(", ");
      this.precioEstudio = catalogo.calcularPrecioTotal(datos.estudiosSeleccionados);
    } else if (datos.nombreEstudio) {
      this.nombreEstudio = datos.nombreEstudio;
      this.precioEstudio = Number(datos.precioEstudio) || 0;
    } else {
      this.nombreEstudio = "";
      this.precioEstudio = 0;
    }
  }

  public obtenerArregloEstudios(): string[] {
    if (!this.nombreEstudio.trim()) return [];
    return this.nombreEstudio.split(", ").map(item => item.trim());
  }

  public obtenerArregloResultados(): string[] {
    if (!this.resultadoExamen.trim()) return [];
    return this.resultadoExamen.split(", ").map(item => item.trim());
  }
}