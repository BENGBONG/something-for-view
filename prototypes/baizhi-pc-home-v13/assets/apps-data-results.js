/* v2 task example: Apps records, not a generated workbook. */
window.ArtifactResults = (() => {
  const sales=t=>t?.id==='apps-sales-update';
  const url=history=>`index.html?edition=${edition}&page=apps&app=sales${history?'&run=run-0908-review':''}`;
  function conversation(task) {
    return `<article class="message message-user"><div>${escapeHTML(task.prompt)}</div></article><article class="message message-agent"><h3>已更新应用数据</h3><p>本次复盘使用「销售洞察」应用，已更新商机跟进、周期汇总，并删除一条失效客户记录。</p><div class="tool-call"><div class="tool-call-button"><strong>销售洞察</strong><span>新增 0 · 修改 2 · 删除 1</span><em>已提交</em></div></div><p>应用已经出现在知识库「应用数据」中，无需另存文件。</p><p><a href="${url(false)}">查看最新数据</a>　<a href="${url(true)}">查看本次变更</a></p><p>最新数据可能包含后续任务更新，本次变更保留此次运行时的修改前后值。</p></article>`;
  }
  function renderPanel(task) {
    if(!sales(task))return false;
    document.querySelector('#file-preview').hidden=true;
    document.querySelector('#task-file-list').hidden=false;
    document.querySelector('#task-file-list').innerHTML=`<section class="panel-section"><div class="panel-section-title">执行状态 <span>已完成</span></div><p>商机复盘 Agent</p><small>2026-09-08 16:25</small></section><section class="panel-section"><div class="panel-section-title">更新的应用 <span>1</span></div><strong>销售洞察</strong><p>客户画像、商机跟进、周期汇总</p><p>修改 2 次 · 删除 1 次</p><a href="${url(false)}">查看最新数据</a><p><a href="${url(true)}">查看本次变更</a></p></section>`;return true;
  }
  function init() {
    taskGroups[0].tasks.unshift({id:'apps-sales-update',title:'华东销售商机复盘',status:'done',progress:100,prompt:'复盘华东销售商机，将客户变化和跟进进展更新到销售洞察应用。',summary:'已更新销售洞察应用的 3 张表。'});
    renderTaskHistory();
    if(new URLSearchParams(location.search).get('task')==='apps-sales-update')renderTask('apps-sales-update');
  }
  return {init,sales,conversation,renderPanel,configureTask:()=>{},augmentPreview:()=>{}};
})();
