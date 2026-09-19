/* Explicit prototype fixtures: schema changes only, never business cell history. */
window.AppsSchema = (() => {
  const records = [
    {id:'schema-sales-5',app:'sales',version:'v4 → v5',time:'2026-09-16 15:20',actor:'应用维护人员',source:'平台配置',run:null,changes:[{table:'legacy_tags',tableName:'旧客户标签',type:'删除表',target:'旧客户标签',before:'表存在，包含客户编号、标签两列',after:'表已移除'}]},
    {id:'schema-sales-4',app:'sales',version:'v3 → v4',time:'2026-09-15 10:30',actor:'张伟',actorId:'zhang',source:'Agent 任务',agent:'销售洞察 Agent',run:'run-schema-sales',title:'完善销售洞察表结构',changes:[{table:'opportunities',tableName:'商机跟进',type:'修改字段',target:'预计金额',before:'字段类型：整数',after:'字段类型：数值'},{table:'customers',tableName:'客户画像',type:'修改字段',target:'客户等级',before:'字段名称：客户级别',after:'字段名称：客户等级'}]},
    {id:'schema-sales-3',app:'sales',version:'v2 → v3',time:'2026-09-04 14:10',actor:'应用维护人员',source:'平台配置',run:null,changes:[{table:'opportunities',tableName:'商机跟进',type:'新增字段',target:'下次跟进',before:'字段不存在',after:'新增字段：下次跟进；类型：日期'}]},
    {id:'schema-sales-2',app:'sales',version:'v1 → v2',time:'2026-09-03 09:00',actor:'应用维护人员',source:'平台配置',run:null,changes:[{table:'weekly',tableName:'周期汇总',type:'新增表',target:'周期汇总',before:'表不存在',after:'新增表：统计周期、有效商机、成交金额、行动建议'}]},
    {id:'schema-leads-2',app:'leads',version:'v1 → v2',time:'2026-09-04 11:00',actor:'应用维护人员',source:'平台配置',run:null,changes:[{table:'actions',tableName:'跟进计划',type:'新增表',target:'跟进计划',before:'表不存在',after:'新增表：客户名称、下一步行动、计划日期'}]}
  ];
  const types=['新增表','修改表','删除表','新增字段','修改字段','删除字段'];
  function history(user,appId,scope,personal=false) {
    const app=AppsDataModel.apps.find(a=>a.id===appId);
    if(!AppsDataModel.allowed(user,app,scope,personal))return [];
    return structuredClone(records.filter(r=>r.app===appId));
  }
  function taskFor(user,id) {
    const r=records.find(r=>r.run===id&&r.actorId===user);
    return r?{id:r.run,actor:r.actorId,agent:r.agent,title:r.title,time:r.time,status:'成功',changes:[],schemaChanges:r.changes.map(c=>({...c,app:r.app})),schemaRecord:r.id}:null;
  }
  return {history,taskFor,types};
})();
