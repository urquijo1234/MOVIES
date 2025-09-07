// Importamos 'execFile' de 'child_process' para ejecutar comandos del sistema (en este caso, MySQL).
import { execFile } from 'child_process'

// Definimos el tipo 'LocalDBCConfig' que contiene la configuración necesaria para la conexión a la base de datos MySQL.
type LocalDBCConfig = {
  host: string   // Dirección del host de la base de datos.
  port: string   // Puerto de la base de datos.
  user: string   // Usuario para la conexión.
  password: string // Contraseña del usuario.
  database: string // Nombre de la base de datos.
  mysqlBin: string // Ruta al binario de MySQL.
}

export default class LocalDBC {
  private static instance: LocalDBC | null = null  // Instancia única de LocalDBC (patrón Singleton).
  private readonly cfg: LocalDBCConfig // Configuración de la conexión a la base de datos.

  // Constructor privado que inicializa la configuración de la base de datos.
  private constructor(cfg?: Partial<LocalDBCConfig>) {
    this.cfg = {
      host: process.env['DB_HOST'] ?? '127.0.0.1',
      port: process.env['DB_PORT'] ?? '3306',
      user: process.env['DB_USER'] ?? 'root',
      password: process.env['DB_PASS'] ?? 'Camilo12345_',
      database: process.env['DB_NAME'] ?? 'attendance_db',
      mysqlBin: process.env['MYSQL_BIN'] ?? 'mysql',
      ...cfg,  // Permite pasar configuraciones adicionales (por ejemplo, para pruebas).
    }
  }

  // Método estático que retorna la instancia única de la clase LocalDBC (patrón Singleton).
  static getInstance(): LocalDBC {
    if (!LocalDBC.instance) {
      LocalDBC.instance = new LocalDBC() // Si no existe, la crea.
    }
    return LocalDBC.instance
  }

  // ---------------- Métodos principales ----------------

  // Método para ejecutar consultas que no retornan filas, como INSERT, UPDATE o DELETE.
  // Recibe la consulta SQL y los parámetros a insertar/actualizar.
  async execute(sql: string, params: unknown[] = []): Promise<void> {
    const formatted = this.format(sql, params)  // Formateamos la consulta con los parámetros.
    // Ejecutamos la consulta utilizando el binario de MySQL.
    await this.runMysql([
      '-h', this.cfg.host,
      '-P', this.cfg.port,
      '-u', this.cfg.user,
      `-p${this.cfg.password}`,
      '-D', this.cfg.database,
      '-e', formatted
    ])
  }

  // Método para ejecutar consultas SELECT y devolver filas como un arreglo de objetos.
  async query(sql: string, params: unknown[] = []): Promise<Record<string, string>[]> {
    const formatted = this.format(sql, params)  // Formateamos la consulta con los parámetros.
    // Ejecutamos la consulta utilizando el binario de MySQL y obtenemos la salida estándar.
    const stdout = await this.runMysqlAndGetStdout([
      '-h', this.cfg.host,
      '-P', this.cfg.port,
      '-u', this.cfg.user,
      `-p${this.cfg.password}`,
      '-D', this.cfg.database,
      '--batch', '--raw', '-e', formatted
    ])
    // Parseamos el resultado en formato TSV y lo convertimos en un arreglo de objetos.
    return this.parseTSV(stdout)
  }

  // ---------------- Helpers internos ----------------

  // Método para ejecutar un comando MySQL sin retornar nada.
  private runMysql(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      execFile(this.cfg.mysqlBin, args, (err, _stdout, stderr) => {
        if (err) reject(new Error(`mysql error: ${stderr || err.message}`))
        else resolve()
      })
    })
  }

  // Método para ejecutar un comando MySQL y obtener la salida estándar (stdout).
  private runMysqlAndGetStdout(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      execFile(this.cfg.mysqlBin, args, (err, stdout, stderr) => {
        if (err) reject(new Error(`mysql error: ${stderr || err.message}`))
        else resolve(stdout)
      })
    })
  }

  // Método para parsear los resultados en formato TSV (Tab Separated Values) y convertirlo en un arreglo de objetos.
  private parseTSV(tsv: string): Record<string, string>[] {
    const lines = tsv.split(/\r?\n/).filter(Boolean)  // Dividimos las líneas y filtramos las vacías.
    if (lines.length === 0) {
      return []
    }

    const headerLine = lines[0]  // La primera línea es el encabezado.
    if (!headerLine) {
      return []
    }

    const headers = headerLine.split('\t')  // Obtenemos los nombres de las columnas.
    const rows: Record<string, string>[] = []  // Arreglo para almacenar los resultados.

    // Iteramos sobre las líneas restantes (datos) y las convertimos en objetos.
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i]?.split('\t') ?? []  // Dividimos los valores de cada columna.
      const row: Record<string, string> = {}
      headers.forEach((h, idx) => {
        row[h] = cols[idx] ?? ''  // Asignamos cada valor de columna al objeto según su encabezado.
      })
      rows.push(row)  // Añadimos la fila al arreglo.
    }

    return rows  // Retornamos el arreglo con todas las filas.
  }

  // ---------------- Helpers de formateo ----------------

  // Método privado para formatear la consulta SQL reemplazando los '?' por los valores escapados.
  private format(sql: string, params: unknown[]): string {
    let i = 0
    return sql.replace(/\?/g, () => this.escape(params[i++]))
  }

  // Método privado para escapar valores y asegurarse de que sean seguros para la consulta SQL.
  private escape(val: unknown): string {
    if (val === null || val === undefined) return 'NULL'
    if (typeof val === 'number') return String(val)
    if (val instanceof Date) {
      const iso = val.toISOString().replace('T', ' ').replace('Z', '')
      return `'${iso}'`
    }
    const s = String(val)
    return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
  }
}
