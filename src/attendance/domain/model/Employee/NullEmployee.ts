import Employee from './Employee'

export default class NullEmployee extends Employee {
  constructor() {
    // Se pasa un empleado "vacío" o de valores no encontrados.
    super({
      id: 'not-found',
      names: 'Not found in database',
      surnames: 'Not found in database',
      employeeCode: 'not-found'
    })
    this.isNull = true
  }

  // Sobrescribir los métodos para lanzar excepciones en caso de intentar modificar un NullEmployee
  override setNames = (_names: string): void => {
    throw new Error('Cannot set names on a NullEmployee')
  }

  override setSurnames = (_surnames: string): void => {
    throw new Error('Cannot set surnames on a NullEmployee')
  }

  override setEmployeeCode = (_employeeCode: string): void => {
    throw new Error('Cannot set employeeCode on a NullEmployee')
  }
}
