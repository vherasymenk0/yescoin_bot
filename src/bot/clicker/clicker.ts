/* eslint-disable no-await-in-loop */
/* eslint-disable no-constant-condition */
import qs from 'querystringify'
import { Api, TelegramClient } from 'telegram'

import { getPeerId } from 'telegram/client/users'
import { ParsedTgWebData, TgClientInstance } from '../../types'
import { logger } from '../../services/logger'
import { sleep } from '../../utils/sleep'
import { YesCoinApi } from '../../services/api'
import { SETTINGS } from '../../config'

const tokenLifeSpan = 3600000 // one hour
const {
  RANDOM_TAPS_COUNT,
  ADD_TAPS_ON_TURBO,
  MIN_AVAILABLE_ENERGY,
  APPLY_DAILY_ENERGY,
  APPLY_DAILY_TURBO,
  MAX_TAP_LEVEL,
  AUTO_UPGRADE_TAP,
  AUTO_UPGRADE_CHARGE,
  AUTO_UPGRADE_ENERGY,
  MAX_CHARGE_LEVEL,
  MAX_ENERGY_LEVEL,
  SLEEP_BETWEEN_TAP,
  SLEEP_BY_MIN_ENERGY,
} = SETTINGS
export class Clicker {
  private readonly sessionName: string
  private readonly tgClient: TelegramClient
  private readonly appUrl: string
  private readonly appName: string
  private readonly api: YesCoinApi
  private tokenCreatedTime: number

  constructor({ client, proxy, sessionName }: TgClientInstance) {
    this.sessionName = sessionName
    this.tgClient = client
    this.appUrl = 'https://www.yescoin.gold'
    this.appName = 'theYescoin_bot'
    this.api = new YesCoinApi(proxy)
    this.tokenCreatedTime = 0
  }

  private async getTgWebData() {
    if (!this.tgClient.connected) await this.tgClient.connect()

    const peer = await getPeerId(this.tgClient, this.appName)
    const { accessHash, id } = (await this.tgClient.getEntity(this.appName)) as any
    const bot = new Api.InputPeerUser({ accessHash, userId: id })

    const webView = await this.tgClient.invoke(
      new Api.messages.RequestWebView({
        peer,
        bot,
        fromBotMenu: true,
        platform: 'android',
        url: this.appUrl,
      }),
    )

    const tgWebDataHash = new URL(webView.url).hash.substring(1)
    const { tgWebAppData } = qs.parse(tgWebDataHash) as ParsedTgWebData

    const parsedQuery = {
      ...qs.parse(tgWebAppData),
      chat_instance: '-4470327037662671160',
      chat_type: 'sender',
    } as any

    const { auth_date, hash, chat_instance, chat_type } = parsedQuery
    const stringTgWebData = `user=${parsedQuery.user}&chat_instance=${chat_instance}&chat_type=${chat_type}&auth_date=${auth_date}&hash=${hash}`

    if (this.tgClient.connected) await this.tgClient.disconnect()

    return stringTgWebData
  }

  async authorize() {
    const tgWebData = await this.getTgWebData()
    await this.api.login(tgWebData)

    this.tokenCreatedTime = Date.now()
    await sleep(2)
    logger.info(`${this.sessionName} | Authorization successful`)
  }

  // TODO: refactor after fixing tgWebData
  async run() {
    let turbo_time = 0
    let active_turbo = false
    const currentTime = Date.now()
    const isTokenExpired = currentTime - this.tokenCreatedTime >= tokenLifeSpan
    if (isTokenExpired) await this.authorize()

    const gameInfo = await this.api.getGameInfo()
    const { currentAmount } = await this.api.getAccountInfo()
    let balance = currentAmount

    const [min, max] = RANDOM_TAPS_COUNT
    let taps = Math.floor(Math.random() * (max - min + 1)) + min
    const available_energy = gameInfo.coinPoolLeftCount
    const coins_by_tap = gameInfo.singleCoinValue

    if (active_turbo) {
      taps += ADD_TAPS_ON_TURBO
      await this.api.collectCoinsWithTurbo(taps)

      if (Date.now() - turbo_time > 20) {
        active_turbo = false
        turbo_time = 0
      }
    } else {
      const countCoins = taps * coins_by_tap

      if (countCoins >= available_energy) {
        const maxAllowedTaps = Math.abs(Math.floor(available_energy / 10) - 1)

        taps = maxAllowedTaps
      } else {
        await this.api.collectCoins(taps)
      }
    }

    const accountInfo = await this.api.getAccountInfo()
    const new_balance = accountInfo.currentAmount
    const calc_taps = Math.abs(new_balance - balance)
    balance = new_balance
    const total = accountInfo.totalAmount
    logger.success(
      `${this.sessionName} | Successful tapped! | Balance: ${balance}+${calc_taps} | Total: ${total}`,
    )

    const boosts_info = await this.api.getBoostersInfo()

    const turbo_boost_count = boosts_info.specialBoxLeftRecoveryCount
    const energy_boost_count = boosts_info.coinPoolLeftRecoveryCount
    const next_tap_level = boosts_info.singleCoinLevel
    const next_energy_level = boosts_info.coinPoolTotalLevel
    const next_charge_level = boosts_info.coinPoolRecoveryLevel
    const next_tap_price = boosts_info.singleCoinUpgradeCost
    const next_energy_price = boosts_info.coinPoolTotalUpgradeCost
    const next_charge_price = boosts_info.coinPoolRecoveryUpgradeCost

    if (!active_turbo) {
      if (energy_boost_count > 0 && available_energy < MIN_AVAILABLE_ENERGY && APPLY_DAILY_ENERGY) {
        logger.info(`${this.sessionName} | Sleep 5s before activating the daily energy boost`)
        await sleep(5)
        const applyStatus = await this.api.applyEnergyBoost()

        if (applyStatus) {
          logger.success(`${this.sessionName} | Energy boost applied"`)
          await sleep(1)
        }
        return
      }

      if (turbo_boost_count > 0 && APPLY_DAILY_TURBO) {
        logger.info(`${this.sessionName} | Sleep 5s before activating the daily turbo boost`)
        await sleep(5)

        const turboStatus = await this.api.applyTurboBoost()
        if (turboStatus) {
          logger.success(`${this.sessionName} | Turbo boost applied`)

          await sleep(1)

          active_turbo = true
          turbo_time = Date.now()
        }
        return
      }

      if (AUTO_UPGRADE_TAP && balance > next_tap_price && next_tap_level <= MAX_TAP_LEVEL) {
        logger.info(`${this.sessionName} | Sleep 5s before upgrade tap to {next_tap_level} lvl`)
        await sleep(5)

        const boosterStatus = await this.api.boosterLevelUp(1)
        if (boosterStatus) {
          logger.success(`${this.sessionName} | Tap upgraded to {next_tap_level} lvl`)

          await sleep(1)
        }

        return
      }

      if (
        AUTO_UPGRADE_ENERGY &&
        balance > next_energy_price &&
        next_energy_level <= MAX_ENERGY_LEVEL
      ) {
        logger.info(
          `${this.sessionName} | Sleep 5s before upgrade energy to ${next_energy_level} lvl`,
        )
        await sleep(5)

        const boosterStatus = await this.api.boosterLevelUp(3)
        if (boosterStatus) {
          logger.success(`${this.sessionName} | Energy upgraded to ${next_energy_level} lvl`)

          await sleep(1)
        }
        return
      }

      if (
        AUTO_UPGRADE_CHARGE &&
        balance > next_charge_price &&
        next_charge_level <= MAX_CHARGE_LEVEL
      ) {
        logger.info(
          `${this.sessionName} | Sleep 5s before upgrade charge to ${next_charge_level} lvl`,
        )
        await sleep(5)

        const boosterStatus = await this.api.boosterLevelUp(2)
        if (boosterStatus) {
          logger.success(`${this.sessionName} | Charge upgraded to ${next_charge_level} lvl`)

          await sleep(1)
        }
        return
      }

      if (available_energy < MIN_AVAILABLE_ENERGY) {
        logger.info(`${this.sessionName} | Minimum energy reached: ${available_energy}`)
        logger.info(`${this.sessionName} | Sleep ${SLEEP_BY_MIN_ENERGY}s`)

        await sleep(SLEEP_BY_MIN_ENERGY)
        return
      }
    }

    let sleep_between_clicks =
      Math.floor(Math.random() * (SLEEP_BETWEEN_TAP[1] - SLEEP_BETWEEN_TAP[0] + 1)) +
      SLEEP_BETWEEN_TAP[0]

    if (active_turbo) sleep_between_clicks = 4

    logger.info(`Sleep ${sleep_between_clicks}s`)
    await sleep(sleep_between_clicks)
  }
}
