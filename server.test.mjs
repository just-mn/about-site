import assert from 'node:assert/strict'
import { once } from 'node:events'
import test from 'node:test'
import { createAppServer } from './server.mjs'

async function withServer(options, run) {
  const server = createAppServer(options)
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')

  try {
    return await run(server)
  } finally {
    server.close()
    await once(server, 'close')
  }
}

function getServerUrl(server, path) {
  const { port } = server.address()
  return `http://127.0.0.1:${port}${path}`
}

test('does not expose a Turnstile site key when production configuration is incomplete', async () => {
  await withServer({ env: { NODE_ENV: 'production' } }, async (server) => {
    const response = await fetch(getServerUrl(server, '/api/turnstile-config'))

    assert.equal(response.status, 503)
    assert.deepEqual(await response.json(), {
      error: 'Contact verification is not configured.',
    })
  })
})

test('returns contacts only after a successful production Turnstile verification', async () => {
  const verificationCalls = []
  const env = {
    NODE_ENV: 'production',
    TURNSTILE_HOSTNAME: 'about.example.com',
    TURNSTILE_SECRET: 'private-secret',
    TURNSTILE_SITEKEY: 'public-site-key',
    CONTACT_LINKS_JSON: JSON.stringify([
      { label: 'email', value: 'hello@example.com', href: 'mailto:hello@example.com' },
    ]),
  }

  await withServer(
    {
      env,
      fetchImplementation: async (url, options) => {
        verificationCalls.push({ options, url })
        return {
          json: async () => ({
            action: 'view_contacts',
            hostname: 'about.example.com',
            success: true,
          }),
        }
      },
    },
    async (server) => {
      const response = await fetch(getServerUrl(server, '/api/contacts'), {
        body: JSON.stringify({ token: 'verified-token' }),
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '203.0.113.10, 198.51.100.4',
        },
        method: 'POST',
      })

      assert.equal(response.status, 200)
      assert.deepEqual(await response.json(), {
        contacts: [
          { label: 'email', value: 'hello@example.com', href: 'mailto:hello@example.com' },
        ],
      })
    },
  )

  assert.equal(verificationCalls.length, 1)
  assert.equal(
    verificationCalls[0].url,
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
  )
  assert.equal(verificationCalls[0].options.method, 'POST')
  assert.deepEqual(Object.fromEntries(verificationCalls[0].options.body), {
    remoteip: '203.0.113.10',
    response: 'verified-token',
    secret: 'private-secret',
  })
})

test('rejects malformed requests and failed Turnstile responses', async () => {
  const env = {
    NODE_ENV: 'production',
    TURNSTILE_HOSTNAME: 'about.example.com',
    TURNSTILE_SECRET: 'private-secret',
    TURNSTILE_SITEKEY: 'public-site-key',
  }

  await withServer(
    {
      env,
      fetchImplementation: async () => ({
        json: async () => ({
          action: 'view_contacts',
          hostname: 'unexpected.example.com',
          success: true,
        }),
      }),
    },
    async (server) => {
      const malformedResponse = await fetch(getServerUrl(server, '/api/contacts'), {
        body: '{',
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      assert.equal(malformedResponse.status, 400)

      const failedVerificationResponse = await fetch(getServerUrl(server, '/api/contacts'), {
        body: JSON.stringify({ token: 'verified-token' }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      assert.equal(failedVerificationResponse.status, 403)
      assert.deepEqual(await failedVerificationResponse.json(), {
        error: 'Verification failed. Please try again.',
      })
    },
  )
})
