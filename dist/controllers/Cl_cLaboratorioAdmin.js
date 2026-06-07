// controllers/Cl_cLaboratorioAdmin.ts
import Cl_mLaboratorio from "../models/Cl_mLaboratorio.js";
import Cl_mEstudio from "../models/Cl_mEstudio.js";
import Cl_sLaboratorio from "../services/Cl_sLaboratorio.js";
export default class Cl_cLaboratorioAdmin {
    laboratorio;
    pantallaAdmin;
    controladorExamen;
    constructor(pantallaAdmin, controladorExamen) {
        this.pantallaAdmin = pantallaAdmin;
        this.controladorExamen = controladorExamen;
        this.laboratorio = new Cl_mLaboratorio();
        let yoMismo = this;
        this.cargarExamenes();
        this.pantallaAdmin.cuandoClicEnNuevoExamen(() => yoMismo.guardarNuevoExamen());
        this.pantallaAdmin.cuandoClicEnFiltrarEstudios((tipo, fecha) => yoMismo.filtrarEstudios(tipo, fecha));
        this.pantallaAdmin.cuandoClicEnImprimir((id) => yoMismo.imprimirReporte(id));
        this.pantallaAdmin.cuandoClicEnEnviarWhatsApp((id) => yoMismo.enviarWhatsApp(id));
    }
    async cargarExamenes() {
        let resultado = await Cl_sLaboratorio.traerDesdeNube();
        if (resultado.ok) {
            this.laboratorio = resultado.laboratorio;
            this.refrescarPantalla();
        }
    }
    refrescarPantalla() {
        // Mostrar exámenes en estado "listo" (completados por bioanalista)
        this.pantallaAdmin.mostrarFinalizados({ examenes: this.laboratorio.obtenerFinalizados() });
    }
    guardarNuevoExamen() {
        let yoMismo = this;
        this.controladorExamen.pedirDatosExamen(async function (examen) {
            if (examen !== null) {
                // El nuevo examen siempre empieza en estado "preparacion"
                examen.cambiarEstado("preparacion");
                let guardado = await Cl_sLaboratorio.guardarEnNube(examen);
                if (guardado.ok) {
                    alert("✅ Orden de examen registrada con éxito (estado: PREPARACIÓN)");
                    await yoMismo.cargarExamenes();
                }
                else {
                    alert("❌ Error al guardar el examen en la nube.");
                }
            }
        });
    }
    filtrarEstudios(tipoEstudio, fechaSeleccionada) {
        if (!tipoEstudio.trim() || !fechaSeleccionada.trim()) {
            alert("Debe ingresar una fecha y un tipo de estudio para filtrar.");
            return;
        }
        let cantidad = this.laboratorio.contarEstudiosPorTipoYFecha(tipoEstudio, fechaSeleccionada);
        this.pantallaAdmin.mostrarResultadoFiltro(cantidad, tipoEstudio, fechaSeleccionada);
    }
    imprimirReporte(idExamen) {
        let examen = this.laboratorio.buscarPorId(idExamen);
        if (!examen)
            return;
        let listaEstudios = examen.obtenerArregloEstudios();
        let listaResultados = examen.obtenerArregloResultados();
        let filasHtml = "";
        for (let i = 0; i < listaEstudios.length; i++) {
            let nombreEst = listaEstudios[i];
            let resultadoVal = listaResultados[i] || "Pendiente";
            let refInfo = Cl_mEstudio.obtenerValoresReferencia(nombreEst);
            let unidadMedida = Cl_mEstudio.obtenerUnidad(nombreEst);
            filasHtml += `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; font-weight: 600; color: #0b3b4f;">${nombreEst}</td>
          <td style="padding: 12px; color: #2c6e49; font-weight: 600; font-size: 1.05rem;">${resultadoVal} ${unidadMedida}</td>
          <td style="padding: 12px; color: #5e7a93; font-size: 0.9rem;">${refInfo}</td>
        </tr>
      `;
        }
        let estadoTexto = "";
        let estadoColor = "";
        if (examen.estado === "preparacion") {
            estadoTexto = "PREPARACIÓN";
            estadoColor = "#ffc107";
        }
        else if (examen.estado === "pendiente") {
            estadoTexto = "PENDIENTE";
            estadoColor = "#17a2b8";
        }
        else {
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
        this.pantallaAdmin.mostrarReporte(plantilla);
    }
    async enviarWhatsApp(idExamen) {
        let examen = this.laboratorio.buscarPorId(idExamen);
        if (!examen) {
            alert("❌ No se encontró el examen solicitado.");
            return;
        }
        // ✅ El controlador llama al método del modelo (respetando MVC)
        let resultado = await examen.enviarResultadosPorWhatsApp();
        if (resultado.exito) {
            alert(`✅ ${resultado.mensaje}\n\n📱 Se abrirá WhatsApp en una nueva pestaña.`);
        }
        else {
            alert(`❌ Error: ${resultado.mensaje}`);
        }
    }
}
//# sourceMappingURL=Cl_cLaboratorioAdmin.js.map