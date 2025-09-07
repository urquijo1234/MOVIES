// Clase Shift que representa un turno de trabajo. El turno tiene:
// - Hora de inicio (start)
// - Hora de fin (end)
// - Hora de inicio del descanso (breakStart)
// - Hora de fin del descanso (breakEnd)

export default class Shift  {
  private start: string //hora de inicio del turno
  private end: string  //hora de fin del turno
  private breakStart: string   // Hora de inicio del descanso 
  private breakEnd: string // Hora de fin del descanso

  constructor(start: string, end: string, breakStart: string, breakEnd: string) {
    this.start = start
    this.end = end
    this.breakStart = breakStart
    this.breakEnd = breakEnd
  }

 // Método para validar si la hora de entrada (entryTime) está dentro del turno de trabajo.
  // Retorna verdadero si la hora de entrada es válida (dentro del rango de inicio y fin del turno).
  isValidEntryTime(entryTime: string): boolean {
    return entryTime >= this.start && entryTime < this.end
  }

  // Método para validar si la hora de salida (exitTime) está dentro del turno de trabajo.
  // Retorna verdadero si la hora de salida es válida (dentro del rango de inicio y fin del turno).

  isValidExitTime(exitTime: string): boolean {
    return exitTime >= this.start && exitTime < this.end
  }

  // Método para validar si el tiempo de descanso (breakTime) está dentro del intervalo de descanso.
  // Retorna verdadero si la hora de descanso está dentro del rango de descanso, excluyendo ese tiempo del turno.
  isValidBreakTime(breakTime: string): boolean {
    return breakTime >= this.breakStart && breakTime < this.breakEnd
  }

  // Getter para la hora de inicio
  getStartTime(): string {
    return this.start
  }

  // Getter para la hora de fin
  getEndTime(): string {
    return this.end
  }

  // Getter para la hora de inicio del descanso
  getBreakStartTime(): string {
    return this.breakStart
  }

  // Getter para la hora de fin del descanso
  getBreakEndTime(): string {
    return this.breakEnd
  }
}