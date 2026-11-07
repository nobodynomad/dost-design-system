import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../../../../', import.meta.url);
const theme = 'www/themes/morph/';
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const names = readdirSync(new URL(`${theme}src/images/icons/`, root))
  .filter((name) => name.endsWith('.svg')).map((name) => name.slice(0, -4));
const sprite = read(`${theme}assets/images/sprite.svg`);
const symbols = new Set([...sprite.matchAll(/<symbol\b[^>]*\bid="([^"]+)"/g)].map((match) => match[1]));

test('the Fluent source SVGs build into a complete sprite without external content', () => {
  assert.deepEqual([...symbols].sort(), names.map((name) => `icon-${name}`).sort());
  assert.match(read(`${theme}src/images/icons/LICENSE`), /Copyright \(c\) 2020 Microsoft Corporation/);
  assert.equal(read(`${theme}assets/images/LICENSE`), read(`${theme}src/images/icons/LICENSE`));
  for (const name of names) {
    const source = read(`${theme}src/images/icons/${name}.svg`);
    assert.match(source, /viewBox="0 0 24 24"/, name);
    assert.match(source, /<path\b[^>]*\bd="[^"]+"/, name);
    assert.doesNotMatch(source, /<script|<foreignObject|\bon\w+=|(?:href|xlink:href)=/i, name);
  }
});

test('all page, PHP and dynamic component icon references resolve to the shared sprite', () => {
  const guide = read('design-system.html');
  for (const page of ['dost-model.html', 'design-system.html', 'typography.html']) {
    const html = read(page);
    assert.doesNotMatch(html, /<symbol\b|model-assets\/(?:navigation|specifications)\/[^"\s]+\.svg/);
    for (const [, href, id] of html.matchAll(/<use\b[^>]*href="([^"#]*)#(icon-[^"]+)"/g)) {
      assert.match(href, /^www\/themes\/morph\/assets\/images\/sprite\.svg(?:\?[^#]+)?$/, page);
      assert.ok(symbols.has(id), `${page}: missing ${id}`);
    }
  }
  for (const name of names) assert.ok(guide.includes(`#icon-${name}"`), `Missing gallery example: ${name}`);
  const php = read(`${theme}design-system.php`);
  for (const [, id] of php.matchAll(/'icon'\s*=>\s*'(icon-[^']+)'/g)) assert.ok(symbols.has(id), id);
  const input = read(`${theme}src/scripts/components/input-text.js`);
  for (const [, id] of input.matchAll(/['"](icon-[a-z-]+(?:regular|filled))['"]/g)) assert.ok(symbols.has(id), id);
  for (const platform of ['Facebook', 'Instagram', 'YouTube']) {
    assert.ok(read('dost-model.html').includes(`<span>${platform}</span>`), 'Generic social icons need visible platform names');
  }
});
