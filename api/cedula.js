// api/cedula.js - Proxy para consultar cédula sin CORS
export default async function handler(req, res) {
    // Configurar CORS para el frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const { cedula, nacionalidad = 'V' } = req.query;
    
    if (!cedula) {
        return res.status(400).json({ error: true, error_str: 'Cédula no proporcionada' });
    }
    
    // Limpiar cédula (solo números)
    const numeroCedula = String(cedula).replace(/[^0-9]/g, '');
    
    if (!numeroCedula) {
        return res.status(400).json({ error: true, error_str: 'Formato de cédula inválido' });
    }
    
    const APP_ID = '9217';
    const TOKEN = '1b0611917be24be6131b02be8be356f4';
    const API_URL = `https://api.cedula.com.ve/api/v1?app_id=${APP_ID}&token=${TOKEN}&nacionalidad=${nacionalidad}&cedula=${numeroCedula}`;
    
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.error === true) {
            return res.status(404).json({
                error: true,
                error_str: data.error_str || 'No se encontraron datos'
            });
        }
        
        if (data.data) {
            // 🔥 SOLO PRIMER NOMBRE Y PRIMER APELLIDO
            const primerNombre = data.data.primer_nombre || '';
            const primerApellido = data.data.primer_apellido || '';
            
            // Construir nombre completo: Primer Nombre + Primer Apellido
            const nombreCompleto = [primerNombre, primerApellido]
                .filter(p => p && p.trim() !== '')
                .join(' ');
            
            return res.status(200).json({
                error: false,
                data: {
                    nombre_completo: nombreCompleto,
                    estado: data.data.cne?.estado || '',
                    municipio: data.data.cne?.municipio || '',
                    parroquia: data.data.cne?.parroquia || ''
                }
            });
        }
        
        return res.status(404).json({ error: true, error_str: 'No se encontraron datos' });
        
    } catch (error) {
        return res.status(500).json({
            error: true,
            error_str: 'Error al consultar la API: ' + error.message
        });
    }
}