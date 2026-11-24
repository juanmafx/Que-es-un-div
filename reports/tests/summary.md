# Test Report

- Generated: 2026-11-24T02:18:09.302Z
- Runtime: Node.js v24.22.0 on linux
- Command: `npm run test:report`
- Exit code: 0
- Total: 64
- Passed: 64
- Failed: 0
- Skipped: 0

| Suite | Test | Status |
| --- | --- | --- |
| optional results schema | creates the expected tables | passed |
| optional results schema | can be applied twice | passed |
| optional results schema | stores a run with its results | passed |
| optional results schema | rejects negative counters | passed |
| optional results schema | rejects a malformed timestamp | passed |
| optional results schema | rejects a short commit hash | passed |
| optional results schema | rejects an unknown status | passed |
| optional results schema | rejects results for a missing run | passed |
| optional results schema | removes results with their run | passed |
| page structure | declares English | passed |
| page structure | has one h1 and one main landmark | passed |
| page structure | has unique ids | passed |
| page structure | nests three demo divs in one parent div | passed |
| page structure | shows each demo box its own real opening tag | passed |
| page structure | labels the inspector input | passed |
| page structure | credits the original source | passed |
| page structure | states the project history | passed |
| page security | denies by default in the content security policy | passed |
| page security | sets script-src 'self' | passed |
| page security | sets style-src 'self' | passed |
| page security | sets base-uri 'none' | passed |
| page security | sets form-action 'none' | passed |
| page security | does not allow unsafe sources | passed |
| page security | has no inline scripts, styles or event handlers | passed |
| page security | isolates external links | passed |
| page security | references only local assets that exist | passed |
| tag inspector | renders the default tag on mount | passed |
| tag inspector | updates when the input changes | passed |
| tag inspector | renders a readable message for every reported issue | passed |
| tag inspector | renders hostile values as inert text | passed |
| tag inspector | ignores a missing root | passed |
| parseDivTag: valid tags | parses a bare div | passed |
| parseDivTag: valid tags | reads the id and every class | passed |
| parseDivTag: valid tags | accepts single-quoted and unquoted values | passed |
| parseDivTag: valid tags | is case-insensitive for tag and attribute names | passed |
| parseDivTag: valid tags | tolerates whitespace around equals signs and the tag | passed |
| parseDivTag: valid tags | accepts an immediate closing tag | passed |
| parseDivTag: valid tags | removes repeated class names | passed |
| parseDivTag: valid tags | treats a greater-than sign inside quotes as part of the value | passed |
| parseDivTag: valid tags | accepts boolean attributes | passed |
| parseDivTag: rejected input | rejects undefined | passed |
| parseDivTag: rejected input | rejects null | passed |
| parseDivTag: rejected input | rejects 42 | passed |
| parseDivTag: rejected input | rejects {} | passed |
| parseDivTag: rejected input | rejects [] | passed |
| parseDivTag: rejected input | rejects "" | passed |
| parseDivTag: rejected input | rejects "div" | passed |
| parseDivTag: rejected input | rejects "<span>" | passed |
| parseDivTag: rejected input | rejects "<divider>" | passed |
| parseDivTag: rejected input | rejects "</div>" | passed |
| parseDivTag: rejected input | rejects input over the length limit | passed |
| parseDivTag: rejected input | accepts input at exactly the length limit | passed |
| parseDivTag: rejected input | flags a missing closing bracket | passed |
| parseDivTag: rejected input | flags an unterminated quote | passed |
| parseDivTag: rejected input | flags a self-closing div | passed |
| parseDivTag: rejected input | flags a stray equals sign | passed |
| parseDivTag: rejected input | flags trailing content | passed |
| parseDivTag: id and class rules | flags a second id and keeps the first | passed |
| parseDivTag: id and class rules | flags a second class attribute and keeps the first | passed |
| parseDivTag: id and class rules | flags other repeated attributes | passed |
| parseDivTag: id and class rules | flags an empty id | passed |
| parseDivTag: id and class rules | flags an id containing whitespace | passed |
| parseDivTag: id and class rules | is safe with attribute names matching object prototype keys | passed |
| parseDivTag: resource bounds | handles worst-case input at the limit quickly | passed |
