// src/attendance/application/service/ReportCalculator.ts
import Attendance from '../../domain/model/Attendance/Attendance'

// Definimos los tipos para los valores de tipo de marcación en español y en el dominio.
// 'SpanishTipo' se utiliza para los valores en español ('ENTRADA' y 'SALIDA').
// 'DomainType' se utiliza para los valores en el dominio ('ENTRANCE' y 'EXIT').
type SpanishTipo = 'ENTRADA' | 'SALIDA'
type DomainType = 'ENTRANCE' | 'EXIT'

// Definimos el tipo 'ReportJSON', que describe la estructura del reporte final que será generado.
// Este reporte incluirá detalles como el ID del empleado, el rango de consulta, resumen de tardanza e inactividad, y detalles por día.
export type ReportJSON = {
  empleadoId: string,
  rangoConsulta: { inicio: string, fin: string },
  resumen: { totalMinutosTardanza: number, totalMinutosInactividad: number },
  detallePorDia: {
    fecha: string,
    turnoAsignado: 'Turno A' | 'Turno B' | 'Desconocido',
    minutosTardanzaDia: number,
    minutosInactividadDia: number,
    marcaciones: { timestamp: string, tipo: SpanishTipo }[]
  }[]
}

// Función para convertir el tipo de marcación del dominio ('ENTRANCE'/'EXIT') a su equivalente en español ('ENTRADA'/'SALIDA').
const toSpanishTipo = (domainType: DomainType): SpanishTipo => domainType === 'ENTRANCE' ? 'ENTRADA' : 'SALIDA'

// Función para asegurarse de que un número tenga al menos dos dígitos (por ejemplo, 5 se convierte en '05').
const pad2 = (n: number) => String(n).padStart(2, '0')

// Función que convierte una fecha en formato ISO (yyyy-mm-dd) a una cadena en formato 'yyyy-mm-dd'.
const isoDate = (d: Date): string => {
  const yyyy = d.getUTCFullYear()
  const mm = pad2(d.getUTCMonth() + 1) // Meses en JavaScript son de 0 a 11, por lo que sumamos 1.
  const dd = pad2(d.getUTCDate())
  return `${yyyy}-${mm}-${dd}`
}

// Función para combinar un día y una hora en un objeto Date (por ejemplo, '2025-09-01T06:00:00Z').
const combineDayTime = (day: string, time: string): Date => new Date(`${day}T${time}Z`)

// Función para calcular la diferencia en minutos entre dos objetos Date.
const minutesBetween = (a: Date, b: Date): number => Math.max(0, Math.floor((b.getTime() - a.getTime()) / 60000))

// Función para obtener los bloques de turno (horarios de trabajo) para un día específico según el turno asignado ('A' o 'B').
const getShiftBlocksForDay = (shiftId: 'A' | 'B' | 'UNKNOWN', day: string): { start: Date, end: Date }[] => {
  // Si el turno es A, los bloques de trabajo serán de 06:00-10:00 y 11:00-15:00.
  if (shiftId === 'A') {
    return [
      { start: combineDayTime(day, '06:00:00'), end: combineDayTime(day, '10:00:00') },
      { start: combineDayTime(day, '11:00:00'), end: combineDayTime(day, '15:00:00') },
    ]
  }
  // Si el turno es B, los bloques de trabajo serán de 15:00-19:00 y 20:00-00:00.
  if (shiftId === 'B') {
    return [
      { start: combineDayTime(day, '15:00:00'), end: combineDayTime(day, '19:00:00') },
      { start: combineDayTime(day, '20:00:00'), end: new Date(`${day}T23:59:59Z`) },
    ]
  }
  // Si el turno es desconocido, no hay bloques de trabajo.
  return []
}

// Función para obtener el nombre del turno en español según el turno asignado ('A', 'B' o 'UNKNOWN').
const shiftName = (shiftId: 'A' | 'B' | 'UNKNOWN'): 'Turno A' | 'Turno B' | 'Desconocido' => {
  if (shiftId === 'A') return 'Turno A'
  if (shiftId === 'B') return 'Turno B'
  return 'Desconocido'
}

// Función para generar un arreglo con todas las fechas entre un rango de fechas (inicio y fin).
const enumerateDays = (start: string, end: string): string[] => {
  const days: string[] = []
  const from = new Date(`${start}T00:00:00Z`)
  const to = new Date(`${end}T00:00:00Z`)
  for (let d = new Date(from.getTime()); d.getTime() <= to.getTime(); d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(isoDate(d)) // Añadimos la fecha al arreglo en formato ISO.
  }
  return days
}

// Definimos la clase ReportCalculator, que se encargará de calcular los reportes de asistencia.
export default class ReportCalculator {
  // Método estático para construir el reporte de asistencia de un empleado dentro de un rango de fechas.
  static buildReport(
    empleadoId: string,  // ID del empleado
    fechaInicio: string, // Fecha de inicio del reporte
    fechaFin: string,    // Fecha de fin del reporte
    shiftId: 'A' | 'B' | 'UNKNOWN', // Turno asignado al empleado
    records: Attendance[] // Lista de registros de asistencia (entradas y salidas)
  ): ReportJSON {
    // Ordenamos los registros por la fecha de marcación.
    const ordered = [...records].sort((a, b) => a.getTimestamp().localeCompare(b.getTimestamp()))
    const byDay: Record<string, Attendance[]> = {}

    // Agrupamos los registros por día.
    for (const r of ordered) {
      const day = r.getTimestamp().slice(0, 10) // Obtenemos la fecha (sin hora) del registro.
      if (!byDay[day]) byDay[day] = []
      byDay[day].push(r)
    }

    // Inicializamos los totales de tardanza e inactividad.
    let totalMinutosTardanza = 0
    let totalMinutosInactividad = 0
    const detallePorDia: ReportJSON['detallePorDia'] = []

    // Iteramos sobre todos los días en el rango de fechas.
    for (const day of enumerateDays(fechaInicio, fechaFin)) {
      const dayRecords = byDay[day] ?? [] // Obtenemos los registros de asistencia para el día actual.
      const blocks = getShiftBlocksForDay(shiftId, day) // Obtenemos los bloques de turno para el día.

      // Inicializamos las variables para tardanza e inactividad del día.
      let tardanzaDia = 0
      let inactividadDia = 0

      // Mapeamos los registros de asistencia a un formato adecuado para el reporte.
      const marcaciones = dayRecords.map((r) => ({
        timestamp: r.getTimestamp(),
        tipo: toSpanishTipo(r.getType()) // Convertimos el tipo de evento a español.
      }))

      // Calculamos la tardanza e inactividad para cada bloque de turno.
      for (const { start, end } of blocks) {
        const eventsInBlock = dayRecords.filter((r) => {
          const t = new Date(r.getTimestamp())
          return t.getTime() >= start.getTime() && t.getTime() <= end.getTime() // Filtramos los eventos dentro del bloque.
        }).sort((a, b) => a.getTimestamp().localeCompare(b.getTimestamp()))

        // Calculamos la tardanza si la primera entrada se realiza después del inicio del bloque.
        const firstEntrance = eventsInBlock.find((e) => e.getType() === 'ENTRANCE')
        if (firstEntrance) {
          const entranceTime = new Date(firstEntrance.getTimestamp())
          if (entranceTime.getTime() > start.getTime()) {
            tardanzaDia += minutesBetween(start, entranceTime) // Sumamos los minutos de tardanza.
          }
        }

        let lastSalida: Date | null = null
        // Calculamos el tiempo de inactividad entre entradas y salidas.
        for (const e of eventsInBlock) {
          const t = new Date(e.getTimestamp())
          if (e.getType() === 'EXIT') {
            lastSalida = t
          } else if (e.getType() === 'ENTRANCE' && lastSalida) {
            if (t.getTime() <= end.getTime() && lastSalida.getTime() >= start.getTime()) {
              inactividadDia += minutesBetween(lastSalida, t) // Sumamos los minutos de inactividad.
            }
            lastSalida = null
          }
        }
      }

      // Sumamos los totales de tardanza e inactividad.
      totalMinutosTardanza += tardanzaDia
      totalMinutosInactividad += inactividadDia

      // Añadimos los detalles del día al reporte.
      detallePorDia.push({
        fecha: day,
        turnoAsignado: shiftName(shiftId), // Asignamos el nombre del turno en español.
        minutosTardanzaDia: tardanzaDia,
        minutosInactividadDia: inactividadDia,
        marcaciones
      })
    }

    // Retornamos el reporte completo.
    return {
      empleadoId,
      rangoConsulta: { inicio: fechaInicio, fin: fechaFin },
      resumen: {
        totalMinutosTardanza,
        totalMinutosInactividad
      },
      detallePorDia
    }
  }
}
