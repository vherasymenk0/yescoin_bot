import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import { input } from 'input'

import { settings } from './bot/config'

async function registerSessions(): Promise<void> {
  const { API_ID } = settings
  const { API_HASH } = settings

  if (!API_ID || !API_HASH) {
    throw new Error('API_ID и API_HASH не найдены в файле .env.')
  }

  const sessionName = await input.text('Введите имя сессии (нажмите Enter, чтобы выйти): ')

  if (!sessionName) {
    return
  }

  const session = new TelegramClient(new StringSession(sessionName), API_ID, API_HASH, {
    connectionRetries: 5,
  })

  try {
    await session.start({
      phoneNumber: async () => await input.text('Пожалуйста, введите ваш номер: '),
      password: async () => await input.text('Пожалуйста, введите ваш пароль: '),
      phoneCode: async () => await input.text('Пожалуйста, введите полученный код: '),
      onError: (err) => console.log(err),
    })

    const me = await session.getMe()

    console.log(`Сессия успешно добавлена @${me.username} | ${me.firstName} ${me.lastName}`)
  } finally {
    await session.stop()
  }
}

registerSessions()
