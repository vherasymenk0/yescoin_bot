import { TelegramClient } from 'telegram'
import fs from 'fs'
import path from 'path'
import { SESSION_FOLDER } from '../../constants'
import { InputType } from '../../types'

export const saveSession = async (client: TelegramClient, input: InputType) => {
  if (!fs.existsSync(SESSION_FOLDER)) fs.mkdirSync(SESSION_FOLDER)

  const sessionName = await input.text('Enter a session name (press Enter to exit): ')
  if (!sessionName) process.exit(0)

  const sessionFileName = `${SESSION_FOLDER}/${sessionName}.txt`
  const isExistedFile = fs.existsSync(sessionFileName)

  if (isExistedFile) {
    console.warn(`File with ${sessionName} name already exists, use a different one`)
    await saveSession(client, input)
  } else {
    const sessionString = client.session.save() as unknown as string

    fs.writeFileSync(path.resolve(sessionFileName), sessionString)
    console.log(`Session has been successfully saved to ${sessionFileName}`)
  }
}
