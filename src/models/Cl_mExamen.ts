// models/Cl_mExamen.ts
import Cl_mEstudio from "./Cl_mEstudio.js";

export default class Cl_mExamen {
  public id: string;
  public nombrePaciente: string;
  public cedulaPaciente: string;
  public telefonoPaciente: string;
  public nombreEstudio: string;      
  public resultadoExamen: string;    
  public precioEstudio: string; // se cambio a string para guardar múltiples precios
  public formaPago: string;
  public referencia: string;
  public estado: "preparacion" | "pendiente" | "listo";
  public fechaRegistro: string;

  constructor(datos: {
    id?: string;
    nombrePaciente?: string;
    cedulaPaciente?: string;
    telefonoPaciente?: string;
    estudiosSeleccionados?: string[];
    nombreEstudio?: string;
    resultadoExamen?: string;
    precioEstudio?: string | number; 
    formaPago?: string;
    referencia?: string;
    estado?: "preparacion" | "pendiente" | "listo";
    fechaRegistro?: string;
  }) {
    this.id = datos.id || "";
    this.nombrePaciente = datos.nombrePaciente || "";
    this.cedulaPaciente = datos.cedulaPaciente || "";
    this.telefonoPaciente = datos.telefonoPaciente || "";
    this.formaPago = datos.formaPago || "";
    this.referencia = datos.referencia || "";
    this.resultadoExamen = datos.resultadoExamen || "";
    this.estado = datos.estado || "preparacion";
    this.fechaRegistro = datos.fechaRegistro || new Date().toISOString();

    if (datos.estudiosSeleccionados && Array.isArray(datos.estudiosSeleccionados)) {
      this.nombreEstudio = datos.estudiosSeleccionados.join(", ");
      this.precioEstudio = datos.estudiosSeleccionados
        .map(nombre => Cl_mEstudio.getPrecio(nombre))
        .join(", ");
    } else if (datos.nombreEstudio) {
      this.nombreEstudio = datos.nombreEstudio;
      this.precioEstudio = datos.precioEstudio !== undefined && datos.precioEstudio !== null 
        ? String(datos.precioEstudio) 
        : "";
    } else {
      this.nombreEstudio = "";
      this.precioEstudio = "";
    }
  }

  // Calcula total sumando los precios individuales de los estudios en el examen 
  public calcularTotal(): number {
    if (!this.precioEstudio) return 0;
    const precios = this.obtenerArregloPrecios();
    return precios.reduce((sum, precio) => sum + precio, 0);
  }

  public obtenerArregloPrecios(): number[] {
    if (!this.precioEstudio || this.precioEstudio.trim() === "") return [];
    return this.precioEstudio.split(", ").map(item => {
      const num = parseFloat(item.trim());
      return isNaN(num) ? 0 : num;
    });
  }

  public obtenerDatosCompletos(): { estudio: string; resultado: string; precio: number }[] {
    const estudios = this.obtenerArregloEstudios();
    const resultados = this.obtenerArregloResultados();
    const precios = this.obtenerArregloPrecios();
    
    const maxLength = Math.max(estudios.length, resultados.length, precios.length);
    const datosCompletos = [];
    
    for (let i = 0; i < maxLength; i++) {
      datosCompletos.push({
        estudio: estudios[i] || "",
        resultado: resultados[i] || "",
        precio: precios[i] || 0
      });
    }
    
    return datosCompletos;
  }

  public obtenerArregloEstudios(): string[] {
    if (!this.nombreEstudio.trim()) return [];
    return this.nombreEstudio.split(", ").map(item => item.trim());
  }

  public obtenerArregloResultados(): string[] {
    if (!this.resultadoExamen.trim()) return [];
    return this.resultadoExamen.split(", ").map(item => item.trim());
  }

  public validarNombre(nombre: string): { valido: boolean; mensaje: string } {
    if (!nombre || nombre.trim() === "") {
      return { valido: false, mensaje: "El nombre del paciente es obligatorio." };
    }
    return { valido: true, mensaje: "" };
  }

  public validarCedula(cedula: string): { valido: boolean; mensaje: string } {
    if (!cedula || cedula.trim() === "") {
      return { valido: false, mensaje: "La cédula del paciente es obligatoria." };
    }
    
    const limpia = cedula.trim().toUpperCase();
    const regex = /^([VEJPG])\-?(\d{6,8})$/i;
    
    if (regex.test(limpia) || /^\d{6,8}$/.test(limpia)) {
      return { valido: true, mensaje: "" };
    }
    
    return { valido: false, mensaje: "Formato de cédula inválido. Use V-12345678 o 12345678" };
  }

  public validarTelefono(telefono: string): { valido: boolean; mensaje: string } {
    if (!telefono || telefono.trim() === "") {
      return { valido: false, mensaje: "El número de teléfono es obligatorio." };
    }
    
    let telefonoLimpio = telefono.trim().replace(/[\s\-\.]/g, "");
    let numeroLimpio = telefonoLimpio;
    
    if (telefonoLimpio.startsWith("+58")) numeroLimpio = telefonoLimpio.substring(3);
    else if (telefonoLimpio.startsWith("58")) numeroLimpio = telefonoLimpio.substring(2);
    
    if (!/^\d+$/.test(numeroLimpio)) {
      return { valido: false, mensaje: "Solo números y opcionalmente +58" };
    }
    
    const prefijosValidos = ["412", "414", "424", "426", "416", "422"];
    
    if (numeroLimpio.length === 10) {
      const prefijo = numeroLimpio.substring(0, 3);
      if (prefijosValidos.includes(prefijo)) return { valido: true, mensaje: "" };
      return { valido: false, mensaje: "Prefijo inválido. Use 0412, 0414, 0424, 0426, 0416 o 0422" };
    }
    
    if (numeroLimpio.length === 11 && numeroLimpio.startsWith("0")) {
      const prefijo = numeroLimpio.substring(1, 4);
      if (prefijosValidos.includes(prefijo)) return { valido: true, mensaje: "" };
      return { valido: false, mensaje: "Prefijo inválido. Use 0412, 0414, 0424, 0426, 0416 o 0422" };
    }
    
    return { valido: false, mensaje: "Teléfono inválido. Ej: 04121234567" };
  }

  public validarEstudios(estudios: string[]): { valido: boolean; mensaje: string } {
    if (!estudios || estudios.length === 0) {
      return { valido: false, mensaje: "Debe seleccionar al menos un estudio." };
    }
    return { valido: true, mensaje: "" };
  }

  public validarReferencia(metodoPago: string, referencia: string): { valido: boolean; mensaje: string } {
    if ((metodoPago === "Transferencia" || metodoPago === "Pago Móvil") && (!referencia || referencia.trim() === "")) {
      return { valido: false, mensaje: "El número de referencia es obligatorio para Transferencia o Pago Móvil." };
    }
    return { valido: true, mensaje: "" };
  }

  public validarTodosLosDatos(datos: {
    nombre: string;
    cedula: string;
    telefono: string;
    estudios: string[];
    metodoPago: string;
    referencia?: string;
  }): { valido: boolean; errores: string[] } {
    const errores: string[] = [];
    
    const nombreVal = this.validarNombre(datos.nombre);
    if (!nombreVal.valido) errores.push(nombreVal.mensaje);
    
    const cedulaVal = this.validarCedula(datos.cedula);
    if (!cedulaVal.valido) errores.push(cedulaVal.mensaje);
    
    const telefonoVal = this.validarTelefono(datos.telefono);
    if (!telefonoVal.valido) errores.push(telefonoVal.mensaje);
    
    const estudiosVal = this.validarEstudios(datos.estudios);
    if (!estudiosVal.valido) errores.push(estudiosVal.mensaje);
    
    const referenciaVal = this.validarReferencia(datos.metodoPago, datos.referencia || "");
    if (!referenciaVal.valido) errores.push(referenciaVal.mensaje);
    
    return {
      valido: errores.length === 0,
      errores: errores
    };
  }

  public async enviarResultadosPorWhatsApp(): Promise<{ exito: boolean; mensaje: string }> {
    if (this.estado !== "listo") {
      return { 
        exito: false, 
        mensaje: `El examen está en estado "${this.estado}". Solo se pueden enviar resultados cuando está LISTO.` 
      };
    }

    if (!this.resultadoExamen || this.resultadoExamen.trim() === "") {
      return { 
        exito: false, 
        mensaje: "No hay resultados registrados para enviar." 
      };
    }

    if (!this.telefonoPaciente || this.telefonoPaciente.trim() === "") {
      return { 
        exito: false, 
        mensaje: "El paciente no tiene número de teléfono registrado." 
      };
    }

    let mensajeWhatsApp = this.construirMensajeResultados();
    let telefonoLimpio = this.telefonoPaciente.replace(/\D/g, "");
  
    if (telefonoLimpio.length === 10 && !telefonoLimpio.startsWith("58")) {
      telefonoLimpio = "58" + telefonoLimpio;
    }

    let urlWhatsApp = `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(mensajeWhatsApp)}`;
    window.open(urlWhatsApp, "_blank");

    return { 
      exito: true, 
      mensaje: "Se abrió WhatsApp para enviar los resultados al paciente." 
    };
  }

  private construirMensajeResultados(): string {
    const datosCompletos = this.obtenerDatosCompletos();
    const total = this.calcularTotal();
    
    let mensaje = `🏥 *LABORATORIO CLÍNICO*\n\n`;
    mensaje += `📋 *RESULTADOS DE EXAMENES*\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    mensaje += `👤 *Paciente:* ${this.nombrePaciente}\n`;
    mensaje += `🆔 *Cédula:* ${this.cedulaPaciente}\n`;
    mensaje += `📅 *Fecha:* ${new Date(this.fechaRegistro).toLocaleDateString()}\n\n`;
    mensaje += `*📊 RESULTADOS:*\n`;
    
    for (let i = 0; i < datosCompletos.length; i++) {
      const item = datosCompletos[i];
      const referencia = Cl_mEstudio.obtenerValoresReferencia(item.estudio);
      const unidad = Cl_mEstudio.obtenerUnidad(item.estudio);
      let alerta = "";

      if (item.resultado !== "Pendiente" && !isNaN(Number(item.resultado))) {
        const valNum = Number(item.resultado);
        const evaluacion = Cl_mEstudio.evaluarResultado(item.estudio, valNum);
        
        if (evaluacion.esAlto) {
          alerta = `  *${evaluacion.mensaje}* `;
        } else if (evaluacion.esBajo) {
          alerta = `  *${evaluacion.mensaje}* `;
        }
      }

      mensaje += `\n🔬 *${item.estudio}*\n`;
      mensaje += `   Valor: ${item.resultado} ${unidad}${alerta}\n`;
      mensaje += `   Referencia: ${referencia}\n`;
      mensaje += `   Precio: $${item.precio.toFixed(2)}\n`;
    }
    
    mensaje += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `*Total pagado:* $${total.toFixed(2)}\n`;  
    mensaje += `*Método de pago:* ${this.formaPago}\n\n`;
    mensaje += `_Resultados validados por nuestro equipo._\n`;
    mensaje += `_Ante cualquier duda, consulte con su médico._`;
    
    return mensaje;
  }

  public cambiarEstado(nuevoEstado: "preparacion" | "pendiente" | "listo"): void {
    this.estado = nuevoEstado;
  }

  public puedeFinalizar(): boolean {
    if (!this.resultadoExamen || this.resultadoExamen.trim() === "") {
      return false;
    }
    let resultados = this.obtenerArregloResultados();
    let estudios = this.obtenerArregloEstudios();
    const placeholders = ["pendiente", "no realizado", "no realizado", "nr", "-", "n/a", "na"]; 

    const resultadosValidos = resultados.filter(r => {
      if (!r) return false;
      const limpio = r.trim().toLowerCase();
      if (limpio === "") return false;
      if (placeholders.includes(limpio)) return false;
      return true;
    });

    return resultados.length === estudios.length && resultadosValidos.length === estudios.length;
  }


  
}