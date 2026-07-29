import assert from 'node:assert/strict'
import test from 'node:test'
import { parseConfiguredContactLinks } from './contact-links.mjs'

test('parses any supported contact link type', () => {
  const result = parseConfiguredContactLinks(
    JSON.stringify([
      { label: 'email', value: 'hello@example.com', href: 'mailto:hello@example.com' },
      { label: 'discord', value: '@justmn', href: 'https://discord.com/users/123' },
      { label: 'phone', value: '+7 999 123-45-67', href: 'tel:+79991234567' },
    ]),
  )

  assert.deepEqual(result, {
    isConfigured: true,
    links: [
      { label: 'email', value: 'hello@example.com', href: 'mailto:hello@example.com' },
      { label: 'discord', value: '@justmn', href: 'https://discord.com/users/123' },
      { label: 'phone', value: '+7 999 123-45-67', href: 'tel:+79991234567' },
    ],
  })
})

test('omits malformed and unsafe entries without dropping valid links', () => {
  const result = parseConfiguredContactLinks(
    JSON.stringify([
      { label: 'website', value: 'example.com', href: 'https://example.com' },
      { label: 'unsafe', value: 'nope', href: 'javascript:alert(1)' },
      { label: '', value: 'missing label', href: 'https://example.com' },
    ]),
  )

  assert.deepEqual(result, {
    isConfigured: true,
    links: [{ label: 'website', value: 'example.com', href: 'https://example.com/' }],
  })
})

test('reports invalid JSON and accepts an intentionally empty list', () => {
  assert.deepEqual(parseConfiguredContactLinks('{not json'), {
    isConfigured: true,
    error: 'CONTACT_LINKS_JSON must contain a valid JSON array.',
    links: [],
  })

  assert.deepEqual(parseConfiguredContactLinks('[]'), { isConfigured: true, links: [] })
})
