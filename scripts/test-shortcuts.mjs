import assert from 'node:assert/strict';
import test from 'node:test';
const { shortcutAllowed, isShortcut, SHORTCUTS } = await import('../lib/shortcuts.ts');

const press = (key, extra = {}) => ({ key, ctrlKey: false, metaKey: false, altKey: false, ...extra });

test('a plain key fires on the page', () => {
  assert.equal(isShortcut(press('f'), 'F'), true);
  assert.equal(isShortcut(press('F'), 'f'), true);
  assert.equal(isShortcut(press('?'), '?'), true);
  assert.equal(isShortcut(press('g'), 'f'), false);
});

test('shortcuts never fire while typing', () => {
  for (const targetTag of ['INPUT', 'TEXTAREA', 'SELECT']) assert.equal(shortcutAllowed(press('f', { targetTag })), false);
  assert.equal(shortcutAllowed(press('f', { targetEditable: true })), false);
  assert.equal(shortcutAllowed(press('f', { targetTag: 'BUTTON' })), true);
});

test('modifiers and open dialogs block shortcuts', () => {
  for (const mod of ['ctrlKey', 'metaKey', 'altKey']) assert.equal(shortcutAllowed(press('f', { [mod]: true })), false);
  assert.equal(shortcutAllowed(press('f', { inOpenDialog: true })), false);
});

test('the list only names keys that exist', () => {
  assert.deepEqual(SHORTCUTS.map(item => item.keys.join(' ')), ['?', 'F', 'Esc', '← →', '↑ ↓', 'Enter']);
});
