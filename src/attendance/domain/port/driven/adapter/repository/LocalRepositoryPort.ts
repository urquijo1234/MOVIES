// Importamos la interfaz Repository que define los métodos básicos del repositorio.
// También importamos la clase Attendance, que será el tipo de los objetos que se manejen en este repositorio.
import Repository from '../../../../../../shared/repository/domain/interfaces/model/Repository'
import Attendance from '../../../../model/Attendance/Attendance'

// Definimos la interfaz LocalRepositoryPort que extiende la interfaz Repository para la entidad Attendance.
// Esta interfaz será usada por la capa de infraestructura para interactuar con la fuente de datos (como una base de datos local).
export default interface LocalRepositoryPort extends Repository<string, Attendance> {
  
  // Método para obtener un reporte de asistencia para un empleado en un rango de fechas específico.
  // Devuelve una lista de objetos Attendance que representan las marcaciones del empleado durante el periodo consultado.
  // El parámetro employeeId es el ID del empleado, y startDate y endDate son las fechas de inicio y fin del reporte.
  getReport(employeeId: string, startDate: string, endDate: string): Promise<Attendance[]>

  // Método para obtener el turno asignado al empleado.
  // Devuelve un valor que puede ser 'A', 'B' o 'UNKNOWN'. El turno puede ser 'A' o 'B' o si no está asignado, 'UNKNOWN'.
  getEmployeeShiftId(employeeId: string): Promise<'A' | 'B' | 'UNKNOWN'>
}
