import { SocksProxyAgent } from 'socks-proxy-agent'
import axios from 'axios'
import fs from 'fs'
import { IpInfo, Proxy } from '../types'
import { logger } from './logger'

const IP_INFO_URL = 'https://ipinfo.io/json'
const REGEX =
  /^(?<protocol>\w+):\/\/((?<login>[\w-]+):(?<password>[\w-]+)@)?(?<host>[\w.-]+):(?<port>\d+)$/

const proxiesFileName = 'proxies.txt'

class ProxyService {
  getProxies() {
    const isExistedProxies = fs.existsSync(proxiesFileName)

    if (!isExistedProxies) {
      logger.error(`Cannot find ${proxiesFileName}}`)
      process.exit(1)
    }

    const proxyList = fs
      .readFileSync(proxiesFileName, 'utf-8')
      .split(/\r?\n/)
      .filter(Boolean)
      .map(this.parse)

    if (proxyList.length === 0) {
      logger.error(`${proxiesFileName} is empty`)
      process.exit(1)
    }

    return proxyList
  }

  getHttpsAgent(proxy: string | Proxy) {
    let proxyString = null

    if (typeof proxy === 'string') proxyString = proxy
    else proxyString = this.stringify(proxy)

    return new SocksProxyAgent(proxyString)
  }

  parse(proxyString: string) {
    const match = proxyString.trim().match(REGEX)

    if (!match || !match.groups) {
      logger.error('Invalid proxy format')
      logger.info('Proxy template example -> socks5://login:password@ip:port')
      process.exit(1)
    }

    const { protocol, host, port, login, password } = match.groups

    return {
      protocol,
      host,
      port: Number(port),
      ...(login && { login }),
      ...(password && { password }),
    }
  }

  stringify(proxy: Proxy): string {
    const { protocol, host, port, login, password } = proxy
    let result = `${protocol}://`

    if (login && password) result += `${login}:${password}@`

    result += `${host}:${port}`
    return result
  }

  async check(proxy: Proxy, sessionName = '') {
    try {
      const httpsAgent = this.getHttpsAgent(proxy)
      const res = await axios.get<IpInfo>(IP_INFO_URL, { timeout: 5000, httpsAgent })
      const { ip, country, city, timezone } = res.data

      logger.info(`${sessionName} | proxy_info: ${ip} | ${country} | ${city} | ${timezone}`)
      return true
    } catch (e) {
      logger.error(
        `Error during connect to proxy | ${sessionName} | IP: ${proxy.host} | error: ${e}`,
      )
      return true
    }
  }

  *createProxyIterator(proxies: Proxy[]): Generator<Proxy, void> {
    let index = 0

    while (true) {
      if (index >= proxies.length) index = 0

      yield proxies[index]
      index++
    }
  }
}

export const proxyService = new ProxyService()
