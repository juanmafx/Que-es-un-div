import { ISSUE } from '../domain/div-tag.js';

export const ISSUE_MESSAGES = Object.freeze({
  [ISSUE.NOT_A_DIV]: 'This is not an opening div tag.',
  [ISSUE.TOO_LONG]: 'The tag is too long to check.',
  [ISSUE.UNTERMINATED]: 'The tag or one of its quoted values is never closed.',
  [ISSUE.SELF_CLOSING]: 'A div cannot self-close. Use a separate closing tag.',
  [ISSUE.MALFORMED_ATTRIBUTE]: 'An attribute is malformed.',
  [ISSUE.DUPLICATE_ID]: 'A div can have only one id. Browsers keep the first.',
  [ISSUE.DUPLICATE_CLASS_ATTRIBUTE]: 'Put all classes in one class attribute. Browsers keep the first.',
  [ISSUE.DUPLICATE_ATTRIBUTE]: 'An attribute is repeated. Browsers keep the first.',
  [ISSUE.EMPTY_ID]: 'The id must not be empty.',
  [ISSUE.ID_HAS_WHITESPACE]: 'The id must not contain whitespace.',
  [ISSUE.TRAILING_CONTENT]: 'There is unexpected content after the tag.',
});
