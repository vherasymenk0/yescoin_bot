import * as input from 'input'
import { TelegramClient } from 'telegram'

export type InputType = typeof input

export interface Proxy {
  protocol: string
  host: string
  port: number
  login?: string
  password?: string
}

export interface TgClientInstance {
  client: TelegramClient
  sessionName: string
  proxy: Proxy | null
}

export interface TgWebData {
  query_id: string
  user: string
  auth_date: string
  hash: string
}

export interface ParsedTgWebData {
  tgWebAppData: string
  tgWebAppVersion: string
  tgWebAppPlatform: 'android' | 'ios' | 'desktop'
}

export interface IpInfo {
  ip: string
  city: string
  region: string
  country: string
  loc: string
  org: string
  postal: string
  timezone: string
}
