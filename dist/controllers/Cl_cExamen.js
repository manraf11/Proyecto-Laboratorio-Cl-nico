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
        if (this.pantallaExamen.mostrarBuscandoCedula) {
            this.pantallaExamen.mostrarBuscandoCedula();
        }
        try {
            const resMockApi = await Cl_sLaboratorio.buscarPorCedula(cedula);
            if (resMockApi.ok && resMockApi.registro) {
                const r = resMockApi.registro;
                if (this.pantallaExamen.mostrarDatosPaciente) {
                    this.pantallaExamen.mostrarDatosPaciente({
                        nombre: r.nombrePaciente || "",
                        telefono: r.telefonoPaciente || "",
                        origen: "mockapi"
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
            if (this.pantallaExamen.mostrarConsultandoAPI) {
                this.pantallaExamen.mostrarConsultandoAPI();
            }
            const resultadoApi = await Cl_sCedula.consultarPorCedula(cedula);
            if (resultadoApi.exito && resultadoApi.nombreCompleto) {
                if (this.pantallaExamen.mostrarDatosPaciente) {
                    this.pantallaExamen.mostrarDatosPaciente({
                        nombre: resultadoApi.nombreCompleto,
                        telefono: "",
                        origen: "cne"
                    });
                }
                if (this.pantallaExamen.mostrarMensajeExito) {
                    this.pantallaExamen.mostrarMensajeExito(`✅ Datos obtenidos del CNE:\n👤 ${resultadoApi.nombreCompleto}`);
                }
                else {
                    alert(`✅ Datos obtenidos del CNE:\n👤 ${resultadoApi.nombreCompleto}`);
                }
            }
            else {
                if (this.pantallaExamen.mostrarErrorBusqueda) {
                    this.pantallaExamen.mostrarErrorBusqueda(`ℹ️ ${resultadoApi.mensaje}\nComplete los datos manualmente.`);
                }
                else {
                    alert(`ℹ️ ${resultadoApi.mensaje}\nComplete los datos manualmente.`);
                }
                if (this.pantallaExamen.enfocarCampoNombre) {
                    this.pantallaExamen.enfocarCampoNombre();
                }
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