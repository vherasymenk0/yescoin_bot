import { createLogger, format, transports } from 'winston'
import { WinstonColorsType, WinstonColorsTypeLevels } from './logger.interfaces'

class Logger {
  private levels: Record<WinstonColorsTypeLevels, number>
  private levelColors: Record<WinstonColorsTypeLevels, WinstonColorsType>
  private logger

  constructor() {
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      success: 3,
      debug: 4,
    }

    this.levelColors = {
      error: 'red',
      warn: 'yellow',
      info: 'blue',
      success: 'green',
      debug: 'white',
    }

    this.logger = createLogger({
      levels: this.levels,
      level: 'debug',
      format: format.combine(format.timestamp({ format: 'HH:mm:ss' }), this.customFormat),
      transports: [new transports.Console()],
    })
  }

  private colorize(str: string, color: WinstonColorsType) {
    const codes = {
      red: 31,
      yellow: 33,
      blue: 36,
      green: 32,
      white: 37,
    }

    const code = codes[color] || 37
    return `\u001b[${code}m${str}\u001b[0m`
  }

  private customFormat = format.printf(({ level: lvl, timestamp, message }) => {
    const color = this.levelColors[lvl as WinstonColorsTypeLevels]
    const levelUppercase = lvl.toUpperCase()
    const level = this.colorize(levelUppercase, color)
    let colorizedLevel = ''

    if (lvl === 'info') colorizedLevel = `|  ${level}   |`
    if (lvl === 'warn') colorizedLevel = `|  ${level}   |`
    if (lvl === 'error') colorizedLevel = `|  ${level}  |`
    if (lvl === 'success') colorizedLevel = `| ${level} |`

    return `${timestamp}${colorizedLevel} ${this.colorize(message, color)}`
  })

  info(message: string) {
    this.logger.info(message)
  }
  warn(message: string) {
    this.logger.warn(message)
  }
  error(message: string) {
    this.logger.error(message)
  }
  success(message: string) {
    this.logger.log({ level: 'success', message })
  }
  debug(message: string) {
    this.logger.debug(message)
  }
}

export const logger = new Logger()
