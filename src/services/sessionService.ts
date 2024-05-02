import fs from 'fs'
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import path from 'path'
import * as input from 'input'
import { globSync } from 'glob'
import { SETTINGS } from '../config'
import { SESSION_FOLDER } from '../constants'
import { logger } from './logger'

class SessionService {
  async createSession(): Promise<void> {
    const { API_ID, API_HASH } = SETTINGS

    const client = new TelegramClient(new StringSession(''), API_ID, API_HASH, {
      connectionRetries: 5,
    })

    try {
      await client.start({
        phoneNumber: async () => input.text('Please enter your number: '),
        password: async () => input.password('Please enter your password: '),
        phoneCode: async () => input.password('Please enter the code you received: '),
        onError: (err) => logger.error(String(err)),
      })

      const { username } = await client.getMe()
      logger.success(`@${username} | session successfully created`)

      await this.saveSession(client)
    } finally {
      client.session.close()
      await client.disconnect()
      process.exit(0)
    }
  }

  async saveSession(client: TelegramClient) {
    if (!fs.existsSync(SESSION_FOLDER)) fs.mkdirSync(SESSION_FOLDER)

    const sessionName = await input.text('Enter a session name (press Enter to exit): ')
    if (!sessionName) process.exit(0)

    const sessionFileName = `${SESSION_FOLDER}/${sessionName}.txt`
    const isExistedFile = fs.existsSync(sessionFileName)

    if (isExistedFile) {
      logger.warn(`File with ${sessionName} name already exists, use a different one`)
      await this.saveSession(client)
    } else {
      const sessionString = client.session.save() as unknown as string

      fs.writeFileSync(path.resolve(sessionFileName), sessionString)
      logger.success(`Session has been successfully saved to ${sessionFileName}`)
    }
  }

  getSessionNames() {
    const sessionNames = globSync(`${SESSION_FOLDER}/*.txt`)
    return sessionNames.map((file) => path.basename(file, path.extname(file)))
  }
}

export const sessionService = new SessionService()
