import Cl_mEstudio from "../models/Cl_mEstudio.js";
export default class Cl_vExamen {
    modal;
    botonCancelar;
    botonAceptar;
    avisarAceptar = null;
    avisarCancelar = null;
    inputCedula;
    inputNombre;
    inputTelefono;
    inputReferencia;
    selectMetodoPago;
    campoReferencia;
    inputPrecio;
    checkboxesContainer;
    placeholderOriginal = "";
    constructor() {
        this.modal = document.getElementById("modalExamen");
        this.botonCancelar = document.getElementById("modal_btnCancelar");
        this.botonAceptar = document.getElementById("modal_btnAceptar");
        this.inputCedula = document.getElementById("modal_cedula");
        this.inputNombre = document.getElementById("modal_nombre");
        this.inputTelefono = document.getElementById("modal_telefono");
        this.inputReferencia = document.getElementById("modal_referencia");
        this.selectMetodoPago = document.getElementById("modal_metodoPago");
        this.campoReferencia = document.getElementById("campo_referencia");
        this.inputPrecio = document.getElementById("modal_precio");
        this.checkboxesContainer = document.getElementById("modal_checkboxes");
        if (this.modal)
            this.modal.style.display = "none";
        if (this.inputNombre) {
            this.placeholderOriginal = this.inputNombre.placeholder;
        }
        this.configurarEventListeners();
    }
    obtenerDatosFormulario() {
        return {
            nombrePaciente: this.inputNombre?.value || "",
            cedulaPaciente: this.inputCedula?.value || "",
            telefonoPaciente: this.inputTelefono?.value || "",
            estudiosSeleccionados: this.obtenerEstudiosSeleccionados(),
            formaPago: this.selectMetodoPago?.value || "",
            referencia: this.inputReferencia?.value || ""
        };
    }
    obtenerEstudiosSeleccionados() {
        const seleccionados = [];
        if (this.checkboxesContainer) {
            const checkboxes = this.checkboxesContainer.querySelectorAll(".modal-check-estudio:checked");
            for (let i = 0; i < checkboxes.length; i++) {
                seleccionados.push(checkboxes[i].value);
            }
        }
        return seleccionados;
    }
    mostrarErrores(errores) {
        if (errores.length === 0)
            return;
        alert("⚠️ " + errores.join("\n"));
    }
    mostrarBuscandoCedula() {
        if (this.inputNombre) {
            this.inputNombre.value = "";
            this.inputNombre.placeholder = "🔍 Buscando...";
        }
    }
    mostrarConsultandoAPI() {
        if (this.inputNombre) {
            this.inputNombre.placeholder = "🌐 Consultando API...";
        }
    }
    mostrarDatosPaciente(datos) {
        if (this.inputNombre && datos.nombre) {
            this.inputNombre.value = datos.nombre;
        }
        if (this.inputTelefono && datos.telefono) {
            this.inputTelefono.value = datos.telefono;
        }
    }
    mostrarMensajeExito(mensaje) {
        alert(mensaje);
    }
    mostrarErrorBusqueda(mensaje) {
        alert(mensaje);
    }
    enfocarCampoNombre() {
        if (this.inputNombre) {
            this.inputNombre.focus();
        }
    }
    restaurarPlaceholder() {
        if (this.inputNombre) {
            this.inputNombre.placeholder = this.placeholderOriginal;
        }
    }
    configurarEventListeners() {
        let yoMismo = this;
        if (this.botonCancelar) {
            this.botonCancelar.onclick = () => {
                if (yoMismo.avisarCancelar)
                    yoMismo.avisarCancelar();
                yoMismo.ocultar();
            };
        }
        if (this.botonAceptar) {
            this.botonAceptar.onclick = () => {
                const datos = yoMismo.obtenerDatosFormulario();
                if (yoMismo.avisarAceptar) {
                    yoMismo.avisarAceptar(datos);
                }
            };
        }
        if (this.checkboxesContainer) {
            this.checkboxesContainer.addEventListener("change", (e) => {
                const target = e.target;
                if (target.classList.contains("modal-check-estudio")) {
                    this.actualizarTotal();
                }
            });
        }
        if (this.selectMetodoPago) {
            this.selectMetodoPago.onchange = () => {
                const v = this.selectMetodoPago?.value;
                if (v === "Transferencia" || v === "Pago Móvil") {
                    if (this.campoReferencia)
                        this.campoReferencia.style.display = "block";
                }
                else {
                    if (this.campoReferencia)
                        this.campoReferencia.style.display = "none";
                    if (this.inputReferencia)
                        this.inputReferencia.value = "";
                }
            };
        }
        if (this.inputCedula) {
            this.inputCedula.addEventListener('keydown', (ev) => {
                if (ev.key === 'Enter') {
                    const ced = this.inputCedula?.value.trim() || "";
                    if (!ced)
                        return;
                    if (this.avisarBuscarCedula) {
                        this.avisarBuscarCedula(ced);
                    }
                }
            });
        }
    }
    avisarBuscarCedula = null;
    cuandoBusquenCedula(callback) {
        this.avisarBuscarCedula = callback;
    }
    actualizarTotal() {
        if (!this.checkboxesContainer || !this.inputPrecio)
            return;
        let total = 0;
        const checkboxes = this.checkboxesContainer.querySelectorAll(".modal-check-estudio:checked");
        for (let i = 0; i < checkboxes.length; i++) {
            const chk = checkboxes[i];
            const precio = parseFloat(chk.getAttribute("data-precio") || "0");
            total += precio;
        }
        this.inputPrecio.value = total.toString();
    }
    cargarCatalogoEstudios() {
        if (!this.checkboxesContainer)
            return;
        const estudios = Cl_mEstudio.obtenerTodos();
        if (estudios.length === 0) {
            this.checkboxesContainer.innerHTML = "<p>Cargando catálogo...</p>";
            return;
        }
        let checkboxesHtml = "";
        for (let i = 0; i < estudios.length; i++) {
            const est = estudios[i];
            checkboxesHtml += `
        <div class="checkbox-item">
          <input type="checkbox" class="modal-check-estudio" id="mod_est_${est.id}" value="${est.nombre}" data-precio="${est.precio}">
          <label for="mod_est_${est.id}">${this.escapeHtml(est.nombre)} ($${est.precio})</label>
        </div>
      `;
        }
        this.checkboxesContainer.innerHTML = checkboxesHtml;
    }
    limpiarFormulario() {
        if (this.inputCedula)
            this.inputCedula.value = "";
        if (this.inputNombre) {
            this.inputNombre.value = "";
            this.inputNombre.placeholder = this.placeholderOriginal;
        }
        if (this.inputTelefono)
            this.inputTelefono.value = "";
        if (this.inputReferencia)
            this.inputReferencia.value = "";
        if (this.inputPrecio)
            this.inputPrecio.value = "0";
        if (this.selectMetodoPago)
            this.selectMetodoPago.value = "Efectivo";
        if (this.campoReferencia)
            this.campoReferencia.style.display = "none";
        if (this.checkboxesContainer) {
            const checkboxes = this.checkboxesContainer.querySelectorAll(".modal-check-estudio");
            for (let i = 0; i < checkboxes.length; i++) {
                checkboxes[i].checked = false;
            }
        }
    }
    cuandoDenCancelar(callback) {
        this.avisarCancelar = callback;
    }
    cuandoDenAceptar(callback) {
        this.avisarAceptar = callback;
    }
    mostrar() {
        this.limpiarFormulario();
        this.cargarCatalogoEstudios();
        if (this.modal)
            this.modal.style.display = "flex";
        setTimeout(() => this.inputCedula?.focus(), 100);
    }
    ocultar() {
        if (this.modal)
            this.modal.style.display = "none";
    }
    escapeHtml(text) {
        if (!text)
            return "";
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
//# sourceMappingURL=Cl_vExamen.js.map