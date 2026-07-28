import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const html = await readFile(new URL('../prototypes/business-leads-prototype.html', import.meta.url), 'utf8');

function loadTableControlModel(){
  const match = html.match(/\/\* TABLE_CONTROL_MODEL_START \*\/([\s\S]*?)\/\* TABLE_CONTROL_MODEL_END \*\//);
  assert.ok(match, 'table control model block should exist');
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${match[1]};this.model={gridSearchText,applyGridControls,nextGridSort,hasActiveGridControls}`, context);
  return context.model;
}

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

test('table controls search only visible values and combine filters', () => {
  const { applyGridControls } = loadTableControlModel();
  const cols = [{k:'company'}, {k:'industry'}, {k:'grade'}, {k:'hv',f:'email'}];
  const rows = [
    {id:1,company:'Alpha',industry:'能源',grade:'A',hv:{email:{s:'locked',v:'secret@example.com'},name:{s:'unlocked',v:'张三'}}},
    {id:2,company:'Beta',industry:'水务',grade:'B',hv:{email:{s:'unlocked',v:'open@example.com'}}}
  ];
  assert.equal(applyGridControls(rows, cols, {query:'secret',grade:'',industry:'',enhanced:'',sortKey:'',sortDir:''}).length, 0);
  assert.deepEqual(Array.from(applyGridControls(rows, cols, {query:'open@example.com',grade:'B',industry:'水务',enhanced:'yes',sortKey:'',sortDir:''}), row => row.id), [2]);
});

test('table controls sort asc, desc, and leave empty values last', () => {
  const { applyGridControls } = loadTableControlModel();
  const cols = [{k:'company'}, {k:'icp'}];
  const rows = [{id:1,company:'乙',icp:80},{id:2,company:'甲',icp:95},{id:3,company:'丙',icp:''}];
  assert.deepEqual(Array.from(applyGridControls(rows, cols, {query:'',grade:'',industry:'',enhanced:'',sortKey:'icp',sortDir:'asc'}), row => row.id), [1,2,3]);
  assert.deepEqual(Array.from(applyGridControls(rows, cols, {query:'',grade:'',industry:'',enhanced:'',sortKey:'icp',sortDir:'desc'}), row => row.id), [2,1,3]);
});

test('table controls cycle sort state and detect active controls', () => {
  const { nextGridSort, hasActiveGridControls } = loadTableControlModel();
  assert.deepEqual({...nextGridSort('', '', 'icp')}, {sortKey:'icp',sortDir:'asc'});
  assert.deepEqual({...nextGridSort('icp', 'asc', 'icp')}, {sortKey:'icp',sortDir:'desc'});
  assert.deepEqual({...nextGridSort('icp', 'desc', 'icp')}, {sortKey:'',sortDir:''});
  assert.equal(hasActiveGridControls({query:'',grade:'',industry:'',enhanced:'',sortKey:'',sortDir:''}), false);
  assert.equal(hasActiveGridControls({query:'Alpha',grade:'',industry:'',enhanced:'',sortKey:'',sortDir:''}), true);
});
