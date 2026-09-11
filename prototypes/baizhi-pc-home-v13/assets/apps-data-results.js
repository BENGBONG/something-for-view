/* Prototype: task details and Apps history share the same run records. */
window.ArtifactResults = (() => {
  const M=AppsDataModel, query=new URLSearchParams(location.search);
  const user=sessionStorage.getItem('apps-demo-user')||'zhang';
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
  function conversation(task) {
    const r=task.appRun,failed=r.status==='失败';
    return '<article class="message message-user"><div>'+escapeHTML(task.prompt)+'</div></article><article class="message message-agent"><h3>'+(failed?'任务执行失败':'任务已完成')+'</h3><p>'+escapeHTML(r.agent)+' · '+escapeHTML(M.users[r.actor].name)+' · '+escapeHTML(r.time)+'</p><div class="task-progress"><div class="progress-step done"><i></i>接收任务：'+escapeHTML(r.title)+'</div>'+groups(r).map(g=>renderToolCall('更新「'+g.app.name+'」',g.app.tables.filter(t=>g.changes.some(c=>c.table===t.id)).map(t=>t.name).join('、')+'；'+summary(g.changes),'已提交')).join('')+'<div class="progress-step '+(failed?'':'done')+'"><i></i>'+(failed?'任务未完成，已提交的变更仍然保留':'应用数据更新完成')+'</div></div><p>'+(failed?'本次任务未全部完成，不会因失败而自动撤销已提交的数据。':r.changes.length?'更新已保存到应用数据，无需另存文件。':'本次没有产生数据变更。')+'</p>'+groups(r).map(g=>'<section><h4>'+escapeHTML(g.app.name)+'</h4><p>'+summary(g.changes)+'</p>'+links(g,r)+'</section>').join('')+'<p>本次变更保留此次运行的修改前后值；最新数据可能包含后续任务的更新。</p></article>';
  }
  function renderPanel(task) {
    if(!sales(task))return false;
    const r=task.appRun;
    document.querySelector('.panel-placeholder').hidden=true;
    document.querySelector('#file-preview').hidden=true;
    const panel=document.querySelector('#task-file-list');panel.hidden=false;
    panel.innerHTML='<section class="panel-section"><div class="panel-section-title">执行状态 <span>'+(r.status==='失败'?'执行失败':'已完成')+'</span></div><p>'+escapeHTML(r.agent)+'</p><p>触发人：'+escapeHTML(M.users[r.actor].name)+'</p><small>'+escapeHTML(r.time)+'</small></section><section class="panel-section"><div class="panel-section-title">更新的应用 <span>'+groups(r).length+'</span></div>'+groups(r).map(g=>'<h4>'+escapeHTML(g.app.name)+'</h4><p>'+summary(g.changes)+'</p>'+links(g,r)).join('')+'</section>';
    return true;
  }
  function configureTask(task) {
    if(!sales(task))return;
    document.querySelector('#agent-name').textContent=task.appRun.agent;
    document.querySelector('#agent-role').textContent='应用数据分析与更新';
    document.querySelector('#agent-portrait').alt=task.appRun.agent+'职业形象';
    document.title=task.title+' · '+task.appRun.agent;
  }
  function back() {
    if(query.get('from')!=='apps-history')return false;
    const p=new URLSearchParams({edition,page:'apps'});
    if(query.get('app')){p.set('app',query.get('app'));p.set('scope',query.get('scope')==='all'?'all':'mine');p.set('run',query.get('run')||'');p.set('from','task');}
    location.href='index.html?'+p;return true;
  }
  function init() {
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
