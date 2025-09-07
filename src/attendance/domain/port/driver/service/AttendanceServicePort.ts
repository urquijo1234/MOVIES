// Importamos la clase Attendance que se utilizará como el tipo de retorno para las operaciones relacionadas con las asistencias.
import Attendance from "../../../model/Attendance/Attendance";

// Definimos la interfaz AttendanceServicePort que establece los métodos del servicio de asistencia que se deben implementar.
export default interface AttendanceServicePort {
  
  // Método para registrar una nueva marcación (entrada o salida) para un empleado.
  // Recibe el ID del empleado y el tipo de evento (ENTRANCE o EXIT), y retorna una promesa con el objeto Attendance creado.
  registerAttendance(employeeId: string, type: 'ENTRANCE' | 'EXIT'): Promise<Attendance>;

  // Método para generar un reporte de asistencia para un empleado dentro de un rango de fechas específico.
  // Recibe el ID del empleado y un filtro que contiene las fechas de inicio y fin del reporte, y retorna una promesa con un arreglo de objetos Attendance.
  generateReport(employeeId: string, filter: { startDate: string; endDate: string }): Promise<Attendance[]>;

  // Método para obtener el turno asignado a un empleado.
  // Devuelve un valor que puede ser 'A', 'B' o 'UNKNOWN', dependiendo del turno asignado al empleado.
  getEmployeeShiftId(employeeId: string): Promise<'A' | 'B' | 'UNKNOWN'>
}
