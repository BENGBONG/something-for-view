window.AppsDataUI = (() => {
  const M=AppsDataModel, E=AppsDataEditor, G=AppsGridTools, q=s=>document.querySelector(s);
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const value=x=>x===null||x===undefined?'—':typeof x==='boolean'?(x?'是':'否'):typeof x==='number'?x.toLocaleString('zh-CN'):esc(typeof x==='object'?JSON.stringify(x):x);
  let state={user:'zhang',mode:'mine',app:null,scope:'mine',tab:'data',table:null,search:'',owner:'',department:'',agent:'',operation:'',historyTable:'',from:'',to:'',page:1};
  let root,lastRun=null,historySnapshot=[],loadedFingerprint='';
  const personal=()=>document.body.dataset.edition==='personal';
  const app=()=>M.apps.find(x=>x.id===state.app);
  const availableApps=()=>M.apps.filter(a=>M.allowed(state.user,a,'mine',personal())||M.canManage(state.user,a,personal()));
  const initialScope=a=>a&&!M.allowed(state.user,a,'mine',personal())&&M.canManage(state.user,a,personal())?'all':'mine';
  const person=id=>`<span class="apps-person">${esc(M.users[id]?.name||id)}<small>${esc(M.users[id]?.department||'')}</small></span>`;
  const opts=(values,selected)=>values.map(([id,name])=>`<option value="${esc(id)}" ${id===selected?'selected':''}>${esc(name)}</option>`).join('');
  const resetFilters=()=>{G.reset();Object.assign(state,{search:'',owner:'',department:'',agent:'',operation:'',historyTable:'',from:'',to:'',page:1});};
  function navigate(id=null,scope=null,tab='data') {
    if(ArtifactUI.guard(()=>navigate(id,scope,tab))||E.guard(()=>navigate(id,scope,tab)))return;
    const a=M.apps.find(x=>x.id===id);
    state.app=a?.id||null;state.scope=scope||initialScope(a);state.tab=tab;state.table=a?.tables[0]?.id||null;resetFilters();
    if(a&&!M.allowed(state.user,a,state.scope,personal())){state.app=null;showToast('当前身份无权查看此应用数据');}
    showMainView('apps',{silent:true});document.querySelectorAll('.tree-folder-toggle.active,.knowledge-leaf.active').forEach(x=>x.classList.remove('active'));render();
  }
  function nav() {
    const list=availableApps();
    q('#apps-nav-children').innerHTML=list.map(a=>`<button class="side-sub-item apps-side-entry ${state.app===a.id?'active':''}" data-app-open="${a.id}"><svg class="icon"><use href="#ico-folder"/></svg>${esc(a.name)}</button>`).join('');
    q('#apps-entry').classList.toggle('active',!root.hidden);
  }
  function head(title,description) {
    return `<div class="apps-page-head"><div>${state.app?'<button class="apps-link apps-back" data-app-back>‹ 返回应用数据</button>':''}<h1>${esc(title)}</h1><p>${esc(description)}</p></div></div><div id="apps-new-data" class="apps-update" hidden><span>有新数据，刷新查看</span><button class="apps-link" data-app-refresh>刷新</button></div>`;
  }
  function empty(text,sub='') {return `<div class="apps-empty"><span class="apps-symbol">▦</span><strong>${esc(text)}</strong>${esc(sub)}</div>`;}
  function renderList() {
    const list=availableApps().filter(a=>a.name.includes(state.search)||a.description.includes(state.search));
    root.innerHTML=head('应用数据','查看 Agent 更新的业务数据与变更记录')+`<div class="apps-toolbar"><span class="apps-caption">${M.apps.some(a=>M.canManage(state.user,a,personal()))?'展示已使用及有权管理的应用':'仅展示我的数据，成功更新后自动加入应用'}</span><input type="search" data-app-filter="search" aria-label="搜索应用" placeholder="搜索应用名称" value="${esc(state.search)}"></div><div class="apps-panel">${list.length?`<div class="apps-table-scroll"><table class="apps-table"><thead><tr><th>应用名称</th><th>数据表</th><th>数据条数</th><th>最近更新时间</th><th>最近更新人</th></tr></thead><tbody>${list.map(a=>{
      const scope=initialScope(a),h=M.latestActivity(state.user,a.id,scope,personal()),total=a.tables.reduce((n,t)=>n+M.rows(state.user,a.id,t.id,scope,personal()).length,0);
      return `<tr><td><button class="apps-link apps-name" data-app-open="${a.id}"><span class="apps-symbol">▦</span><span><strong>${esc(a.name)}</strong><small>${esc(a.description)}</small></span></button></td><td>${a.tables.length} 张表</td><td>${total} 条</td><td>${h?.time||'—'}</td><td>${h?person(h.actor):'—'}</td></tr>`;
    }).join('')}</tbody></table></div><div class="apps-footer">共 ${list.length} 个应用 · 按 App 展示，不按 Agent 分组</div>`:empty(state.search?'没有匹配的应用':'暂无应用数据',state.search?'试试其他应用名称':'运行带应用工具的 Agent 并成功更新数据后，应用将自动出现。')}</div>`;
  }
  function getHistory() {
    return AppsSchema.history(state.user,state.app,state.scope,personal()).slice().sort((a,b)=>b.time.localeCompare(a.time));
  }
  function pageFooter(total) {
    const pages=Math.max(1,Math.ceil(total/7));state.page=Math.min(state.page,pages);
    return `<div class="apps-footer"><span>共 ${total} ${state.tab==='history'?'次结构变更':'条数据'} · 每页 7 条</span><div><button class="apps-btn" data-app-page="-1" ${state.page===1?'disabled':''}>上一页</button><span>${state.page} / ${pages}</span><button class="apps-btn" data-app-page="1" ${state.page===pages?'disabled':''}>下一页</button></div></div>`;
  }
  function tableRows(a,table) {
    const all=M.rows(state.user,a.id,table.id,state.scope,personal());
    const base=all.filter(r=>(!state.owner||r.owner===state.owner)&&(!state.department||M.users[r.owner]?.department===state.department)&&(!state.search||r.values.some(v=>AppsFieldValues.raw(v).toLowerCase().includes(state.search.toLowerCase()))));
    return {all,rows:G.query(base,table)};
  }
  function downloadTable() {
    if(E.guard(downloadTable))return;
    M.reload();
    const a=app(),table=a?.tables.find(t=>t.id===state.table);
    if(!table||state.tab!=='data'||!M.allowed(state.user,a,state.scope,personal())){showToast('当前没有下载此表的权限');return;}
    try {
      const {rows}=tableRows(a,table);
      AppsTableExport.download(a,table,rows,M.users,G.metadata());
      showToast(`已下载「${table.name}」 · ${rows.length} 条记录（全部匹配结果）`);
    } catch {showToast('表格下载失败，请重试');}
  }
  function taskEntry() {
    document.querySelectorAll('.apps-task-entry').forEach(n=>n.remove());
    const tasks=availableApps().flatMap(a=>M.history(state.user,a.id,initialScope(a),personal())).filter(r=>M.taskFor(state.user,r.id));
    const latest=tasks.sort((a,b)=>b.time.localeCompare(a.time))[0];
    if(!latest)return;
    const button=document.createElement('button');button.type='button';button.className='history-row apps-task-entry';
    button.dataset.historyType='normal';button.dataset.appTaskRun=latest.id;button.title=latest.title;
    button.innerHTML=`<svg class="icon"><use href="#ico-chat"/></svg><span class="history-text">${esc(latest.title)}</span><span class="history-time">应用</span>`;
    const filter=q('[data-history-tab].active')?.dataset.historyTab;button.hidden=!!filter&&filter!=='all';
    q('#history-task-list').prepend(button);
  }
  function openTaskResult(id) {
    const run=M.taskFor(state.user,id);
    if(!run){showToast('暂无该任务的查看权限');return;}
    sessionStorage.setItem('apps-demo-user',state.user);
    const params=new URLSearchParams({edition:personal()?'personal':'enterprise',run:id,app:run.changes[0]?.app||'',from:'history'});
    window.top.location.href='agent.html?'+params;
  }
  function renderDetail() {
    const a=app();if(!M.allowed(state.user,a,state.scope,personal())){state.app=null;renderList();return;}
    const table=a.tables.find(t=>t.id===state.table)||a.tables[0];state.table=table.id;
    let body='';
    const ownerIds=[...new Set(state.tab==='history'?[]:M.rows(state.user,a.id,table.id,state.scope,personal()).map(r=>r.owner))];
    const ownerFilter=state.scope==='all'&&state.tab==='data'?`<select aria-label="${state.tab==='history'?'触发人':'数据所属人'}" data-app-filter="owner">${opts([['',state.tab==='history'?'全部触发人':'全部所属人'],...ownerIds.map(id=>[id,M.users[id].name])],state.owner)}</select>`:'';
    if(state.tab==='data'){
      const {all,rows}=tableRows(a,table),footer=G.footer(rows.length),slice=rows.slice((state.page-1)*7,state.page*7);
      const tools=G.toolbar(table,rows,slice);
      const widths=table.fields.map(f=>f[1]==='JSON'?240:f[1]==='UUID'?240:f[1]==='日期时间'?180:/痛点|建议|行动|描述/.test(f[0])?180:/区域|等级|优先级|已联系/.test(f[0])?104:f[1]==='日期'?128:140);
      const tableNav=G.rail(a.tables,table.id,id=>M.rows(state.user,a.id,id,state.scope,personal()).length);
      const writable=M.operations(a.id,table.id).length>0,meta=G.metadata();
      body=`<div class="apps-data-layout ${G.collapsed()?'rail-collapsed':''}">${tableNav}<section class="apps-sheet-content" aria-label="${esc(table.name)}"><div class="apps-sheet-heading"><div><strong>${esc(table.name)}</strong><span class="apps-caption">${writable?'仅可维护本人记录':'只读 · 此表由 Agent 更新'}</span></div><div class="apps-sheet-actions"><button class="apps-btn apps-download-btn" data-app-download title="下载当前权限范围和筛选条件下的全部记录，不限当前页"><svg class="icon" aria-hidden="true"><use href="#ico-download"/></svg>下载表格</button>${M.permissions(state.user,a.id,table.id,null,state.scope,personal()).create?'<button class="apps-btn primary" data-edit-create>＋ 新增记录</button>':''}</div></div><div class="apps-toolbar"><div class="apps-filter-group">${ownerFilter}${state.scope==='all'?`<select data-app-filter="department" aria-label="部门">${opts([['','全部部门'],...[...new Set(all.map(r=>M.users[r.owner].department))].map(d=>[d,d])],state.department)}</select>`:`<span class="apps-caption">${writable?'Enter / 失焦保存 · Esc 取消':'当前表不支持手动修改'}</span>`}</div><input type="search" aria-label="搜索表格数据" data-app-filter="search" placeholder="搜索表格内容" value="${esc(state.search)}"></div>${tools}${E.banner()}<div class="apps-table-scroll apps-grid-scroll"><table class="apps-table apps-data-grid" style="width:${40+44+widths.reduce((n,w)=>n+w,0)+170+158+106+(meta?370:0)}px"><colgroup><col style="width:40px"><col style="width:44px">${widths.map(w=>`<col style="width:${w}px">`).join('')}<col style="width:170px"><col style="width:158px">${meta?'<col style="width:210px"><col style="width:160px">':''}<col style="width:106px"></colgroup><thead><tr>${G.selectHead()}<th scope="col">#</th>${table.fields.map(f=>`<th scope="col">${esc(f[0])}${f[2]?.required?'<span class="apps-required" title="必填">*</span>':''}<small>${esc(f[1])}</small></th>`).join('')}<th scope="col">数据所属人</th><th scope="col">更新时间</th>${meta?'<th scope="col">记录 ID<small>只读</small></th><th scope="col">创建时间<small>只读</small></th>':''}<th scope="col" class="apps-row-operation">操作</th></tr></thead><tbody>${slice.map((r,i)=>`<tr>${G.checkbox(r)}<td class="apps-readonly-cell" aria-readonly="true" title="只读：行序号">${(state.page-1)*7+i+1}</td>${E.cells(r,table,value)}<td class="apps-readonly-cell" aria-readonly="true" title="只读：数据所属人不可修改">${person(r.owner)}</td><td class="apps-time-cell apps-readonly-cell" aria-readonly="true" title="只读：更新时间由系统维护">${esc(r.updated)}</td>${meta?`<td class="apps-record-id apps-readonly-cell" aria-readonly="true" title="只读：记录 ID">${esc(r.id)}</td><td class="apps-readonly-cell" aria-readonly="true" title="只读：创建时间由系统维护">${esc(r.created||'未记录')}</td>`:''}${E.actions(r)}</tr>`).join('')}</tbody></table>${!rows.length?empty('当前范围暂无记录','请调整筛选条件，或在有权限的表中新增记录。'):''}</div>${footer}</section></div>`;
    }else{
      historySnapshot=getHistory();const footer=pageFooter(historySnapshot.length),slice=historySnapshot.slice((state.page-1)*7,state.page*7);
      body=`<p class="apps-caption">仅记录已生效的表与字段定义变化，不记录单元格内容变化。</p><div class="apps-panel"><div class="apps-table-scroll"><table class="apps-table"><thead><tr><th>变更时间</th><th>结构版本</th><th>变更来源</th><th>操作人</th><th>结构变更摘要</th><th>操作</th></tr></thead><tbody>${slice.map(r=>`<tr><td>${esc(r.time)}</td><td>${esc(r.version)}</td><td>${esc(r.source)}${r.agent?`<small class="apps-caption" style="display:block">${esc(r.agent)}</small>`:''}</td><td>${esc(r.actor)}</td><td>${r.changes.map(c=>`<div>${esc(c.type)} · ${esc(c.tableName)}${c.target!==c.tableName?' / '+esc(c.target):''}</div>`).join('')}</td><td><button class="apps-link" data-app-history="${r.id}">查看结构变更</button></td></tr>`).join('')}</tbody></table>${!slice.length?empty('暂无结构变更记录','数据内容更新不会产生结构变更历史。'):''}</div>${footer}</div>`;

    }
    const scopeButtons=M.canManage(state.user,a,personal())?`<button data-app-scope="mine" class="${state.scope==='mine'?'active':''}" ${!M.allowed(state.user,a,'mine',personal())?'disabled':''}>我的数据</button><button data-app-scope="all" class="${state.scope==='all'?'active':''}">全部数据</button>`:'';
    root.innerHTML=head(a.name,a.description)+`${scopeButtons&&state.tab==='data'?`<div class="apps-scope">${scopeButtons}${state.scope==='all'?'<span class="apps-caption">当前企业内授权数据</span>':''}</div>`:''}<div class="apps-segment"><button data-app-tab="data" class="${state.tab==='data'?'active':''}">数据表</button><button data-app-tab="history" class="${state.tab==='history'?'active':''}">结构变更历史</button></div>${body}<p class="apps-caption">最近读取：${new Date().toLocaleString('zh-CN',{hour12:false})} · 当前为已提交数据</p>`;
  }
  function fingerprint() {
    const items=state.app?[app()]:availableApps();
    return JSON.stringify([M.revision(),items.filter(Boolean).map(a=>a.id)]);
  }
  function render() {if(state.app)renderDetail();else renderList();nav();loadedFingerprint=fingerprint();}
  function detail(id) {
    const record=historySnapshot.find(r=>r.id===id||r.run===id);
    if(!record){showToast('此链接没有对应的结构变更；数据内容历史已不再提供');return;}
    const d=q('#apps-history-dialog');
    d.innerHTML=`<div class="apps-detail-heading"><div><h2>表结构变更</h2><p>${esc(app().name)} · ${esc(record.version)}</p></div><button class="apps-btn" data-app-close>关闭</button></div><div class="apps-detail-meta"><div><small>生效时间</small>${esc(record.time)}</div><div><small>来源</small>${esc(record.source)}</div><div><small>操作人</small>${esc(record.actor)}</div><div><small>结构版本</small>${esc(record.version)}</div></div><p>只展示表、字段及类型等定义变化，不包含任何业务记录的旧值或新值。</p>${record.changes.map(c=>`<section class="apps-change"><div class="apps-change-head"><span class="apps-pill">${esc(c.type)}</span><strong>${esc(c.tableName)} · ${esc(c.target)}</strong></div><table class="apps-diff"><thead><tr><th>变更对象</th><th>原结构</th><th>新结构</th></tr></thead><tbody><tr><td>${esc(c.target)}</td><td>${esc(c.before)}</td><td>${esc(c.after)}</td></tr></tbody></table></section>`).join('')}${record.run&&AppsSchema.taskFor(state.user,record.run)?`<footer><button class="apps-link" data-app-task="${record.id}">查看本次任务</button></footer>`:''}`;
    d.showModal();
  }
  function task(run) {
    if(!run)return;
    if(!AppsSchema.taskFor(state.user,run.run)){showToast('暂无该任务的查看权限，仍可查看当前应用的结构变更');return;}
    sessionStorage.setItem('apps-history-return',JSON.stringify({state,run:run.run}));
    const query=new URLSearchParams({edition:personal()?'personal':'enterprise',agent:run.agent,run:run.run,app:state.app||'',scope:state.scope,from:'apps-history'});
    window.top.location.href='agent.html?'+query;
  }
  function demo() {
    q('#apps-demo-dialog').innerHTML=`<h2>演示设置</h2><p>仅用于原型评审。切换身份不会修改真实账号，执行场景不会调用真实 Agent。</p><label>当前身份<select id="apps-demo-user">${opts(Object.entries(M.users).map(([id,u])=>[id,`${u.name} · ${u.role}`]),state.user)}</select></label><label>模拟任务<select id="apps-demo-scenario"><option value="update">商机复盘 Agent → 更新销售洞察</option><option value="multi">销售洞察 Agent → 同时更新销售洞察、客户商机</option><option value="first">交付跟踪 Agent → 成功写入项目交付</option><option value="read">只读成功 → 不新增应用</option><option value="failed">项目交付写入后失败 → 不新增应用</option></select></label><p>新成员许安初始没有应用数据。陈琳创建了销售洞察和客户商机；李敏是本企业管理员。</p><footer><button class="apps-btn" data-app-close>取消</button><button class="apps-btn" data-app-identity>切换身份</button><button class="apps-btn primary" data-app-simulate>模拟执行</button></footer>`;q('#apps-demo-dialog').showModal();
  }
  function identity() {
    state.user=q('#apps-demo-user').value;state.mode='mine';state.app=null;resetFilters();
    sessionStorage.setItem('apps-demo-user',state.user);taskEntry();
  }
  function init() {
    state.user=new URLSearchParams(location.search).get('demoUser')||sessionStorage.getItem('apps-demo-user')||'zhang';if(!M.users[state.user])state.user='zhang';
    if(new URLSearchParams(location.search).has('demoUser')) {const label=q('.user-name');if(label)label.textContent=M.users[state.user].name;}
    mainViewTitles.apps='应用数据';
    q('.main').insertAdjacentHTML('beforeend','<section class="apps-workspace" data-main-view="apps" hidden></section>');root=q('.apps-workspace');
    q('#knowledge-side-list').insertAdjacentHTML('beforeend','<div class="apps-nav"><button id="apps-entry" class="side-sub-item apps-side-entry"><svg class="icon"><use href="#ico-folder"/></svg>应用数据</button><div id="apps-nav-children" class="apps-nav-children"></div></div>');
    q('.knowledge-sidebar-tools').before(q('.apps-nav'));
    document.body.insertAdjacentHTML('beforeend','<dialog id="apps-history-dialog" class="apps-dialog apps-drawer" aria-label="表结构变更"></dialog><dialog id="apps-demo-dialog" class="apps-dialog" aria-label="演示设置"></dialog>');
    E.init(()=>({user:state.user,appId:state.app,table:state.table,scope:state.scope,personal:personal()}),reset=>{if(reset)resetFilters();render();});
    G.init(()=>state,()=>({user:state.user,appId:state.app,table:state.table,scope:state.scope,personal:personal()}),render,root);
    q('#apps-entry').onclick=()=>navigate();
    document.addEventListener('click',event=>{
      const b=event.target.closest('button');if(!b)return;const d=b.dataset;
      if('appOpen'in d)navigate(d.appOpen);
      else if('appDownload'in d)downloadTable();
      else if('appTaskRun'in d)openTaskResult(d.appTaskRun);
      else if('appBack'in d)navigate();
      else if('appMode'in d){state.mode=d.appMode;state.search='';render();}
      else if('appScope'in d){state.scope=d.appScope;resetFilters();render();}
      else if('appTab'in d){state.tab=d.appTab;resetFilters();render();}
      else if('appTable'in d){state.table=d.appTable;resetFilters();render();}
      else if('appPage'in d){state.page+=Number(d.appPage);render();}
      else if('appClear'in d){resetFilters();render();}
      else if('appHistory'in d)detail(d.appHistory);
      else if('appTask'in d)task(historySnapshot.find(r=>r.id===d.appTask));
      else if('appDemo'in d)demo();
      else if('appClose'in d)b.closest('dialog').close();
      else if('appIdentity'in d){identity();q('#apps-demo-dialog').close();navigate();}
      else if('appSimulate'in d){const scenario=q('#apps-demo-scenario').value;const changed=state.user!==q('#apps-demo-user').value;if(changed)identity();lastRun=M.run(state.user,scenario);q('#apps-demo-dialog').close();if(changed)navigate();task(lastRun);if(q('#apps-new-data'))q('#apps-new-data').hidden=fingerprint()===loadedFingerprint;nav();}
      else if('appRefresh'in d){M.reload();render();showToast('已读取当前范围的最新数据');}
      else if('appResult'in d){document.querySelectorAll('.apps-dialog[open]').forEach(x=>x.close());navigate(d.appResult,d.scope,d.run?'history':'data');if(d.run)detail(d.run);}
    });
    root.addEventListener('change',event=>{const name=event.target.dataset.appFilter;if(name){G.clearSelection();const requested=event.target.value;if(E.guard(()=>{state[name]=requested;state.page=1;render();})){event.target.value=state[name];return;}const previous=state[name];state[name]=event.target.value;if(state.from&&state.to&&state.from>state.to){state[name]=previous;event.target.value=previous;showToast('开始日期不能晚于结束日期');return;}state.page=1;render();}});
    root.addEventListener('input',event=>{if(event.target.dataset.appFilter!=='search')return;G.clearSelection();const requested=event.target.value;if(E.guard(()=>{state.search=requested;state.page=1;render();})){event.target.value=state.search;return;}const cursor=event.target.selectionStart;state.search=event.target.value;state.page=1;render();const next=q('[data-app-filter="search"]');next?.focus();next?.setSelectionRange(cursor,cursor);});
    window.addEventListener('storage',e=>{if(e.key!==M.key)return;M.reload();if(!root.hidden&&fingerprint()!==loadedFingerprint)q('#apps-new-data').hidden=false;});
    nav();taskEntry();
  }
  function openRun(id) { if(!state.app)return;state.tab='history';resetFilters();render();detail(id); }
  function restoreHistory(id) {
    try {
      const saved=JSON.parse(sessionStorage.getItem('apps-history-return'));
      if(saved?.run===id&&saved.state.app===state.app&&saved.state.user===state.user) {
        const next=saved.state;
        if(M.allowed(state.user,app(),next.scope,personal())){state={...next,tab:'history'};render();detail(id);return;}
      }
    } catch {}
    openRun(id);
  }
  return {init,navigate,openRun,restoreHistory,state:()=>({...state})};
})();
