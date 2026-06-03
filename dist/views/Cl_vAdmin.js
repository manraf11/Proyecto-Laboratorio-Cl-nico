export default class Cl_vAdmin {
    divFinalizados;
    divFormulario;
    botonNuevoExamen = null;
    avisarImprimir;
    constructor() {
        this.divFinalizados = document.getElementById("admin_finalizados");
        this.divFormulario = document.getElementById("admin_formulario");
        this.mostrarFormulario();
    }
    cuandoClicEnNuevoExamen(avisar) {
        if (this.botonNuevoExamen)
            this.botonNuevoExamen.onclick = avisar;
    }
    cuandoClicEnImprimir(avisar) {
        this.avisarImprimir = avisar;
    }
    mostrarFormulario() {
        if (!this.divFormulario)
            return;
        this.divFormulario.innerHTML = `
      <button id="botonAbrirModal" style="width:100%; padding:12px; background:linear-gradient(135deg, #764ba2 0%, #667eea 100%); color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer; font-size:1rem;">
        + Registrar Orden de Examen
      </button>
    `;
        this.botonNuevoExamen = document.getElementById("botonAbrirModal");
    }
    mostrarFinalizados(datos) {
        if (!this.divFinalizados)
            return;
        if (datos.examenes.length === 0) {
            this.divFinalizados.innerHTML = "<div class='mensaje-vacio'>No hay exámenes listos para imprimir el día de hoy.</div>";
            return;
        }
        let html = `
      <table style="width:100%; border-collapse:collapse; text-align:left;">
        <thead>
          <tr style="background:#f4f6f9; border-bottom:2px solid #eee;">
            <th style="padding:12px;">Paciente</th>
            <th style="padding:12px;">Cédula</th>
            <th style="padding:12px;">Estudios Realizados</th>
            <th style="padding:12px;">Total Cobrado</th>
            <th style="padding:12px; text-align:center;">Acciones</th>
          </tr>
        </thead>
        <tbody>
    `;
        for (let i = 0; i < datos.examenes.length; i++) {
            let ex = datos.examenes[i];
            html += `
        <tr style="border-bottom:1px solid #f9f9f9;">
          <td style="padding:12px; font-weight:500;">${ex.nombrePaciente}</td>
          <td style="padding:12px; color:#666;">${ex.cedulaPaciente}</td>
          <td style="padding:12px;"><span style="background:#e8eaf6; color:#3f51b5; padding:4px 10px; border-radius:12px; font-size:0.85rem; font-weight:500;">${ex.nombreEstudio}</span></td>
          <td style="padding:12px; font-weight:bold; color:#2e7d32;">$${ex.precioEstudio}.00</td>
          <td style="padding:12px; text-align:center;">
            <button class="btn-imprimir" data-id="${ex.id}" style="padding:6px 14px; background:#764ba2; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">
              Imprimir Reporte
            </button>
          </td>
        </tr>
      `;
        }
        html += "</tbody></table>";
        this.divFinalizados.innerHTML = html;
        let botones = this.divFinalizados.querySelectorAll(".btn-imprimir");
        let yoMismo = this;
        for (let i = 0; i < botones.length; i++) {
            let btn = botones[i];
            btn.onclick = function () {
                let id = btn.getAttribute("data-id") || "";
                if (yoMismo.avisarImprimir)
                    yoMismo.avisarImprimir(id);
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