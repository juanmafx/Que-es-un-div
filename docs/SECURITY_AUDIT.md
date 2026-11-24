# Security Audit

- **Date:** 2026-11-24
- **Scope:** the `modernize/2026` working tree and its full Git history
- **Type:** secret scan, dependency audit, HTML validation, browser check and manual code review. This was not an independent penetration test.

## Attack surface

A static page with one text input, processed only in the browser. There is no backend, authentication, form submission, cookie, storage or third-party request. Because there is no contact form or account system, two-factor authentication and credential hashing do not apply.

## Fixed findings

| Severity | Finding | Resolution |
| --- | --- | --- |
| Medium | End-of-life Bootstrap 3.0.3 stylesheet committed to the repository | Removed and replaced with a small CSS Grid layout |
| Low | No content security policy | Added a deny-by-default policy with no unsafe sources |
| Low | No referrer policy | Added `no-referrer` |
| Low | The credit linked over HTTP to a domain that no longer resolves (NXDOMAIN from two public resolvers), so a future registrant could control the target | Removed the link and kept the credit as plain text |
| Low | The checker reported malformed attribute syntax as a valid tag | The parser now applies the HTML tokenizer's attribute rules |
| Low | The optional schema accepted impossible dates and non-hex commit hashes | Tightened the `CHECK` constraints |
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
| `npm audit signatures` | No invalid signatures reported |
| `gitleaks` 8.30.1 with `--redact` on the full branch history | 0 findings |
| Email address patterns across all history blobs | 0 matches |
| Private key or environment files in history | None found |
| `html-validate` on the page after the checker renders | No content model errors |
| Page load in headless Chrome 157 | Checker ran, no policy violations logged |
| Hostile markup in the checker | Rendered as inert text by an automated test |

Secret scanners can miss values that do not match a known format.

## Open items and accepted limitations

| Severity | Item | Status |
| --- | --- | --- |
| Low | GitHub Pages cannot send custom headers, so `frame-ancestors` and `nosniff` are not enforced there | Accepted. The page has no sensitive actions |
| Info | Private vulnerability reporting is not enabled on the repository | Owner decision. `SECURITY.md` describes the fallback |
| Info | Removed legacy files remain in Git history | Accepted. No secrets were found in them |
