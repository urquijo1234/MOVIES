// Importamos el router base AbstractRouter desde el archivo de la API.
// Este router base debe contener la funcionalidad común a todos los routers en el sistema.
import { AbstractRouter } from "../../../api/API";

// Definimos la clase AbstractAttendanceRouter, que extiende de AbstractRouter.
// Este será el router base para manejar las rutas relacionadas con la asistencia.
export default abstract class AbstractAttendanceRouter extends AbstractRouter {}
