# Release Notes: 1.0.0

This is the first versioned release of a small lesson page originally created in 2016. It is now fully in English, has no runtime dependencies, and is covered by automated tests.

## Highlights

- Rewritten lesson with accurate examples.
- New in-browser checker for opening `div` tags.
- Bootstrap 3 removed in favor of a small CSS Grid layout.
- Strict content security policy with no inline code.
- Responsive layout and dark mode.

## Breaking changes

- Demo ids and stylesheet paths changed.
- The legacy root stylesheets and the bitmap preview no longer exist.

## Verification

The results of the test run are in [reports/tests/summary.md](reports/tests/summary.md). The security review is in [docs/SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md).

## Upgrade

Replace the deployed files with this version and serve the repository root.
