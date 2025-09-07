// src/attendance/infrastructure/adapter/api/factory/AttendanceRouterFactory.ts
import LocalDBC from '../../../../../shared/repository/infrastructure/dbc/local/LocalDBC'
import AttendanceService from '../../../../application/service/AttendanceService'
import AttendanceUseCase from '../../../../application/usecase/AttendanceUseCase'
import AbstractAttendanceRouter from '../../../../domain/api/AbstractAttendanceRouter'
import LocalRepository from '../../repository/LocalRepository'
import AttendanceController from '../controller/AttendanceController'
import AttendanceRouter from '../router/AttendanceRouter'

export default class AttendanceRouterFactory {
  static readonly create = (): AbstractAttendanceRouter => {
    const dbc = LocalDBC.getInstance()
    const repo = new LocalRepository(dbc)
    const service = new AttendanceService(repo)
    const usecase = new AttendanceUseCase(service)
    const controller = new AttendanceController(usecase)
    const router = new AttendanceRouter(controller)
    return router
  }
}
