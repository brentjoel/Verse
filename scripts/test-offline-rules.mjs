import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
const { classify, assetUrls, PAGES } = createRequire(import.meta.url)('../public/sw.js');
const { default: emotions } = await import('../data/emotions.json', { with: { type: 'json' } });

test('app pages and public-domain paths may be cached', () => {
  for (const path of PAGES) assert.equal(classify(path), 'page', path);
  assert.equal(classify('/emotions/sad'), 'page');
  assert.equal(classify('/path/sad/lonely'), 'page');
  assert.equal(classify('/journal/'), 'page');
});
test('Results, Compare, Share and everything unknown are never cached', () => {
  for (const emotion of emotions) for (const specific of emotion.specifics) {
    assert.equal(classify(`/emotions/${emotion.id}/${specific.id}`), 'never');
    assert.equal(classify(`/emotions/${emotion.id}/${specific.id}/`), 'never');
  }
  for (const path of ['/compare', '/share', '/api/x', '/sw.js', '/emotions/sad/opengraph-image', '/emotions', '/emotions/sad/lonely/extra', '/path/sad', '/anything-else', '/_next/image']) assert.equal(classify(path), 'never', path);
});
test('only immutable build output and icons count as assets', () => {
  assert.equal(classify('/_next/static/chunks/abc.js'), 'asset');
  assert.equal(classify('/icon-192.png'), 'asset');
  assert.equal(classify('/_next/data/x.json'), 'never');
});
test('asset URLs are pulled out of HTML once each', () => {
  const html = '<script src="/_next/static/chunks/a.js"></script><link href="/_next/static/css/b.css"/><script src="/_next/static/chunks/a.js"></script>';
  assert.deepEqual(assetUrls(html), ['/_next/static/chunks/a.js', '/_next/static/css/b.css']);
});
test('the worker source has no notification or push code', async () => {
  const { readFileSync } = await import('node:fs');
  const source = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
  for (const word of ['showNotification', 'PushManager', "'push'", '"push"', 'Notification.request']) assert.equal(source.includes(word), false, word);
});
