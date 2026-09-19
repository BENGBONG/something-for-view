/* Local fixtures, not connected to the Platform release catalogue. */
window.PublishedApps = (() => {
  const releases=[
    {id:'sales',name:'销售洞察',description:'查看销售表现、重点客户和商机进展，让团队持续掌握业务变化。',version:'v1.3',time:'2026-09-16',published:true,url:'published-app-demo.html?app=sales'},
    {id:'leads',name:'客户商机',description:'集中浏览客户线索与跟进计划，快速找到下一步行动。',version:'v1.1',time:'2026-09-15',published:true,url:'published-app-demo.html?app=leads'},
    {id:'delivery',name:'项目交付',description:'汇总项目里程碑、实施进度和待解决的问题。',version:'v1.0',time:'2026-09-14',published:true,url:'published-app-demo.html?app=delivery'},
    {id:'draft',name:'未发布应用',published:false,url:null}
  ];
  function init(){
    const input=document.querySelector('#published-app-search'),grid=document.querySelector('#published-app-grid');
    const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    function render(){
      const keyword=input.value.trim();
      const list=releases.filter(a=>a.published&&a.url&&(!keyword||a.name.includes(keyword)||a.description.includes(keyword)));
      grid.innerHTML=list.map(a=>`<a class="published-app-card" href="${a.url}" target="_blank" rel="noopener noreferrer" aria-label="打开${esc(a.name)}（新标签页）"><div class="published-app-card-top"><span class="published-app-icon"><svg class="icon"><use href="#ico-globe"/></svg></span><span class="published-app-status">已发布</span></div><h3>${esc(a.name)}</h3><p>${esc(a.description)}</p><div class="published-app-card-foot"><span>${a.version} · ${a.time}</span><strong>打开应用 ↗</strong></div></a>`).join('');
      const empty=document.querySelector('#published-app-empty');
      empty.hidden=!!list.length;
      empty.textContent=keyword?'暂无匹配的已发布应用':'暂无可用应用';
    }
    input.addEventListener('input',render);render();
  }
  return {init};
})();
