// src/services/Cl_sLaboratorio.ts
import Cl_mExamen from "../models/Cl_mExamen.js";
import Cl_mLaboratorio from "../models/Cl_mLaboratorio.js";
// USAR MOCKAPI PARA EXÁMENES
const API_URL = "https://6a14b55c91ff9a63de06fced.mockapi.io/examenes";
export default class Cl_sLaboratorio {
    static async guardarEnNube(examen) {
        try {
            console.log("📤 Guardando examen en MockAPI...");
            const estudiosArray = examen.obtenerArregloEstudios();
            const preciosArray = examen.obtenerArregloPrecios();
            const datosExamen = {
                nombrePaciente: examen.nombrePaciente || '',
                cedulaPaciente: examen.cedulaPaciente || '',
                telefonoPaciente: examen.telefonoPaciente || '',
                nombreEstudio: estudiosArray.join(', '),
                precioEstudio: preciosArray.join(', '),
                resultadoExamen: examen.resultadoExamen || '',
                formaPago: examen.formaPago || '',
                referencia: examen.referencia || '',
                estado: examen.estado || 'preparacion',
                fechaRegistro: examen.fechaRegistro || new Date().toISOString()
            };
            const respuesta = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosExamen)
            });
            if (respuesta.ok) {
                let datos = await respuesta.json();
                console.log("✅ Examen guardado en MockAPI con ID:", datos.id);
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
            console.log("📥 Cargando exámenes desde MockAPI...");
            const respuesta = await fetch(API_URL);
            const laboratorio = new Cl_mLaboratorio();
            if (!respuesta.ok) {
                console.error(`❌ Error HTTP ${respuesta.status} al cargar exámenes`);
                return { ok: false, laboratorio: laboratorio };
            }
            const arregloCrudo = await respuesta.json();
            console.log(`📊 Recibidos ${arregloCrudo.length} exámenes desde MockAPI`);
            for (const c of arregloCrudo) {
                let estadoExamen = "preparacion";
                if (c.estado) {
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
                }
                const examen = new Cl_mExamen({
                    id: String(c.id),
                    nombrePaciente: c.nombrePaciente || '',
                    cedulaPaciente: c.cedulaPaciente || '',
                    telefonoPaciente: c.telefonoPaciente || '',
                    nombreEstudio: c.nombreEstudio || '',
                    resultadoExamen: c.resultadoExamen || '',
                    precioEstudio: c.precioEstudio || '',
                    formaPago: c.formaPago || '',
                    referencia: c.referencia || '',
                    estado: estadoExamen,
                    fechaRegistro: c.fechaRegistro || new Date().toISOString()
                });
                laboratorio.agregarExamen(examen);
            }
            console.log(`✅ Cargados ${laboratorio.obtenerTodosLosExamenes().length} exámenes en memoria`);
            return { ok: true, laboratorio: laboratorio };
        }
        catch (error) {
            console.error('❌ Error al cargar exámenes:', error);
            return { ok: false, laboratorio: new Cl_mLaboratorio() };
        }
    }
    static async actualizarEnNube(id, examen) {
        try {
            console.log(`🔄 Actualizando examen ${id} en MockAPI...`);
            const estudiosArray = examen.obtenerArregloEstudios();
            const preciosArray = examen.obtenerArregloPrecios();
            const datosExamen = {
                nombrePaciente: examen.nombrePaciente || '',
                cedulaPaciente: examen.cedulaPaciente || '',
                telefonoPaciente: examen.telefonoPaciente || '',
                nombreEstudio: estudiosArray.join(', '),
                precioEstudio: preciosArray.join(', '),
                resultadoExamen: examen.resultadoExamen || '',
                formaPago: examen.formaPago || '',
                referencia: examen.referencia || '',
                estado: examen.estado || 'preparacion',
                fechaRegistro: examen.fechaRegistro || new Date().toISOString()
            };
            const respuesta = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosExamen)
            });
            if (!respuesta.ok) {
                console.error(`❌ Error HTTP ${respuesta.status} al actualizar examen`);
                return { ok: false };
            }
            console.log(`✅ Examen ${id} actualizado en MockAPI`);
            return { ok: true, id: id };
        }
        catch (error) {
            console.error('❌ Error al actualizar examen:', error);
            return { ok: false };
        }
    }
    // ============================================
    // BÚSQUEDA DE CÉDULA - COMPLETA (MockAPI + CNE)
    // ============================================
    static async buscarPorCedula(cedula) {
        try {
            const cedulaLimpia = cedula.trim();
            console.log(`🔍 Buscando cédula: "${cedulaLimpia}"`);
            // ========== PASO 1: Buscar en MockAPI EXÁMENES ==========
            console.log("📋 PASO 1: Buscando en MockAPI EXÁMENES...");
            const respuesta = await fetch(`${API_URL}?cedulaPaciente=${encodeURIComponent(cedulaLimpia)}`);
            if (respuesta.ok) {
                const datos = await respuesta.json();
                console.log(`📊 Resultados en EXÁMENES: ${datos.length}`);
                if (Array.isArray(datos) && datos.length > 0) {
                    // Buscar coincidencia exacta (misma cédula)
                    const exactMatch = datos.find((item) => {
                        const cedulaRegistro = (item.cedulaPaciente || '').trim().toUpperCase();
                        return cedulaRegistro === cedulaLimpia.toUpperCase();
                    });
                    if (exactMatch) {
                        console.log(`✅ Cédula ENCONTRADA en EXÁMENES: ${exactMatch.nombrePaciente}`);
                        console.log(`📱 Teléfono: ${exactMatch.telefonoPaciente || 'No registrado'}`);
                        return {
                            ok: true,
                            registro: {
                                nombrePaciente: exactMatch.nombrePaciente || '',
                                telefonoPaciente: exactMatch.telefonoPaciente || '',
                                cedulaPaciente: exactMatch.cedulaPaciente || '',
                                origen: 'examenes'
                            }
                        };
                    }
                }
            }
            // ========== PASO 2: Consultar al CNE (via Vercel proxy) ==========
            console.log("📋 PASO 2: Cédula NO encontrada en EXÁMENES. Consultando al CNE...");
            const cedulaNumeros = cedulaLimpia.replace(/[^0-9]/g, '');
            // ⭐ En Vercel: usar /api/cedula (la serverless function)
            const cneApiUrl = `/api/cedula?cedula=${cedulaNumeros}&nacionalidad=V`;
            console.log(`🌐 Consultando CNE via proxy: ${cneApiUrl}`);
            try {
                const responseCNE = await fetch(cneApiUrl);
                console.log(`📊 Status CNE: ${responseCNE.status}`);
                if (responseCNE.ok) {
                    const dataCNE = await responseCNE.json();
                    console.log(`📊 Respuesta CNE:`, dataCNE);
                    if (dataCNE && !dataCNE.error && dataCNE.data && dataCNE.data.nombre_completo) {
                        const nombre = dataCNE.data.nombre_completo;
                        console.log(`✅ Nombre OBTENIDO del CNE: ${nombre}`);
                        return {
                            ok: true,
                            nombreApi: nombre,
                            registro: {
                                nombrePaciente: nombre,
                                telefonoPaciente: '', // El CNE no da teléfono
                                cedulaPaciente: cedulaLimpia,
                                origen: 'cne',
                                estado: dataCNE.data.estado || '',
                                municipio: dataCNE.data.municipio || '',
                                parroquia: dataCNE.data.parroquia || ''
                            }
                        };
                    }
                    else {
                        console.log(`❌ CNE no devolvió datos para la cédula ${cedulaNumeros}`);
                    }
                }
                else {
                    console.log(`⚠️ CNE respondió con status: ${responseCNE.status}`);
                    const errorData = await responseCNE.json().catch(() => ({}));
                    console.log(`📄 Error:`, errorData);
                }
            }
            catch (cneError) {
                console.warn('⚠️ Error al consultar CNE:', cneError);
            }
            // ========== PASO 3: No encontrado en ningún lado ==========
            console.log(`❌ Cédula ${cedulaLimpia} NO ENCONTRADA en EXÁMENES ni en CNE`);
            return {
                ok: true,
                registro: null // Indica que no se encontró
            };
        }
        catch (error) {
            console.error('❌ Error al buscar por cédula:', error);
            return { ok: false };
        }
    }
}
//# sourceMappingURL=Cl_sLaboratorio.js.map