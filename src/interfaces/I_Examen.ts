
export interface IExamen {
  id?: string;
  nombrePaciente: string;
  cedulaPaciente: string;
  telefonoPaciente?: string;
  estudiosSeleccionados?: string[];
  nombreEstudio?: string;
  resultadoExamen?: string;
  precioEstudio?: number;
  formaPago?: string;
  estaFinalizado?: boolean;
  fechaRegistro?: string;
}
