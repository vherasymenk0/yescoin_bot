import { TelegramClient } from 'telegram'
import fs from 'fs'
import input from 'input'
import path from 'path'

const SESSION_FOLDER = 'my_sessions'

export const saveSession = async (client: TelegramClient) => {
  if (!fs.existsSync(SESSION_FOLDER)) fs.mkdirSync(SESSION_FOLDER)

  const sessionName = await input.text('Enter a session name (press Enter to exit): ')
  if (!sessionName) process.exit(0)

  const sessionFileName = `${SESSION_FOLDER}/${sessionName}.session`
  const isExistedFile = fs.existsSync(sessionFileName)

  if (isExistedFile) {
    console.warn(`File with ${sessionName} name already exists, use a different one`)
    await saveSession(client)
  } else {
    const sessionString = client.session.save() as unknown as string

    fs.writeFileSync(path.resolve(sessionFileName), sessionString)
    console.log(`The session has been successfully saved to ${sessionFileName}`)
  }
}
