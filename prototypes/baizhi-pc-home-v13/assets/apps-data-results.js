/* Prototype: task details and Apps history share the same run records. */
window.ArtifactResults = (() => {
  const M=AppsDataModel, query=new URLSearchParams(location.search);
  const user=sessionStorage.getItem('apps-demo-user')||'zhang';
  const scopeFor=appId=>appId===query.get('app')&&query.get('scope')==='all'?'all':'mine';
  const sales=t=>!!t?.appRun;
  const summary=cs=>['新增','修改','删除'].map(op=>op+' '+cs.filter(c=>c.op===op).length).join(' · ');
  const groups=r=>[...new Set(r.changes.map(c=>c.app))].map(id=>({app:M.apps.find(a=>a.id===id),changes:r.changes.filter(c=>c.app===id)}));
  function url(appId,runId) {
    const scope=appId===query.get('app')&&query.get('scope')==='all'?'all':'mine';
    const p=new URLSearchParams({edition,page:'apps',app:appId,scope});
    if(runId){p.set('run',runId);p.set('from','task');}
    return 'index.html?'+p;
  }
  function links(g,r) {
    if(!M.allowed(user,g.app,'mine',edition==='personal'))return '<p>应用入口尚未开放，已提交的变更保留在任务记录中。</p>';
    return '<p><a href="'+url(g.app.id)+'">查看最新数据</a>　<a href="'+url(g.app.id,r.id)+'">查看本次变更</a></p>';
  }
  let currentTask=null, workspaceTab='apps', selectedApp=null, mode='changes', selectedTable=null;
  const e=x=>escapeHTML(String(x??'—'));
  const cell=x=>x===null||x===undefined?'未填写':typeof x==='boolean'?(x?'是':'否'):typeof x==='number'?x.toLocaleString('zh-CN'):e(x);
  const tableNames=g=>g.app.tables.filter(t=>g.changes.some(c=>c.table===t.id)).map(t=>t.name).join('、');
  function conversation(task) {
    const r=task.appRun,gs=groups(r),failed=r.status==='失败';
    return '<article class="message message-user"><div>'+e(task.prompt)+'</div></article>'+
      '<details class="result-process"><summary>任务执行过程</summary><ol>'+gs.map(g=>'<li>更新「'+e(g.app.name)+'」：'+e(tableNames(g))+'。'+summary(g.changes)+'，已提交。</li>').join('')+'</ol></details>'+
      '<section class="result-block"><h3>应用数据更新 <small>共 '+gs.length+' 个应用</small></h3><p class="result-copy">'+(failed?'任务未全部完成，以下数据已提交并保留。':'已将本次分析结果更新至应用，可在知识库持续查看。')+'</p>'+
      gs.map(g=>'<article class="app-result-card"><span class="app-result-mark"><img src="assets/figma-task/folder.svg" alt=""/></span><div class="app-result-name"><div class="app-result-title"><strong title="'+e(g.app.name)+'">'+e(g.app.name)+'</strong><span class="result-status">已更新</span></div><p>'+summary(g.changes)+'</p></div><div class="app-result-actions"><button class="result-link" data-result-app="'+g.app.id+'" data-result-mode="changes">查看本次变更</button><button class="result-link" data-result-app="'+g.app.id+'" data-result-mode="latest">查看最新数据</button></div></article>').join('')+
      (!gs.length?'<div class="result-summary"><p>本次未产生应用数据更新。</p></div>':'')+'</section>'+
      '<section class="result-block"><h3>任务完成总结</h3><div class="result-summary"><p>'+(failed?'任务执行失败，但已提交的数据不会自动撤销。':r.id==='run-0908-review'?'已更新重点商机的报价金额与下次跟进日期，移除失效客户，并调整本周销售汇总。':'已完成本次应用数据整理，具体更新内容可在右侧工作台查看。')+'</p><div class="result-summary-metrics"><span><strong>'+gs.length+'</strong>更新应用</span><span><strong>'+new Set(r.changes.map(c=>c.app+'/'+c.table)).size+'</strong>涉及数据表</span><span><strong>'+r.changes.length+'</strong>数据变更次数</span></div></div></section>'+
      '<p class="task-complete-note">'+(failed?'任务执行失败 · 已提交的数据仍保留':'任务已完成 · 可继续补充要求')+'</p>';
  }
  function renderWorkspace() {
    const r=currentTask.appRun,gs=groups(r),g=gs.find(x=>x.app.id===selectedApp)||gs[0];
    selectedApp=g?.app.id;
    const tabs=[['tools','工具调用'],['files','文件列表'],['revisions','修订文件'],['apps','应用数据']];
    let body='';
    if(workspaceTab==='apps'&&g) {
      const tables=mode==='changes'?g.app.tables.filter(t=>g.changes.some(c=>c.table===t.id)):g.app.tables;
      const t=tables.find(t=>t.id===selectedTable)||tables.find(t=>t.id===g.changes[0]?.table)||tables[0];selectedTable=t?.id;
      const access=M.allowed(user,g.app,scopeFor(g.app.id),edition==='personal');
      body='<select class="workspace-app-select" aria-label="选择应用" id="workspace-app">'+gs.map(x=>'<option value="'+x.app.id+'" '+(x.app.id===g.app.id?'selected':'')+'>'+e(x.app.name)+'</option>').join('')+'</select>'+
        '<div class="workspace-mode" role="tablist" aria-label="应用内容视图">'+[['changes','本次变更'],['latest','最新数据']].map(([id,label])=>'<button role="tab" aria-selected="'+(mode===id)+'" data-result-mode="'+id+'">'+label+'</button>').join('')+'</div>'+
        '<p class="workspace-description">'+(mode==='changes'?'本次任务的更新记录，不随最新数据改变':'当前最新数据 · 只读查看')+'</p>'+
        '<div class="workspace-table-select" role="tablist" aria-label="应用数据表">'+tables.map(x=>'<button role="tab" aria-selected="'+(x.id===t.id)+'" data-result-table="'+x.id+'">'+e(x.name)+'</button>').join('')+'</div>';
      if(mode==='changes'){
        const cs=g.changes.filter(c=>c.table===t.id);
        body+='<p class="workspace-counts">'+summary(cs)+' · 当前表</p>'+cs.map((c,index)=>'<details class="workspace-change" '+(index===0?'open':'')+'><summary><span class="result-status '+(c.op==='删除'?'warning':'')+'">'+c.op+'</span><strong>'+cell((c.after||c.before)[0])+'</strong><small>#'+c.sequence+'</small></summary><table class="workspace-diff"><thead><tr><th scope="col">字段</th><th scope="col">修改前</th><th scope="col">修改后</th></tr></thead><tbody>'+t.fields.map((f,i)=>c.before&&c.after&&c.before[i]===c.after[i]?'':'<tr><td>'+e(f[0])+'</td><td>'+(c.before?cell(c.before[i]):'不存在')+'</td><td>'+(c.after?cell(c.after[i]):'已删除')+'</td></tr>').join('')+'</tbody></table></details>').join('');
      }else if(access){
        const rows=M.rows(user,g.app.id,t.id,scopeFor(g.app.id),edition==='personal');
        body+='<div class="workspace-scroll"><table class="workspace-grid"><thead><tr>'+t.fields.map(f=>'<th>'+e(f[0])+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.values.map(v=>'<td>'+cell(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div><p class="workspace-description">共 '+rows.length+' 条数据</p>';
        if(!rows.length)body+='<p class="workspace-empty">这张表暂无数据</p>';
      }else body+='<div class="workspace-empty">暂无查看最新数据的权限<br>本次已提交的变更仍可在任务中查看。</div>';
      body+='<div class="workspace-footer"><small>'+(mode==='changes'?'提交于 '+e(r.time):'当前可查看的最新数据')+'</small>'+(access?'<a class="result-link" href="'+url(g.app.id,mode==='changes'?r.id:null)+'">在知识库中打开</a>':'')+'</div>';
    }else if(workspaceTab==='tools'){
      body='<h3 style="font-size:14px;margin-top:0">本次应用工具调用</h3><p class="workspace-description">按已提交的更新展示；完整执行日志以实际任务记录为准。</p>'+gs.map(g=>'<section class="workspace-log"><strong>'+e(g.app.name)+'</strong><br>'+e(tableNames(g))+'<br>'+summary(g.changes)+'<br>提交时间：'+e(r.time)+'</section>').join('');
    }else body='<div class="workspace-empty">'+(workspaceTab==='files'?'本次任务未生成文件<br>更新结果请在「应用数据」中查看。':workspaceTab==='revisions'?'本次任务没有修订文件<br>应用数据的修改记录在「应用数据」中查看。':'本次任务未更新应用数据。')+'</div>';
    document.querySelector('#task-file-list').innerHTML='<nav class="workspace-tabs" role="tablist" aria-label="工作台">'+tabs.map(([id,label])=>'<button role="tab" aria-selected="'+(workspaceTab===id)+'" data-workspace-tab="'+id+'">'+label+'</button>').join('')+'</nav><section class="workspace-content">'+body+'</section>';
  }
  function renderPanel(task) {
    if(!sales(task))return false;
    if(currentTask?.id!==task.id){workspaceTab='apps';mode='changes';selectedApp=query.get('app');selectedTable=null;}
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
    const r=id?M.taskFor(user,id):null;
    if(query.get('from')==='apps-history')document.querySelector('#agent-back').textContent='‹ 返回应用更新历史';
    if(!id)return;
    if(!r){
      document.querySelector('#new-task-view').hidden=true;
      document.querySelector('#conversation-view').hidden=false;
      document.querySelector('#task-title').textContent='无法查看任务';
      document.querySelector('#conversation-stream').innerHTML='<article class="message message-agent"><h3>任务不存在或暂无查看权限</h3><p>可以返回应用更新历史，继续查看有权访问的数据变更。</p></article>';
      return;
    }
    const task={id:r.id,title:r.title,status:r.status==='失败'?'failed':'done',progress:100,prompt:r.title,summary:summary(r.changes),appRun:r};
    taskGroups.unshift({label:'本次任务',tasks:[task]});renderTaskHistory();renderTask(task.id);
  }
  return {init,sales,conversation,renderPanel,configureTask,back,augmentPreview:()=>{}};
})();
