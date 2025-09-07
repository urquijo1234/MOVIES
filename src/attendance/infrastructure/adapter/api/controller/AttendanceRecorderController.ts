// Importamos las dependencias necesarias para manejar las solicitudes HTTP con Express.
import { Request, Response } from 'express'
// Importamos la clase base AbstractAttendanceController que extiende la funcionalidad del controlador.
import AbstractAttendanceController from '../../../../domain/api/AbstractAttendanceController'
// Importamos la interfaz AttendanceUseCasePort que define los métodos de los casos de uso relacionados con las asistencias.
import AttendanceUseCasePort from '../../../../domain/port/driver/usecase/AttendanceUseCasePort'

// Definimos la clase AttendanceRecorderController que extiende AbstractAttendanceController.
// Este controlador maneja la ruta para registrar una nueva marcación de entrada o salida de un empleado.
export default class AttendanceRecorderController extends AbstractAttendanceController {

  // El constructor inyecta el caso de uso `attendanceUseCase` que maneja la lógica de negocio de las asistencias.
  constructor(private readonly attendanceUseCase: AttendanceUseCasePort) {
    super()
  }

  // Método `create` que maneja la solicitud HTTP para registrar una nueva marcación de asistencia.
  readonly create = async (req: Request, res: Response): Promise<void> => {
    // Extraemos los datos de la solicitud (employeeId y type).
    const { employeeId, type } = req.body

    // Validamos que los campos `employeeId` y `type` estén presentes en el cuerpo de la solicitud.
    if (!employeeId || !type) {
      // Si falta alguno de los campos, respondemos con un error 400 (Bad Request).
      res.status(this.HTTPStatusCode.BAD_REQUEST).json({ error: 'Bad Request' })
      return
    }

    try {
      // Llamamos al caso de uso para registrar la marcación de entrada o salida.
      const attendance = await this.attendanceUseCase.register(employeeId, type)

      // Si la asistencia es inválida (objeto NullAttendance), respondemos con un error 400.
      if (attendance.isNull) {
        res.status(this.HTTPStatusCode.BAD_REQUEST).json({ error: 'Invalid Attendance' })
        return
      }

      // Si la marcación fue exitosa, respondemos con el objeto de asistencia creado con el código 201 (Created).
      res.status(this.HTTPStatusCode.CREATED).json(attendance)
    } catch (error) {
      // Si ocurre un error inesperado, registramos el error en la consola y respondemos con un error 500 (Internal Server Error).
      console.error('Internal Server Error: create', error)
      res.status(this.HTTPStatusCode.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' })
    }
  }
}
