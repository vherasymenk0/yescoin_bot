import axios, { AxiosInstance } from 'axios'
import { Proxy } from '../../types'
import { apiMap, baseURL, HeaderData } from './api.constants'
import { proxyService } from '../proxyService'
import {
  AccountInfoResponse,
  BooleanResponse,
  BoostsInfoResponse,
  CollectResponse,
  GameInfoResponse,
  LoginResponse,
} from './api.interfaces'

export class YesCoinApi {
  private readonly proxy: Proxy | null
  private readonly axios: AxiosInstance

  constructor(proxy: Proxy | null) {
    this.proxy = proxy
    this.axios = axios.create({
      ...axios.defaults,
      baseURL,
      headers: {
        ...HeaderData,
      },
    })
  }

  async login(tgWebData: string) {
    if (this.proxy) {
      const res = await proxyService.check(this.proxy)
      if (res) this.axios.defaults.httpsAgent = proxyService.getHttpsAgent(this.proxy)
    }

    const res = await this.axios.post<LoginResponse>(apiMap.login, { code: tgWebData })

    const { token } = res.data.data
    this.axios.defaults.headers.common = { Token: token }
  }

  async getAccountInfo() {
    const res = await this.axios.get<AccountInfoResponse>(apiMap.accountInfo)
    const { code, message, data } = res.data

    if (!data) throw new Error(`${code} | Error while getting Account Info: ${message}`)
    return data
  }

  async getGameInfo() {
    const res = await this.axios.get<GameInfoResponse>(apiMap.gameInfo)
    const { code, message, data } = res.data

    if (!data) throw new Error(`${code} | Error while getting Game Info: ${message}`)
    return data
  }

  async getBoostersInfo() {
    const res = await this.axios.get<BoostsInfoResponse>(apiMap.boostersInfo)
    const { code, message, data } = res.data

    if (!data) throw new Error(`${code} | Error while getting boosters info: ${message}`)
    return data
  }

  async boosterLevelUp(boosterId: number) {
    const res = await this.axios.post<BooleanResponse>(apiMap.boosterLevelUp, boosterId)
    const { code, message, data } = res.data

    if (!data) throw new Error(`${code} | Error while ${boosterId} booster level up: ${message}`)
    return data
  }

  async applyTurboBoost() {
    const res = await this.axios.post<BooleanResponse>(apiMap.applyTurboBoost)
    const { code, message, data } = res.data

    if (!data) throw new Error(`${code} | Error while apply turbo boost: ${message}`)
    return data
  }

  async applyEnergyBoost() {
    const res = await this.axios.post<BooleanResponse>(apiMap.applyRecoverEnergy)
    const { code, message, data } = res.data

    if (!data) throw new Error(`${code} | Error while apply energy boost: ${message}`)
    return data
  }

  async collectCoins(coinsCount: number) {
    const res = await this.axios.post<CollectResponse>(apiMap.collect, JSON.stringify(coinsCount))
    const { code, message, data } = res.data

    if (!data) throw new Error(`${code} | Error while collect coins: ${message}`)
    return data
  }

  async collectCoinsWithTurbo(coinsCount: number) {
    const dto = { boxType: 2, coinCount: coinsCount }
    const res = await this.axios.post<CollectResponse>(apiMap.collectWithTurbo, dto)
    const { code, message, data } = res.data

    if (!data) throw new Error(`${code} | Error while collect coins with turbo: ${message}`)
    return data
  }
}
