// Clase AttendanceFilter que sirve para almacenar los parámetros de un filtro para la consulta de asistencias.
export class AttendanceFilter {
  public employeeId: string  // ID del empleado que queremos consultar.
  public startDate: string   // Fecha de inicio del rango de consulta (formato de fecha, ej. '2025-09-01').
  public endDate: string     // Fecha de fin del rango de consulta (formato de fecha, ej. '2025-09-30').

  // Constructor que inicializa los valores del filtro (empleado, fecha de inicio y fecha de fin).
  constructor(employeeId: string, startDate: string, endDate: string) {
    this.employeeId = employeeId   // Asignamos el ID del empleado.
    this.startDate = startDate     // Asignamos la fecha de inicio del filtro.
    this.endDate = endDate         // Asignamos la fecha de fin del filtro.
  }
}
