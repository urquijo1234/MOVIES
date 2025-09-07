// Importamos el filtro de asistencia y la clase Attendance que se utilizarán en los métodos de la interfaz.
import { AttendanceFilter } from "../../../api/AttendanceFilter";
import Attendance from "../../../model/Attendance/Attendance";

// Definimos la interfaz AttendanceUseCasePort que establece los métodos para interactuar con los casos de uso relacionados con las asistencias.
export default interface AttendanceUseCasePort {
  
  // Método para registrar una nueva marcación de entrada o salida para un empleado.
  // Recibe el ID del empleado y el tipo de evento ('ENTRANCE' o 'EXIT').
  // Retorna una promesa con un objeto Attendance que representa la marcación registrada.
  register: (employeeId: string, type: 'ENTRANCE' | 'EXIT') => Promise<Attendance>;

  // Método para generar un reporte de asistencias para un empleado dentro de un rango de fechas específico.
  // Recibe el ID del empleado y un filtro que contiene las fechas de inicio y fin del reporte.
  // Retorna una promesa con un arreglo de objetos Attendance, que representan las marcaciones del empleado.
  generateReport: (employeeId: string, filter: AttendanceFilter) => Promise<Attendance[]>;

  // Método para obtener el turno asignado a un empleado.
  // Retorna una promesa con uno de los valores posibles: 'A', 'B', o 'UNKNOWN'.
  getEmployeeShiftId: (employeeId: string) => Promise<'A' | 'B' | 'UNKNOWN'>
}
