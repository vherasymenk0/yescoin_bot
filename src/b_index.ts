import { TelegramClient } from 'telegram'
import fs from 'fs'
import path from 'path'
import { globSync } from 'glob'
import { StringSession } from 'telegram/sessions'
import * as input from 'input'
import { SETTINGS } from './config'
import { parseProxyString } from './helpers/parseProxyString'
import { InputType, Proxy } from './types'
import { SESSION_FOLDER, START_TEXT } from './constants'
import { createSession } from './features/createSession'

export const getSessionNames = () => {
  const sessionNames = globSync(`${SESSION_FOLDER}/*.txt`)
  return sessionNames.map((file) => path.basename(file, path.extname(file)))
}

export const getProxies = () => {
  let proxyList: Proxy[] = []

  if (SETTINGS.USE_PROXY_FROM_FILE)
    proxyList = fs
      .readFileSync('proxies.txt', 'utf-8')
      .split(/\r?\n/)
      .map(parseProxyString)
      .filter((proxy): proxy is Proxy => proxy !== null)

  return proxyList
}

export const getTgClients = async (): Promise<TelegramClient[]> => {
  const sessionNames = getSessionNames()
  const { API_HASH, API_ID } = SETTINGS

  if (sessionNames.length === 0) throw new Error('Not found session files')

  const tgClients = sessionNames.map((sessionName) => {
    const sessionFileName = path.resolve(`${SESSION_FOLDER}/${sessionName}.txt`)
    const sessionString = fs.readFileSync(sessionFileName, 'utf-8')

    return new TelegramClient(new StringSession(sessionString), API_ID, API_HASH, {
      connectionRetries: 5,
    })
  })

  return tgClients
}

const runS = async (action: number, inpt: InputType): Promise<void> => {
  if (action === 1) {
    console.log('create new session')
    createSession(inpt)
  } else if (action === 2) {
    console.info(`Detected ${getSessionNames().length} sessions | ${getProxies().length} proxies`)
    console.log('run bot')
  }
}

export const run = async (err?: string) => {
  console.log(err || START_TEXT)
  const actionNumber = Number(await input.text('->: '))

  if (!Number.isInteger(actionNumber)) run('Action must be number')
  else if (![1, 2].includes(actionNumber)) run('Action must be 1 or 2')
  else runS(actionNumber, input)
}

// async function runTasks(tgClients: TelegramClient[]) {
//   const proxies = getProxies()
//   const proxiesCycle = proxies.length
//     ? (() => {
//         let i = 0
//         return () => proxies[(i = (i + 1) % proxies.length)]
//       })()
//     : null
//   const tasks = tgClients.map((tgClient) =>
//     runTapper(tgClient, proxiesCycle ? proxiesCycle() : null),
//   )
//
//   await Promise.all(tasks)
// }
