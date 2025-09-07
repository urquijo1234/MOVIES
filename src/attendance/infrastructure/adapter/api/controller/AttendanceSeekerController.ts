// Importamos las dependencias necesarias para manejar las solicitudes HTTP con Express.
import { Request, Response } from 'express'
// Importamos la clase base AbstractAttendanceController para extenderla y agregar la funcionalidad específica.
import AbstractAttendanceController from '../../../../domain/api/AbstractAttendanceController'
// Importamos la interfaz AttendanceUseCasePort que define los métodos de los casos de uso relacionados con las asistencias.
import AttendanceUseCasePort from '../../../../domain/port/driver/usecase/AttendanceUseCasePort'
// Importamos la clase AttendanceFilter, que se utiliza para filtrar los reportes de asistencia.
import { AttendanceFilter } from '../../../../domain/api/AttendanceFilter'

// Definimos la clase AttendanceSeekerController que extiende AbstractAttendanceController.
// Este controlador maneja la solicitud para buscar el reporte de asistencia de un empleado.
export default class AttendanceSeekerController extends AbstractAttendanceController {

  // El constructor inyecta el caso de uso `attendanceUseCase`, que maneja la lógica de negocio para las asistencias.
  constructor(private readonly attendanceUseCase: AttendanceUseCasePort) {
    super()
  }

  // Método `search` que maneja la solicitud HTTP para buscar el reporte de asistencia de un empleado.
  readonly search = async (req: Request, res: Response): Promise<void> => {
    // Extraemos los parámetros necesarios de la consulta (employeeId, startDate y endDate).
    const { employeeId, startDate, endDate } = req.query

    // Validamos que todos los parámetros requeridos estén presentes en la solicitud.
    if (!employeeId || !startDate || !endDate) {
      // Si falta algún parámetro, respondemos con un error 400 (Bad Request).
      res.status(this.HTTPStatusCode.BAD_REQUEST).json({ error: 'Bad Request' })
      return
    }

    // Creamos un filtro de asistencia con los parámetros proporcionados.
    const filter = new AttendanceFilter(employeeId as string, startDate as string, endDate as string)

    try {
      // Llamamos al caso de uso para generar el reporte de asistencia utilizando el filtro.
      const report = await this.attendanceUseCase.generateReport(employeeId as string, filter)

      // Si la operación es exitosa, respondemos con el reporte generado y un código de estado 200 (OK).
      res.status(this.HTTPStatusCode.OK).json(report)
    } catch (error) {
      // En caso de error inesperado, lo registramos en la consola y respondemos con un código 500 (Internal Server Error).
      console.error('Internal Server Error: search', error)
      res.status(this.HTTPStatusCode.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' })
    }
  }
}
