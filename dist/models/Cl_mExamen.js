// models/Cl_mExamen.ts
import Cl_mEstudio from "./Cl_mEstudio.js";
export default class Cl_mExamen {
    id;
    nombrePaciente;
    cedulaPaciente;
    telefonoPaciente;
    nombreEstudio;
    resultadoExamen;
    precioEstudio;
    formaPago;
    estado;
    fechaRegistro;
    constructor(datos) {
        this.id = datos.id || "";
        this.nombrePaciente = datos.nombrePaciente || "";
        this.cedulaPaciente = datos.cedulaPaciente || "";
        this.telefonoPaciente = datos.telefonoPaciente || "";
        this.formaPago = datos.formaPago || "";
        this.resultadoExamen = datos.resultadoExamen || "";
        this.estado = datos.estado || "preparacion";
        this.fechaRegistro = datos.fechaRegistro || new Date().toISOString();
        if (datos.estudiosSeleccionados && Array.isArray(datos.estudiosSeleccionados)) {
            this.nombreEstudio = datos.estudiosSeleccionados.join(", ");
            this.precioEstudio = Cl_mEstudio.calcularPrecioTotal(datos.estudiosSeleccionados);
        }
        else if (datos.nombreEstudio) {
            this.nombreEstudio = datos.nombreEstudio;
            this.precioEstudio = Number(datos.precioEstudio) || 0;
        }
        else {
            this.nombreEstudio = "";
            this.precioEstudio = 0;
        }
    }
    obtenerArregloEstudios() {
        if (!this.nombreEstudio.trim())
            return [];
        return this.nombreEstudio.split(", ").map(item => item.trim());
    }
    obtenerArregloResultados() {
        if (!this.resultadoExamen.trim())
            return [];
        return this.resultadoExamen.split(", ").map(item => item.trim());
    }
    // ✅ MÉTODO EN EL MODELO: Lógica de negocio para enviar WhatsApp
    async enviarResultadosPorWhatsApp() {
        // Validar que el examen esté en estado "listo" (completado)
        if (this.estado !== "listo") {
            return {
                exito: false,
                mensaje: `El examen está en estado "${this.estado}". Solo se pueden enviar resultados cuando está "listo".`
            };
        }
        // Validar que tenga resultados
        if (!this.resultadoExamen || this.resultadoExamen.trim() === "") {
            return {
                exito: false,
                mensaje: "No hay resultados registrados para enviar."
            };
        }
        // Validar que tenga número de teléfono
        if (!this.telefonoPaciente || this.telefonoPaciente.trim() === "") {
            return {
                exito: false,
                mensaje: "El paciente no tiene número de teléfono registrado."
            };
        }
        // Construir el mensaje para WhatsApp
        let mensajeWhatsApp = this.construirMensajeResultados();
        // Limpiar número de teléfono (solo dígitos)
        let telefonoLimpio = this.telefonoPaciente.replace(/\D/g, "");
        // Si el número no tiene código de país, asumir Venezuela (+58)
        if (telefonoLimpio.length === 10 && !telefonoLimpio.startsWith("58")) {
            telefonoLimpio = "58" + telefonoLimpio;
        }
        // URL de WhatsApp Web (abre el chat sin enviar automáticamente por seguridad)
        // El usuario debe hacer clic en enviar
        let urlWhatsApp = `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(mensajeWhatsApp)}`;
        // Abrir WhatsApp en nueva pestaña
        window.open(urlWhatsApp, "_blank");
        return {
            exito: true,
            mensaje: "Se abrió WhatsApp para enviar los resultados al paciente."
        };
    }
    construirMensajeResultados() {
        let estudios = this.obtenerArregloEstudios();
        let resultados = this.obtenerArregloResultados();
        let mensaje = `🏥 *LABORATORIO CLÍNICO*\n\n`;
        mensaje += `📋 *RESULTADOS DE EXAMENES*\n`;
        mensaje += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
        mensaje += `👤 *Paciente:* ${this.nombrePaciente}\n`;
        mensaje += `🆔 *Cédula:* ${this.cedulaPaciente}\n`;
        mensaje += `📅 *Fecha:* ${new Date(this.fechaRegistro).toLocaleDateString()}\n\n`;
        mensaje += `*📊 RESULTADOS:*\n`;
        for (let i = 0; i < estudios.length; i++) {
            let resultado = resultados[i] || "Pendiente";
            let referencia = Cl_mEstudio.obtenerValoresReferencia(estudios[i]);
            let unidad = Cl_mEstudio.obtenerUnidad(estudios[i]);
            mensaje += `\n🔬 *${estudios[i]}*\n`;
            mensaje += `   Valor: ${resultado} ${unidad}\n`;
            mensaje += `   Referencia: ${referencia}\n`;
        }
        mensaje += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
        mensaje += `*Total pagado:* Bs./$ ${this.precioEstudio}\n`;
        mensaje += `*Método de pago:* ${this.formaPago}\n\n`;
        mensaje += `_Resultados validados por nuestro equipo._\n`;
        mensaje += `_Ante cualquier duda, consulte con su médico._`;
        return mensaje;
    }
    // Método para cambiar estado (lógica de negocio)
    cambiarEstado(nuevoEstado) {
        this.estado = nuevoEstado;
    }
    // Verificar si puede pasar a listo
    puedeFinalizar() {
        if (!this.resultadoExamen || this.resultadoExamen.trim() === "") {
            return false;
        }
        let resultados = this.obtenerArregloResultados();
        let estudios = this.obtenerArregloEstudios();
        // Todos los estudios deben tener resultado
        return resultados.length === estudios.length && resultados.every(r => r.trim() !== "");
    }
}
//# sourceMappingURL=Cl_mExamen.js.map