# Business Leads Navigation Collapse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 更新商机线索列表文案和创建人，并为一级导航增加 56px 紧凑折叠状态。

**Architecture:** 保持单 HTML 结构，在现有一级导航节点上增加稳定的标识和无障碍属性，通过 `.collapsed` 状态类驱动布局变化，并用一个原生 JavaScript 函数切换状态。使用 Node 内置测试运行器做静态契约测试，再用浏览器完成真实交互验证。

**Tech Stack:** HTML、CSS、原生 JavaScript、Node.js `node:test`、应用内浏览器。

## Global Constraints

- 不引入第三方依赖。
- 折叠态约 56px，仅保留 Logo、一级菜单图标和账户头像。
- 二级导航和主内容不折叠。
- 折叠状态不做持久化，刷新后默认展开。
- 不调整其他导航、数据逻辑或视觉主题。

---

### Task 1: 文案和折叠契约测试

**Files:**
- Create: `tests/business-leads-prototype.test.mjs`
- Modify: `prototypes/business-leads-prototype.html:29-45`
- Modify: `prototypes/business-leads-prototype.html:234-300`
- Modify: `prototypes/business-leads-prototype.html:359`
- Modify: `prototypes/business-leads-prototype.html:571`
- Modify: `prototypes/business-leads-prototype.html:458-485`

**Interfaces:**
- Consumes: `prototypes/business-leads-prototype.html` 的一级导航 DOM、`FILES` 数据与列表卡片模板。
- Produces: `togglePrimarySidebar(): void`，在 `aside#primarySidebar` 上切换 `.collapsed`；按钮 `#primarySidebarToggle` 的 `aria-expanded` 和 `title` 同步更新。

- [x] **Step 1: 写入失败的静态契约测试**

```js
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
```

- [x] **Step 2: 运行测试并确认因功能缺失而失败**

Run: `node --test tests/business-leads-prototype.test.mjs`

Expected: 两个测试失败，分别指出批准后的文案/创建人不存在，以及折叠 DOM、CSS 和函数不存在。

- [x] **Step 3: 实现两处文案修改**

将 `FILES` 第三项的 `creator` 改为 `小张`，将卡片说明替换为批准后的完整文案，不改变模板结构。

- [x] **Step 4: 实现一级导航折叠 CSS**

在现有一级导航样式后增加：

```css
.side1{transition:width .2s ease}
.side1.collapsed{width:56px}
.side1.collapsed .logo-row{padding-left:15px;padding-right:15px;justify-content:center}
.side1.collapsed .logo-text,
.side1.collapsed .new-task .new-task-label,
.side1.collapsed .new-task .nt-right,
.side1.collapsed .nav-item .nav-label,
.side1.collapsed .nav-item .arrow,
.side1.collapsed .nav-sub,
.side1.collapsed .nav-empty,
.side1.collapsed .user-meta,
.side1.collapsed .user-badge,
.side1.collapsed .user-card .arrow{display:none}
.side1.collapsed .side-collapse{position:absolute;left:42px;background:#fff;border:1px solid var(--border);box-shadow:0 2px 8px rgba(29,33,41,.08)}
.side1.collapsed .new-task,
.side1.collapsed .nav-item,
.side1.collapsed .user-card{justify-content:center;margin-left:8px;margin-right:8px;padding-left:0;padding-right:0}
```

为需要隐藏的文本增加 `.new-task-label` 和 `.nav-label` 包裹，并为一级菜单项补充 `title`。

- [x] **Step 5: 实现可逆、无障碍的切换函数**

将折叠控件改为原生按钮，并加入：

```js
function togglePrimarySidebar(){
  const sidebar = $('primarySidebar');
  const button = $('primarySidebarToggle');
  const collapsed = sidebar.classList.toggle('collapsed');
  button.setAttribute('aria-expanded', String(!collapsed));
  button.setAttribute('aria-label', collapsed ? '展开一级导航' : '收起一级导航');
  button.title = collapsed ? '展开一级导航' : '收起一级导航';
}
```

- [x] **Step 6: 运行契约测试并确认通过**

Run: `node --test tests/business-leads-prototype.test.mjs`

Expected: `2` tests passed，`0` failed。

- [x] **Step 7: 浏览器验证真实行为**

打开或刷新 `http://127.0.0.1:8765/prototypes/business-leads-prototype.html`，验证：

1. 新文案和“小张”可见。
2. 点击顶部折叠按钮后 `#primarySidebar` 含 `.collapsed`，宽度为 `56px`，二级导航仍可见。
3. 按钮 `aria-expanded` 变为 `false`，标题变为“展开一级导航”。
4. 再次点击后宽度恢复 `200px`，`aria-expanded` 变为 `true`。
5. 浏览器控制台无 error 或 warning。

- [x] **Step 8: 检查差异并提交实现**

Run: `git diff --check && git diff --stat && git status --short`

Expected: 只有原型 HTML、测试文件和实施计划发生预期变化，无空白错误。

```bash
git add prototypes/business-leads-prototype.html tests/business-leads-prototype.test.mjs docs/superpowers/plans/2026-07-28-business-leads-nav-collapse.md
git commit -m "feat: add collapsible business leads navigation"
```
