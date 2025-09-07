// src/movies.ts
import ServerFactory from './api/infrastructure/adapter/api/factory/ServerFactory'
import MovieRouterFactory from './movie/infrastructure/adapter/api/factory/MovieRouterFactory'
import AttendanceRouterFactory from './attendance/infrastructure/adapter/api/factory/AttendanceRouterFactory'

// Crear routers de cada módulo
const movieRouter = MovieRouterFactory.create()
const attendanceRouter = AttendanceRouterFactory.create()

// Crear el server con ambos routers montados
const server = ServerFactory.create([movieRouter, attendanceRouter])

server.start()