import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../prototypes/business-leads-prototype.html', import.meta.url), 'utf8');

test('uses the approved business leads copy and creator', () => {
  assert.match(html, /线索 Agent 的结果自动沉淀为线索文件，支持预览、导出，并支持使用积分解锁高价值字段。/);
  assert.match(html, /creator: '小张'/);
  assert.doesNotMatch(html, /指定 Agent 的线索结果自动沉淀/);
  assert.doesNotMatch(html, /creator: '李静'/);
});

test('defines an accessible reversible primary sidebar collapse', () => {
  assert.match(html, /id="primarySidebar"/);
  assert.match(html, /id="primarySidebarToggle"/);
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /\.side1\.collapsed\s*\{[^}]*width:56px/s);
  assert.match(html, /function togglePrimarySidebar\(\)/);
  assert.match(html, /classList\.toggle\('collapsed'\)/);
  assert.match(html, /aria-expanded/);
});
