# Security Audit

- **Date:** 2026-11-23
- **Scope:** the `modernize/2026` working tree and all 33 blobs in the Git history at audit time
- **Type:** automated pattern scan, dependency audit and manual code review. This was not an independent penetration test.

## Attack surface

A static page with one text input, processed only in the browser. There is no backend, authentication, form submission, cookie, storage or third-party request. Because there is no contact form or account system, two-factor authentication and credential hashing do not apply.

## Fixed findings

| Severity | Finding | Resolution |
| --- | --- | --- |
| Medium | End-of-life Bootstrap 3.0.3 stylesheet committed to the repository | Removed and replaced with a small CSS Grid layout |
| Low | No content security policy | Added a deny-by-default policy with no unsafe sources |
| Low | No referrer policy, and the external link passed referrer data | Added `no-referrer` and `rel="noopener noreferrer"` |
| Info | Stylesheet referenced missing font files and contained a commented-out third-party URL | Removed with the legacy stylesheets |

## Controls in the new code

- Output uses `textContent`. No `innerHTML`, `eval` or dynamic code execution is used.
- Parsing is linear and limited to 500 characters.
- Parsed attributes are held in a `Map`, which avoids prototype pollution.
- CI uses read-only permissions, actions pinned to commit hashes, and installs with lifecycle scripts disabled.

## Verification

| Check | Result |
| --- | --- |
| `npm audit` | 0 known vulnerabilities at audit time |
| Secret patterns across all history blobs | 0 matches |
| Email address patterns across all history blobs | 0 matches |
| Private key or environment files in history | None found |
| Page load in headless Chrome 157 | Checker ran, no policy violations logged |
| Hostile markup in the checker | Rendered as inert text by an automated test |

Pattern scanning can miss secrets that do not match a known format.

## Open items and accepted limitations

| Severity | Item | Status |
| --- | --- | --- |
| Low | GitHub Pages cannot send custom headers, so `frame-ancestors` and `nosniff` are not enforced there | Accepted. The page has no sensitive actions |
| Info | The source credit link uses HTTP because HTTPS support on that site was not verified | Accepted. It is a plain outbound link |
| Info | Removed legacy files remain in Git history | Accepted. No secrets were found in them |
