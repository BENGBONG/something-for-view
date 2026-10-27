(function(root, factory){
  if (typeof module === 'object' && module.exports) module.exports = factory;
  else {
    let storage; try { storage = root.localStorage; } catch {}
    root.CredybaraSavedProducts = factory(storage);
  }
})(globalThis, function(storage, now = () => Date.now()){
  const TTL = 7 * 24 * 60 * 60 * 1000;
  const ids = new Set(['maple','bright','harbor','cedar','lumen','quick']);
  const fields = ['term','apr','rate','monthly','total','fee','feeAmt'];
  const owner = name => String(name || '').normalize('NFKC').trim().toLowerCase();
  const key = name => 'credy_v4_products:' + encodeURIComponent(owner(name));
  function clean(value){
    if (!value || value.version !== 1 || typeof value.id !== 'string' || value.id.length > 100) return null;
    if (!Number.isFinite(value.createdAt) || value.createdAt <= 0 || value.createdAt > now()+60000 || !Number.isFinite(value.expiresAt) || value.expiresAt <= value.createdAt || value.expiresAt > value.createdAt+TTL) return null;
    if (!Number.isFinite(value.amount) || value.amount < 500 || value.amount > 50000) return null;
    if (!['emergency','debt','home','bills','other'].includes(value.purposeKey) || !['cost','monthly','fast','flex'].includes(value.pref)) return null;
    if (!Array.isArray(value.products) || !value.products.length || value.products.length > 6) return null;
    const seen = new Set(), products = [];
    for (const product of value.products){
      if (!product || !ids.has(product.lenderId) || seen.has(product.lenderId)) return null;
      const item = {lenderId:product.lenderId};
      for (const field of fields){
        const number = product[field];
        if (!Number.isFinite(number) || number < 0 || number > 1000000) return null;
        item[field] = number;
      }
      if (item.term < 1 || item.monthly <= 0) return null;
      seen.add(item.lenderId); products.push(item);
    }
    return {version:1,id:value.id,createdAt:value.createdAt,expiresAt:value.expiresAt,amount:value.amount,purposeKey:value.purposeKey,pref:value.pref,products};
  }
  function read(name){
    if (!owner(name)) return null;
    try {
      const record = JSON.parse(storage.getItem(key(name)) || 'null');
      if (!record || record.owner !== owner(name)) return null;
      const result = clean(record);
      return result ? {...result,expired:result.expiresAt <= now()} : null;
    } catch { return null; }
  }
  function save(name, value){
    const result = clean(value);
    if (!owner(name) || !result || result.expiresAt <= now()) return false;
    try { storage.setItem(key(name), JSON.stringify({...result,owner:owner(name)})); return true; } catch { return false; }
  }
  return {TTL,owner,read,save,clean};
});
