import NullObject from '../../../../shared/base/domain/interfaces/NullObject'
import Person, { PersonInterface } from '../../../../shared/base/domain/abstracts/Person'

// La clase Employee extiende Person y representa a un empleado en el sistema.
export default class Employee extends Person implements NullObject {
  protected employeeCode: string // Código único del empleado
  isNull: boolean = false // Indicador de si el empleado es nulo o no

  constructor(employee: EmployeeInterface) {
    super(employee) // Llamamos al constructor de la clase base Person
    this.employeeCode = employee.employeeCode // Asignamos el código del empleado
  }

  // Métodos para obtener y modificar el código del empleado.
  getEmployeeCode = (): string => this.employeeCode
  setEmployeeCode = (employeeCode: string): void => {
    this.employeeCode = employeeCode // Modificamos el código del empleado
  }
}

// Interfaz que define la estructura del empleado, extendiendo de PersonInterface.
export interface EmployeeInterface extends PersonInterface {
  employeeCode: string // Código del empleado
}