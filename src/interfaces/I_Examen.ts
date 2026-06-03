export interface IDatosExamen {
  nombrePaciente: string;
  cedulaPaciente: string;
  telefonoPaciente?: string;
  estudiosSeleccionados?: string[];
  formaPago?: string;
}

export interface IExamen {
  id?: string;
  nombrePaciente: string;
  cedulaPaciente: string;
  telefonoPaciente?: string;
  nombreEstudio?: string;
  resultadoExamen?: string;
  precioEstudio?: number;
  formaPago?: string;
  estaFinalizado?: boolean;
  fechaRegistro?: string;
}
