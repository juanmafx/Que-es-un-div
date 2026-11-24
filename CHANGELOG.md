# Changelog

All notable changes are documented here. This project follows [Semantic Versioning](https://semver.org/).

## [1.0.1] - 2026-11-24

### Changed

- Documentation corrections: the security audit now records that removed legacy files are no longer in the published history. No code behaviour change.

## [1.0.0] - 2026-11-24

First versioned release. The original 2016 page was unversioned.

### Added

- Interactive div tag checker with a tested, linear parser.
- Unit, DOM and schema test suites with a committed report.
- GitHub Actions CI with read-only permissions and pinned actions.
- Optional SQLite schema for test results.
- Architecture, security and release documentation.

### Changed

- **Breaking:** translated all content and identifiers to English.
- **Breaking:** renamed the demo ids and moved styles to `assets/styles/`.
- Rebuilt the layout with CSS Grid and added responsive and dark mode styles.
- Raised demo box text contrast.
- Replaced the 1.3 MB bitmap preview with an optimized PNG of the current page.

### Fixed

- Demo labels now match each box's real markup.
- The lesson text now names the actual box colors.
- Removed an intro style rule that never applied because its selector targeted the wrong attribute.
- The checker now flags malformed attribute syntax and accepts whitespace inside a closing tag.
- The checker result region now uses markup that permits its block content.
- The optional schema now rejects impossible dates and commit hashes that are not lowercase hex.

### Removed

- End-of-life Bootstrap 3.0.3 stylesheet and the unused template stylesheet.

### Security

- Added a strict content security policy and referrer policy.
- Replaced the link to the credited domain, which no longer resolves, with a plain-text credit.
