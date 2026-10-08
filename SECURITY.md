# Security policy

## Supported versions

Only the latest minor release receives security fixes.

## Reporting a vulnerability

Please report vulnerabilities privately through [GitHub security advisories](https://github.com/alhassan73/open-accessibility-widget/security/advisories/new), not in public issues. Include the affected version, a minimal reproduction and the impact. You can expect a first response within a week.

## Security model

- The widget has no runtime dependencies and makes no network requests.
- It never parses HTML from strings (`innerHTML` is not used), so it runs under Trusted Types.
- Labels, language names and page text are inserted as text nodes. The statement URL and read-mode links accept only http(s), relative and same-scheme URLs (no `javascript:`).
- Settings read from `localStorage` or passed by callers are validated against a fixed schema; unknown keys are ignored.
- `icon` / `logo` DOM elements passed in options are cloned as-is: only pass elements you trust.
- Injected `<style>` tags take the `nonce` option for CSP.
