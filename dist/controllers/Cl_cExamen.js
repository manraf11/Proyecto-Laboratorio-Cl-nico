import Cl_mExamen from "../models/Cl_mExamen.js";
import Cl_sEstudio from "../services/Cl_sEstudio.js";
import Cl_sLaboratorio from "../services/Cl_sLaboratorio.js";
import Cl_sCedula from "../services/Cl_sCedula.js";
export default class Cl_cExamen {
    pantallaExamen;
    avisar = null;
    constructor(pantallaExamen) {
        this.pantallaExamen = pantallaExamen;
        let yoMismo = this;
        this.pantallaExamen.cuandoDenCancelar(() => yoMismo.alCancelar());
        this.pantallaExamen.cuandoDenAceptar((datos) => yoMismo.alAceptar(datos));
        if (this.pantallaExamen.cuandoBusquenCedula) {
            this.pantallaExamen.cuandoBusquenCedula((cedula) => yoMismo.buscarCedula(cedula));
        }
    }
    async pedirDatosExamen(avisar) {
        this.avisar = avisar;
        await Cl_sEstudio.cargarCatálogo();
        this.pantallaExamen.mostrar();
    }
    alCancelar() {
        if (this.avisar)
            this.avisar(null);
        this.pantallaExamen.ocultar();
    }
    alAceptar(datos) {
        const examenTemp = new Cl_mExamen({
            nombrePaciente: datos.nombrePaciente,
            cedulaPaciente: datos.cedulaPaciente,
            telefonoPaciente: datos.telefonoPaciente || "",
            estudiosSeleccionados: datos.estudiosSeleccionados,
            formaPago: datos.formaPago,
            referencia: datos.referencia || ""
        });
        const validacion = examenTemp.validarTodosLosDatos({
            nombre: datos.nombrePaciente,
            cedula: datos.cedulaPaciente,
            telefono: datos.telefonoPaciente || "",
            estudios: datos.estudiosSeleccionados,
            metodoPago: datos.formaPago,
            referencia: datos.referencia
        });
        if (!validacion.valido) {
            // La Vista muestra los errores (UI)
            if (this.pantallaExamen.mostrarErrores) {
                this.pantallaExamen.mostrarErrores(validacion.errores);
            }
            else {
                alert("⚠️ " + validacion.errores.join("\n"));
            }
            return;
        }
        if (this.avisar) {
            let nuevoExamen = new Cl_mExamen({
                nombrePaciente: datos.nombrePaciente,
                cedulaPaciente: datos.cedulaPaciente,
                telefonoPaciente: datos.telefonoPaciente,
                estudiosSeleccionados: datos.estudiosSeleccionados,
                formaPago: datos.formaPago,
                referencia: datos.referencia || ""
            });
            this.avisar(nuevoExamen);
        }
        this.pantallaExamen.ocultar();
    }
    async buscarCedula(cedula) {
        if (!cedula || cedula.trim() === "")
            return;
        // Guardar placeholder original
        const inputNombre = document.getElementById("modal_nombre");
        const inputTelefono = document.getElementById("modal_telefono");
        const originalPlaceholder = inputNombre?.placeholder || "";
        if (inputNombre) {
            inputNombre.value = "";
            inputNombre.placeholder = "🔍 Buscando...";
        }
        try {
            // PASO 1: Buscar en mockapi (exámenes existentes)
            const resMockApi = await Cl_sLaboratorio.buscarPorCedula(cedula);
            if (resMockApi.ok && resMockApi.registro) {
                const r = resMockApi.registro;
                if (inputNombre && r.nombrePaciente)
                    inputNombre.value = r.nombrePaciente;
                if (inputTelefono && r.telefonoPaciente)
                    inputTelefono.value = r.telefonoPaciente;
                alert("✅ Datos del paciente cargados automáticamente (desde registros anteriores).");
            }
            else {
                // PASO 2: Consultar API externa a través del proxy
                if (inputNombre)
                    inputNombre.placeholder = "🌐 Consultando API...";
                const resultadoApi = await Cl_sCedula.consultarPorCedula(cedula);
                if (resultadoApi.exito && resultadoApi.nombreCompleto) {
                    if (inputNombre)
                        inputNombre.value = resultadoApi.nombreCompleto;
                    alert(`✅ Datos obtenidos del CNE:\n👤 ${resultadoApi.nombreCompleto}`);
                }
                else {
                    alert(`ℹ️ ${resultadoApi.mensaje}\nComplete los datos manualmente.`);
                    if (inputNombre)
                        inputNombre.focus();
                }
            }
        }
        catch (error) {
            console.error("Error en búsqueda de cédula:", error);
            alert("⚠️ Error al consultar. Complete los datos manualmente.");
        }
        finally {
            if (inputNombre)
                inputNombre.placeholder = originalPlaceholder;
        }
    }
}
//# sourceMappingURL=Cl_cExamen.js.map