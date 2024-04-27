export interface SettingsType {
  API_ID: number
  API_HASH: string
  MIN_AVAILABLE_ENERGY?: number
  SLEEP_BY_MIN_ENERGY?: number
  ADD_TAPS_ON_TURBO?: number
  AUTO_UPGRADE_TAP?: boolean
  MAX_TAP_LEVEL?: number
  AUTO_UPGRADE_ENERGY?: boolean
  MAX_ENERGY_LEVEL?: number
  AUTO_UPGRADE_CHARGE?: boolean
  MAX_CHARGE_LEVEL?: number
  APPLY_DAILY_ENERGY?: boolean
  APPLY_DAILY_TURBO?: boolean
  RANDOM_TAPS_COUNT?: number[]
  SLEEP_BETWEEN_TAP?: number[]
  USE_PROXY_FROM_FILE?: boolean
}
