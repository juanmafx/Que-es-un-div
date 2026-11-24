import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ISSUE, MAX_TAG_LENGTH, parseDivTag } from '../../assets/scripts/domain/div-tag.js';

describe('parseDivTag: valid tags', () => {
  it('parses a bare div', () => {
    assert.deepEqual(parseDivTag('<div>'), { valid: true, id: null, classes: [], issues: [] });
  });

  it('reads the id and every class', () => {
    const result = parseDivTag('<div class="card featured" id="profile">');
    assert.equal(result.valid, true);
    assert.equal(result.id, 'profile');
    assert.deepEqual(result.classes, ['card', 'featured']);
  });

  it('accepts single-quoted and unquoted values', () => {
    const result = parseDivTag("<div class='a b' id=main>");
    assert.equal(result.id, 'main');
    assert.deepEqual(result.classes, ['a', 'b']);
  });

  it('is case-insensitive for tag and attribute names', () => {
    const result = parseDivTag('<DIV ID="Main" CLASS="Box">');
    assert.equal(result.valid, true);
    assert.equal(result.id, 'Main');
    assert.deepEqual(result.classes, ['Box']);
  });

  it('tolerates whitespace around equals signs and the tag', () => {
    const result = parseDivTag('  <div\n  id = "x"\tclass = "y" >  ');
    assert.equal(result.valid, true);
    assert.equal(result.id, 'x');
    assert.deepEqual(result.classes, ['y']);
  });

  it('accepts an immediate closing tag', () => {
    assert.equal(parseDivTag('<div id="x"></div>').valid, true);
  });

  for (const value of ['<div></div >', '<div></DIV\n>', '<div> </div>']) {
    it(`accepts the closing tag in ${JSON.stringify(value)}`, () => {
      assert.equal(parseDivTag(value).valid, true);
    });
  }

  it('keeps a slash in an unquoted value, as HTML does', () => {
    const result = parseDivTag('<div id=x/>');
    assert.equal(result.valid, true);
    assert.equal(result.id, 'x/');
  });

  it('allows a non-breaking space inside an id', () => {
    assert.equal(parseDivTag('<div id="a\u00a0b">').valid, true);
  });

  it('removes repeated class names', () => {
    assert.deepEqual(parseDivTag('<div class="a a  b">').classes, ['a', 'b']);
  });

  it('treats a greater-than sign inside quotes as part of the value', () => {
    const result = parseDivTag('<div title="a>b" id="x">');
    assert.equal(result.valid, true);
    assert.equal(result.id, 'x');
  });

  it('accepts boolean attributes', () => {
    assert.equal(parseDivTag('<div hidden id="x">').valid, true);
  });
});

describe('parseDivTag: rejected input', () => {
  for (const value of [undefined, null, 42, {}, [], '', 'div', '<span>', '<divider>', '</div>']) {
    it(`rejects ${JSON.stringify(value) ?? 'undefined'}`, () => {
      assert.deepEqual(parseDivTag(value).issues, [ISSUE.NOT_A_DIV]);
    });
  }

  it('rejects input over the length limit', () => {
    const input = `<div class="${'a'.repeat(MAX_TAG_LENGTH)}">`;
    assert.deepEqual(parseDivTag(input).issues, [ISSUE.TOO_LONG]);
  });

  it('accepts input at exactly the length limit', () => {
    const input = `<div class="${'a'.repeat(MAX_TAG_LENGTH - 14)}">`;
    assert.equal(input.length, MAX_TAG_LENGTH);
    assert.equal(parseDivTag(input).valid, true);
  });

  it('flags a missing closing bracket', () => {
    assert.ok(parseDivTag('<div id="x"').issues.includes(ISSUE.UNTERMINATED));
  });

  it('flags an unterminated quote', () => {
    assert.ok(parseDivTag('<div id="x>').issues.includes(ISSUE.UNTERMINATED));
  });

  it('flags a self-closing div', () => {
    assert.ok(parseDivTag('<div id="x"/>').issues.includes(ISSUE.SELF_CLOSING));
  });

  it('flags a stray equals sign', () => {
    assert.ok(parseDivTag('<div ="x">').issues.includes(ISSUE.MALFORMED_ATTRIBUTE));
  });

  it('flags trailing content', () => {
    assert.ok(parseDivTag('<div>text').issues.includes(ISSUE.TRAILING_CONTENT));
  });

  for (const value of [
    '<div class="a"id="b">',
    '<div id="a"b="c">',
    '<div "x">',
    '<div <span>',
    '<div a"b="c">',
    "<div a'b>",
    '<div id=a"b>',
    "<div id=a'b>",
    '<div id=a=b>',
    '<div id=a<b>',
    '<div id=a`b>',
    '<div / id="x">',
    '<div / >',
    '<div class=>',
    '<div id=>',
  ]) {
    it(`flags malformed attribute syntax in ${value}`, () => {
      const result = parseDivTag(value);
      assert.equal(result.valid, false);
      assert.ok(result.issues.includes(ISSUE.MALFORMED_ATTRIBUTE));
    });
  }

  for (const value of ['\u00a0<div>', '<div>\u00a0', '<div\u00a0id="x">']) {
    it(`does not treat a non-breaking space as tag whitespace in ${JSON.stringify(value)}`, () => {
      assert.equal(parseDivTag(value).valid, false);
    });
  }
});

describe('parseDivTag: id and class rules', () => {
  it('flags a second id and keeps the first', () => {
    const result = parseDivTag('<div id="first" id="second">');
    assert.equal(result.id, 'first');
    assert.ok(result.issues.includes(ISSUE.DUPLICATE_ID));
  });

  it('flags a second class attribute and keeps the first', () => {
    const result = parseDivTag('<div class="first" class="second">');
    assert.deepEqual(result.classes, ['first']);
    assert.ok(result.issues.includes(ISSUE.DUPLICATE_CLASS_ATTRIBUTE));
  });

  it('flags other repeated attributes', () => {
    assert.ok(parseDivTag('<div title="a" title="b">').issues.includes(ISSUE.DUPLICATE_ATTRIBUTE));
  });

  it('flags an empty id', () => {
    assert.ok(parseDivTag('<div id="">').issues.includes(ISSUE.EMPTY_ID));
  });

  it('flags an id containing whitespace', () => {
    assert.ok(parseDivTag('<div id="two words">').issues.includes(ISSUE.ID_HAS_WHITESPACE));
  });

  it('is safe with attribute names matching object prototype keys', () => {
    const result = parseDivTag('<div __proto__="x" constructor="y">');
    assert.equal(result.valid, true);
    assert.equal(Object.getPrototypeOf(result), Object.prototype);
  });
});

describe('parseDivTag: resource bounds', () => {
  it('handles worst-case input at the limit quickly', () => {
    const inputs = [
      `<div ${'a '.repeat(247)}>`,
      `<div ${'='.repeat(494)}>`,
      `<div ${'/'.repeat(494)}>`,
      `<div class="${' '.repeat(486)}">`,
    ];
    const startedAt = performance.now();
    for (const input of inputs) parseDivTag(input);
    assert.ok(performance.now() - startedAt < 250);
  });
});
