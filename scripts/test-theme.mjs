import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { applyThemeChoice, storedBaseTheme, resolveTextSize, resolveTheme, themeScript, THEME_KEY, TEXT_SIZE_KEY } from '../lib/theme.ts';
import { emotionHues } from '../lib/constellation.ts';

const css = readFileSync(new URL('../app/styles/tokens.css', import.meta.url), 'utf8');
const tokens = selector => Object.fromEntries([...css.match(selector)[1].matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]));
const night = tokens(/:root \{([^}]+)\}/);
const day = tokens(/:root\[data-theme="light"\] \{([^}]+)\}/);
const bedtime = tokens(/:root\[data-theme="bedtime"\] \{([^}]+)\}/);
const rgb = value => value.startsWith('#') ? value.slice(1).match(/../g).map(v => parseInt(v, 16)) : value.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
const alpha = value => { const m = value.match(/\/\s*([\d.]+)(%?)\s*\)/); return m ? Number(m[1]) / (m[2] ? 100 : 1) : 1; };
const mix = (a, b, amount) => a.map((v, i) => v * (1 - amount) + b[i] * amount);
const luminance = color => color.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
const aa = (a, b, minimum = 4.5, label = '') => assert.ok(contrast(a, b) >= minimum, `${label} contrast ${contrast(a, b).toFixed(2)} < ${minimum}`);

test('explicit theme wins; absent or invalid preference follows system', () => {
  for (const system of [true, false]) {
    assert.equal(resolveTheme('dark', system), 'dark');
    assert.equal(resolveTheme('light', system), 'light');
    for (const preference of [null, undefined, 'invalid']) assert.equal(resolveTheme(preference, system), system ? 'light' : 'dark');
  }
});

test('text size resolves to a known value', () => {
  assert.equal(resolveTextSize('large'), 'large');
  assert.equal(resolveTextSize('larger'), 'larger');
  assert.equal(resolveTextSize('huge'), 'default');
  assert.equal(resolveTextSize(null), 'default');
  assert.equal(resolveTextSize(undefined), 'default');
});

test('theme choice resolves system and stored sources', () => {
  assert.deepEqual(applyThemeChoice('system', true), { theme: 'light', source: 'system' });
  assert.deepEqual(applyThemeChoice('system', false), { theme: 'dark', source: 'system' });
  assert.deepEqual(applyThemeChoice('dark', true), { theme: 'dark', source: 'stored' });
  assert.deepEqual(applyThemeChoice('light', false), { theme: 'light', source: 'stored' });
});

test('actual pre-paint script sets theme, text size and js flag, and survives blocked storage', () => {
  for (const preference of [null, 'dark', 'light', 'bedtime', 'invalid']) for (const size of [null, 'large', 'bogus']) for (const system of [true, false]) for (const blocked of [true, false]) {
    const dataset = {};
    vm.runInNewContext(themeScript, {
      localStorage: { getItem(key) { if (blocked) throw Error('blocked'); return key === THEME_KEY ? preference : key === TEXT_SIZE_KEY ? size : null; } },
      document: { documentElement: { dataset } }, matchMedia: () => ({ matches: system }),
    });
    assert.equal(dataset.theme, resolveTheme(blocked ? null : preference, system));
    assert.equal(dataset.themeSource, !blocked && ['dark', 'light', 'bedtime'].includes(preference) ? 'stored' : 'system');
    assert.equal(dataset.textSize, blocked ? 'default' : resolveTextSize(size));
    assert.equal(dataset.js, 'true');
  }
});

test('canvases are pure void and morning paper', () => {
  assert.equal(night['--canvas'], '#000000');
  assert.equal(day['--canvas'], '#f6f4f1');
  assert.match(css.match(/:root\[data-theme="light"\] \{([^}]+)\}/)[1], /color-scheme:\s*only light\s*;/);
});

test('ink, spark and action meet AA on the canvas in both themes', () => {
  for (const [name, p] of [['night', night], ['day', day], ['bedtime', bedtime]]) {
    const canvas = rgb(p['--canvas']);
    for (const key of ['--ink', '--ink-2', '--ink-3', '--spark', '--action']) aa(rgb(p[key]), canvas, 4.5, `${name} ${key}`);
    aa(rgb(p['--on-action']), rgb(p['--action']), 4.5, `${name} on-action`);
    aa(rgb(p['--ink']), mix(canvas, rgb(p['--veil']), alpha(p['--veil'])), 4.5, `${name} ink on veil`);
    aa(rgb(p['--ink-3']), mix(canvas, rgb(p['--veil']), alpha(p['--veil'])), 4.5, `${name} ink-3 on veil`);
  }
});

test('emotion hues are visible as dots and particles in both themes', () => {
  for (const [id, { night: n, day: d }] of Object.entries(emotionHues)) {
    aa(rgb(n), rgb(night['--canvas']), 3, `night ${id}`);
    aa(rgb(d), rgb(day['--canvas']), 3, `day ${id}`);
    assert.match(css, new RegExp(`\\[data-emotion="${id}"\\] \\{ --emotion: ${n}; \\}`));
    assert.match(css, new RegExp(`\\[data-theme="light"\\] \\[data-emotion="${id}"\\], :root\\[data-theme="light"\\]\\[data-emotion="${id}"\\] \\{ --emotion: ${d}; \\}`));
  }
});

test('animated components only read color tokens the stylesheet defines', () => {
  const source = readFileSync(new URL('../components/dawn-reveal.tsx', import.meta.url), 'utf8');
  const used = [...source.matchAll(/getPropertyValue\("(--[\w-]+)"\)/g)].map(m => m[1]);
  assert.ok(used.length > 0, 'dawn reveal reads its colors from tokens');
  for (const token of used) assert.ok(token in night && token in day, `${token} is defined in both themes`);
});

test('bedtime is a stored choice that the data schema keeps as dark', () => {
  assert.equal(resolveTheme('bedtime', true), 'bedtime');
  assert.deepEqual(applyThemeChoice('bedtime', true), { theme: 'bedtime', source: 'stored' });
  assert.equal(storedBaseTheme('bedtime'), 'dark');
  assert.equal(storedBaseTheme('light'), 'light');
  assert.equal(storedBaseTheme(undefined), 'dark');
});

test('bedtime is dimmer and warmer than night, and low in blue', () => {
  const [r, g, b] = rgb(bedtime['--ink']);
  assert.ok(r > g && g > b, 'ink is warm');
  assert.ok(luminance(rgb(bedtime['--ink'])) < luminance(rgb(night['--ink'])) * .8, 'ink is dimmer than night');
  assert.ok(rgb(bedtime['--ink'])[2] < 200 && rgb(bedtime['--spark'])[2] < 120, 'little blue light');
  const [ar, ag, ab] = rgb(bedtime['--action']);
  assert.ok(Math.max(ar, ag, ab) < 0xc0 && ab - ar < 0x40, 'violet is toned down');
});
