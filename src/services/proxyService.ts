import { SocksProxyAgent } from 'socks-proxy-agent'
import axios from 'axios'
import fs from 'fs'
import { IpInfo, Proxy } from '../types'
import { SETTINGS } from '../config'

const IP_INFO_URL = 'https://ipinfo.io/json'
const REGEX =
  /^(?<protocol>\w+):\/\/((?<login>[\w-]+):(?<password>[\w-]+)@)?(?<host>[\w.-]+):(?<port>\d+)$/

class ProxyService {
  getProxies() {
    let proxyList: Proxy[] = []

    if (SETTINGS.USE_PROXY_FROM_FILE)
      proxyList = fs
        .readFileSync('proxies.txt', 'utf-8')
        .split(/\r?\n/)
        .map(this.parse)
        .filter((proxy): proxy is Proxy => proxy !== null)

    return proxyList
  }

  getHttpsAgent(proxy: string | Proxy) {
    let proxyString = null

    if (typeof proxy === 'string') proxyString = proxy
    else proxyString = this.stringify(proxy)

    return new SocksProxyAgent(proxyString)
  }

  parse(proxyString: string): Proxy | null {
    const match = proxyString.trim().match(REGEX)

    if (!match || !match.groups) return null

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

      console.log(`${sessionName} | proxy_info: ${ip} | ${country} | ${city} | ${timezone}`)
      return true
    } catch (e) {
      console.log(`Error during connect to proxy: ${sessionName} | IP: ${proxy.host} | error: ${e}`)
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
