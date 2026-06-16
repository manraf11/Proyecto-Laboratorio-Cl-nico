// models/Cl_mLaboratorio.ts
import Cl_mEstudio from "./Cl_mEstudio.js";
import Cl_mExamen from "./Cl_mExamen.js";

export default class Cl_mLaboratorio {
  private listaExamenes: Cl_mExamen[] = [];

  constructor() {
    this.listaExamenes = [];
  }

  public agregarExamen(examen: Cl_mExamen): void {
    this.listaExamenes.push(examen);
  }

  public buscarPorId(id: string): Cl_mExamen | null {
    for (let i = 0; i < this.listaExamenes.length; i++) {
      if (this.listaExamenes[i].id === id) {
        return this.listaExamenes[i];
      }
    }
    return null;
  }

  public buscarPorIdParcial(idParcial: string): Cl_mExamen[] {
    if (!idParcial || idParcial.trim() === "") {
      return [...this.listaExamenes];
    }
    
    const idBusqueda = idParcial.trim().toLowerCase();
    const resultados: Cl_mExamen[] = [];
    
    for (let i = 0; i < this.listaExamenes.length; i++) {
      const examen = this.listaExamenes[i];
      if (!examen.id) continue;
      
      const idCompleto = examen.id.toLowerCase();
      const idCorto = examen.id.length > 6 ? examen.id.slice(-6).toLowerCase() : examen.id.toLowerCase();
      
      if (idCompleto.includes(idBusqueda) || idCorto.includes(idBusqueda)) {
        resultados.push(examen);
      }
    }
    
    return resultados;
  }

  public obtenerPendientes(): Cl_mExamen[] {
    let pendientes: Cl_mExamen[] = [];
    for (let i = 0; i < this.listaExamenes.length; i++) {
      if (this.listaExamenes[i].estado !== "listo") {
        pendientes.push(this.listaExamenes[i]);
      }
    }
    return pendientes;
  }

  public obtenerFinalizados(): Cl_mExamen[] {
    let finalizados: Cl_mExamen[] = [];
    for (let i = 0; i < this.listaExamenes.length; i++) {
      if (this.listaExamenes[i].estado === "listo") {
        finalizados.push(this.listaExamenes[i]);
      }
    }
    return finalizados;
  }

  public obtenerPorEstados(estados: ("preparacion" | "pendiente" | "listo")[]): Cl_mExamen[] {
    let filtrados: Cl_mExamen[] = [];
    for (let i = 0; i < this.listaExamenes.length; i++) {
      if (estados.includes(this.listaExamenes[i].estado)) {
        filtrados.push(this.listaExamenes[i]);
      }
    }
    return filtrados;
  }

  public obtenerPorEstadosYId(
    estados: ("preparacion" | "pendiente" | "listo")[],
    idParcial: string = ""
  ): Cl_mExamen[] {
    let resultados = this.obtenerPorEstados(estados);
    
    if (idParcial && idParcial.trim() !== "") {
      const idBusqueda = idParcial.trim().toLowerCase();
      resultados = resultados.filter(examen => {
        if (!examen.id) return false;
        const idCompleto = examen.id.toLowerCase();
        const idCorto = examen.id.length > 6 ? examen.id.slice(-6).toLowerCase() : examen.id.toLowerCase();
        return idCompleto.includes(idBusqueda) || idCorto.includes(idBusqueda);
      });
    }
    
    return resultados;
  }

  public contarEstudiosPorTipo(tipoEstudio: string): number {
    let tipoBusqueda = tipoEstudio.trim().toLowerCase();
    let cantidad = 0;
    for (let i = 0; i < this.listaExamenes.length; i++) {
      let examen = this.listaExamenes[i];
      let estudios = examen.obtenerArregloEstudios();
      for (let j = 0; j < estudios.length; j++) {
        if (estudios[j].toLowerCase() === tipoBusqueda) cantidad++;
      }
    }
    return cantidad;
  }

  public contarEstudiosPorFecha(fechaSeleccionada: string): number {
    let fechaBusqueda = fechaSeleccionada.trim().slice(0, 10);
    if (fechaBusqueda.length !== 10) return 0;
    let cantidad = 0;
    for (let i = 0; i < this.listaExamenes.length; i++) {
      let examen = this.listaExamenes[i];
      if (this.normalizarFecha(examen.fechaRegistro) === fechaBusqueda) {
        cantidad += examen.obtenerArregloEstudios().length;
      }
    }
    return cantidad;
  }

  public contarEstudiosPorTipoYFecha(tipoEstudio: string, fechaSeleccionada: string): number {
    let tipoBusqueda = tipoEstudio.trim().toLowerCase();
    let fechaBusqueda = fechaSeleccionada.trim().slice(0, 10);
    let cantidad = 0;

    if (fechaBusqueda.length !== 10) {
      return 0;
    }

    for (let i = 0; i < this.listaExamenes.length; i++) {
      let examen = this.listaExamenes[i];
      if (this.normalizarFecha(examen.fechaRegistro) !== fechaBusqueda) {
        continue;
      }

      let estudios = examen.obtenerArregloEstudios();
      for (let j = 0; j < estudios.length; j++) {
        if (estudios[j].toLowerCase() === tipoBusqueda) {
          cantidad++;
        }
      }
    }

    return cantidad;
  }

  private normalizarFecha(fecha: string): string {
    let fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
      return "";
    }

    let year = fechaObj.getFullYear();
    let month = String(fechaObj.getMonth() + 1).padStart(2, "0");
    let day = String(fechaObj.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  public calcularPorcentajeEstudio(tipoEstudio: string): number {
    let cantidadTipoEstudio = 0;
    let totalEstudios = 0;
    
    for (let i = 0; i < this.listaExamenes.length; i++) {
      let examen = this.listaExamenes[i];
      let estudios = examen.obtenerArregloEstudios();
      
      for (let j = 0; j < estudios.length; j++) {
        totalEstudios++;
        
        if (estudios[j].toLowerCase() === tipoEstudio.toLowerCase()) {
          cantidadTipoEstudio++;
        }
      }
    }
    
    if (totalEstudios === 0) {
      return 0;
    }
    
    let porcentaje = (cantidadTipoEstudio / totalEstudios) * 100;
    return Math.round(porcentaje * 100) / 100;
  }


  public nombrepacientesporestudio(tipoEstudio: string): string[] {
    let pacientes: string[] = [];
    let tipoBusqueda = tipoEstudio.trim().toLowerCase();

    for (let i = 0; i < this.listaExamenes.length; i++) {
      let examen = this.listaExamenes[i];
      let estudios = examen.obtenerArregloEstudios();

      for (let m = 0; m < estudios.length; m++) {
        if (estudios[m].toLowerCase() === tipoBusqueda) {
          if (!pacientes.includes(examen.nombrePaciente)) {
            pacientes.push(examen.nombrePaciente);
          }
        }
      }
    }

    return pacientes;
  }

public obtenertotalporestudio(tipoEstudio: string): number {
    let tipoBusqueda = tipoEstudio.trim();
    let cantidad = 0;
    
    const estudio = Cl_mEstudio.buscarPorNombre(tipoBusqueda);
    
    if (!estudio) {
        console.warn(`No se encontró el estudio: ${tipoEstudio}`);
        return 0;
    }
    
    const costoPorEstudio = estudio.precio;
    
    for (let i = 0; i < this.listaExamenes.length; i++) {
        let examen = this.listaExamenes[i];
        let estudios = examen.obtenerArregloEstudios();
        
        for (let m = 0; m < estudios.length; m++) {
            if (estudios[m].trim() === tipoBusqueda) {
                cantidad++;
            }
        }
    }
    
    return costoPorEstudio * cantidad;
}
public obtenerEstadisticasEstudio(tipoEstudio: string): { cantidad: number; total: number } {
    const tipoBusqueda = tipoEstudio.trim();
    let cantidad = 0;
    
    const estudio = Cl_mEstudio.buscarPorNombre(tipoBusqueda);
    if (!estudio) {
      return { cantidad: 0, total: 0 };
    }
    
    for (let i = 0; i < this.listaExamenes.length; i++) {
      let examen = this.listaExamenes[i];
      let estudios = examen.obtenerArregloEstudios();
      
      for (let m = 0; m < estudios.length; m++) {
        if (estudios[m].trim() === tipoBusqueda) {
          cantidad++;
        }
      }
    }
    
    return {
      cantidad: cantidad,
      total: estudio.precio * cantidad
    };
  }

  public calcularPorcentajeFinalizados(): number {
    if (this.listaExamenes.length === 0) {
      return 0;
    }
    
    let finalizados = 0;
    for (let i = 0; i < this.listaExamenes.length; i++) {
      if (this.listaExamenes[i].estado === "listo") {
        finalizados++;
      }
    }
    
    return Math.round((finalizados / this.listaExamenes.length) * 100 * 100) / 100;
  }

  
  public calcularPromedioEstudio(tipoEstudio: string): number {
  const tipoBusqueda = tipoEstudio.trim();
  
  let cantidadEstudio = 0;
  let totalEstudios = 0;
  
  for (let i = 0; i < this.listaExamenes.length; i++) {
    let examen = this.listaExamenes[i];
    let estudios = examen.obtenerArregloEstudios();
    
    for (let m = 0; m < estudios.length; m++) {
      totalEstudios++; 
      
      if (estudios[m].trim() === tipoBusqueda) {
        cantidadEstudio++; 
      }
    }
  }
  
  // si no hay estudios retorna 0
  if (totalEstudios === 0) {
    return 0;
  }
  
  
  const promedio = cantidadEstudio / totalEstudios;
  return Math.round(promedio * 100) / 100; // para redonder a 2 decimas
}
}