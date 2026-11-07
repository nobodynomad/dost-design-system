import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const page = fileURLToPath(new URL('../../../../dost-model.html', import.meta.url));
const html = readFileSync(page, 'utf8');
const text = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');

test('the model page keeps the requested specifications and demo actions', () => {
	for (const value of ['до 1 045 кг', 'до 13,5 м³', 'Evotech A275', 'Евро-5', '200 000 км', '3 места', '7 мест', '10,5 м³', '2 455 кг', '2 570 кг', '170 мм']) {
		assert.ok(text.includes(value), `Missing specification: ${value}`);
	}
	const brochure = html.match(/<button\b([^>]*\bhero__brochure\b[^>]*)>\s*Скачать брошюру\s*<\/button>/);
	assert.ok(brochure, 'Missing text-only brochure button');
	assert.match(brochure[1], /\btype="button"/);
	assert.doesNotMatch(brochure[1], /\bdisabled\b|\bonclick\b/);
	assert.doesNotMatch(text, /расч[её]т кредита|Подробнее/i);
	assert.match(text, /18 направлений регулировки/);
	assert.match(text, /4 USB-разъёма и 2 розетки 12 В/);
	assert.doesNotMatch(text, /иллюстраци|иллюстративн|предварительн|уточня[ею]|из примера|требуют подтверждения|\*/iu);
});

test('technical specifications expose the reference values without replacing the brief', () => {
	const section = html.match(/<section class="section section--technical"[\s\S]*?<\/section>/)?.[0];
	assert.ok(section, 'Missing technical specifications section');
	assert.equal((section.match(/class="tabs__trigger"/g) || []).length, 5);
	assert.equal((section.match(/class="tabs__panel" hidden/g) || []).length, 4);
	for (const value of ['4 × 2', '3&nbsp;745', '3&nbsp;631', '1&nbsp;861', '1&nbsp;927', '730', 'до 1&nbsp;045']) {
		assert.ok(section.includes(value), `Missing technical specification: ${value}`);
	}
	assert.doesNotMatch(section, /до 1(?:&nbsp;|\s)500/);
});

test('navigation reaches the model sections and the agreed DOST destinations', () => {
	const footer = html.match(/<footer\b[\s\S]*?<\/footer>/)[0];
	for (const name of ['Facebook', 'YouTube']) {
		assert.match(footer, new RegExp(`<a href="https://dostauto\\.uz/" aria-label="${name}">`));
	}
	assert.match(footer, /<a href="https:\/\/dostauto\.uz\/">Акции<\/a>/);
	const navigation = html.match(/<header\b[\s\S]*?<\/header>/)[0];
	for (const section of ['specifications', 'configurations', 'cargo', 'comfort', 'technical']) {
		assert.ok(navigation.includes(`href="#${section}"`) && html.includes(`id="${section}"`));
	}
});
