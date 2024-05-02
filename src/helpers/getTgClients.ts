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

export const getTgClients = async () => {
  const sessionNames = sessionService.getSessionNames()
  const { API_HASH, API_ID } = SETTINGS

  if (sessionNames.length === 0) throw new Error('Not found session files')

  const proxies = proxyService.getProxies()
  const proxyIterator = proxies.length > 0 ? proxyService.createProxyIterator(proxies) : null

  const tgClients = sessionNames.map((sessionName) => {
    const sessionFileName = path.resolve(`${SESSION_FOLDER}/${sessionName}.txt`)
    const sessionString = fs.readFileSync(sessionFileName, 'utf-8')
    let tgClientParams: TelegramClientParams = { connectionRetries: 5 }
    let proxy = null
    if (proxyIterator) proxy = proxyIterator.next().value as Proxy

    if (proxy)
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
