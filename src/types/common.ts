import * as input from 'input'

export type InputType = typeof input
export interface Proxy {
  protocol: string
  host: string
  port: string
  login?: string
  password?: string
}
