// Importamos la clase Attendance, que será el tipo de retorno para el registro de asistencias.
import Attendance from "../model/Attendance/Attendance"

// Definimos la interfaz AttendanceServiceInterface, que establece los métodos que cualquier servicio de asistencia debe implementar.
export default interface AttendanceServiceInterface {
  
  // Método para registrar una nueva marcación.
  // Recibe el ID del empleado y el tipo de evento (entrada o salida), y retorna una promesa con un objeto Attendance.
  // Este método debe ser implementado para registrar la entrada o salida de un empleado en el sistema.
  registerAttendance(employeeId: string, type: 'ENTRANCE' | 'EXIT'): Promise<Attendance>

  // Método para generar un reporte de asistencia.
  // Recibe el ID del empleado y un rango de fechas (startDate y endDate), y retorna una promesa con el reporte generado.
  // Este método debe ser implementado para generar un informe de las asistencias de un empleado durante el período solicitado.
  generateReport(employeeId: string, startDate: string, endDate: string): Promise<any>
}
