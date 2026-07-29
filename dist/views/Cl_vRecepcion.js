import Cl_mEstudio from "../models/Cl_mEstudio.js";
export default class Cl_vRecepcion {
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
        this.divFinalizados = document.getElementById("rec_finalizados");
        this.divFormulario = document.getElementById("rec_formulario");
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
        const divResultado = document.getElementById("rec_resultadoFiltroEstudios");
        if (!divResultado)
            return;
        divResultado.innerHTML = `
      <div class="resultado-item">
        <strong>${cantidad}</strong> estudio(s) de tipo <strong>${tipoEstudio}</strong> en fecha <strong>${fechaSeleccionada}</strong>
      </div>
    `;
    }
    mostrarFinalizados(datos) {
        if (!this.divFinalizados)
            return;
        if (datos.examenes.length === 0) {
            this.divFinalizados.innerHTML = "<div class='mensaje-vacio'>📭 No hay exámenes listos</div>";
            return;
        }
        let html = `
      <div class="tabla-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Paciente</th>
              <th>Cédula</th>
              <th>Teléfono</th>
              <th>Estudios</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
    `;
        for (const ex of datos.examenes) {
            const idMostrar = ex.id ? (ex.id.length > 6 ? ex.id.slice(-6) : ex.id) : "N/A";
            html += `
        <tr>
          <td data-label="ID">#${idMostrar}</td>
          <td data-label="Paciente">${this.escapeHtml(ex.nombrePaciente)}</td>
          <td data-label="Cédula">${this.escapeHtml(ex.cedulaPaciente)}</td>
          <td data-label="Teléfono">${ex.telefonoPaciente || "No registrado"}</td>
          <td data-label="Estudios"><span style="background:#e8eaf6; padding:4px 10px; border-radius:12px; font-size:0.7rem;">${this.escapeHtml(ex.nombreEstudio)}</span></td>
          <td data-label="Total">$${ex.calcularTotal().toFixed(2)}</td>
          <td data-label="Acciones">
            <button class="btn-imprimir" data-id="${ex.id}">📄 Imprimir</button>
            <button class="btn-whatsapp" data-id="${ex.id}">💬 WhatsApp</button>
          </td>
        </tr>
      `;
        }
        html += "</tbody></table></div>";
        this.divFinalizados.innerHTML = html;
        const yoMismo = this;
        document.querySelectorAll(".btn-imprimir").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id") || "";
                if (yoMismo.avisarImprimir)
                    yoMismo.avisarImprimir(id);
            });
        });
        document.querySelectorAll(".btn-whatsapp").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id") || "";
                if (yoMismo.avisarWhatsApp)
                    yoMismo.avisarWhatsApp(id);
            });
        });
    }
    mostrarFormulario() {
        if (!this.divFormulario)
            return;
        this.botonNuevoExamen = document.getElementById("rec_botonAbrirModal");
        this.botonFiltrarEstudios = document.getElementById("rec_botonFiltrarEstudios");
        this.inputFiltroFecha = document.getElementById("rec_filtro_fecha");
        this.selectFiltroTipo = document.getElementById("rec_filtro_tipo_estudio");
        this.actualizarListaEstudios();
        if (this.botonFiltrarEstudios) {
            this.botonFiltrarEstudios.onclick = () => {
                const tipo = this.selectFiltroTipo?.value || "";
                const fecha = this.inputFiltroFecha?.value || "";
                if (this.avisarFiltrarEstudios)
                    this.avisarFiltrarEstudios(tipo, fecha);
            };
        }
    }
    actualizarListaEstudios() {
        const estudios = Cl_mEstudio.obtenerTodos();
        const selects = [this.selectFiltroTipo];
        const valores = [this.selectFiltroTipo?.value || ""];
        selects.forEach((select, index) => {
            if (select) {
                select.innerHTML = '<option value="">-- Seleccione un estudio --</option>';
                for (let i = 0; i < estudios.length; i++) {
                    const option = document.createElement("option");
                    option.value = estudios[i].nombre;
                    option.textContent = `${estudios[i].nombre} ($${estudios[i].precio})`;
                    select.appendChild(option);
                }
                if (valores[index] && select.querySelector(`option[value="${valores[index]}"]`)) {
                    select.value = valores[index];
                }
            }
        });
    }
    escapeHtml(text) {
        if (!text)
            return "";
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
//# sourceMappingURL=Cl_vRecepcion.js.map