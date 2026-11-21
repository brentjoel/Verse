import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, nextResolve) {
  return nextResolve(specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier) ? `${specifier}.ts` : specifier, context);
} });
const { parseAnchor, anchorValue } = await import('../lib/anchor.ts');
const known = new Set(['Psalm 23:1', 'John 3:16']);

test('a known reference is accepted', () => assert.equal(parseAnchor(anchorValue('John 3:16'), known), 'John 3:16'));
test('unknown references and bad shapes are rejected', () => {
  for (const bad of [undefined, null, 'John 3:16', [], {}, { reference: 5 }, { reference: 'Nope 1:1' }, { reference: 'John 3:16', text: 'x' }]) assert.equal(parseAnchor(bad, known), undefined);
});
