// Importamos las dependencias necesarias para manejar las solicitudes HTTP con Express.
import { Request, Response } from 'express'
// Importamos el controlador base AbstractAttendanceController para extenderlo.
import AbstractAttendanceController from '../../../../domain/api/AbstractAttendanceController'
// Importamos la interfaz AttendanceUseCasePort que define los casos de uso de la asistencia.
import AttendanceUseCasePort from '../../../../domain/port/driver/usecase/AttendanceUseCasePort'
// Importamos la clase AttendanceFilter que se utiliza para filtrar los reportes de asistencia.
import { AttendanceFilter } from '../../../../domain/api/AttendanceFilter'
// Importamos ReportCalculator para generar los reportes de asistencia.
import ReportCalculator from '../../../../application/service/ReportCalculator'

// Función para convertir el tipo de evento de dominio ('ENTRANCE'/'EXIT') a su equivalente en español ('ENTRADA'/'SALIDA').
const toSpanishTipo = (domainType: 'ENTRANCE' | 'EXIT'): 'ENTRADA' | 'SALIDA' =>
  domainType === 'ENTRANCE' ? 'ENTRADA' : 'SALIDA'

// Función para obtener la fecha y hora actual en formato ISO UTC.
const nowIsoUtc = (): string => new Date().toISOString()

// Función para convertir una fecha ISO a su formato 'yyyy-mm-dd'.
const isoToDate = (iso: string): string => iso.slice(0, 10)

// Definimos la clase AttendanceController que extiende AbstractAttendanceController.
// Este controlador maneja las rutas relacionadas con las asistencias de los empleados.
export default class AttendanceController extends AbstractAttendanceController {
  
  // Constructor que inyecta el caso de uso (attendanceUseCase) para interactuar con la lógica de negocio de las asistencias.
  constructor(private readonly attendanceUseCase: AttendanceUseCasePort) {
    super()
  }

  // Método para registrar una nueva marcación de entrada o salida.
  // Este es el endpoint para registrar una nueva marcación para un empleado.
  // RNF-04
  readonly registerAttendance = async (req: Request, res: Response): Promise<void> => {
    try {
      // Obtenemos el ID del empleado desde el cuerpo de la solicitud.
      const { idEmpleado } = req.body as { idEmpleado?: string }

      // Si no se proporciona un ID de empleado, retornamos un error 400 (Bad Request).
      if (!idEmpleado) {
        res.status(this.HTTPStatusCode.BAD_REQUEST).json({ error: 'Bad Request: idEmpleado requerido' })
        return
      }

      // Determinamos el tipo de evento para la marcación según la última marcación del día.
      const now = nowIsoUtc() // Obtenemos la fecha y hora actuales.
      const today = isoToDate(now) // Extraemos la fecha sin la hora.
      const filterHoy = new AttendanceFilter(idEmpleado, today, today) // Creamos un filtro para el día de hoy.
      
      // Obtenemos las marcaciones de hoy para el empleado.
      const todayRecords = await this.attendanceUseCase.generateReport(idEmpleado, filterHoy)
      const last = todayRecords.length > 0 ? todayRecords[todayRecords.length - 1] : undefined
      // Si no hay registros previos, el tipo será 'ENTRANCE'. Si el último registro fue 'ENTRANCE', el siguiente será 'EXIT', y viceversa.
      const nextType: 'ENTRANCE' | 'EXIT' = !last ? 'ENTRANCE' : (last.getType() === 'ENTRANCE' ? 'EXIT' : 'ENTRANCE')

      // Registramos la nueva marcación llamando al caso de uso.
      const created = await this.attendanceUseCase.register(idEmpleado, nextType)

      // Retornamos la marcación registrada con el código de estado 201 (Created).
      res.status(this.HTTPStatusCode.CREATED).json({
        idMarcacion: created.getId(),
        idEmpleado: created.getEmployeeId(),
        timestamp: created.getTimestamp(),
        tipo: toSpanishTipo(created.getType()) // Convertimos el tipo a español.
      })
    } catch (error) {
      // En caso de error, registramos el error y respondemos con un código 500 (Internal Server Error).
      console.error('Internal Server Error: registerAttendance', error)
      res.status(this.HTTPStatusCode.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' })
    }
  }

  // Método para generar un reporte de asistencia para un empleado dentro de un rango de fechas.
  // Este es el endpoint para generar un reporte de asistencia de un empleado.
  // RNF-05
  readonly generateReport = async (req: Request, res: Response): Promise<void> => {
    try {
      // Obtenemos los parámetros necesarios de la solicitud (empleadoId, fechaInicio y fechaFin).
      const { empleadoId, fechaInicio, fechaFin } = req.query as {
        empleadoId?: string, fechaInicio?: string, fechaFin?: string
      }

      // Si faltan parámetros, retornamos un error 400 (Bad Request).
      if (!empleadoId || !fechaInicio || !fechaFin) {
        res.status(this.HTTPStatusCode.BAD_REQUEST).json({ error: 'Bad Request: faltan parámetros' })
        return
      }

      // Creamos un filtro de asistencia con los parámetros proporcionados.
      const filter = new AttendanceFilter(empleadoId, fechaInicio, fechaFin)
      // Obtenemos los registros de asistencia utilizando el caso de uso.
      const records = await this.attendanceUseCase.generateReport(empleadoId, filter)
      // Obtenemos el turno del empleado.
      const shiftId = await this.attendanceUseCase.getEmployeeShiftId(empleadoId)

      // Calculamos el reporte detallado utilizando la clase ReportCalculator.
      const payload = ReportCalculator.buildReport(empleadoId, fechaInicio, fechaFin, shiftId, records)

      // Retornamos el reporte con un código de estado 200 (OK).
      res.status(this.HTTPStatusCode.OK).json(payload)
    } catch (error) {
      // En caso de error, registramos el error y respondemos con un código 500 (Internal Server Error).
      console.error('Internal Server Error: generateReport', error)
      res.status(this.HTTPStatusCode.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' })
    }
  }
}
