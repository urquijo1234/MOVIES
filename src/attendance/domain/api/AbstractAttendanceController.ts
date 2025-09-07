// Importamos el controlador base AbstractController desde el archivo de la API.
// Este controlador base debe contener la funcionalidad común a todos los controladores en el sistema.
import { AbstractController } from "../../../api/API";

// Definimos la clase AbstractAttendanceController, que extiende de AbstractController.
// Este será el controlador base para manejar las solicitudes relacionadas con la asistencia.
export default abstract class AbstractAttendanceController extends AbstractController {}
