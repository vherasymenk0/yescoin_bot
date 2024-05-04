/* eslint-disable no-await-in-loop */
import { getTgClients } from '../helpers/getTgClients'
import { logger } from '../services/logger'
import { sleep } from '../utils/sleep'
import { Clicker } from './clicker'

export const startBot = async () => {
  try {
    const clients = await getTgClients()

    const tasks = clients.map((tgClient) => ({
      tapper: new Clicker(tgClient),
      sessionName: tgClient.sessionName,
    }))

    const runTask = async (task: (typeof tasks)[0]) => {
      const { tapper, sessionName } = task
      while (true) {
        try {
          await tapper.run()
        } catch (error) {
          if (error instanceof Error) logger.error(`[${sessionName}]:`, error)
          else logger.error(`[${sessionName}]: ${error}`)
        }
        await sleep(5)
      }
    }

    tasks.forEach((task) => {
      runTask(task)
    })
  } catch (e) {
    logger.error(`Error while running bot :${e}`)
  }
}
