// Importamos la clase base AbstractAttendanceRouter que maneja la configuración de rutas.
import AbstractAttendanceRouter from '../../../../domain/api/AbstractAttendanceRouter'
// Importamos el controlador AttendanceController que maneja las solicitudes relacionadas con las asistencias.
import AttendanceController from '../controller/AttendanceController'

// Definimos la clase AttendanceRouter, que extiende AbstractAttendanceRouter para configurar las rutas de la API.
export default class AttendanceRouter extends AbstractAttendanceRouter {
  
  // El constructor recibe el controlador de asistencia (AttendanceController) y lo inyecta.
  // También llama al constructor de la clase base (AbstractAttendanceRouter) con el prefijo de ruta '/api/v1.0'.
  constructor(private readonly attendanceController: AttendanceController) {
    super('/api/v1.0') // Definimos el prefijo de las rutas para esta API.
    this.routes() // Llamamos al método `routes` para configurar las rutas.
  }

  // Método protegido que define las rutas específicas para las operaciones de asistencia.
  protected override routes(): void {
    // Definimos la ruta POST para registrar una nueva marcación de entrada o salida.
    // Llama al método `registerAttendance` del controlador.
    this.router.post('/marcaciones', this.attendanceController.registerAttendance) // RNF-04

    // Definimos la ruta GET para generar un reporte de asistencia de un empleado.
    // Llama al método `generateReport` del controlador.
    this.router.get('/reportes/horario', this.attendanceController.generateReport) // RNF-05
  }
}
