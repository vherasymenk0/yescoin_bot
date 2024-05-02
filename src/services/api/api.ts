import axios, { AxiosRequestConfig } from 'axios'
import { Proxy } from '../../types'
import { apiMap, HeaderData } from './api.constants'
import { proxyService } from '../proxyService'
import {
  AccountInfoResponse,
  BooleanResponse,
  BoostsInfoResponse,
  CollectResponse,
  GameInfoResponse,
  LoginResponse,
} from './api.interfaces'
import { sleep } from '../../utils/sleep'
import { logger } from '../logger'

export class Api {
  private readonly proxy: Proxy | null
  private readonly config: AxiosRequestConfig
  private readonly sessionName: string

  constructor(proxy: Proxy | null, sessionName: string) {
    this.proxy = proxy
    this.config = { headers: HeaderData }
    this.sessionName = sessionName
  }

  private async login(tgWebData: string) {
    try {
      if (this.proxy) {
        const res = await proxyService.check(this.proxy)
        if (res) this.config.httpsAgent = proxyService.getHttpsAgent(this.proxy)
      }

      const res = await axios.post<LoginResponse>(apiMap.login, { code: tgWebData })
      const { token } = res.data.data
      this.config.headers = { Authorization: `Bearer ${token}` }

      return token
    } catch (error) {
      logger.error(`${this.sessionName} | error while getting Access Token: ${error}`)
      await sleep()
      return null
    }
  }

  async getAccountInfo() {
    try {
      const res = await axios.get<AccountInfoResponse>(apiMap.accountInfo)
      const accountInfo = res.data.data

      return accountInfo
    } catch (error) {
      logger.error(`${this.sessionName} | error while getting Account Info: ${error}`)
      await sleep()
      return null
    }
  }

  async getGameInfo() {
    try {
      const res = await axios.get<GameInfoResponse>(apiMap.gameInfo)
      const gameInfo = res.data.data

      return gameInfo
    } catch (error) {
      logger.error(`${this.sessionName} | error while getting Game Info: ${error}`)
      await sleep()
      return null
    }
  }

  async getBoostersInfo() {
    try {
      const res = await axios.get<BoostsInfoResponse>(apiMap.boostersInfo)
      const boostsInfo = res.data.data

      return boostsInfo
    } catch (error) {
      logger.error(`${this.sessionName} | error while getting boosters info: ${error}`)
      await sleep()
      return null
    }
  }

  async boosterLevelUp(boosterId: number) {
    try {
      const res = await axios.post<BooleanResponse>(apiMap.boosterLevelUp, boosterId)
      const isLevelUp = res.data.data

      return isLevelUp
    } catch (error) {
      logger.error(`${this.sessionName} | error while ${boosterId} booster level up: ${error}`)
      await sleep()
      return false
    }
  }

  async applyTurboBoost() {
    try {
      const res = await axios.post<BooleanResponse>(apiMap.applyTurboBoost)
      const isApplied = res.data.data

      return isApplied
    } catch (error) {
      logger.error(`${this.sessionName} | error while apply turbo boost: ${error}`)
      await sleep()
      return false
    }
  }

  async applyEnergyBoost() {
    try {
      const res = await axios.post<BooleanResponse>(apiMap.applyRecoverEnergy)
      const isApplied = res.data.data

      return isApplied
    } catch (error) {
      logger.error(`${this.sessionName} | error while apply energy boost: ${error}`)
      await sleep()
      return false
    }
  }

  async collectCoins(coinsCount: number) {
    try {
      const res = await axios.post<CollectResponse>(apiMap.collect, coinsCount)
      const { collectStatus } = res.data.data

      return collectStatus
    } catch (error) {
      logger.error(`${this.sessionName} | error while collect coins: ${error}`)
      await sleep()
      return null
    }
  }

  async collectCoinsWithTurbo(coinsCount: number) {
    try {
      const dto = { boxType: 2, coinCount: coinsCount }
      const res = await axios.post<CollectResponse>(apiMap.collectWithTurbo, dto)
      const { collectStatus } = res.data.data

      return collectStatus
    } catch (error) {
      logger.error(`${this.sessionName} | error while collect coins with turbo: ${error}`)
      await sleep()
      return null
    }
  }
}
