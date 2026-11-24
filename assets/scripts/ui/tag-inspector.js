import { parseDivTag } from '../domain/div-tag.js';
import { ISSUE_MESSAGES } from './issue-messages.js';

const appendDefinition = (documentRef, list, term, description) => {
  const termElement = documentRef.createElement('dt');
  termElement.textContent = term;
  const descriptionElement = documentRef.createElement('dd');
  descriptionElement.textContent = description;
  list.append(termElement, descriptionElement);
};

export function renderInspection(output, result) {
  const documentRef = output.ownerDocument;

  const status = documentRef.createElement('p');
  status.className = `inspector-status inspector-status--${result.valid ? 'valid' : 'invalid'}`;
  status.textContent = result.valid ? 'Valid div tag' : 'Needs attention';

  const details = documentRef.createElement('dl');
  appendDefinition(documentRef, details, 'id', result.id ?? 'none');
  appendDefinition(documentRef, details, 'classes', result.classes.join(', ') || 'none');

  const nodes = [status, details];
  if (result.issues.length > 0) {
    const issues = documentRef.createElement('ul');
    for (const issue of result.issues) {
      const item = documentRef.createElement('li');
      item.textContent = ISSUE_MESSAGES[issue];
      issues.append(item);
    }
    nodes.push(issues);
  }

  output.replaceChildren(...nodes);
}

export function mountTagInspector(root) {
  if (!root) return;
  const input = root.querySelector('[data-tag-input]');
  const output = root.querySelector('[data-tag-output]');
  if (!input || !output) return;

  const update = () => renderInspection(output, parseDivTag(input.value));
  input.addEventListener('input', update);
  update();
}
