import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import postcss from 'postcss';
import { readTypeMetrics } from '../../../../typography.mjs';

const root = new URL('../../../../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const css = postcss.parse(read('www/themes/morph/assets/styles/main.css'));
const properties = new Map();
css.walkRules(':root', (rule) => {
  if (rule.parent.type === 'root') rule.walkDecls((decl) => properties.set(decl.prop, decl.value));
});
const style = { getPropertyValue: (name) => properties.get(name) || '' };

test('every reference role resolves from the built shared scale at all three sizes', () => {
  const roles = [...read('typography.html').matchAll(/data-type-role="([^"]+)"/g)].map((match) => match[1]);
  const sharedRoles = [...properties.keys()].filter((key) => key.endsWith('-size-desktop'))
    .map((key) => key.slice('--type-'.length, -'-size-desktop'.length));
  assert.deepEqual(roles.toSorted(), sharedRoles.toSorted());
  for (const viewport of ['desktop', 'tablet', 'mobile']) {
    const metrics = Object.fromEntries(roles.map((role) => [role, readTypeMetrics(style, role, viewport, 16)]));
    assert.ok(metrics.display.size > metrics.title.size);
    assert.ok(metrics.title.size > metrics.heading.size);
    assert.ok(metrics.heading.size >= metrics.body.size);
    assert.equal(metrics.body.weight, 300, 'Light is the explicit Bounded body choice');
    assert.equal(metrics.control.size, 16, 'editable controls must not trigger mobile zoom');
    assert.ok(metrics['body-small'].leading >= 1.4);
    for (const metric of Object.values(metrics)) assert.ok(metric.size >= 13);
  }
  assert.equal(readTypeMetrics(style, 'body', 'mobile', 32).size, 32, 'rem values respect the browser font size');
  assert.throws(() => readTypeMetrics(style, 'missing', 'mobile', 16), /invalid typography role/);
});

test('site and reference pages share one stylesheet without local size overrides', () => {
  for (const page of ['dost-model', 'design-system', 'typography']) {
    assert.match(read(`${page}.html`), /href="www\/themes\/morph\/assets\/styles\/main\.css/);
    postcss.parse(read(`${page}.css`)).walkDecls('font-size', (decl) => {
      assert.fail(`${page}.css contains a separate size: ${decl.value}`);
    });
  }
});
