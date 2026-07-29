// services/Cl_sLaboratorio.ts
import Cl_mExamen from "../models/Cl_mExamen.js";
import Cl_mLaboratorio from "../models/Cl_mLaboratorio.js";
export default class Cl_sLaboratorio {
    static direccionWeb = "/api/examenes";
    static obtenerUsuarioSesion() {
        try {
            const sesion = sessionStorage.getItem('labUser');
            if (sesion) {
                const datos = JSON.parse(sesion);
                return {
                    id: datos.id || 0,
                    nombre: datos.nombreCompleto || datos.usuario || 'Sistema'
                };
            }
        }
        catch (e) {
            // Ignorar error
        }
        return { id: 0, nombre: 'Sistema' };
    }
    static async guardarEnNube(examen) {
        try {
            const usuario = this.obtenerUsuarioSesion();
            let respuesta = await fetch(this.direccionWeb, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombrePaciente: examen.nombrePaciente,
                    cedulaPaciente: examen.cedulaPaciente,
                    telefonoPaciente: examen.telefonoPaciente || '',
                    nombreEstudio: examen.nombreEstudio || '',
                    resultadoExamen: examen.resultadoExamen || '',
                    precioEstudio: examen.precioEstudio || '',
                    formaPago: examen.formaPago || '',
                    referencia: examen.referencia || '',
                    estado: examen.estado || 'preparacion',
                    fechaRegistro: examen.fechaRegistro || new Date().toISOString(),
                    usuarioRegistra: usuario.nombre,
                    usuarioId: usuario.id
                })
            });
            if (respuesta.ok) {
                let datos = await respuesta.json();
                return { ok: true, id: String(datos.id) };
            }
            console.error(`❌ Error HTTP ${respuesta.status} al guardar examen`);
            return { ok: false };
        }
        catch (error) {
            console.error('❌ Error al guardar examen:', error);
            return { ok: false };
        }
    }
    static async traerDesdeNube() {
        try {
            let respuesta = await fetch(this.direccionWeb);
            let laboratorio = new Cl_mLaboratorio();
            if (respuesta.ok) {
                let arregloCrudo = await respuesta.json();
                console.log(`📊 Recibidos ${arregloCrudo.length} exámenes desde Supabase`);
                for (let i = 0; i < arregloCrudo.length; i++) {
                    let c = arregloCrudo[i];
                    let estadoExamen = "preparacion";
                    if (c.estado !== undefined && c.estado !== null) {
                        const s = String(c.estado).toLowerCase();
                        if (s === "listo" || s.includes("listo") || s.includes("finalizado")) {
                            estadoExamen = "listo";
                        }
                        else if (s === "pendiente" || s.includes("pendiente")) {
                            estadoExamen = "pendiente";
                        }
                        else if (s === "preparacion" || s.includes("preparaci")) {
                            estadoExamen = "preparacion";
                        }
                        else {
                            estadoExamen = "preparacion";
                        }
                    }
                    let examen = new Cl_mExamen({
                        id: String(c.id),
                        nombrePaciente: c.nombre_paciente || c.nombrePaciente || '',
                        cedulaPaciente: c.cedula_paciente || c.cedulaPaciente || '',
                        telefonoPaciente: c.telefono_paciente || c.telefonoPaciente || '',
                        nombreEstudio: c.nombre_estudio || c.nombreEstudio || '',
                        resultadoExamen: c.resultado_examen || c.resultadoExamen || '',
                        precioEstudio: c.precio_estudio || c.precioEstudio || '',
                        formaPago: c.forma_pago || c.formaPago || '',
                        referencia: c.referencia || '',
                        estado: estadoExamen,
                        fechaRegistro: c.fecha_registro || c.fechaRegistro || new Date().toISOString()
                    });
                    laboratorio.agregarExamen(examen);
                }
                console.log(`✅ Cargados ${laboratorio.obtenerTodosLosExamenes().length} exámenes en memoria`);
                return { ok: true, laboratorio: laboratorio };
            }
            console.error(`❌ Error HTTP ${respuesta.status} al cargar exámenes`);
            return { ok: false, laboratorio: laboratorio };
        }
        catch (error) {
            console.error('❌ Error al cargar exámenes:', error);
            return { ok: false, laboratorio: new Cl_mLaboratorio() };
        }
    }
    // ============================================
    // ACTUALIZAR EXAMEN EN LA NUBE (CORREGIDO)
    // ============================================
    static async actualizarEnNube(id, examen) {
        try {
            console.log(`🔄 Actualizando examen ID: ${id}`);
            console.log(`📋 Datos a actualizar:`, {
                nombrePaciente: examen.nombrePaciente,
                cedulaPaciente: examen.cedulaPaciente,
                estado: examen.estado,
                nombreEstudio: examen.nombreEstudio,
                resultadoExamen: examen.resultadoExamen
            });
            // CORREGIDO: Enviar el ID en la URL y también en el body
            let respuesta = await fetch(`${this.direccionWeb}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: id,
                    nombrePaciente: examen.nombrePaciente || '',
                    cedulaPaciente: examen.cedulaPaciente || '',
                    telefonoPaciente: examen.telefonoPaciente || '',
                    nombreEstudio: examen.nombreEstudio || '',
                    resultadoExamen: examen.resultadoExamen || '',
                    precioEstudio: examen.precioEstudio || '',
                    formaPago: examen.formaPago || '',
                    referencia: examen.referencia || '',
                    estado: examen.estado || 'preparacion',
                    fechaRegistro: examen.fechaRegistro || new Date().toISOString()
                })
            });
            if (!respuesta.ok) {
                const errorText = await respuesta.text();
                console.error(`❌ Error HTTP ${respuesta.status}: ${respuesta.statusText}`);
                console.error(`📄 Respuesta del servidor: ${errorText}`);
                return { ok: false };
            }
            const datos = await respuesta.json();
            console.log(`✅ Examen actualizado correctamente:`, datos);
            return { ok: true, id: id };
        }
        catch (error) {
            console.error('❌ Error al actualizar examen:', error);
            return { ok: false };
        }
    }
    // ============================================
    // BÚSQUEDA DE CÉDULA CON API CNE
    // ============================================
    static async buscarPorCedula(cedula) {
        try {
            const cedulaLimpia = cedula.trim();
            console.log(`🔍 Buscando cédula: "${cedulaLimpia}"`);
            const respuesta = await fetch(`${this.direccionWeb}?cedula=${encodeURIComponent(cedulaLimpia)}`);
            if (!respuesta.ok) {
                console.log(`⚠️ Error en API local: ${respuesta.status}`);
            }
            else {
                const datos = await respuesta.json();
                console.log(`📊 Resultados de BD: ${datos.length}`);
                if (Array.isArray(datos) && datos.length > 0) {
                    const exactMatch = datos.find((item) => {
                        const cedulaRegistro = (item.cedula_paciente || item.cedulaPaciente || '').trim().toUpperCase();
                        const cedulaBuscar = cedulaLimpia.toUpperCase();
                        return cedulaRegistro === cedulaBuscar;
                    });
                    if (exactMatch) {
                        console.log(`✅ Cédula encontrada en BD: ${exactMatch.nombre_paciente || exactMatch.nombrePaciente}`);
                        return {
                            ok: true,
                            registro: {
                                nombrePaciente: exactMatch.nombre_paciente || exactMatch.nombrePaciente || '',
                                telefonoPaciente: exactMatch.telefono_paciente || exactMatch.telefonoPaciente || '',
                                cedulaPaciente: exactMatch.cedula_paciente || exactMatch.cedulaPaciente || ''
                            }
                        };
                    }
                }
            }
            console.log(`🔍 Cédula no encontrada en BD. Consultando API del CNE...`);
            const cedulaNumeros = cedulaLimpia.replace(/[^0-9]/g, '');
            const apiUrl = `/api/cedula.js?cedula=${cedulaNumeros}&nacionalidad=V`;
            console.log(`🌐 Consultando API CNE: ${apiUrl}`);
            try {
                const responseApi = await fetch(apiUrl);
                if (responseApi.ok) {
                    const dataApi = await responseApi.json();
                    console.log(`📊 Respuesta API:`, dataApi);
                    if (dataApi && dataApi.data && dataApi.data.nombre_completo) {
                        const nombreCompleto = dataApi.data.nombre_completo;
                        console.log(`✅ Nombre obtenido de CNE: ${nombreCompleto}`);
                        return {
                            ok: true,
                            nombreApi: nombreCompleto,
                            registro: {
                                nombrePaciente: nombreCompleto,
                                telefonoPaciente: '',
                                cedulaPaciente: cedulaLimpia
                            }
                        };
                    }
                    else if (dataApi && dataApi.nombre) {
                        console.log(`✅ Nombre obtenido de CNE: ${dataApi.nombre}`);
                        return {
                            ok: true,
                            nombreApi: dataApi.nombre,
                            registro: {
                                nombrePaciente: dataApi.nombre,
                                telefonoPaciente: '',
                                cedulaPaciente: cedulaLimpia
                            }
                        };
                    }
                    else {
                        console.log(`❌ CNE no devolvió datos para la cédula ${cedulaNumeros}`);
                    }
                }
                else {
                    console.log(`⚠️ CNE respondió con status: ${responseApi.status}`);
                }
            }
            catch (apiError) {
                console.error('❌ Error al consultar CNE:', apiError);
            }
            console.log(`❌ Cédula ${cedulaLimpia} no encontrada en BD ni en CNE`);
            return { ok: true };
        }
        catch (error) {
            console.error('❌ Error al buscar por cédula:', error);
            return { ok: false };
        }
    }
}
//# sourceMappingURL=Cl_sLaboratorio.js.map