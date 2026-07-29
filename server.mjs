import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseConfiguredContactLinks } from './contact-links.mjs'

const developmentSiteKey = '1x00000000000000000000AA'
const developmentSecret = '1x0000000000000000000000000000000AA'

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
}

function json(response, status, body) {
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  })
  response.end(JSON.stringify(body))
}

function getClientIp(request) {
  return request.headers['x-forwarded-for']?.split(',')[0]?.trim() || request.socket.remoteAddress
}

async function readJson(request) {
  let body = ''
  for await (const chunk of request) {
    body += chunk
    if (body.length > 4096) throw new Error('Request body is too large')
  }

  return JSON.parse(body)
}

async function serveStatic(request, response, pathname, publicDirectory) {
  const requestedPath = pathname === '/' ? 'index.html' : pathname.slice(1)
  const safePath = normalize(requestedPath).replace(/^(\.\.([/\\]|$))+/, '')
  let filePath = join(publicDirectory, safePath)

  try {
    const file = await stat(filePath)
    if (!file.isFile()) throw new Error('Not a file')
  } catch {
    filePath = join(publicDirectory, 'index.html')
  }

  response.writeHead(200, {
    'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
  })
  createReadStream(filePath).pipe(response)
}

export function createAppServer({
  env = process.env,
  fetchImplementation = fetch,
  publicDirectory = join(process.cwd(), 'dist'),
} = {}) {
  const isProduction = env.NODE_ENV === 'production'

  function getConfiguration() {
    const siteKey = env.TURNSTILE_SITEKEY || (isProduction ? '' : developmentSiteKey)
    const secret = env.TURNSTILE_SECRET || (isProduction ? '' : developmentSecret)
    const hostname = env.TURNSTILE_HOSTNAME || ''

    return { hostname, secret, siteKey }
  }

  function isTurnstileConfigured({ hostname, secret, siteKey }) {
    if (!siteKey || !secret) return false
    if (!isProduction) return true

    return Boolean(hostname) && siteKey !== developmentSiteKey && secret !== developmentSecret
  }

  function getContactLinks() {
    const configuredLinks = parseConfiguredContactLinks(
      env.CONTACT_LINKS_B64
        ? Buffer.from(env.CONTACT_LINKS_B64, 'base64').toString('utf8')
        : env.CONTACT_LINKS_JSON,
    )
    if (configuredLinks.isConfigured) {
      if (configuredLinks.error) throw new Error(configuredLinks.error)
      return configuredLinks.links
    }
    throw new Error('CONTACT_LINKS_JSON is not configured.')
  }

  async function verifyTurnstile(token, request) {
    const configuration = getConfiguration()
    const { hostname, secret } = configuration
    if (!isTurnstileConfigured(configuration) || typeof token !== 'string' || token.length > 2048) {
      return false
    }

    const formData = new URLSearchParams({ secret, response: token })
    const remoteIp = getClientIp(request)
    if (remoteIp) formData.set('remoteip', remoteIp)

    const response = await fetchImplementation(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
        signal: AbortSignal.timeout(10_000),
      },
    )
    const result = await response.json()
    const isDevelopmentTestSecret = !isProduction && secret === developmentSecret

    return (
      result.success &&
      (isDevelopmentTestSecret || result.action === 'view_contacts') &&
      (!isProduction || result.hostname === hostname)
    )
  }

  return createServer(async (request, response) => {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)

    if (request.method === 'GET' && url.pathname === '/api/turnstile-config') {
      const configuration = getConfiguration()
      if (!isTurnstileConfigured(configuration)) {
        return json(response, 503, { error: 'Contact verification is not configured.' })
      }
      const { siteKey } = configuration
      return json(response, 200, { siteKey })
    }

    if (request.method === 'POST' && url.pathname === '/api/contacts') {
      try {
        const { token } = await readJson(request)
        const verified = await verifyTurnstile(token, request)
        if (!verified)
          return json(response, 403, { error: 'Verification failed. Please try again.' })

        return json(response, 200, { contacts: getContactLinks() })
      } catch {
        return json(response, 400, { error: 'Could not verify this request. Please try again.' })
      }
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return json(response, 405, { error: 'Method not allowed.' })
    }

    return serveStatic(request, response, url.pathname, publicDirectory)
  })
}

export function startServer() {
  const port = Number(process.env.PORT || 80)
  return createAppServer().listen(port, () => {
    console.log(`About site is listening on port ${port}`)
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  startServer()
}
