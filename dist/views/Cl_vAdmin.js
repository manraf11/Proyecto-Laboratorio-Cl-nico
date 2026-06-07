import Cl_mEstudio from "../models/Cl_mEstudio.js";
export default class Cl_vAdmin {
    divFinalizados;
    divFormulario;
    botonNuevoExamen = null;
    botonFiltrarEstudios = null;
    inputFiltroFecha = null;
    selectFiltroTipo = null;
    avisarImprimir = null;
    avisarWhatsApp = null;
    avisarFiltrarEstudios = null;
    constructor() {
        this.divFinalizados = document.getElementById("admin_finalizados");
        this.divFormulario = document.getElementById("admin_formulario");
        this.mostrarFormulario();
    }
    cuandoClicEnNuevoExamen(avisar) {
        if (this.botonNuevoExamen)
            this.botonNuevoExamen.onclick = avisar;
    }
    cuandoClicEnFiltrarEstudios(avisar) {
        this.avisarFiltrarEstudios = avisar;
    }
    cuandoClicEnImprimir(avisar) {
        this.avisarImprimir = avisar;
    }
    cuandoClicEnEnviarWhatsApp(avisar) {
        this.avisarWhatsApp = avisar;
    }
    mostrarResultadoFiltro(cantidad, tipoEstudio, fechaSeleccionada) {
        const divResultado = document.getElementById("resultadoFiltroEstudios");
        if (!divResultado)
            return;
        let fechaFormateada = fechaSeleccionada;
        if (fechaSeleccionada && fechaSeleccionada.length === 10) {
            const [year, month, day] = fechaSeleccionada.split("-");
            fechaFormateada = `${day}/${month}/${year}`;
        }
        divResultado.innerHTML = `
      <div class="resultado-item" style="background: #ffffff; border: 1px solid #cbd5e1; color: #16324f; padding: 14px 16px; border-radius: 14px;">
        <strong>${cantidad}</strong> estudio${cantidad === 1 ? "" : "s"} de tipo <strong>${tipoEstudio}</strong> registrado${cantidad === 1 ? "" : "s"} en la fecha <strong>${fechaFormateada}</strong>.
      </div>
    `;
    }
    actualizarListaEstudios() {
        if (!this.selectFiltroTipo)
            return;
        const estudios = Cl_mEstudio.obtenerTodos();
        const valorActual = this.selectFiltroTipo.value;
        this.selectFiltroTipo.innerHTML = '<option value="">-- Seleccione un estudio --</option>';
        for (let i = 0; i < estudios.length; i++) {
            const option = document.createElement("option");
            option.value = estudios[i].nombre;
            option.textContent = `${estudios[i].nombre} ($${estudios[i].precio})`;
            this.selectFiltroTipo.appendChild(option);
        }
        if (valorActual && this.selectFiltroTipo.querySelector(`option[value="${valorActual}"]`)) {
            this.selectFiltroTipo.value = valorActual;
        }
    }
    mostrarFormulario() {
        if (!this.divFormulario)
            return;
        this.botonNuevoExamen = document.getElementById("botonAbrirModal");
        this.botonFiltrarEstudios = document.getElementById("botonFiltrarEstudios");
        this.inputFiltroFecha = document.getElementById("filtro_fecha");
        this.selectFiltroTipo = document.getElementById("filtro_tipo_estudio");
        this.actualizarListaEstudios();
        if (this.botonFiltrarEstudios) {
            this.botonFiltrarEstudios.onclick = () => {
                const tipo = this.selectFiltroTipo?.value || "";
                const fecha = this.inputFiltroFecha?.value || "";
                if (!tipo) {
                    alert("Por favor, seleccione un estudio de la lista.");
                    return;
                }
                if (!fecha) {
                    alert("Por favor, seleccione una fecha.");
                    return;
                }
                if (this.avisarFiltrarEstudios) {
                    this.avisarFiltrarEstudios(tipo, fecha);
                }
            };
        }
    }
    mostrarFinalizados(datos) {
        if (!this.divFinalizados)
            return;
        if (datos.examenes.length === 0) {
            this.divFinalizados.innerHTML = "<div class='mensaje-vacio'>no hay examenes en estado LISTO para enviar resultados.</div>";
            return;
        }
        let html = `
      <table style="width:100%; border-collapse:collapse; text-align:left;">
        <thead>
          <tr style="background:#f4f6f9; border-bottom:2px solid #eee;">
            <th style="padding:12px;">Paciente</th>
            <th style="padding:12px;">Cédula</th>
            <th style="padding:12px;">Teléfono</th>
            <th style="padding:12px;">Estado</th>
            <th style="padding:12px;">Estudios</th>
            <th style="padding:12px;">Total</th>
            <th style="padding:12px; text-align:center;">Acciones</th>
          </tr>
        </thead>
        <tbody>
    `;
        for (let i = 0; i < datos.examenes.length; i++) {
            let ex = datos.examenes[i];
            let estadoColor = "";
            let estadoTexto = "";
            if (ex.estado === "preparacion") {
                estadoColor = "#ffc107";
                estadoTexto = "PREPARACIÓN";
            }
            else if (ex.estado === "pendiente") {
                estadoColor = "#17a2b8";
                estadoTexto = "PENDIENTE";
            }
            else {
                estadoColor = "#28a745";
                estadoTexto = "LISTO";
            }
            html += `
        <tr style="border-bottom:1px solid #f9f9f9;">
          <td style="padding:12px; font-weight:500;">${ex.nombrePaciente}</td>
          <td style="padding:12px; color:#666;">${ex.cedulaPaciente}</td>
          <td style="padding:12px; color:#666;">${ex.telefonoPaciente || "No registrado"}</td>
          <td style="padding:12px;"><span style="background:${estadoColor}; color:#fff; padding:4px 10px; border-radius:12px; font-size:0.7rem; font-weight:bold;">${estadoTexto}</span></td>
          <td style="padding:12px;"><span style="background:#e8eaf6; color:#3f51b5; padding:4px 10px; border-radius:12px; font-size:0.75rem;">${ex.nombreEstudio}</span></td>
          <td style="padding:12px; font-weight:bold; color:#2e7d32;">$${ex.precioEstudio}.00</td>
          <td style="padding:12px; text-align:center;">
            <button class="btn-imprimir" data-id="${ex.id}" style="padding:5px 12px; background:#764ba2; color:white; border:none; border-radius:6px; cursor:pointer; margin-right:6px; font-size:0.75rem;">
              📄 Imprimir
            </button>
            ${ex.estado === "listo" ? `
            <button class="btn-whatsapp" data-id="${ex.id}" style="padding:5px 12px; background:#25D366; color:white; border:none; border-radius:6px; cursor:pointer; font-size:0.75rem;">
              💬 Enviar WhatsApp
            </button>
            ` : `
            <span style="font-size:0.7rem; color:#999;">(esperando resultados)</span>
            `}
          </td>
        </tr>
      `;
        }
        html += "</tbody></table>";
        this.divFinalizados.innerHTML = html;
        let botonesImprimir = this.divFinalizados.querySelectorAll(".btn-imprimir");
        let yoMismo = this;
        for (let i = 0; i < botonesImprimir.length; i++) {
            let btn = botonesImprimir[i];
            btn.onclick = function () {
                let id = btn.getAttribute("data-id") || "";
                if (yoMismo.avisarImprimir)
                    yoMismo.avisarImprimir(id);
            };
        }
        let botonesWhatsApp = this.divFinalizados.querySelectorAll(".btn-whatsapp");
        for (let i = 0; i < botonesWhatsApp.length; i++) {
            let btn = botonesWhatsApp[i];
            btn.onclick = function () {
                let id = btn.getAttribute("data-id") || "";
                if (yoMismo.avisarWhatsApp)
                    yoMismo.avisarWhatsApp(id);
            };
        }
    }
    mostrarReporte(reporte) {
        let ventana = window.open("", "_blank");
        if (ventana) {
            ventana.document.write(`<html><head><title>Impresión de Resultados</title></head><body>${reporte}</body></html>`);
            ventana.document.close();
            ventana.print();
        }
    }
}
//# sourceMappingURL=Cl_vAdmin.js.map