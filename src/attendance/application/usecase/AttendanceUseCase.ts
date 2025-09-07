// Importamos las interfaces y clases necesarias para implementar la lógica de casos de uso.
import AttendanceServicePort from '../../domain/port/driver/service/AttendanceServicePort' // Interfaz para los servicios de asistencia.
import AttendanceUseCasePort from '../../domain/port/driver/usecase/AttendanceUseCasePort' // Interfaz que define los casos de uso de asistencia.
import { AttendanceFilter } from '../../domain/api/AttendanceFilter' // Filtro para los reportes de asistencia.
import Attendance from '../../domain/model/Attendance/Attendance' // Clase que representa una marcación de asistencia.
import NullAttendance from '../../domain/model/Attendance/NullAttendance' // Clase para manejar los casos de asistencia nula (vacía).

// Definimos la clase AttendanceUseCase, que implementa los métodos definidos en AttendanceUseCasePort.
// Esta clase se encarga de manejar la lógica de negocio relacionada con las asistencias de los empleados.
export default class AttendanceUseCase implements AttendanceUseCasePort {

  // Inyectamos el servicio de asistencia (AttendanceServicePort) en el constructor.
  constructor(private readonly attendanceService: AttendanceServicePort) {}

  // Método para registrar una nueva marcación de entrada o salida para un empleado.
  // Si ocurre un error (por ejemplo, si el servicio de asistencia falla), se devuelve un objeto NullAttendance.
  readonly register = async (employeeId: string, type: 'ENTRANCE' | 'EXIT'): Promise<Attendance> => {
    try {
      // Intentamos registrar la marcación llamando al servicio de asistencia.
      return await this.attendanceService.registerAttendance(employeeId, type)
    } catch {
      // Si ocurre un error, retornamos un objeto NullAttendance para indicar que la operación falló.
      return new NullAttendance()
    }
  }

  // Método para generar un reporte de las asistencias de un empleado dentro de un rango de fechas.
  // Si ocurre un error, se devuelve un arreglo con un objeto NullAttendance.
  readonly generateReport = async (employeeId: string, filter: AttendanceFilter): Promise<Attendance[]> => {
    try {
      // Intentamos generar el reporte llamando al servicio de asistencia.
      return await this.attendanceService.generateReport(employeeId, { startDate: filter.startDate, endDate: filter.endDate })
    } catch {
      // Si ocurre un error, retornamos un arreglo con un objeto NullAttendance para indicar que la operación falló.
      return [new NullAttendance()]
    }
  }

  // Método para obtener el turno asignado a un empleado.
  // Si ocurre un error, se devuelve 'UNKNOWN' para indicar que el turno no está disponible.
  readonly getEmployeeShiftId = async (employeeId: string): Promise<'A' | 'B' | 'UNKNOWN'> => {
    try {
      // Intentamos obtener el turno llamando al servicio de asistencia.
      return await this.attendanceService.getEmployeeShiftId(employeeId)
    } catch {
      // Si ocurre un error, retornamos 'UNKNOWN' para indicar que el turno no se pudo obtener.
      return 'UNKNOWN'
    }
  }
}
