import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import { SETTINGS } from '../../config'
import { saveSession } from './saveSession'
import { InputType } from '../../types'

export const createSession = async (input: InputType): Promise<void> => {
  const { API_ID, API_HASH } = SETTINGS

  const client = new TelegramClient(new StringSession(''), API_ID, API_HASH, {
    connectionRetries: 5,
  })

  try {
    await client.start({
      phoneNumber: async () => input.text('Please enter your number: '),
      password: async () => input.password('Please enter your password: '),
      phoneCode: async () => input.password('Please enter the code you received: '),
      onError: (err) => console.log(err),
    })

    const { username } = await client.getMe()
    console.log(`@${username} | session successfully created`)

    await saveSession(client, input)
  } finally {
    client.session.close()
    await client.disconnect()
    process.exit(0)
  }
}
