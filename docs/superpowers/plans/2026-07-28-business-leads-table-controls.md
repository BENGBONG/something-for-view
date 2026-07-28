# Business Leads Table Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为商机线索文件详情的当前 Sheet 增加搜索、等级/行业/增强状态筛选、三态表头排序、结果计数和重置能力。

**Architecture:** 在现有单 HTML 中增加一组纯数据函数，负责生成可搜索文本并对当前 Sheet 数据执行过滤和排序；UI 层只负责更新状态、渲染工具栏、刷新表格和同步结果计数。纯函数通过 Node `vm` 从 HTML 的标记代码块中提取并执行，真实 DOM 行为通过应用内浏览器验证。

**Tech Stack:** HTML、CSS、原生 JavaScript、Node.js `node:test`、Node.js `vm`、应用内浏览器。

## Global Constraints

- 搜索、筛选和排序只作用于当前 Sheet。
- 搜索覆盖普通字段和已解锁高价值字段，不能暴露锁定字段底层值。
- 筛选项固定为等级、行业和增强状态，并使用 AND 组合。
- 高价值字段列和操作列不可排序。
- 切换 Sheet 时重置条件；解锁刷新时保留条件。
- 不引入第三方依赖，不修改 Credits、导出和列表页搜索逻辑。

---

### Task 1: 可测试的查询与排序数据模型

**Files:**
- Modify: `tests/business-leads-prototype.test.mjs`
- Modify: `prototypes/business-leads-prototype.html:384-405`
- Modify: `prototypes/business-leads-prototype.html:493-495`
- Modify: `prototypes/business-leads-prototype.html:721-733`

**Interfaces:**
- Consumes: `Lead[]`、当前列定义 `cols` 和控件状态 `{ query, grade, industry, enhanced, sortKey, sortDir }`。
- Produces: `gridSearchText(lead, cols): string`、`applyGridControls(rows, cols, controls): Lead[]`、`nextGridSort(sortKey, sortDir, key): {sortKey:string,sortDir:string}` 和 `hasActiveGridControls(controls): boolean`。

- [x] **Step 1: 添加失败的模型行为测试**

在现有测试文件中读取 `TABLE_CONTROL_MODEL_START/END` 标记间代码，并通过 `vm.runInContext` 执行：

```js
import vm from 'node:vm';

function loadTableControlModel(){
  const match = html.match(/\/\* TABLE_CONTROL_MODEL_START \*\/([\s\S]*?)\/\* TABLE_CONTROL_MODEL_END \*\//);
  assert.ok(match, 'table control model block should exist');
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${match[1]};this.model={gridSearchText,applyGridControls,nextGridSort,hasActiveGridControls}`, context);
  return context.model;
}

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
```

- [x] **Step 2: 运行测试并确认模型缺失导致失败**

Run: `node --test tests/business-leads-prototype.test.mjs`

Expected: 现有测试通过，新测试因找不到模型标记块而失败。

- [x] **Step 3: 增加查询状态与纯函数实现**

为 `state` 增加：

```js
gridQuery: '',
gridGrade: '',
gridIndustry: '',
gridEnhanced: '',
gridSortKey: '',
gridSortDir: ''
```

在标记块中实现：

```js
/* TABLE_CONTROL_MODEL_START */
function gridSearchText(lead, cols){
  return cols.flatMap(col => {
    if (col.k === 'op') return [];
    if (col.k === 'hv'){
      const cell = lead.hv?.[col.f];
      return cell?.s === 'unlocked' ? [cell.v ?? ''] : [];
    }
    return [lead[col.k] ?? ''];
  }).join(' ').toLocaleLowerCase();
}

function applyGridControls(rows, cols, controls){
  const query = String(controls.query ?? '').trim().toLocaleLowerCase();
  const enhanced = lead => Object.values(lead.hv ?? {}).some(cell => cell?.s === 'unlocked');
  let result = rows.filter(lead =>
    (!query || gridSearchText(lead, cols).includes(query)) &&
    (!controls.grade || lead.grade === controls.grade) &&
    (!controls.industry || lead.industry === controls.industry) &&
    (!controls.enhanced || (controls.enhanced === 'yes') === enhanced(lead))
  );
  if (!controls.sortKey || !controls.sortDir) return result;
  const numeric = new Set(['no', 'icp']);
  const direction = controls.sortDir === 'desc' ? -1 : 1;
  return result.slice().sort((left, right) => {
    const a = left[controls.sortKey], b = right[controls.sortKey];
    const aEmpty = a === '' || a === null || a === undefined;
    const bEmpty = b === '' || b === null || b === undefined;
    if (aEmpty || bEmpty) return aEmpty === bEmpty ? 0 : (aEmpty ? 1 : -1);
    const comparison = numeric.has(controls.sortKey)
      ? Number(a) - Number(b)
      : String(a).localeCompare(String(b), 'zh-CN', {numeric:true, sensitivity:'base'});
    return comparison * direction;
  });
}
function nextGridSort(sortKey, sortDir, key){
  if (sortKey !== key) return {sortKey:key, sortDir:'asc'};
  if (sortDir === 'asc') return {sortKey:key, sortDir:'desc'};
  return {sortKey:'', sortDir:''};
}
function hasActiveGridControls(controls){
  return Boolean(controls.query || controls.grade || controls.industry || controls.enhanced || controls.sortKey || controls.sortDir);
}
/* TABLE_CONTROL_MODEL_END */
```

- [x] **Step 4: 运行测试并确认模型行为通过**

Run: `node --test tests/business-leads-prototype.test.mjs`

Expected: 模型测试与现有测试全部通过。

---

### Task 2: 工具栏、筛选状态与三态表头排序

**Files:**
- Modify: `tests/business-leads-prototype.test.mjs`
- Modify: `prototypes/business-leads-prototype.html:154-225`
- Modify: `prototypes/business-leads-prototype.html:619-654`
- Modify: `prototypes/business-leads-prototype.html:656-733`

**Interfaces:**
- Consumes: Task 1 的 `applyGridControls`。
- Produces: `gridToolbarHTML()`, `filteredGridLeads()`, `setGridControl(name,value)`, `toggleGridSort(key)`, `resetGridControls(renderNow)`, `syncGridToolbar()`。

- [x] **Step 1: 执行失败的浏览器行为检查**

刷新本地页面并打开第一条文件详情，使用真实 DOM 检查工具栏搜索框。

Expected: `#gridSearch` 数量为 `0`，确认用户可见功能尚未实现。

- [x] **Step 2: 增加工具栏样式与 HTML**

新增 `.grid-toolbar`、`.grid-search`、`.grid-filter`、`.grid-reset`、`.grid-result-count`、`.grid-sort-btn`、`.sort-indicator` 和空状态样式。`viewDetail()` 在标题行后插入 `${gridToolbarHTML()}`。

工具栏结构：

```html
<div class="grid-toolbar">
  <label class="grid-search">…<input id="gridSearch" oninput="setGridControl('gridQuery',this.value)"></label>
  <select id="gridGrade" onchange="setGridControl('gridGrade',this.value)">…</select>
  <select id="gridIndustry" onchange="setGridControl('gridIndustry',this.value)">…</select>
  <select id="gridEnhanced" onchange="setGridControl('gridEnhanced',this.value)">…</select>
  <button id="gridReset" onclick="resetGridControls(true)">重置</button>
  <span id="gridResultCount">显示 X / Y 条</span>
</div>
```

- [x] **Step 3: 实现控件状态与结果同步**

```js
function gridControls(){
  return {query:state.gridQuery,grade:state.gridGrade,industry:state.gridIndustry,enhanced:state.gridEnhanced,sortKey:state.gridSortKey,sortDir:state.gridSortDir};
}
function filteredGridLeads(){
  const cols = state.sheet === 'nocontact' ? COLS_N : COLS_C;
  return applyGridControls(sheetLeads(), cols, gridControls());
}
function setGridControl(name, value){ state[name] = value; refreshGrid(); }
function resetGridControls(renderNow = true){
  Object.assign(state,{gridQuery:'',gridGrade:'',gridIndustry:'',gridEnhanced:'',gridSortKey:'',gridSortDir:''});
  if (renderNow) render();
}
function toggleGridSort(key){
  const next = nextGridSort(state.gridSortKey, state.gridSortDir, key);
  state.gridSortKey = next.sortKey;
  state.gridSortDir = next.sortDir;
  refreshGrid();
}
```

`syncGridToolbar()` 更新结果数和重置按钮 `disabled` 状态。`switchSheet()` 先调用 `resetGridControls(false)`；`refreshGrid()` 保留滚动位置并调用 `syncGridToolbar()`。

- [x] **Step 4: 接入可排序表头和空状态**

`gridHTML()` 使用 `filteredGridLeads()`。普通列标题输出按钮，并根据状态设置 `aria-sort="ascending|descending|none"`；`hv` 和 `op` 列保持原样。无结果时输出一个跨全部列的空状态行。

- [x] **Step 5: 运行完整测试**

Run: `node --test tests/business-leads-prototype.test.mjs`

Expected: 所有测试通过，`0` failed。

- [x] **Step 6: 浏览器验证**

刷新 `http://127.0.0.1:8765/prototypes/business-leads-prototype.html`，打开第一条文件并验证：

1. 搜索公司名称能缩小结果，搜索锁定邮箱底层值无结果。
2. 等级、行业、增强状态单独和组合筛选正确。
3. 点击 ICP 表头按升序、降序、默认顺序循环，空值始终末尾。
4. 结果计数和重置按钮状态同步。
5. 切换 Sheet 后条件清空。
6. 控制台无 error 或 warning。

- [x] **Step 7: 检查差异并提交**

Run: `git diff --check && git status --short --branch`

```bash
git add prototypes/business-leads-prototype.html tests/business-leads-prototype.test.mjs docs/superpowers/plans/2026-07-28-business-leads-table-controls.md
git commit -m "feat: add business leads table controls"
```
