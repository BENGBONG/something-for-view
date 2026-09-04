const { chromium } = require('/Users/admin/.npm/_npx/31e32ef8478fbf80/node_modules/playwright');
const path = require('node:path');

const agentPath = process.env.AGENT_HTML || path.resolve('prototypes/baizhi-pc-home-v13/agent.html');
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
  if (errors.length) throw new Error(`Agent 页面脚本错误: ${errors.join(' | ')}`);

  console.log('Agent 页面基础验证通过：专家参数、新任务态和个人/企业版本隔离');
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
