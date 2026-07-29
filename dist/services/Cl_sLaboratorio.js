// services/Cl_sLaboratorio.ts
import { supabase } from '../config/database.js';
import Cl_mExamen from "../models/Cl_mExamen.js";
import Cl_mLaboratorio from "../models/Cl_mLaboratorio.js";
export default class Cl_sLaboratorio {
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
            const { data: examenData, error: examenError } = await supabase
                .from('examenes')
                .insert({
                nombre_paciente: examen.nombrePaciente,
                cedula_paciente: examen.cedulaPaciente,
                telefono_paciente: examen.telefonoPaciente || '',
                forma_pago: examen.formaPago || '',
                referencia: examen.referencia || '',
                estado: examen.estado || 'preparacion',
                fecha_registro: examen.fechaRegistro || new Date().toISOString(),
                usuario_registra: usuario.nombre,
                usuario_id: usuario.id || null
            })
                .select()
                .single();
            if (examenError) {
                console.error('❌ Error al guardar examen:', examenError);
                return { ok: false };
            }
            const examenId = examenData.id;
            const estudios = examen.obtenerArregloEstudios();
            const precios = examen.obtenerArregloPrecios();
            const resultados = examen.obtenerArregloResultados();
            for (let i = 0; i < estudios.length; i++) {
                const nombreEstudio = estudios[i]?.trim();
                if (!nombreEstudio)
                    continue;
                const { data: estudioData } = await supabase
                    .from('estudios')
                    .select('id')
                    .eq('nombre', nombreEstudio)
                    .maybeSingle();
                if (!estudioData)
                    continue;
                const precio = precios[i] || 0;
                const resultado = resultados[i] || '';
                const estadoDetalle = resultado.trim() !== '' && resultado.trim() !== 'Pendiente' ? 'realizado' : 'pendiente';
                await supabase
                    .from('examen_estudios')
                    .insert({
                    examen_id: examenId,
                    estudio_id: estudioData.id,
                    precio: precio,
                    resultado: resultado,
                    estado: estadoDetalle
                });
            }
            await this.actualizarTotalExamen(examenId);
            console.log(`✅ Examen guardado con ID: ${examenId}`);
            return { ok: true, id: String(examenId) };
        }
        catch (error) {
            console.error('❌ Error al guardar examen:', error);
            return { ok: false };
        }
    }
    static async actualizarTotalExamen(examenId) {
        try {
            const { data } = await supabase
                .from('examen_estudios')
                .select('precio')
                .eq('examen_id', examenId);
            // CORREGIDO: Tipado explícito para los parámetros
            const total = data?.reduce((sum, item) => sum + (item.precio || 0), 0) || 0;
            await supabase
                .from('examenes')
                .update({ total_general: total })
                .eq('id', examenId);
        }
        catch (error) {
            console.error('❌ Error al actualizar total:', error);
        }
    }
    static async traerDesdeNube() {
        try {
            const { data: examenesData, error: examenesError } = await supabase
                .from('vista_examenes_completos')
                .select('*')
                .order('id', { ascending: false });
            if (examenesError) {
                console.error('❌ Error al cargar exámenes:', examenesError);
                return { ok: false, laboratorio: new Cl_mLaboratorio() };
            }
            const laboratorio = new Cl_mLaboratorio();
            for (const c of examenesData || []) {
                let estadoExamen = "preparacion";
                const s = String(c.estado || '').toLowerCase();
                if (s === "listo" || s.includes("listo") || s.includes("finalizado")) {
                    estadoExamen = "listo";
                }
                else if (s === "pendiente" || s.includes("pendiente")) {
                    estadoExamen = "pendiente";
                }
                else {
                    estadoExamen = "preparacion";
                }
                let examen = new Cl_mExamen({
                    id: String(c.id),
                    nombrePaciente: c.nombre_paciente || '',
                    cedulaPaciente: c.cedula_paciente || '',
                    telefonoPaciente: c.telefono_paciente || '',
                    nombreEstudio: c.nombre_estudio || '',
                    resultadoExamen: c.resultado_examen || '',
                    precioEstudio: c.precio_estudio || '',
                    formaPago: c.forma_pago || '',
                    referencia: c.referencia || '',
                    estado: estadoExamen,
                    fechaRegistro: c.fecha_registro || new Date().toISOString()
                });
                laboratorio.agregarExamen(examen);
            }
            console.log(`✅ Cargados ${laboratorio.obtenerTodosLosExamenes().length} exámenes desde Supabase`);
            return { ok: true, laboratorio };
        }
        catch (error) {
            console.error('❌ Error al cargar exámenes:', error);
            return { ok: false, laboratorio: new Cl_mLaboratorio() };
        }
    }
    static async actualizarEnNube(id, examen) {
        try {
            const examenId = parseInt(id);
            console.log(`🔄 Actualizando examen ID: ${examenId}`);
            const { error: updateError } = await supabase
                .from('examenes')
                .update({
                nombre_paciente: examen.nombrePaciente || '',
                cedula_paciente: examen.cedulaPaciente || '',
                telefono_paciente: examen.telefonoPaciente || '',
                forma_pago: examen.formaPago || '',
                referencia: examen.referencia || '',
                estado: examen.estado || 'preparacion',
                updated_at: new Date().toISOString()
            })
                .eq('id', examenId);
            if (updateError) {
                console.error('❌ Error al actualizar examen:', updateError);
                return { ok: false };
            }
            await supabase
                .from('examen_estudios')
                .delete()
                .eq('examen_id', examenId);
            const estudios = examen.obtenerArregloEstudios();
            const precios = examen.obtenerArregloPrecios();
            const resultados = examen.obtenerArregloResultados();
            for (let i = 0; i < estudios.length; i++) {
                const nombreEstudio = estudios[i]?.trim();
                if (!nombreEstudio)
                    continue;
                const { data: estudioData } = await supabase
                    .from('estudios')
                    .select('id')
                    .eq('nombre', nombreEstudio)
                    .maybeSingle();
                if (!estudioData)
                    continue;
                const precio = precios[i] || 0;
                const resultado = resultados[i] || '';
                const estadoDetalle = resultado.trim() !== '' && resultado.trim() !== 'Pendiente' ? 'realizado' : 'pendiente';
                await supabase
                    .from('examen_estudios')
                    .insert({
                    examen_id: examenId,
                    estudio_id: estudioData.id,
                    precio: precio,
                    resultado: resultado,
                    estado: estadoDetalle
                });
            }
            await this.actualizarTotalExamen(examenId);
            console.log(`✅ Examen ${id} actualizado correctamente`);
            return { ok: true, id: id };
        }
        catch (error) {
            console.error('❌ Error al actualizar examen:', error);
            return { ok: false };
        }
    }
    static async buscarPorCedula(cedula) {
        try {
            const cedulaLimpia = cedula.trim();
            console.log(`🔍 Buscando cédula: "${cedulaLimpia}"`);
            const { data, error } = await supabase
                .from('examenes')
                .select('nombre_paciente, telefono_paciente, cedula_paciente')
                .eq('cedula_paciente', cedulaLimpia)
                .order('id', { ascending: false })
                .limit(1);
            if (error) {
                console.log('⚠️ Error al buscar en BD:', error);
            }
            else if (data && data.length > 0) {
                const registro = data[0];
                console.log(`✅ Cédula encontrada en BD: ${registro.nombre_paciente}`);
                return {
                    ok: true,
                    registro: {
                        nombrePaciente: registro.nombre_paciente || '',
                        telefonoPaciente: registro.telefono_paciente || '',
                        cedulaPaciente: registro.cedula_paciente || ''
                    }
                };
            }
            console.log(`🔍 Cédula no encontrada en BD. Consultando API del CNE...`);
            const cedulaNumeros = cedulaLimpia.replace(/[^0-9]/g, '');
            const apiUrl = `/api/cedula.js?cedula=${cedulaNumeros}&nacionalidad=V`;
            try {
                const response = await fetch(apiUrl);
                if (response.ok) {
                    const dataApi = await response.json();
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
                }
            }
            catch (apiError) {
                console.error('❌ Error al consultar CNE:', apiError);
            }
            console.log(`❌ Cédula ${cedulaLimpia} no encontrada`);
            return { ok: true };
        }
        catch (error) {
            console.error('❌ Error al buscar por cédula:', error);
            return { ok: false };
        }
    }
}
//# sourceMappingURL=Cl_sLaboratorio.js.map