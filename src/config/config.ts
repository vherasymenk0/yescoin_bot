import { getEnvVar } from '../helpers/getEnvVar'
import { stringToBoolean } from '../helpers/stringToBoolean'

export const SETTINGS = {
  API_ID: Number(getEnvVar('API_ID')),
  API_HASH: getEnvVar('API_HASH'),
  MIN_AVAILABLE_ENERGY: Number(getEnvVar('MIN_AVAILABLE_ENERGY', '100')),
  SLEEP_BY_MIN_ENERGY: Number(getEnvVar('SLEEP_BY_MIN_ENERGY', '200')),
  ADD_TAPS_ON_TURBO: Number(getEnvVar('ADD_TAPS_ON_TURBO', '2500')),
  MAX_TAP_LEVEL: Number(getEnvVar('MAX_TAP_LEVEL', '5')),
  MAX_ENERGY_LEVEL: Number(getEnvVar('MAX_ENERGY_LEVEL', '20')),
  MAX_CHARGE_LEVEL: Number(getEnvVar('MAX_CHARGE_LEVEL', '5')),
  RANDOM_TAPS_COUNT: getEnvVar('RANDOM_TAPS_COUNT', '50-200').split('-').map(Number),
  SLEEP_BETWEEN_TAP: getEnvVar('SLEEP_BETWEEN_TAP', '15-25').split('-').map(Number),
  AUTO_UPGRADE_TAP: stringToBoolean(getEnvVar('AUTO_UPGRADE_TAP', 'true')),
  AUTO_UPGRADE_ENERGY: stringToBoolean(getEnvVar('AUTO_UPGRADE_ENERGY', 'true')),
  AUTO_UPGRADE_CHARGE: stringToBoolean(getEnvVar('AUTO_UPGRADE_CHARGE', 'true')),
  APPLY_DAILY_ENERGY: stringToBoolean(getEnvVar('APPLY_DAILY_ENERGY', 'true')),
  APPLY_DAILY_TURBO: stringToBoolean(getEnvVar('APPLY_DAILY_TURBO', 'true')),
  USE_PROXY_FROM_FILE: stringToBoolean(getEnvVar('USE_PROXY_FROM_FILE', 'true')),
}
