/* Prototype: latest data stays live; only schema changes have a historical detail view. */
window.ArtifactResults = (() => {
  const M=AppsDataModel, query=new URLSearchParams(location.search);
  const user=sessionStorage.getItem('apps-demo-user')||'zhang';
  const scopeFor=appId=>appId===query.get('app')&&query.get('scope')==='all'?'all':'mine';
  const sales=t=>!!t?.appRun;
  const summary=cs=>cs.length?'应用数据已更新':'无业务数据更新';
  const groups=r=>[...new Set([...r.changes,...(r.schemaChanges||[])].map(c=>c.app))].map(id=>({app:M.apps.find(a=>a.id===id),changes:r.changes.filter(c=>c.app===id),schema:(r.schemaChanges||[]).filter(c=>c.app===id)}));
  function url(appId,runId) {
    const scope=appId===query.get('app')&&query.get('scope')==='all'?'all':'mine';
    const p=new URLSearchParams({edition,page:'apps',app:appId,scope});
    if(runId){p.set('run',runId);p.set('from','task');}
    return 'index.html?'+p;
  }
  let currentTask=null, workspaceTab='apps', selectedApp=null, mode='latest', selectedTable=null;
  const e=x=>escapeHTML(String(x??'—'));
  const cell=x=>x===null||x===undefined?'未填写':typeof x==='boolean'?(x?'是':'否'):typeof x==='number'?x.toLocaleString('zh-CN'):e(x);
  const tableNames=g=>[...new Set([...g.changes.map(c=>g.app.tables.find(t=>t.id===c.table)?.name),...g.schema.map(c=>c.tableName)].filter(Boolean))].join('、');
  function conversation(task) {
    const r=task.appRun,gs=groups(r),failed=r.status==='失败';
    return '<article class="message message-user"><div>'+e(task.prompt)+'</div></article>'+
      '<details class="result-process"><summary>任务执行过程</summary><ol>'+gs.map(g=>'<li>更新「'+e(g.app.name)+'」：'+e(tableNames(g))+'。</li>').join('')+'</ol></details>'+
      '<section class="result-block"><h3>应用更新 <small>共 '+gs.length+' 个应用</small></h3>'+
      gs.map(g=>'<article class="app-result-card"><span class="app-result-mark"><img src="assets/figma-task/folder.svg" alt=""/></span><div class="app-result-name"><div class="app-result-title"><strong>'+e(g.app.name)+'</strong><span class="result-status">已更新</span></div><p>'+e(tableNames(g))+(g.schema.length?' · 表结构已更新':' · 数据已更新')+'</p></div><div class="app-result-actions">'+(g.schema.length?'<button class="result-link" data-result-app="'+g.app.id+'" data-result-mode="changes">查看结构变更</button>':'')+'<button class="result-link" data-result-app="'+g.app.id+'" data-result-mode="latest">查看最新数据</button></div></article>').join('')+
      (!gs.length?'<p class="result-copy">本次未产生应用更新。</p>':'')+'</section>'+
      '<section class="result-block"><h3>任务完成总结</h3><div class="result-summary"><p>'+(failed?'任务执行失败；已经生效的更新仍保留。':r.id==='run-0908-review'?'已完成商机跟进状态复盘，整理客户画像与本周销售汇总。可在右侧工作台查看最新数据。':r.schemaChanges?.length?'已完成销售洞察表结构调整，包括客户等级字段名称和预计金额字段类型。':gs.length?'本次应用更新已完成，可在工作台查看最新数据。':'本次任务已完成，应用未发生更新。')+'</p></div></section>'+
      '<p class="task-complete-note">'+(failed?'任务执行失败':'任务已完成 · 可继续补充要求')+'</p>';
  }
  function renderWorkspace() {
    const r=currentTask.appRun,gs=groups(r),g=gs.find(x=>x.app.id===selectedApp)||gs[0];
    selectedApp=g?.app.id;
    const tabs=[['tools','工具调用'],['files','文件列表'],['revisions','修订文件'],['apps','应用数据']];
    let body='';
    if(workspaceTab==='apps'&&g) {
      const access=M.allowed(user,g.app,scopeFor(g.app.id),edition==='personal');
      if(mode==='changes'&&!g.schema.length)mode='latest';
      const t=g.app.tables.find(t=>t.id===selectedTable)||g.app.tables[0];selectedTable=t?.id;
      body='<select class="workspace-app-select" aria-label="选择应用" id="workspace-app">'+gs.map(x=>'<option value="'+x.app.id+'" '+(x.app.id===g.app.id?'selected':'')+'>'+e(x.app.name)+'</option>').join('')+'</select>'+
        '<div class="workspace-mode" role="tablist" aria-label="应用内容视图">'+[['latest','最新数据'],...(g.schema.length?[['changes','结构变更']]:[])].map(([id,label])=>'<button role="tab" aria-selected="'+(mode===id)+'" data-result-mode="'+id+'">'+label+'</button>').join('')+'</div>';
      if(!access)body+='<div class="workspace-empty">暂无查看此应用的权限</div>';
      else if(mode==='changes'){
        body+='<p class="workspace-description">本次任务生效的表结构变化，不含业务数据内容。</p>'+g.schema.map(c=>'<section class="workspace-change"><div class="workspace-description">'+e(c.type)+' · '+e(c.tableName)+' / '+e(c.target)+'</div><table class="workspace-diff"><thead><tr><th>原结构</th><th>新结构</th></tr></thead><tbody><tr><td>'+e(c.before)+'</td><td>'+e(c.after)+'</td></tr></tbody></table></section>').join('');
      }else{
        const rows=M.rows(user,g.app.id,t.id,scopeFor(g.app.id),edition==='personal');
        body+='<p class="workspace-description">当前最新数据 · 只读查看</p><div class="workspace-table-select" role="tablist" aria-label="应用数据表">'+g.app.tables.map(x=>'<button role="tab" aria-selected="'+(x.id===t.id)+'" data-result-table="'+x.id+'">'+e(x.name)+'</button>').join('')+'</div>'+
        '<div class="workspace-scroll"><table class="workspace-grid"><thead><tr>'+t.fields.map(f=>'<th>'+e(f[0])+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.values.map(v=>'<td>'+cell(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div><p class="workspace-description">共 '+rows.length+' 条数据</p>';
        if(!rows.length)body+='<p class="workspace-empty">这张表暂无数据</p>';
      }
      body+='<div class="workspace-footer"><small>'+(mode==='changes'?'结构生效于 '+e(r.time):'当前可查看的最新数据')+'</small>'+(access?'<a class="result-link" href="'+url(g.app.id,mode==='changes'?r.id:null)+'">在知识库中打开</a>':'')+'</div>';
    }else if(workspaceTab==='tools'){
      body='<h3 style="font-size:14px;margin-top:0">本次应用工具调用</h3>'+gs.map(g=>'<section class="workspace-log"><strong>'+e(g.app.name)+'</strong><br>'+e(tableNames(g))+'<br>提交时间：'+e(r.time)+'</section>').join('');
    }else body='<div class="workspace-empty">'+(workspaceTab==='files'?'本次任务未生成文件':workspaceTab==='revisions'?'本次任务没有修订文件':'本次任务未更新应用')+'</div>';
    document.querySelector('#task-file-list').innerHTML='<nav class="workspace-tabs" role="tablist" aria-label="工作台">'+tabs.map(([id,label])=>'<button role="tab" aria-selected="'+(workspaceTab===id)+'" data-workspace-tab="'+id+'">'+label+'</button>').join('')+'</nav><section class="workspace-content">'+body+'</section>';
  }
  function renderPanel(task) {
    if(!sales(task))return false;
    if(currentTask?.id!==task.id){workspaceTab='apps';mode=task.appRun.schemaChanges?.length?'changes':'latest';selectedApp=query.get('app');selectedTable=null;}
    currentTask=task;
    document.querySelector('.panel-placeholder').hidden=true;
    document.querySelector('#file-preview').hidden=true;
    document.querySelector('#task-file-list').hidden=false;
    renderWorkspace();return true;
  }
  function configureTask(task) {
    document.body.classList.toggle('apps-task',sales(task));
    document.querySelector('.panel-head strong').textContent=sales(task)?'AI Agent 工作台':'任务文件';
    document.querySelector('#task-file-panel-close').setAttribute('aria-label',sales(task)?'关闭工作台':'关闭任务文件面板');
    document.querySelector('#task-file-panel-toggle').lastChild.textContent=sales(task)?'工作台':'任务文件';
    const name=sales(task)?task.appRun.agent:agentName;
    const role=sales(task)?'应用数据分析与更新':profile.role;
    document.querySelector('#agent-name').textContent=name;
    document.querySelector('#agent-role').textContent=role;
    document.querySelector('#welcome-agent-name').textContent=name;
    document.querySelector('#welcome-role').textContent=role;
    document.querySelector('#agent-portrait').alt=name+'职业形象';
    if(!sales(task))return;
    document.title=task.title+' · '+task.appRun.agent;
  }
  function back() {
    if(query.get('from')!=='apps-history')return false;
    const p=new URLSearchParams({edition,page:'apps'});
    if(query.get('app')){p.set('app',query.get('app'));p.set('scope',query.get('scope')==='all'?'all':'mine');p.set('run',query.get('run')||'');p.set('from','task');}
    location.href='index.html?'+p;return true;
  }
  function init() {
    document.addEventListener('click',event=>{
      const b=event.target.closest('button');if(!b||!currentTask)return;
      if(b.dataset.workspaceTab){workspaceTab=b.dataset.workspaceTab;renderWorkspace();}
      else if(b.dataset.resultMode){
        workspaceTab='apps';mode=b.dataset.resultMode;
        if(b.dataset.resultApp){selectedApp=b.dataset.resultApp;selectedTable=null;}
        renderWorkspace();setFilePanelOpen(true);
      }else if(b.dataset.resultTable){selectedTable=b.dataset.resultTable;renderWorkspace();}
    });
    document.addEventListener('change',event=>{
      if(event.target.id==='workspace-app'){selectedApp=event.target.value;selectedTable=null;renderWorkspace();}
    });
    const id=query.get('run')||(query.get('task')==='apps-sales-update'?'run-0908-review':null);
    const r=id?(AppsSchema.taskFor(user,id)||M.taskFor(user,id)):null;
    if(query.get('from')==='apps-history')document.querySelector('#agent-back').textContent='‹ 返回结构变更历史';
    if(!id)return;
    if(!r){
      document.querySelector('#new-task-view').hidden=true;
      document.querySelector('#conversation-view').hidden=false;
      document.querySelector('#task-title').textContent='无法查看任务';
      document.querySelector('#conversation-stream').innerHTML='<article class="message message-agent"><h3>任务不存在或暂无查看权限</h3><p>可以返回结构变更历史，继续查看有权访问的表结构变更。</p></article>';
      return;
    }
    const task={id:r.id,title:r.title,status:r.status==='失败'?'failed':'done',progress:100,prompt:r.title,summary:summary(r.changes),appRun:r};
    taskGroups.unshift({label:'本次任务',tasks:[task]});renderTaskHistory();renderTask(task.id);
  }
  return {init,sales,conversation,renderPanel,configureTask,back,augmentPreview:()=>{}};
})();
