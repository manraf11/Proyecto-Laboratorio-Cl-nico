import Cl_mCatalogoEstudios from "./Cl_mCatalogoEstudios.js";
import { IExamen, IDatosExamen } from "../interfaces/I_Examen.js";

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

  constructor(datos: IDatosExamen | Partial<IExamen>, catalogo: Cl_mCatalogoEstudios) {
    this.id = (datos as Partial<IExamen>).id || "";
    this.nombrePaciente = (datos as Partial<IExamen>).nombrePaciente || "";
    this.cedulaPaciente = (datos as Partial<IExamen>).cedulaPaciente || "";
    this.telefonoPaciente = (datos as Partial<IExamen>).telefonoPaciente || "";
    this.formaPago = (datos as Partial<IExamen>).formaPago || "";
    this.resultadoExamen = (datos as Partial<IExamen>).resultadoExamen || "";
    this.estaFinalizado = (datos as Partial<IExamen>).estaFinalizado || false;
    this.fechaRegistro = (datos as Partial<IExamen>).fechaRegistro || new Date().toISOString();

    if ("estudiosSeleccionados" in datos && Array.isArray((datos as IDatosExamen).estudiosSeleccionados)) {
      const estudios = (datos as IDatosExamen).estudiosSeleccionados || [];
      this.nombreEstudio = estudios.join(", ");
      this.precioEstudio = catalogo.calcularPrecioTotal(estudios);
    } else if ("nombreEstudio" in datos && (datos as Partial<IExamen>).nombreEstudio) {
      this.nombreEstudio = (datos as Partial<IExamen>).nombreEstudio || "";
      this.precioEstudio = Number((datos as Partial<IExamen>).precioEstudio) || 0;
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