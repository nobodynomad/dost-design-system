import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const theme = fileURLToPath(new URL('../', import.meta.url));
const html = readFileSync(resolve(theme, '../../../design-system.html'), 'utf8');
const css = readFileSync(resolve(theme, 'assets/styles/main.css'), 'utf8');
const colors = {
	'night': '#252525',
	'night-deep': '#171717',
	'green': '#00362d',
	'green-deep': '#001b16',
	'white': '#fff',
	'gray': '#c4c4c4',
	'red': '#630d0d',
	'red-deep': '#4e0000',
};

test('the theme and standalone page contain the DOST brand assets', () => {
	for (const [name, value] of Object.entries(colors)) {
		assert.ok(css.includes(`--dost-${name}:${value}`));
	}

	for (const weight of ['ExtraLight', 'Light', 'Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold', 'Black']) {
		const name = `Bounded-${weight}.otf`;
		const font = readFileSync(resolve(theme, 'src/fonts', name));
		assert.deepEqual(readFileSync(resolve(theme, 'assets/fonts', name)), font);
	}
	assert.match(html, /<link[^>]+href="www\/themes\/morph\/assets\/styles\/main\.css(?:\?[^"]*)?"/, 'the guide must use the shared theme stylesheet');

	for (const name of ['dost-logo-dark.svg', 'dost-logo-white.svg', 'dost-logo-extended-dark.svg', 'dost-logo-extended-white.svg', 'dost-pattern-green.svg', 'dost-pattern-gray.svg']) {
		const asset = readFileSync(resolve(theme, 'src/images/brand', name));
		assert.deepEqual(readFileSync(resolve(theme, 'assets/images', name)), asset);
		assert.ok(html.includes(`data:image/svg+xml;base64,${asset.toString('base64')}`));
	}
});
