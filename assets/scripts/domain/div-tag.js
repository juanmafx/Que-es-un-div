export const MAX_TAG_LENGTH = 500;

export const ISSUE = Object.freeze({
  NOT_A_DIV: 'not-a-div',
  TOO_LONG: 'too-long',
  UNTERMINATED: 'unterminated',
  SELF_CLOSING: 'self-closing',
  MALFORMED_ATTRIBUTE: 'malformed-attribute',
  DUPLICATE_ID: 'duplicate-id',
  DUPLICATE_CLASS_ATTRIBUTE: 'duplicate-class-attribute',
  DUPLICATE_ATTRIBUTE: 'duplicate-attribute',
  EMPTY_ID: 'empty-id',
  ID_HAS_WHITESPACE: 'id-has-whitespace',
  TRAILING_CONTENT: 'trailing-content',
});

const DUPLICATE_ISSUES = new Map([
  ['id', ISSUE.DUPLICATE_ID],
  ['class', ISSUE.DUPLICATE_CLASS_ATTRIBUTE],
]);

const isWhitespace = (character) =>
  character === ' ' || character === '\t' || character === '\n' || character === '\f' || character === '\r';

const isNameBoundary = (character) =>
  isWhitespace(character) || character === '=' || character === '>' || character === '/';

const skipWhitespace = (source, start) => {
  let index = start;
  while (index < source.length && isWhitespace(source[index])) index += 1;
  return index;
};

const startsWithDivTag = (source) => {
  if (source.slice(0, 4).toLowerCase() !== '<div') return false;
  const next = source[4];
  return next === undefined || isWhitespace(next) || next === '>' || next === '/';
};

const readValue = (source, start) => {
  const quote = source[start];
  if (quote === '"' || quote === "'") {
    const end = source.indexOf(quote, start + 1);
    if (end === -1) return { terminated: false, value: '', next: source.length };
    return { terminated: true, value: source.slice(start + 1, end), next: end + 1 };
  }
  let index = start;
  while (index < source.length && !isWhitespace(source[index]) && source[index] !== '>') index += 1;
  return { terminated: true, value: source.slice(start, index), next: index };
};

const scanAttributes = (source) => {
  const attributes = new Map();
  const issues = new Set();
  let index = 4;

  while (true) {
    index = skipWhitespace(source, index);
    if (index >= source.length) {
      issues.add(ISSUE.UNTERMINATED);
      return { attributes, issues, end: index };
    }
    const character = source[index];
    if (character === '>') return { attributes, issues, end: index + 1 };
    if (character === '/') {
      if (source[index + 1] === '>') {
        issues.add(ISSUE.SELF_CLOSING);
        return { attributes, issues, end: index + 2 };
      }
      index += 1;
      continue;
    }
    if (character === '=') {
      issues.add(ISSUE.MALFORMED_ATTRIBUTE);
      index += 1;
      continue;
    }

    const nameStart = index;
    while (index < source.length && !isNameBoundary(source[index])) index += 1;
    const name = source.slice(nameStart, index).toLowerCase();

    let value = '';
    const afterName = skipWhitespace(source, index);
    if (source[afterName] === '=') {
      const valueStart = skipWhitespace(source, afterName + 1);
      const parsed = readValue(source, valueStart);
      if (!parsed.terminated) {
        issues.add(ISSUE.UNTERMINATED);
        return { attributes, issues, end: source.length };
      }
      value = parsed.value;
      index = parsed.next;
    }

    if (attributes.has(name)) {
      issues.add(DUPLICATE_ISSUES.get(name) ?? ISSUE.DUPLICATE_ATTRIBUTE);
    } else {
      attributes.set(name, value);
    }
  }
};

const splitClasses = (value) => [...new Set(value.split(/[ \t\n\f\r]+/).filter(Boolean))];

const hasWhitespace = (value) => [...value].some(isWhitespace);

const buildResult = (id, classes, issues) => ({
  valid: issues.length === 0,
  id,
  classes,
  issues,
});

export function parseDivTag(input) {
  if (typeof input !== 'string') return buildResult(null, [], [ISSUE.NOT_A_DIV]);
  if (input.length > MAX_TAG_LENGTH) return buildResult(null, [], [ISSUE.TOO_LONG]);

  const source = input.trim();
  if (!startsWithDivTag(source)) return buildResult(null, [], [ISSUE.NOT_A_DIV]);

  const { attributes, issues, end } = scanAttributes(source);
  const trailing = source.slice(end).trim();
  if (trailing !== '' && trailing.toLowerCase() !== '</div>') issues.add(ISSUE.TRAILING_CONTENT);

  const id = attributes.has('id') ? attributes.get('id') : null;
  if (id === '') issues.add(ISSUE.EMPTY_ID);
  if (id !== null && hasWhitespace(id)) issues.add(ISSUE.ID_HAS_WHITESPACE);

  return buildResult(id, splitClasses(attributes.get('class') ?? ''), [...issues]);
}
