import * as input from 'input'
import { START_TEXT } from './constants'
import { logger } from './services/logger'
import { sessionService } from './services/sessionService'
import { startBot } from './bot/launcher'

const handleAction = (action: number) => {
  if (action === 1) sessionService.createSession()
  else startBot()
}

const start = async (message?: string) => {
  if (message) logger.warn(message)
  else logger.info(START_TEXT)

  const actionNumber = Number(await input.text('->: '))
  const isNumber = !Number.isInteger(actionNumber)
  const isValid = ![1, 2].includes(actionNumber)

  if (isNumber) start('Action must be number')
  else if (isValid) start('Action must be 1 or 2')
  else handleAction(actionNumber)
}

start()
