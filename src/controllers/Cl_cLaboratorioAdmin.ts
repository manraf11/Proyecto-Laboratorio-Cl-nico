// controllers/Cl_cLaboratorioAdmin.ts
import Cl_mLaboratorio from "../models/Cl_mLaboratorio.js";
import Cl_mExamen from "../models/Cl_mExamen.js";
import Cl_mEstudio from "../models/Cl_mEstudio.js";
import Cl_sLaboratorio from "../services/Cl_sLaboratorio.js";
import { I_vAdmin } from "../interfaces/I_vAdmin.js";
import Cl_cExamen from "./Cl_cExamen.js";

export default class Cl_cLaboratorioAdmin {
  private laboratorio: Cl_mLaboratorio;
  private pantallaAdmin: I_vAdmin;
  private controladorExamen: Cl_cExamen;

  constructor(pantallaAdmin: I_vAdmin, controladorExamen: Cl_cExamen) {
    this.pantallaAdmin = pantallaAdmin;
    this.controladorExamen = controladorExamen;
    this.laboratorio = new Cl_mLaboratorio();
    
    let yoMismo = this;
    this.cargarExamenes();
    
    this.pantallaAdmin.cuandoClicEnNuevoExamen(() => yoMismo.guardarNuevoExamen());
    this.pantallaAdmin.cuandoClicEnFiltrarEstudios((tipo, fecha) => yoMismo.filtrarEstudios(tipo, fecha));
    this.pantallaAdmin.cuandoClicEnCalcularPorcentaje((tipo) => yoMismo.calcularPorcentaje(tipo));
    this.pantallaAdmin.cuandoCLicEnObtenerNombres((tipo) => yoMismo.obtenerNombresPacientes(tipo));
    this.pantallaAdmin.cuandoClicEnObtenerTotalPorEstudio((tipo) => yoMismo.obtenertotalportestudio(tipo));
    this.pantallaAdmin.cuandoClicEnEnviarWhatsApp((id) => yoMismo.enviarWhatsApp(id));
    this.pantallaAdmin.cuandoClicEnImprimir((id) => yoMismo.imprimirReporte(id));
    this.pantallaAdmin.cuandoClicEnVerEstadisticasEstudio((tipo) => yoMismo.verEstadisticasEstudio(tipo));
    this.pantallaAdmin.cuandoClicEnCalcularPorcentajeFinalizados(() => yoMismo.calcularPorcentajeFinalizados());
    this.pantallaAdmin.cuandoClicEnCalcularPromedioEstudio((tipo) => yoMismo.calcularPromedioEstudio(tipo));
  }

  private async cargarExamenes() {
    let resultado = await Cl_sLaboratorio.traerDesdeNube();
    if (resultado.ok) {
      this.laboratorio = resultado.laboratorio;
      this.refrescarPantalla();
      this.actualizarSelectsEstudios();
    } else {
      console.error("Error al cargar exámenes desde la nube");
    }
  }

  private actualizarSelectsEstudios(): void {
    if (this.pantallaAdmin.actualizarListaEstudios) {
      this.pantallaAdmin.actualizarListaEstudios();
    }
  }

  private refrescarPantalla() {
    this.pantallaAdmin.mostrarFinalizados({ examenes: this.laboratorio.obtenerFinalizados() });
    this.actualizarSelectsEstudios();
  }

  private guardarNuevoExamen() {
    let yoMismo = this;
    this.controladorExamen.pedirDatosExamen(async function(examen: Cl_mExamen | null) {
      if (examen !== null) {
        examen.cambiarEstado("preparacion");
        
        let guardado = await Cl_sLaboratorio.guardarEnNube(examen);
        if (guardado.ok) {
          if (guardado.id) {
            examen.id = guardado.id;
          }
          alert("✅ Examen registrado con éxito");
          await yoMismo.cargarExamenes();
          
          setTimeout(() => {
            yoMismo.actualizarSelectsEstudios();
          }, 500);
        } else {
          alert("❌ Error al guardar el examen.");
        }
      }
    });
  }

  
  private filtrarEstudios(tipoEstudio: string, fechaSeleccionada: string) {
    const tipo = tipoEstudio ? tipoEstudio.trim() : "";
    const fecha = fechaSeleccionada ? fechaSeleccionada.trim() : "";

    if (!tipo && !fecha) {
      alert("⚠️ Debe ingresar al menos un estudio o una fecha para filtrar.");
      return;
    }

    let cantidad = 0;
    if (tipo && fecha) {
      cantidad = this.laboratorio.contarEstudiosPorTipoYFecha(tipo, fecha);
    } else if (tipo) {
      cantidad = this.laboratorio.contarEstudiosPorTipo(tipo);
    } else if (fecha) {
      cantidad = this.laboratorio.contarEstudiosPorFecha(fecha);
    }

    this.pantallaAdmin.mostrarResultadoFiltro(cantidad, tipo || "(todos)", fecha || "(todas)");
  }

  private calcularPorcentaje(tipoEstudio: string) {
    if (!tipoEstudio || tipoEstudio.trim() === "") {
      alert("⚠️ Debe seleccionar un tipo de estudio");
      return;
    }

    let porcentaje = this.laboratorio.calcularPorcentajeEstudio(tipoEstudio);
    this.pantallaAdmin.mostrarResultadoPorcentaje(porcentaje, tipoEstudio);
  }

  private obtenerNombresPacientes(tipoEstudio: string) {
    if (!tipoEstudio || tipoEstudio.trim() === "") {
      alert("⚠️ Debe seleccionar un tipo de estudio");
      return;
    }

    const nombres = this.laboratorio.nombrepacientesporestudio(tipoEstudio);
    this.pantallaAdmin.mostrarResultadosobteneNombrePacientesPorEstudio({
      nombres: nombres,
      tipoEstudio: tipoEstudio
    });
  }

  private obtenertotalportestudio(tipoEstudio: string) {
    if (!tipoEstudio || tipoEstudio.trim() === "") {
      alert("⚠️ Debe seleccionar un tipo de estudio");
      return;
    }

    const total = this.laboratorio.obtenertotalporestudio(tipoEstudio);
    this.pantallaAdmin.mostrarResultadoTotalPorEstudio(`El total recaudado por el estudio "${tipoEstudio}" es: $${total.toFixed(2)}`);
  }

  private verEstadisticasEstudio(tipoEstudio: string): void {
    if (!tipoEstudio || tipoEstudio.trim() === "") {
      alert("⚠️ Debe seleccionar un tipo de estudio");
      return;
    }
    
    const estadisticas = this.laboratorio.obtenerEstadisticasEstudio(tipoEstudio);
    this.pantallaAdmin.mostrarEstadisticasEstudio({
      tipoEstudio: tipoEstudio,
      cantidad: estadisticas.cantidad,
      total: estadisticas.total
    });
  }

  private calcularPorcentajeFinalizados(): void {
    // No necesita validación adicional, siempre es válido
    const porcentaje = this.laboratorio.calcularPorcentajeFinalizados();
    this.pantallaAdmin.mostrarPorcentajeFinalizados(porcentaje);
  }

  private calcularPromedioEstudio(tipoEstudio: string): void {
    if (!tipoEstudio || tipoEstudio.trim() === "") {
      alert("⚠️ Debe seleccionar un tipo de estudio");
      return;
    }
    
    const promedio = this.laboratorio.calcularPromedioEstudio(tipoEstudio);
    const cantidad = this.laboratorio.contarEstudiosPorTipo(tipoEstudio);
    
    this.pantallaAdmin.mostrarPromedioEstudio({
      tipoEstudio: tipoEstudio,
      promedio: promedio,
      cantidad: cantidad
    });
  }

  
  private imprimirReporte(idExamen: string) {
    let examen = this.laboratorio.buscarPorId(idExamen);
    if (!examen) {
      console.error("Examen no encontrado:", idExamen);
      alert("No se encontró el examen solicitado.");
      return;
    }

    let listaEstudios = examen.obtenerArregloEstudios();
    let listaResultados = examen.obtenerArregloResultados();

    let filasHtml = "";
    for (let i = 0; i < listaEstudios.length; i++) {
      let nombreEst = listaEstudios[i];
      let resultadoVal = listaResultados[i] || "Pendiente";
      
      let refInfo = Cl_mEstudio.obtenerValoresReferencia(nombreEst);
      let unidadMedida = Cl_mEstudio.obtenerUnidad(nombreEst);
      let estiloResultado = 'color: #2c6e49; font-weight:600; font-size:1.05rem;';
      let alertaTexto = "";

      if (resultadoVal !== "Pendiente" && !isNaN(Number(resultadoVal))) {
        const valNum = Number(resultadoVal);
        const evaluacion = Cl_mEstudio.evaluarResultado(nombreEst, valNum);
        
        if (evaluacion.esAlto) {
          estiloResultado = 'color: #c0392b; font-weight:700; font-size:1.05rem; background: #ffe8e5; padding: 4px 8px; border-radius: 4px;';
          alertaTexto = ` <span style="color: #c0392b; font-weight: bold;">⚠️ ${evaluacion.mensaje}</span>`;
        } else if (evaluacion.esBajo) {
          estiloResultado = 'color: #c0392b; font-weight:700; font-size:1.05rem; background: #ffe8e5; padding: 4px 8px; border-radius: 4px;';
          alertaTexto = ` <span style="color: #c0392b; font-weight: bold;">⚠️ ${evaluacion.mensaje}</span>`;
        }
      }

      filasHtml += `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; font-weight: 600; color: #0b3b4f;">${nombreEst}</td>
          <td style="padding: 12px; ${estiloResultado}">${resultadoVal} ${unidadMedida}${alertaTexto}</td>
          <td style="padding: 12px; color: #5e7a93; font-size: 0.9rem;">${refInfo}</td>
        </tr>
      `;
    }

    let estadoTexto = "";
    let estadoColor = "";
    if (examen.estado === "preparacion") {
      estadoTexto = "PREPARACIÓN";
      estadoColor = "#ffc107";
    } else if (examen.estado === "pendiente") {
      estadoTexto = "PENDIENTE";
      estadoColor = "#17a2b8";
    } else {
      estadoTexto = "LISTO";
      estadoColor = "#28a745";
    }

    let plantilla = `
      <div style="font-family: 'Segoe UI', 'Roboto', Arial, sans-serif; padding: 30px; color: #2c3e50; max-width: 650px; margin: auto; border: 2px solid #1a5f7a; border-radius: 12px; background: white;">
        <div style="text-align: center; border-bottom: 3px solid #ffc107; padding-bottom: 15px; margin-bottom: 20px;">
          <h2 style="color: #1a5f7a; margin: 0; font-size: 1.6rem; letter-spacing: 1px;">LABORATORIO CLINICO</h2>
          <p style="margin: 5px 0 0 0; color: #5e7a93; font-size: 0.9rem;">Reporte Oficial de Resultados Analiticos</p>
        </div>
        <div style="margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f0f6fa; padding: 15px; border-radius: 8px; border: 1px solid #dce4ec;">
          <div><strong style="color: #1a5f7a;">Paciente:</strong> <span style="color: #2c3e50;">${examen.nombrePaciente}</span></div>
          <div><strong style="color: #1a5f7a;">Cedula:</strong> <span style="color: #2c3e50;">${examen.cedulaPaciente}</span></div>
          <div><strong style="color: #1a5f7a;">Telefono:</strong> <span style="color: #2c3e50;">${examen.telefonoPaciente || "No registrado"}</span></div>
          <div><strong style="color: #1a5f7a;">Estado:</strong> <span style="background: ${estadoColor}; color: white; padding: 2px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold;">${estadoTexto}</span></div>
          <div><strong style="color: #1a5f7a;">Fecha de Emision:</strong> <span style="color: #2c3e50;">${new Date(examen.fechaRegistro).toLocaleDateString()}</span></div>
        </div>
        <table style="width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 25px;">
          <thead>
            <tr style="background: #1a5f7a; color: white;">
              <th style="padding: 12px; border-top-left-radius: 6px;">Estudio Clinico</th>
              <th style="padding: 12px;">Resultado Obtenido</th>
              <th style="padding: 12px; border-top-right-radius: 6px;">Valores de Referencia</th>
             </tr>
          </thead>
          <tbody>
            ${filasHtml}
          </tbody>
        </table>
        <div style="text-align: center; color: #7f8c8d; font-size: 0.8rem; margin-top: 40px; border-top: 1px dashed #cbdde9; padding-top: 15px;">
          Resultados validados digitalmente por el Personal Bioanalista de guardia.
        </div>
      </div>
    `;

    const ventanaImpresion = window.open('', '_blank');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Reporte de Resultados - ${examen.nombrePaciente}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${plantilla}
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print();" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background: #1a5f7a; color: white; border: none; border-radius: 5px;">🖨️ Imprimir</button>
            <button onclick="window.close();" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background: #6c757d; color: white; border: none; border-radius: 5px; margin-left: 10px;">❌ Cerrar</button>
          </div>
        </body>
        </html>
      `);
      ventanaImpresion.document.close();
    } else {
      alert("No se pudo abrir la ventana de impresión. Por favor, permita ventanas emergentes.");
    }
  }

  private async enviarWhatsApp(idExamen: string) {
    let examen = this.laboratorio.buscarPorId(idExamen);
    if (!examen) {
      alert("⚠️ No se encontró el examen solicitado.");
      return;
    }

    let resultado = await examen.enviarResultadosPorWhatsApp();
    
    if (resultado.exito) {
      alert(`✅ ${resultado.mensaje}\n\n📱 Se abrirá WhatsApp en una nueva pestaña.`);
    } else {
      alert(`❌ Error: ${resultado.mensaje}`);
    }
  }
}