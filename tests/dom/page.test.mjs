import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { mountTagInspector } from '../../assets/scripts/ui/tag-inspector.js';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const html = readFileSync(join(repositoryRoot, 'index.html'), 'utf8');
const loadPage = () => new JSDOM(html).window.document;

const mountedInspector = (value) => {
  const document = loadPage();
  const root = document.querySelector('[data-tag-inspector]');
  const input = root.querySelector('[data-tag-input]');
  const output = root.querySelector('[data-tag-output]');
  mountTagInspector(root);
  if (value !== undefined) {
    input.value = value;
    input.dispatchEvent(new document.defaultView.Event('input'));
  }
  return { document, output };
};

describe('page structure', () => {
  it('declares English', () => {
    assert.equal(loadPage().documentElement.lang, 'en');
  });

  it('has one h1 and one main landmark', () => {
    const document = loadPage();
    assert.equal(document.querySelectorAll('h1').length, 1);
    assert.equal(document.querySelectorAll('main').length, 1);
  });

  it('has unique ids', () => {
    const ids = [...loadPage().querySelectorAll('[id]')].map((element) => element.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it('nests three demo divs in one parent div', () => {
    const grid = loadPage().querySelector('div#demo-grid');
    assert.deepEqual([...grid.children].map((child) => child.tagName), ['DIV', 'DIV', 'DIV']);
  });

  it('shows each demo box its own real opening tag', () => {
    for (const box of loadPage().querySelectorAll('.demo-box')) {
      const expected = `<div class="${box.getAttribute('class')}" id="${box.id}">`;
      assert.equal(box.querySelector('code').textContent, expected);
    }
  });

  it('labels the inspector input', () => {
    const document = loadPage();
    const input = document.querySelector('[data-tag-input]');
    assert.equal(document.querySelector(`label[for="${input.id}"]`).tagName, 'LABEL');
  });

  it('credits the original source', () => {
    const link = loadPage().querySelector('.credits a');
    assert.equal(link.href, 'http://programacionabierta.com/');
  });

  it('states the project history', () => {
    const text = loadPage().querySelector('.credits').textContent;
    assert.match(text, /Originally created in 2016, modernized in 2026/);
  });
});

describe('page security', () => {
  const policy = () =>
    loadPage().querySelector('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');

  it('denies by default in the content security policy', () => {
    assert.match(policy(), /default-src 'none'/);
  });

  for (const directive of ["script-src 'self'", "style-src 'self'", "base-uri 'none'", "form-action 'none'"]) {
    it(`sets ${directive}`, () => {
      assert.ok(policy().includes(directive));
    });
  }

  it('does not allow unsafe sources', () => {
    assert.doesNotMatch(policy(), /unsafe-/);
  });

  it('has no inline scripts, styles or event handlers', () => {
    const document = loadPage();
    assert.equal(document.querySelectorAll('script:not([src]), style, [style]').length, 0);
    for (const element of document.querySelectorAll('*')) {
      for (const { name } of element.attributes) assert.doesNotMatch(name, /^on/i);
    }
  });

  it('isolates external links', () => {
    for (const link of loadPage().querySelectorAll('a[href^="http"]')) {
      assert.match(link.rel, /noopener/);
      assert.match(link.rel, /noreferrer/);
    }
  });

  it('references only local assets that exist', () => {
    const assets = loadPage().querySelectorAll('link[rel="stylesheet"], script[src]');
    assert.ok(assets.length > 0);
    for (const asset of assets) {
      const path = asset.getAttribute('href') ?? asset.getAttribute('src');
      assert.doesNotMatch(path, /^(https?:)?\/\//);
      assert.ok(existsSync(join(repositoryRoot, path)), path);
    }
  });
});

describe('tag inspector', () => {
  it('renders the default tag on mount', () => {
    const { output } = mountedInspector();
    assert.match(output.textContent, /Valid div tag/);
    assert.match(output.textContent, /profile/);
    assert.match(output.textContent, /card, featured/);
  });

  it('updates when the input changes', () => {
    const { output } = mountedInspector('<div id="a" id="b">');
    assert.match(output.textContent, /Needs attention/);
    assert.match(output.textContent, /only one id/);
  });

  it('renders a readable message for every reported issue', () => {
    const { output } = mountedInspector('<span>');
    assert.match(output.querySelector('li').textContent, /not an opening div tag/);
  });

  it('renders hostile values as inert text', () => {
    const payload = '<img src=x onerror=alert(1)>';
    const { output } = mountedInspector(`<div id='${payload}' class='${payload}'>`);
    assert.equal(output.querySelector('img'), null);
    assert.ok(output.querySelector('dd').textContent.includes(payload));
  });

  it('ignores a missing root', () => {
    assert.doesNotThrow(() => mountTagInspector(null));
  });
});
