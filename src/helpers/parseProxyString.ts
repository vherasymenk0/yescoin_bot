import { Proxy } from '../types'

export const parseProxyString = (proxyString: string): Proxy | null => {
  const regex =
    /^(?<protocol>\w+):\/\/(?<host>[\w.-]+)(?::(?<port>\d+))?(?::(?<login>[\w-]+):(?<password>[\w-]+))?$/
  const match = proxyString.trim().match(regex)

  if (!match || !match.groups) return null

  const { protocol, host, port, login, password } = match.groups

  return {
    protocol,
    host,
    port,
    ...(login && { login }),
    ...(password && { password }),
  }
}
