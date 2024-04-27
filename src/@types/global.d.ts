export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_ID: string
      API_HASH: string
      MIN_AVAILABLE_ENERGY?: string
      SLEEP_BY_MIN_ENERGY?: string
      ADD_TAPS_ON_TURBO?: string
      AUTO_UPGRADE_TAP?: string
      MAX_TAP_LEVEL?: string
      AUTO_UPGRADE_ENERGY?: string
      MAX_ENERGY_LEVEL?: string
      AUTO_UPGRADE_CHARGE?: string
      MAX_CHARGE_LEVEL?: string
      APPLY_DAILY_ENERGY?: string
      APPLY_DAILY_TURBO?: string
      RANDOM_TAPS_COUNT?: string
      SLEEP_BETWEEN_TAP?: string
      USE_PROXY_FROM_FILE?: string
    }
  }
}
