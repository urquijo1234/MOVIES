// Importamos la interfaz AttendanceServicePort que define los métodos del servicio de asistencia.
import AttendanceServicePort from '../../domain/port/driver/service/AttendanceServicePort'
// Importamos la clase Attendance que representa una entrada o salida registrada de un empleado.
import Attendance from '../../domain/model/Attendance/Attendance'
// Importamos la interfaz LocalRepositoryPort que define los métodos del repositorio local donde se almacenan los datos.
import LocalRepositoryPort from '../../domain/port/driven/adapter/repository/LocalRepositoryPort'

// Definimos la clase AttendanceService, que implementa los métodos definidos en AttendanceServicePort.
// Esta clase se encarga de la lógica de negocio relacionada con las asistencias de los empleados.
export default class AttendanceService implements AttendanceServicePort {

  // Inyectamos el repositorio local en el constructor. El repositorio se utilizará para interactuar con la base de datos.
  constructor(private readonly localRepository: LocalRepositoryPort) {}

  // Método privado que genera un identificador único para cada marcación (usando el formato UUID versión 4).
  private uuid(): string {
    // RFC4122 v4-like (sin bibliotecas externas)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0 // Generamos un número aleatorio entre 0 y 15.
      const v = c === 'x' ? r : (r & 0x3 | 0x8) // Si es una 'x', reemplazamos con un valor aleatorio. Si es una 'y', reemplazamos con un valor específico.
      return v.toString(16) // Convertimos el valor a una cadena hexadecimal.
    })
  }

  // Método para registrar una nueva marcación de entrada o salida.
  // Recibe el ID del empleado y el tipo de evento ('ENTRANCE' o 'EXIT') y retorna una promesa con la asistencia registrada.
  readonly registerAttendance = async (employeeId: string, type: 'ENTRANCE' | 'EXIT'): Promise<Attendance> => {
    // Creamos una nueva instancia de Attendance con un nuevo ID (UUID), el ID del empleado, el timestamp actual y el tipo de evento.
    const attendance = new Attendance({
      id: this.uuid(),                   // Generamos un ID único para la marcación.
      employeeId,                         // Usamos el ID del empleado proporcionado.
      timestamp: new Date().toISOString(), // Usamos la fecha y hora actual en formato ISO 8601.
      type                                // Usamos el tipo de evento ('ENTRANCE' o 'EXIT').
    })
    // Guardamos la nueva asistencia en el repositorio local.
    return this.localRepository.save(attendance)
  }

  // Método para generar un reporte de las asistencias de un empleado en un rango de fechas.
  // Recibe el ID del empleado y un filtro con las fechas de inicio y fin, y retorna un arreglo de asistencias.
  readonly generateReport = async (employeeId: string, filter: { startDate: string; endDate: string }): Promise<Attendance[]> => {
    // Llamamos al método getReport del repositorio local, que devolverá las asistencias en el rango solicitado.
    return this.localRepository.getReport(employeeId, filter.startDate, filter.endDate)
  }

  // Método para obtener el turno asignado a un empleado.
  // Recibe el ID del empleado y retorna el turno ('A', 'B' o 'UNKNOWN') del empleado.
  readonly getEmployeeShiftId = async (employeeId: string): Promise<'A' | 'B' | 'UNKNOWN'> => {
    // Llamamos al método getEmployeeShiftId del repositorio local para obtener el turno del empleado.
    return this.localRepository.getEmployeeShiftId(employeeId)
  }
}
