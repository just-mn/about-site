# Contact details and Turnstile

Contact details are served only after the server verifies a Cloudflare Turnstile token. Keep the following values in GitHub Actions secrets; they are written to a `0600` runtime environment file on the deployment host and are never included in the client bundle:

- `TURNSTILE_SITEKEY` — the public Turnstile sitekey.
- `TURNSTILE_SECRET` — the private Turnstile secret key.
- `TURNSTILE_HOSTNAME` — the production hostname configured in Turnstile.
- `CONTACT_LINKS_JSON` — one JSON array with every contact row. This is the preferred option: add, remove, or reorder rows by changing this one secret, without changing code. The deploy workflow base64-encodes it before placing it in the server's environment file.

For example, create one GitHub Actions secret named `CONTACT_LINKS_JSON` with this single-line value:

```json
[
  { "label": "email", "value": "hello@example.com", "href": "mailto:hello@example.com" },
  { "label": "telegram", "value": "@justmn", "href": "https://t.me/justmn" },
  { "label": "github", "value": "justmn", "href": "https://github.com/justmn" },
  { "label": "discord", "value": "@justmn", "href": "https://discord.com/users/123" }
]
```

Every item needs `label`, `value`, and `href`. `https`, `http`, `mailto`, and `tel` links are allowed. An empty array (`[]`) intentionally shows no links. Invalid JSON makes the API return an error rather than revealing an incomplete list.

For local development, the server uses Cloudflare's always-pass test credentials. Production requires the GitHub secrets above. Keep `CONTACT_LINKS_JSON` on one line.
