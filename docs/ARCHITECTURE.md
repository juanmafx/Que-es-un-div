# Architecture

## Context

Que-es-un-div is a static lesson page. It has no server code, so it is not split into `frontend/` and `backend/`. The whole application is client-side and is served from the repository root, which keeps the existing GitHub Pages URL structure.

## Module structure

```text
assets/scripts/
├── main.js                 Finds the mount point and starts the UI
├── domain/
│   └── div-tag.js          parseDivTag, issue codes, input limit
└── ui/
    ├── issue-messages.js   Maps issue codes to English messages
    └── tag-inspector.js    Binds the input and renders results
assets/styles/
├── base.css                Design tokens, dark mode, element defaults
├── layout.css              Page width and section rhythm
├── demo.css                The three-box grid
└── inspector.css           The tag checker
```

## Dependency rule

Dependencies point one way:

```text
main.js -> ui/tag-inspector.js -> ui/issue-messages.js -> domain/div-tag.js
                               -> domain/div-tag.js
```

`domain/` has no DOM access and imports nothing, so it runs unchanged in Node.js and in the browser.

## Data flow

```text
input event -> parseDivTag(value) -> { valid, id, classes, issues } -> renderInspection -> DOM text nodes
```

## Design decisions

| Decision | Reason |
| --- | --- |
| No framework or build step | The page is small, and shipped source stays readable for learners |
| Replaced Bootstrap with CSS Grid | The page used only a few grid classes from a 124 KB end-of-life stylesheet |
| Hand-written linear scanner | Predictable running time on untrusted input, with no backtracking regular expressions |
| Issue codes separate from messages | Parsing logic can be tested without depending on UI text |
| `Map` for parsed attributes | Attribute names such as `__proto__` remain plain data |
| Parser keeps the first duplicate attribute | Matches how HTML parsers treat duplicates |

## Recommended deployment

Serve the repository root as static files from GitHub Pages or any static host. A host that supports custom headers should also send the policy as a `Content-Security-Policy` header with `frame-ancestors 'none'`, plus `X-Content-Type-Options: nosniff`.

## Persistence

The application stores nothing. `db/schema.sql` is an optional SQLite schema with two tables, `test_runs` and `test_case_results`, for keeping test history outside the repository.

## Testing strategy

| Suite | Location | Verifies |
| --- | --- | --- |
| Unit | `tests/unit/` | Parser rules, rejected input, resource bounds |
| DOM | `tests/dom/` | Page structure, security policy, inspector behavior |
| Schema | `tests/db/` | Schema creation and constraints on in-memory SQLite |
