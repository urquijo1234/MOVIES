// Se importa la interfaz NullObject, que parece ser utilizada para marcar objetos "vacíos" o no válidos.
// Este patrón es útil cuando quieres manejar de manera especial objetos que no tienen valor.
import NullObject from "../../../../shared/base/domain/interfaces/NullObject"

// Definimos la clase Attendance, que representa una marcación de entrada o salida de un empleado.
export default class Attendance implements NullObject {
  // Atributos privados que representan la información de una marcación de asistencia.
  private id: string                // ID único de la asistencia.
  private employeeId: string        // ID del empleado que registra la entrada o salida.
  private timestamp: string         // Fecha y hora exacta de la marcación (entrada o salida).
  private type: 'ENTRANCE' | 'EXIT' // Tipo de evento: si es una entrada ('ENTRANCE') o salida ('EXIT').

  // La propiedad `isNull` indica si el objeto es "nulo" o vacío (parte del patrón Null Object).
  isNull: boolean = false

  // Constructor que recibe un objeto que cumple con la interfaz `AttendanceInterface` y asigna sus valores a los atributos.
  constructor(attendance: AttendanceInterface) {
    this.id = attendance.id               // Asignamos el ID de la asistencia.
    this.employeeId = attendance.employeeId // Asignamos el ID del empleado.
    this.timestamp = attendance.timestamp  // Asignamos la fecha y hora del evento.
    this.type = attendance.type            // Asignamos el tipo de evento (entrada o salida).
  }

  // Métodos getter para acceder a los atributos privados de la clase.

  // Método que retorna el ID de la asistencia.
  getId = (): string => this.id

  // Método que retorna el ID del empleado.
  getEmployeeId = (): string => this.employeeId

  // Método que retorna el timestamp de la asistencia (fecha y hora).
  getTimestamp = (): string => this.timestamp

  // Método que retorna el tipo de evento (ENTRANCE o EXIT).
  getType = (): 'ENTRANCE' | 'EXIT' => this.type
}

// Definimos la interfaz `AttendanceInterface`, que establece la estructura de los objetos de asistencia.
export interface AttendanceInterface {
  id: string                // ID único de la asistencia.
  employeeId: string        // ID del empleado.
  timestamp: string         // Fecha y hora exacta de la entrada o salida.
  type: 'ENTRANCE' | 'EXIT' // Tipo de evento: 'ENTRANCE' o 'EXIT'.
}
