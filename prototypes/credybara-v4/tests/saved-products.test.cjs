const test = require('node:test');
const assert = require('node:assert/strict');
const createStore = require('../saved-products.js');
const initial = 1800000000000;
function setup(){
  let time = initial;
  const values = new Map();
  const storage = {getItem:key=>values.get(key) || null,setItem:(key,value)=>values.set(key,value)};
  const store = createStore(storage,()=>time);
  const quote = {version:1,id:'products-a',createdAt:initial,expiresAt:initial+store.TTL,amount:2000,purposeKey:'home',pref:'cost',products:[{lenderId:'bright',term:24,apr:30.5,rate:24.99,monthly:106.73,total:2661.52,fee:5,feeAmt:100}]};
  return {store,storage,values,quote,advance:ms=>time+=ms};
}
test('results survive a new store instance and remain isolated by username',()=>{
  const {store,storage,quote} = setup();
  assert.equal(store.save('Alice',quote),true);
  const nextVisit = createStore(storage,()=>initial);
  assert.equal(nextVisit.read('alice').id,quote.id);
  assert.equal(nextVisit.read('Bob'),null);
});
test('an exact expiry boundary disables saved results and cannot renew them',()=>{
  const {store,quote,advance} = setup(); store.save('Alice',quote);
  advance(store.TTL-1); assert.equal(store.read('Alice').expired,false);
  advance(1); assert.equal(store.read('Alice').expired,true);
  assert.equal(store.save('Alice',quote),false);
  assert.equal(store.read('Alice').expiresAt,quote.expiresAt);
});
test('only product fields are persisted, without applicant data or handoff tokens',()=>{
  const {store,quote,values} = setup();
  store.save('Alice',{...quote,applicant:{ssn4:'1234'},email:'private@example.com',token:'secret',products:[{...quote.products[0],bank:'private',redirectUrl:'https://example.com/token'}]});
  const raw = [...values.values()][0];
  for (const forbidden of ['ssn4','private','secret','redirectUrl','applicant']) assert.equal(raw.includes(forbidden),false);
});
test('corrupt amounts, lenders, dates and duplicate products are rejected',()=>{
  const {store,quote} = setup();
  for (const bad of [{...quote,amount:NaN},{...quote,products:[{...quote.products[0],lenderId:'unknown'}]},{...quote,expiresAt:quote.expiresAt+1},{...quote,products:[...quote.products,...quote.products]}]) assert.equal(store.save('Alice',bad),false);
});
test('returning does not extend the original validity period',()=>{
  const {store,quote,advance} = setup(); store.save('Alice',quote); advance(86400000);
  store.save('Alice',store.read('Alice'));
  assert.equal(store.read('Alice').expiresAt,quote.expiresAt);
});
test('storage failure is reported instead of claiming saved',()=>{
  const {quote} = setup();
  const store = createStore({getItem(){throw Error('blocked');},setItem(){throw Error('full');}},()=>initial);
  assert.equal(store.save('Alice',quote),false); assert.equal(store.read('Alice'),null);
});
test('malformed or wrong-owner stored data cannot be restored',()=>{
  const {store,quote,values} = setup(); store.save('Alice',quote);
  const key = [...values.keys()][0]; values.set(key,'{broken'); assert.equal(store.read('Alice'),null);
  values.set(key,JSON.stringify({...quote,owner:'bob'})); assert.equal(store.read('Alice'),null);
});
