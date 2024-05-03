import path from 'path'
import fs from 'fs'
import { TelegramClientParams } from 'telegram/client/telegramBaseClient'
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import { SETTINGS } from '../config'
import { SESSION_FOLDER } from '../constants'
import { proxyService } from '../services/proxyService'
import { sessionService } from '../services/sessionService'
import { Proxy } from '../types'
import { logger } from '../services/logger'

export const getTgClients = async () => {
  const sessionNames = sessionService.getSessionNames()
  const sessionsCount = sessionService.getSessionNames().length
  logger.info(`Detected ${sessionsCount} ${sessionsCount > 1 ? 'sessions' : 'session'}`)

  const { API_HASH, API_ID, USE_PROXY_FROM_FILE } = SETTINGS

  let proxyIterator = null
  if (USE_PROXY_FROM_FILE) {
    logger.info(`Bot is running in proxy mode`)
    const proxies = proxyService.getProxies()
    logger.info(`Detected ${proxies.length} proxies`)
    proxyIterator = proxyService.createProxyIterator(proxies)
  }

  const tgClients = sessionNames.map((sessionName) => {
    const sessionFileName = path.resolve(`${SESSION_FOLDER}/${sessionName}.txt`)
    const sessionString = fs.readFileSync(sessionFileName, 'utf-8')
    let tgClientParams: TelegramClientParams = { connectionRetries: 5 }
    let proxy = null

    if (proxyIterator) {
      proxy = proxyIterator.next().value as Proxy
      tgClientParams = {
        ...tgClientParams,
        proxy: {
          ip: proxy.host,
          port: proxy.port,
          MTProxy: false,
          socksType: 5,
          timeout: 2,
          username: proxy.login,
          password: proxy.password,
        },
      }
    }

    const tgClient = new TelegramClient(
      new StringSession(sessionString),
      API_ID,
      API_HASH,
      tgClientParams,
    )

    return {
      client: tgClient,
      sessionName,
      proxy,
    }
  })

  return tgClients
}
