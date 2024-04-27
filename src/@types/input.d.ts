declare module 'input' {
  type InputOptions = {
    label: string
    type: string
    inquirerDefault?: any
    choices?: any[]
    validate?: (answer: any) => boolean | Promise<boolean>
  }

  type CheckboxesOptions = InputOptions & {
    type: 'checkbox'
  }

  type ConfirmOptions = InputOptions & {
    type: 'confirm'
  }

  type PasswordOptions = InputOptions & {
    type: 'password'
  }

  type SelectOptions = InputOptions & {
    type: 'list'
  }

  type TextOptions = InputOptions & {
    type: 'input'
  }

  class Prompt {
    constructor(options: InputOptions)

    execute(): Promise<any>
  }

  function checkboxes(label: string, options?: CheckboxesOptions): Promise<any>
  function confirm(label: string, options?: ConfirmOptions): Promise<any>
  function password(label: string, options?: PasswordOptions): Promise<any>
  function select(label: string, choices: any[], options?: SelectOptions): Promise<any>
  function text(label: string, options?: TextOptions): Promise<any>

  export const _default: {
    checkboxes: typeof checkboxes
    confirm: typeof confirm
    password: typeof password
    select: typeof select
    text: typeof text
  }
}
