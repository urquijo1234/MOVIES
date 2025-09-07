import Attendance from './Attendance'

// La clase NullAttendance extiende la clase Attendance y representa un objeto de asistencia "vacío" o no encontrado.
export default class NullAttendance extends Attendance {
  constructor() {
    // Se pasa un objeto con valores "no encontrados" o vacíos, simulando una asistencia nula.
    super({
      id: 'not-found', // ID no encontrado
      employeeId: 'not-found', // ID de empleado no encontrado
      timestamp: 'not-found', // Timestamp no encontrado
      type: 'EXIT' // Tipo de evento por defecto, pero puede cambiar según el comportamiento
    })
    this.isNull = true // Marcamos que este objeto es nulo
  }

  // Sobrescribimos los métodos de la clase padre para evitar modificaciones en un objeto NullAttendance
  setTimestamp = (_timestamp: string): void => {
    throw new Error('Cannot set timestamp on a NullAttendance') // Lanzamos un error si intentan modificar el timestamp
  }

  setType = (_type: 'ENTRANCE' | 'EXIT'): void => {
    throw new Error('Cannot set type on a NullAttendance') // Lanzamos un error si intentan modificar el tipo
  }
}
