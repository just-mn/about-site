# Contact details and Turnstile

Contact details are served only after the server verifies a Cloudflare Turnstile token. Keep the following values in GitHub Actions secrets; they are written to a `0600` runtime environment file on the deployment host and are never included in the client bundle:

- `TURNSTILE_SITEKEY` — the public Turnstile sitekey.
- `TURNSTILE_SECRET` — the private Turnstile secret key.
- `TURNSTILE_HOSTNAME` — the production hostname configured in Turnstile.
- `CONTACT_EMAIL`, `CONTACT_TELEGRAM`, `CONTACT_GITHUB` — values to reveal after verification.
- `CONTACT_OTHER_LABEL`, `CONTACT_OTHER_VALUE`, `CONTACT_OTHER_URL` — optional extra contact row.

For local development, the server uses Cloudflare's always-pass test credentials. Production requires the GitHub secrets above. All contact values must be single-line strings.
