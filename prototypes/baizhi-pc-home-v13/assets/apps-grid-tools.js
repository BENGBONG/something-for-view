/* Basic grid interactions only; no AI fields or schema management. */
window.AppsGridTools=(()=>{
  const M=AppsDataModel,E=AppsDataEditor,F=AppsFieldValues;
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const empty=v=>v===null||v===undefined||v==='';
  const ops={contains:'包含',eq:'等于',ne:'不等于',gt:'大于 / 晚于',gte:'大于等于',lt:'小于 / 早于',lte:'小于等于',empty:'未填写',not_empty:'已填写'};
  let state,render,context,root,table,selection=new Set(),shown=[],allRows=[],filters=[],sort=[],filterDraft=[],sortDraft=[],panel='',collapsed=false,metadata=false,deletion=null;
  const options=(pairs,value)=>pairs.map(([key,label])=>`<option value="${esc(key)}" ${String(key)===String(value)?'selected':''}>${esc(label)}</option>`).join('');
  const availableOps=type=>['文本','UUID'].includes(type)?(type==='文本'?['contains','eq','ne','empty','not_empty']:['eq','ne','empty','not_empty']):type==='布尔'?['eq','ne','empty','not_empty']:type==='JSON'?['empty','not_empty']:['eq','ne','gt','gte','lt','lte','empty','not_empty'];
  const fields=t=>[...t.fields.map((f,i)=>({key:String(i),name:f[0],type:f[1]})),{key:'created',name:'创建时间',type:'日期时间'},{key:'updated',name:'更新时间',type:'日期时间'},{key:'id',name:'记录 ID',type:'文本'}];
  const get=(r,key)=>/^\d+$/.test(key)?r.values[Number(key)]:r[key];
  const comparable=(v,type)=>type==='日期时间'||type==='日期'?String(v??'').replace(' ','T').slice(0,16):v;
  function query(rows,t,conditions=filters,ordering=sort){
    const defs=fields(t);
    const result=rows.filter(r=>conditions.every(rule=>{
      const def=defs.find(f=>f.key===rule.field),v=get(r,rule.field);
      if(rule.op==='empty')return empty(v);if(rule.op==='not_empty')return !empty(v);if(empty(v))return false;
      const a=comparable(v,def.type),b=comparable(rule.value,def.type);
      return rule.op==='contains'?String(a).toLocaleLowerCase().includes(String(b).toLocaleLowerCase()):rule.op==='eq'?a===b:rule.op==='ne'?a!==b:rule.op==='gt'?a>b:rule.op==='gte'?a>=b:rule.op==='lt'?a<b:a<=b;
    }));
    return result.sort((a,b)=>{for(const rule of ordering){const type=defs.find(f=>f.key===rule.field)?.type,x=comparable(get(a,rule.field),type),y=comparable(get(b,rule.field),type);if(empty(x)||empty(y)){if(empty(x)&&empty(y))continue;return empty(x)?1:-1;}const c=typeof x==='number'?x-y:typeof x==='boolean'?Number(x)-Number(y):String(x).localeCompare(String(y),'zh-CN',{numeric:true});if(c)return rule.direction==='desc'?-c:c;}return 0;});
  }
  function clearSelection(){selection.clear();}
  function reset(){filters=[];sort=[];filterDraft=[];sortDraft=[];panel='';clearSelection();}
  function toolbar(t,rows,slice){
    table=t;allRows=rows;shown=slice;
    const visibleIds=new Set(slice.filter(canDelete).map(r=>r.id));selection=new Set([...selection].filter(id=>visibleIds.has(id)));
    return `<div class="apps-grid-controls"><div><button class="apps-btn ${filters.length?'chosen':''}" data-grid-panel="filter" aria-expanded="${panel==='filter'}">筛选${filters.length?' · '+filters.length:''}</button><button class="apps-btn ${sort.length?'chosen':''}" data-grid-panel="sort" aria-expanded="${panel==='sort'}">排序${sort.length?' · '+sort.length:''}</button><button class="apps-btn ${metadata?'chosen':''}" data-grid-metadata aria-pressed="${metadata}">记录信息</button>${filters.length||sort.length?'<button class="apps-link" data-grid-reset>清空条件</button>':''}</div><span class="apps-caption">${selection.size?`已选 ${selection.size} 条（当前页）`:'双击单元格编辑'}</span>${selection.size?'<button class="apps-trash" data-grid-delete aria-label="删除选中记录" title="删除选中记录"><svg viewBox="0 0 20 20" fill="none"><path d="M3 5h14M7 5V3h6v2M5 5l1 12h8l1-12M8 8v6m4-6v6" stroke="currentColor" stroke-width="1.4"/></svg></button><button class="apps-link" data-grid-unselect>取消选择</button>':''}</div>${panel?builder():''}${filters.length?`<div class="apps-query-summary">同时满足 ${filters.length} 个筛选条件</div>`:''}`;
  }
  function builder(){
    const defs=fields(table),draft=panel==='filter'?filterDraft:sortDraft;
    return `<section class="apps-query-panel" aria-label="${panel==='filter'?'筛选条件':'排序条件'}"><div class="apps-query-heading"><strong>${panel==='filter'?'同时满足以下条件':'按以下优先级排序'}</strong><span>${panel==='filter'?'筛选覆盖全部可见记录':'从上到下依次生效，空值排在最后'}</span></div>${draft.map((rule,i)=>{
      const def=defs.find(f=>f.key===rule.field)||defs[0];
      return `<div class="apps-query-rule"><span>${i+1}</span><select data-grid-rule="${i}" data-rule-part="field" aria-label="${panel==='filter'?'筛选':'排序'}字段 ${i+1}">${options(defs.filter(f=>panel==='filter'||f.type!=='JSON').map(f=>[f.key,f.name]),rule.field)}</select>${panel==='sort'?`<select data-grid-rule="${i}" data-rule-part="direction" aria-label="排序方向 ${i+1}">${options([['asc','升序'],['desc','降序']],rule.direction)}</select><button class="apps-btn" data-grid-up="${i}" aria-label="上移排序 ${i+1}" ${!i?'disabled':''}>↑</button><button class="apps-btn" data-grid-down="${i}" aria-label="下移排序 ${i+1}" ${i===draft.length-1?'disabled':''}>↓</button>`:`<select data-grid-rule="${i}" data-rule-part="op" aria-label="筛选条件 ${i+1}">${options(availableOps(def.type).map(o=>[o,ops[o]]),rule.op)}</select>${['empty','not_empty'].includes(rule.op)?'<span class="apps-rule-no-value">无需填写值</span>':def.type==='布尔'?`<select data-grid-rule="${i}" data-rule-part="value" aria-label="筛选值 ${i+1}">${options([['','请选择'],['true','是'],['false','否']],rule.value)}</select>`:`<input type="${F.inputType(def.type)}" step="any" data-grid-rule="${i}" data-rule-part="value" aria-label="筛选值 ${i+1}" value="${esc(rule.value)}">`}`}<button class="apps-link" data-grid-remove="${i}" aria-label="删除条件 ${i+1}">移除</button></div>`;
    }).join('')}<div id="apps-query-error" role="alert" class="apps-field-error" hidden></div><footer><button class="apps-link" data-grid-add ${draft.length>=8?'disabled':''}>＋ 添加${panel==='filter'?'筛选':'排序'}条件</button><div><button class="apps-btn" data-grid-cancel>取消</button><button class="apps-btn primary" data-grid-apply>应用${panel==='filter'?'筛选':'排序'}</button></div></footer></section>`;
  }
  function canDelete(row){const c=context();return M.permissions(c.user,c.appId,c.table,row,c.scope,c.personal).delete;}
  function checkbox(row){return `<td class="apps-select-cell"><input type="checkbox" aria-label="选择 ${esc(row.values[0])}" data-grid-select="${esc(row.id)}" ${selection.has(row.id)?'checked':''} ${canDelete(row)?'':'disabled'}></td>`;}
  function selectHead(){const eligible=shown.filter(canDelete);return `<th class="apps-select-cell"><input type="checkbox" aria-label="选择当前页可删除记录" data-grid-all ${eligible.length&&eligible.every(r=>selection.has(r.id))?'checked':''} ${eligible.length?'':'disabled'}></th>`;}
  function footer(total){const s=state(),pages=Math.max(1,Math.ceil(total/7));s.page=Math.max(1,Math.min(s.page,pages));const numbers=[...new Set([1,pages,s.page-1,s.page,s.page+1])].filter(n=>n>0&&n<=pages).sort((a,b)=>a-b);
    return `<div class="apps-footer"><span>共 ${total} 条 · 每页 7 条</span><div class="apps-page-numbers"><button class="apps-btn" data-grid-page="${s.page-1}" ${s.page===1?'disabled':''}>上一页</button>${numbers.map((n,i)=>`${i&&n>numbers[i-1]+1?'<span>…</span>':''}<button class="apps-btn ${n===s.page?'chosen':''}" data-grid-page="${n}" ${n===s.page?'aria-current="page"':''}>${n}</button>`).join('')}<button class="apps-btn" data-grid-page="${s.page+1}" ${s.page===pages?'disabled':''}>下一页</button><label>前往 <input type="number" min="1" max="${pages}" value="${s.page}" aria-label="跳转页码" id="apps-page-jump"> 页</label><button class="apps-btn" data-grid-jump>确定</button></div></div>`;
  }
  function rail(tables,selected,counts){return `<aside class="apps-sheet-nav ${collapsed?'is-collapsed':''}"><div class="apps-sheet-nav-heading">${collapsed?'':`数据表 <span>${tables.length}</span>`}<button data-grid-collapse class="apps-rail-toggle" aria-label="${collapsed?'展开':'收起'}数据表导航" aria-expanded="${!collapsed}">${collapsed?'›':'‹'}</button></div><nav aria-label="应用内数据表" ${collapsed?'hidden':''}>${tables.map(t=>`<button aria-pressed="${t.id===selected}" class="${t.id===selected?'active':''}" data-app-table="${t.id}"><span>▦</span><span>${esc(t.name)}</span><em>${counts(t.id)}</em></button>`).join('')}</nav></aside>`;}
  function askDelete(){
    const targets=shown.filter(r=>selection.has(r.id)&&canDelete(r));if(!targets.length)return;
    deletion={context:{...context()},targets:targets.map(r=>({id:r.id,version:r.version||r.updated}))};
    const modal=document.querySelector('#apps-bulk-dialog');modal.innerHTML=`<h2>删除选中的 ${targets.length} 条记录？</h2><p>仅删除当前页已勾选的记录。删除后无法撤销。</p><ul class="apps-delete-list">${targets.map(r=>`<li>${esc(r.values[0])}</li>`).join('')}</ul><div class="apps-editor-error" hidden role="alert"></div><footer><button class="apps-btn" data-grid-delete-cancel>取消</button><button class="apps-btn danger" data-grid-delete-confirm>确认删除 ${targets.length} 条</button></footer>`;modal.showModal();
  }
  function init(getState,getContext,redraw,element){state=getState;context=getContext;render=redraw;root=element;
    document.body.insertAdjacentHTML('beforeend','<dialog id="apps-bulk-dialog" class="apps-dialog apps-confirm" aria-label="批量删除记录" data-app-editor></dialog>');
    document.addEventListener('click',event=>{
      const b=event.target.closest('button');if(!b)return;const d=b.dataset;
      if('gridPanel'in d){panel=panel===d.gridPanel?'':d.gridPanel;filterDraft=filters.map(r=>({...r}));sortDraft=sort.map(r=>({...r}));if(panel==='filter'&&!filterDraft.length)filterDraft=[{field:'0',op:'contains',value:''}];if(panel==='sort'&&!sortDraft.length)sortDraft=[{field:'0',direction:'asc'}];render();}
      else if('gridMetadata'in d){metadata=!metadata;render();}
      else if('gridCollapse'in d){collapsed=!collapsed;render();}
      else if('gridReset'in d){reset();state().page=1;render();}
      else if('gridUnselect'in d){clearSelection();render();}
      else if('gridCancel'in d){panel='';render();}
      else if('gridAdd'in d){const list=panel==='filter'?filterDraft:sortDraft;if(list.length<8)list.push(panel==='filter'?{field:'0',op:'contains',value:''}:{field:'0',direction:'asc'});render();}
      else if('gridRemove'in d){(panel==='filter'?filterDraft:sortDraft).splice(Number(d.gridRemove),1);render();}
      else if('gridUp'in d||'gridDown'in d){const i=Number(d.gridUp??d.gridDown),j=i+('gridUp'in d?-1:1);if(j>=0&&j<sortDraft.length)[sortDraft[i],sortDraft[j]]=[sortDraft[j],sortDraft[i]];render();}
      else if('gridApply'in d){try{if(panel==='filter'){const defs=fields(table);filters=filterDraft.map(rule=>{const f=defs.find(f=>f.key===rule.field);return {...rule,value:['empty','not_empty'].includes(rule.op)?null:F.parse([f.name,f.type,{required:true}],rule.value)};});}else sort=sortDraft.map(r=>({...r}));panel='';clearSelection();state().page=1;render();}catch(error){const node=document.querySelector('#apps-query-error');node.hidden=false;node.textContent=error.message;}}
      else if('gridPage'in d||'gridJump'in d){const n=Number(d.gridPage??document.querySelector('#apps-page-jump').value),pages=Math.max(1,Math.ceil(allRows.length/7));if(!Number.isInteger(n)||n<1||n>pages){showToast(`请输入 1–${pages} 的页码`);return;}clearSelection();state().page=n;render();}
      else if('gridDelete'in d)askDelete();
      else if('gridDeleteCancel'in d)document.querySelector('#apps-bulk-dialog').close();
      else if('gridDeleteConfirm'in d){try{const n=M.deleteMany(deletion.context,deletion.targets);document.querySelector('#apps-bulk-dialog').close();clearSelection();render();showToast(`已删除 ${n} 条记录`);}catch(error){const node=document.querySelector('#apps-bulk-dialog .apps-editor-error');node.hidden=false;node.textContent=error.message;}}
    });
    root.addEventListener('change',event=>{const d=event.target.dataset;
      if('gridSelect'in d||'gridAll'in d){const id=d.gridSelect,checked=event.target.checked;const action=()=>{const eligible=shown.filter(canDelete);(id?eligible.filter(r=>r.id===id):eligible).forEach(r=>checked?selection.add(r.id):selection.delete(r.id));render();};if(!E.guard(action))action();}
      else if('gridRule'in d){const rules=panel==='filter'?filterDraft:sortDraft,r=rules[Number(d.gridRule)];r[d.rulePart]=event.target.value;if(d.rulePart==='field'&&panel==='filter'){r.op=availableOps(fields(table).find(f=>f.key===r.field).type)[0];r.value='';}if(d.rulePart!=='value')render();}
    });
    root.addEventListener('input',event=>{const d=event.target.dataset;if('gridRule'in d&&d.rulePart==='value')(panel==='filter'?filterDraft:sortDraft)[Number(d.gridRule)].value=event.target.value;});
  }
  return {init,reset,clearSelection,query,toolbar,checkbox,selectHead,footer,rail,collapsed:()=>collapsed,metadata:()=>metadata};
})();
