// Importamos las interfaces y clases necesarias.
import LocalRepositoryPort from '../../../domain/port/driven/adapter/repository/LocalRepositoryPort' // Interfaz del repositorio.
import Attendance from '../../../domain/model/Attendance/Attendance' // Modelo de asistencia.
import LocalDBC from '../../../../shared/repository/infrastructure/dbc/local/LocalDBC' // Conexión con la base de datos local.

// Definimos los tipos 'DomainType' y 'DBType' que mapean entre el dominio de la aplicación y la base de datos.
// 'DomainType' se utiliza para los valores de tipo de marcación en el dominio de la aplicación ('ENTRANCE'/'EXIT').
// 'DBType' se utiliza para los valores en la base de datos ('ENTRADA'/'SALIDA').
type DomainType = 'ENTRANCE' | 'EXIT'   // Dominio
type DBType = 'ENTRADA' | 'SALIDA'      // BD (RNF)

// Tipo 'Row' que define el formato de una fila de datos de la base de datos (como un objeto con claves y valores de tipo string).
type Row = Record<string, string>

// Definimos la clase LocalRepository que implementa LocalRepositoryPort.
// Esta clase interactúa con la base de datos local para realizar las operaciones CRUD de asistencia.
export default class LocalRepository implements LocalRepositoryPort {
  private readonly db: LocalDBC // Instancia de LocalDBC, que se utilizará para interactuar con la base de datos local.

  // Constructor que recibe una instancia de LocalDBC y la asigna al atributo 'db'.
  constructor(db: LocalDBC) {
    this.db = db
  }

  // Método para obtener todas las marcaciones de la base de datos.
  // Retorna una lista de objetos 'Attendance'.
  async findAll(): Promise<Attendance[]> {
    const rows = await this.db.query(
      `SELECT id, employee_id, ts_utc, type
         FROM attendances
        ORDER BY ts_utc ASC`
    )
    // Mapeamos las filas obtenidas a instancias de 'Attendance'.
    return rows.map((r) => this.rowToAttendance(r as Row))
  }

  // Método para obtener una marcación por su ID.
  // Retorna la asistencia correspondiente al ID o una "asistencia nula" si no se encuentra.
  async findById(id: string): Promise<Attendance> {
    const rows = await this.db.query(
      `SELECT id, employee_id, ts_utc, type
         FROM attendances
        WHERE id = ? LIMIT 1`,
      [id]
    )
    // Si no se encuentra la marcación, retornamos un objeto de asistencia nulo.
    if (!rows || rows.length === 0) {
      return new Attendance({
        id: 'not-found',
        employeeId: 'not-found',
        timestamp: '1970-01-01T00:00:00Z',
        type: 'ENTRANCE',
      })
    }
    // Si se encuentra, mapeamos la fila a un objeto de tipo 'Attendance'.
    return this.rowToAttendance(rows[0] as Row)
  }

  // Método para guardar una nueva marcación en la base de datos.
  // Recibe un objeto de tipo 'Attendance' y lo guarda en la base de datos.
  async save(item: Attendance): Promise<Attendance> {
    const dbType = this.dbTypeFromDomain(item.getType()) // Convertimos el tipo del dominio a tipo de base de datos.
    const tsUtc = this.toMySQLDateTime(item.getTimestamp()) // Convertimos el timestamp a formato MySQL.
    await this.db.execute(
      `INSERT INTO attendances (id, employee_id, ts_utc, type)
       VALUES (?, ?, ?, ?)`,
      [item.getId(), item.getEmployeeId(), tsUtc, dbType]
    )
    // Retornamos el objeto 'Attendance' después de haber sido guardado.
    return item
  }

  // Método para actualizar una marcación existente en la base de datos.
  // Recibe un objeto 'Attendance' y actualiza sus datos en la base de datos.
  async update(item: Attendance): Promise<Attendance> {
    const dbType = this.dbTypeFromDomain(item.getType()) // Convertimos el tipo del dominio a tipo de base de datos.
    const tsUtc = this.toMySQLDateTime(item.getTimestamp()) // Convertimos el timestamp a formato MySQL.
    await this.db.execute(
      `UPDATE attendances
          SET employee_id = ?, ts_utc = ?, type = ?
        WHERE id = ?`,
      [item.getEmployeeId(), tsUtc, dbType, item.getId()]
    )
    // Retornamos el objeto 'Attendance' después de haber sido actualizado.
    return item
  }

  // Método para realizar una actualización parcial de una marcación.
  // Recibe un ID y un objeto 'Partial<Attendance>' con los datos a actualizar.
  async patch(id: string, partial: Partial<Attendance>): Promise<Attendance> {
    const sets: string[] = [] // Arreglo que almacenará las partes de la consulta SET.
    const vals: unknown[] = [] // Arreglo que almacenará los valores de la consulta.

    const anyP = partial as any // Convertimos el objeto parcial a un tipo 'any' para acceder dinámicamente a las propiedades.
    if (anyP && typeof anyP.employeeId === 'string') {
      sets.push('employee_id = ?'); vals.push(anyP.employeeId)
    }
    if (anyP && typeof anyP.timestamp === 'string') {
      sets.push('ts_utc = ?'); vals.push(this.toMySQLDateTime(anyP.timestamp))
    }
    if (anyP && typeof anyP.type === 'string') {
      sets.push('type = ?'); vals.push(this.dbTypeFromDomain(anyP.type))
    }

    // Si hay campos a actualizar, construimos la consulta SQL y ejecutamos la actualización.
    if (sets.length > 0) {
      vals.push(id)
      const sql = `UPDATE attendances SET ${sets.join(', ')} WHERE id = ?`
      await this.db.execute(sql, vals)
    }
    // Retornamos la marcación actualizada.
    return this.findById(id)
  }

  // Método para eliminar una marcación por su ID.
  // Retorna un valor booleano que indica si la eliminación fue exitosa.
  async delete(id: string): Promise<boolean> {
    await this.db.execute(`DELETE FROM attendances WHERE id = ?`, [id])
    // Verificamos si la marcación fue eliminada.
    const again = await this.db.query(`SELECT id FROM attendances WHERE id = ?`, [id])
    return !again || again.length === 0
  }

  // --------- Métodos Específicos ---------

  // Método para obtener un reporte de asistencias de un empleado en un rango de fechas.
  async getReport(employeeId: string, startDate: string, endDate: string): Promise<Attendance[]> {
    const start = this.toMySQLDateTime(startDate) // Convertimos la fecha de inicio a formato MySQL.
    const end = this.toMySQLDateTime(endDate, true) // Convertimos la fecha de fin a formato MySQL.
    // Ejecutamos la consulta para obtener las marcaciones en el rango de fechas.
    const rows = await this.db.query(
      `SELECT id, employee_id, ts_utc, type
         FROM attendances
        WHERE employee_id = ?
          AND ts_utc BETWEEN ? AND ?
        ORDER BY ts_utc ASC`,
      [employeeId, start, end]
    )
    // Mapeamos las filas obtenidas a instancias de 'Attendance'.
    return (rows ?? []).map((r) => this.rowToAttendance(r as Row))
  }

  // Método para obtener el turno asignado a un empleado.
  // Retorna el turno ('A', 'B' o 'UNKNOWN') del empleado.
  async getEmployeeShiftId(employeeId: string): Promise<'A' | 'B' | 'UNKNOWN'> {
    const rows = await this.db.query(
      `SELECT shift_id FROM employees WHERE id = ? LIMIT 1`,
      [employeeId]
    )
    const sid = rows && rows[0] ? (rows[0]['shift_id'] as string | undefined) : undefined
    if (sid === 'A' || sid === 'B') return sid
    return 'UNKNOWN'
  }

  // --------- Métodos de Mapeo y Auxiliares ---------

  // Método privado para convertir una fila de la base de datos a un objeto 'Attendance'.
  private rowToAttendance(row: Row): Attendance {
    const id = this.get(row, 'id', 'not-found') // Obtenemos el 'id' de la fila.
    const employeeId = this.get(row, 'employee_id', 'not-found') // Obtenemos el 'employee_id' de la fila.
    const tsRaw = this.get(row, 'ts_utc', '1970-01-01 00:00:00') // Obtenemos el 'timestamp' de la fila.
    const typeDb = this.get(row, 'type', 'ENTRADA') // Obtenemos el tipo de evento ('ENTRADA' o 'SALIDA').

    const ts = this.mysqlToIsoUtc(tsRaw) // Convertimos el 'timestamp' de MySQL a ISO UTC.
    const type = this.domainTypeFromDb(typeDb) // Convertimos el tipo de evento de la base de datos al dominio.

    // Retornamos una nueva instancia de 'Attendance' con los valores mapeados.
    return new Attendance({
      id,
      employeeId,
      timestamp: ts,
      type,
    })
  }

  // Método privado para obtener el valor de una propiedad de una fila, o un valor por defecto si no existe.
  private get(r: Row | undefined, key: string, fallback = ''): string {
    if (!r) return fallback
    const v = r[key]
    return v === undefined || v === null ? fallback : v
  }

  // Método para convertir el tipo del dominio ('ENTRANCE'/'EXIT') a tipo de base de datos ('ENTRADA'/'SALIDA').
  private dbTypeFromDomain(t: DomainType): DBType {
    return t === 'ENTRANCE' ? 'ENTRADA' : 'SALIDA'
  }

  // Método para convertir el tipo de base de datos ('ENTRADA'/'SALIDA') a tipo de dominio ('ENTRANCE'/'EXIT').
  private domainTypeFromDb(t: string): DomainType {
    return t === 'ENTRADA' ? 'ENTRANCE' : 'EXIT'
  }

  // Método para convertir una fecha en formato MySQL a fecha ISO UTC.
  private mysqlToIsoUtc(dt: string): string {
    if (!dt) return '1970-01-01T00:00:00Z'
    return dt.replace(' ', 'T') + 'Z'
  }

  // Método para convertir una fecha en formato ISO a formato MySQL.
  private toMySQLDateTime(input: string, endOfDay = false): string {
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      return endOfDay ? `${input} 23:59:59` : `${input} 00:00:00`
    }
    const d = new Date(input)
    const pad = (n: number) => String(n).padStart(2, '0')
    const yyyy = d.getUTCFullYear()
    const mm = pad(d.getUTCMonth() + 1)
    const dd = pad(d.getUTCDate())
    const hh = pad(d.getUTCHours())
    const mi = pad(d.getUTCMinutes())
    const ss = pad(d.getUTCSeconds())
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
  }
}
