// services/Cl_sCedula.ts
export default class Cl_sCedula {
    static API_URL = "/api/cedula.js";
    static async consultarPorCedula(cedulaCompleta) {
        const cedulaLimpia = cedulaCompleta.trim().toUpperCase();
        // Determinar nacionalidad y número
        let nacionalidad = 'V';
        let numeroCedula = cedulaLimpia;
        const matchLetra = cedulaLimpia.match(/^([VEJPG])\-?(\d+)$/i);
        if (matchLetra) {
            nacionalidad = matchLetra[1].toUpperCase();
            numeroCedula = matchLetra[2];
        }
        if (!/^\d+$/.test(numeroCedula)) {
            return {
                exito: false,
                mensaje: 'Formato de cédula inválido. Use V-12345678 o 12345678'
            };
        }
        try {
            const url = `${this.API_URL}?cedula=${numeroCedula}&nacionalidad=${nacionalidad}`;
            const respuesta = await fetch(url);
            if (!respuesta.ok) {
                return {
                    exito: false,
                    mensaje: `Error HTTP: ${respuesta.status}`
                };
            }
            const datos = await respuesta.json();
            if (datos.error === true) {
                return {
                    exito: false,
                    mensaje: datos.error_str || 'Error en la consulta de la API'
                };
            }
            if (datos.data && datos.data.nombre_completo) {
                return {
                    exito: true,
                    mensaje: 'Datos obtenidos correctamente',
                    nombreCompleto: datos.data.nombre_completo,
                    estado: datos.data.estado || '',
                    municipio: datos.data.municipio || '',
                    parroquia: datos.data.parroquia || ''
                };
            }
            return {
                exito: false,
                mensaje: 'No se encontraron datos para esta cédula'
            };
        }
        catch (error) {
            console.error('Error en Cl_sCedula:', error);
            return {
                exito: false,
                mensaje: 'Error de conexión con el servicio de verificación de cédula'
            };
        }
    }
    static validarFormatoCedula(cedula) {
        const limpia = cedula.trim().toUpperCase();
        const regex = /^([VEJPG])\-?(\d{6,8})$/i;
        return regex.test(limpia) || /^\d{6,8}$/.test(limpia);
    }
}
//# sourceMappingURL=Cl_sCedula.js.map