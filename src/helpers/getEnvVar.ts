import dotenv from 'dotenv'

dotenv.config()

export const getEnvVar = <T extends keyof NodeJS.ProcessEnv>(name: T, defaultValue?: string) => {
  try {
    const value = process.env[name]

    if (!value) {
      if (defaultValue === undefined) throw new Error(`Missing a required value for ${name}`)
      return defaultValue as string
    }

    if (typeof value !== 'string') throw new Error(`Invalid value for ${name}: ${value}`)

    return value
  } catch (error) {
    console.error(`Error getting ${name}:`, error)
    return process.exit(1)
  }
}
