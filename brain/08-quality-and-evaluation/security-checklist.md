# Security Checklist

> **Load when:** a diff touches input handling, auth, data access, secrets, files, or external calls.
> Facts: `06-project-knowledge/security-model.md`. Agent rules: `04-harness-engineering/tools/safety-guardrails.md`.

## Input and output

- [ ] All untrusted input parsed/validated at the boundary (type, length, range, format).
- [ ] Queries parameterized; no string-built SQL/NoSQL/shell/paths.
- [ ] Output encoded for its context (HTML, attributes, URLs, JSON); raw HTML only from sanitized sources.
- [ ] File uploads: type/size limits, stored outside web root or with safe names, never executed.
- [ ] Redirect targets allow-listed (no open redirects).

## Authentication and authorization

- [ ] Every new endpoint/action checks authn **and** authz server-side.
- [ ] Object-level checks: the user may access *this* record (no IDOR).
- [ ] Tenant isolation preserved, if multi-tenant.
- [ ] No privilege decisions from client-supplied data (roles, prices, IDs of others).

## Secrets and data

- [ ] No secrets in code, logs, errors, client bundles, or URLs.
- [ ] PII handled per data classification; minimum data returned to clients.
- [ ] New env vars/secrets approved and documented by name only.

## Web specifics (if applicable)

- [ ] CSRF protection on state-changing requests using cookies.
- [ ] Cookies: `HttpOnly`, `Secure`, `SameSite` as appropriate.
- [ ] CORS not widened; security headers unchanged or strengthened.

## Dependencies and integrations

- [ ] New dependencies approved; no known critical advisories.
- [ ] Webhooks verify signatures; external calls have timeouts.
- [ ] Rate limiting on auth and expensive endpoints.

## Errors and logging

- [ ] Errors to users reveal nothing internal; detail goes to logs.
- [ ] Security-relevant events logged (login failure, permission denied) without sensitive data.
