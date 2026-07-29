import Cl_mExamen from "../models/Cl_mExamen.js";
// Eliminar import de Cl_mEstudio si no se usa
import Cl_sEstudio from "../services/Cl_sEstudio.js";
import Cl_sLaboratorio from "../services/Cl_sLaboratorio.js";
// ELIMINAR ESTA LÍNEA: import Cl_sCedula from "../services/Cl_sCedula.js";
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
    // ============================================
    // CORREGIDO: BÚSQUEDA DE CÉDULA
    // ============================================
    async buscarCedula(cedula) {
        if (!cedula || cedula.trim() === "")
            return;
        if (this.pantallaExamen.mostrarBuscandoCedula) {
            this.pantallaExamen.mostrarBuscandoCedula();
        }
        try {
            const resMockApi = await Cl_sLaboratorio.buscarPorCedula(cedula);
            // Caso 1: Encontró en la base de datos
            if (resMockApi.ok && resMockApi.registro && resMockApi.registro.nombrePaciente) {
                const r = resMockApi.registro;
                if (this.pantallaExamen.mostrarDatosPaciente) {
                    this.pantallaExamen.mostrarDatosPaciente({
                        nombre: r.nombrePaciente || "",
                        telefono: r.telefonoPaciente || "",
                        origen: "db"
                    });
                }
                if (this.pantallaExamen.mostrarMensajeExito) {
                    this.pantallaExamen.mostrarMensajeExito("✅ Datos del paciente cargados automáticamente (desde registros anteriores).");
                }
                else {
                    alert("✅ Datos del paciente cargados automáticamente (desde registros anteriores).");
                }
                return;
            }
            // Caso 2: No encontró en BD, pero la API devolvió un nombre
            if (resMockApi.ok && resMockApi.nombreApi) {
                if (this.pantallaExamen.mostrarDatosPaciente) {
                    this.pantallaExamen.mostrarDatosPaciente({
                        nombre: resMockApi.nombreApi,
                        telefono: "",
                        origen: "cne"
                    });
                }
                if (this.pantallaExamen.mostrarMensajeExito) {
                    this.pantallaExamen.mostrarMensajeExito(`✅ Datos obtenidos del CNE:\n👤 ${resMockApi.nombreApi}`);
                }
                else {
                    alert(`✅ Datos obtenidos del CNE:\n👤 ${resMockApi.nombreApi}`);
                }
                return;
            }
            // Caso 3: No encontrado en ningún lado
            if (this.pantallaExamen.mostrarErrorBusqueda) {
                this.pantallaExamen.mostrarErrorBusqueda("ℹ️ Cédula no encontrada. Complete los datos manualmente.");
            }
            else {
                alert("ℹ️ Cédula no encontrada. Complete los datos manualmente.");
            }
            if (this.pantallaExamen.enfocarCampoNombre) {
                this.pantallaExamen.enfocarCampoNombre();
            }
        }
        catch (error) {
            console.error("Error en búsqueda de cédula:", error);
            if (this.pantallaExamen.mostrarErrorBusqueda) {
                this.pantallaExamen.mostrarErrorBusqueda("⚠️ Error al consultar. Complete los datos manualmente.");
            }
            else {
                alert("⚠️ Error al consultar. Complete los datos manualmente.");
            }
        }
        finally {
            if (this.pantallaExamen.restaurarPlaceholder) {
                this.pantallaExamen.restaurarPlaceholder();
            }
        }
    }
}
//# sourceMappingURL=Cl_cExamen.js.map