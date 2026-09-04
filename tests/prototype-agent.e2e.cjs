const { chromium } = require('/Users/admin/.npm/_npx/31e32ef8478fbf80/node_modules/playwright');
const path = require('node:path');
const fs = require('node:fs');

const agentPath = process.env.AGENT_HTML || path.resolve('prototypes/baizhi-pc-home-v13/agent.html');
const homePath = process.env.PROTOTYPE_HTML || path.resolve('prototypes/baizhi-pc-home-v13/app.html');
const toUrl = (file, query) => {
  const url = /^https?:\/\//.test(file) ? file : `file://${encodeURI(path.resolve(file))}`;
  return `${url}${url.includes('?') ? '&' : '?'}${query}`;
};

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto(toUrl(agentPath, `agent=${encodeURIComponent('市场分析助手')}&edition=enterprise`));
  await page.locator('#agent-name').waitFor({ timeout: 3000 });
  if ((await page.locator('#agent-name').textContent()).trim() !== '市场分析助手') throw new Error('专家名称未从 URL 恢复');
  if (await page.locator('#new-task-view').isHidden()) throw new Error('首次进入未展示新任务态');
  if ((await page.locator('body').getAttribute('data-edition')) !== 'enterprise') throw new Error('企业版本上下文错误');

  await page.goto(toUrl(agentPath, `agent=${encodeURIComponent('市场分析助手')}&edition=personal`));
  if (await page.getByText('企业知识库', { exact: true }).count()) throw new Error('个人版错误暴露企业知识库');

  await page.goto(toUrl(agentPath, `agent=${encodeURIComponent('市场分析助手')}&edition=enterprise`));
  const suggestions = page.locator('[data-suggestion]');
  await suggestions.first().click();
  if (!(await page.locator('#agent-input').inputValue()).includes('华东')) throw new Error('建议问题未填入输入框');
  await page.locator('#agent-input').fill('寻找华东地区有数字化升级计划的零售企业');
  await page.locator('#agent-send').click();
  await page.locator('#conversation-view:not([hidden])').waitFor();
  if (await page.locator('#new-task-view').isVisible()) throw new Error('发送任务后仍展示新任务态');
  await page.locator('[data-tool-call]').first().click();
  if (await page.locator('[data-tool-detail]').first().isHidden()) throw new Error('工具调用详情未展开');
  if ((await page.locator('[data-task-id]').count()) < 3) throw new Error('任务历史未渲染');
  if ((await page.locator('#task-file-panel').getAttribute('aria-hidden')) !== 'false') throw new Error('执行任务后文件面板未打开');
  await page.locator('[data-file-id="lead-list"]').first().click();
  if (await page.locator('#file-preview').isHidden()) throw new Error('文件未在右侧面板预览');
  if (!(await page.locator('#file-preview').textContent()).includes('华东零售客户线索')) throw new Error('文件预览内容错误');
  await page.locator('#file-preview-back').click();
  if (await page.locator('#task-file-list').isHidden()) throw new Error('无法从文件预览返回列表');
  await page.locator('#task-file-panel-close').click();
  if ((await page.locator('#task-file-panel').getAttribute('aria-hidden')) !== 'true') throw new Error('文件面板未关闭');
  await page.locator('#task-file-panel-toggle').click();
  if ((await page.locator('#task-file-panel').getAttribute('aria-hidden')) !== 'false') throw new Error('文件面板未重新打开');
  await page.locator('[data-task-id="weekly-opportunities"]').click();
  if ((await page.locator('#task-title').textContent()).trim() !== '整理本周重点商机') throw new Error('历史任务切换失败');
  const appBox = await page.locator('#agent-app').boundingBox();
  const sidebarBox = await page.locator('#agent-sidebar').boundingBox();
  if (!appBox || Math.round(appBox.width) !== 1440 || Math.round(appBox.height) !== 900) throw new Error(`Agent PC 画布尺寸异常: ${JSON.stringify(appBox)}`);
  if (!sidebarBox || Math.abs(sidebarBox.width - 240) > 1 || Math.abs(sidebarBox.height - 900) > 1) throw new Error(`Agent 任务栏尺寸异常: ${JSON.stringify(sidebarBox)}`);
  fs.mkdirSync('output/playwright', { recursive: true });
  await page.screenshot({ path: 'output/playwright/agent-workspace-focused.png', fullPage: true });
  await page.locator('#agent-new-task').click();
  if (await page.locator('#new-task-view').isHidden()) throw new Error('新任务按钮未恢复新任务态');

  await page.goto(toUrl(homePath, 'edition=enterprise'));
  await page.locator('#capability-entry').click();
  await page.locator('[data-main-view="capabilities"]:not([hidden])').waitFor();
  const popupPromise = page.waitForEvent('popup');
  await page.locator('[data-main-view="capabilities"] [data-agent="市场分析助手"]').click();
  const popup = await popupPromise;
  await popup.waitForURL(/agent\.html/, { timeout: 5000 });
  await popup.waitForLoadState('domcontentloaded');
  if (await popup.getByText('开发交接说明', { exact: true }).count()) throw new Error('专家入口仍展示开发交接占位页');
  if (!popup.url().includes('agent.html')) throw new Error(`专家入口未打开 Agent 页面: ${popup.url()}`);
  if (!popup.url().includes('edition=enterprise')) throw new Error('专家入口未继承企业版本');
  if ((await popup.locator('#agent-name').textContent()).trim() !== '市场分析助手') throw new Error('专家入口传参错误');
  await popup.close();
  if (errors.length) throw new Error(`Agent 页面脚本错误: ${errors.join(' | ')}`);

  console.log('Agent 页面验证通过：专家参数、版本隔离、任务执行、工具详情、历史切换和文件预览');
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
