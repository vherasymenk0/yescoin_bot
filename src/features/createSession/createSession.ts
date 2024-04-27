import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import input from 'input'
import { SETTINGS } from '../../config'
import { saveSession } from './saveSession'

export const createSession = async (): Promise<void> => {
  const { API_ID, API_HASH } = SETTINGS

  const client = new TelegramClient(new StringSession(''), API_ID, API_HASH, {
    connectionRetries: 5,
  })

  try {
    await client.start({
      phoneNumber: async () => input.text('Please enter your number: '),
      password: async () => input.text('Please enter your password: '),
      phoneCode: async () => input.text('Please enter the code you received: '),
      onError: (err) => console.log(err),
    })

    const { username } = await client.getMe()
    console.log(`@${username} | session successfully created`)

    await saveSession(client)
  } finally {
    client.session.close()
    await client.disconnect()
    process.exit(0)
  }
}
