/* =====================================================================
   TRAFFIC, LANGUAGE AND TRACKING
   ===================================================================== */
const QS = new URLSearchParams(location.search);
const LANG = QS.get('lang') === 'es' ? 'es' : 'en';
const t = (en, es) => LANG === 'es' ? es : en;
// Attribution: first touch wins for the session. Marketing parameters only — never personal data.
const ATTR_KEYS = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid'];
const ATTR = (() => {
  let saved = {}; try { saved = JSON.parse(sessionStorage.getItem('credy_attr') || '{}'); } catch(e){}
  const now = {}; ATTR_KEYS.forEach(k => { if (QS.get(k)) now[k] = QS.get(k).slice(0,120); });
  const out = Object.keys(saved).length ? saved : now;
  try { sessionStorage.setItem('credy_attr', JSON.stringify(out)); } catch(e){}
  return out;
})();
const SOURCE = ATTR.gclid || /google/i.test(ATTR.utm_source || '') ? 'google'
  : ATTR.fbclid || /facebook|meta|instagram|fb/i.test(ATTR.utm_source || '') ? 'meta'
  : ATTR.utm_source ? ATTR.utm_source : 'direct';
// Google Ads doesn't allow personal loans with APR ≥ 36% in the US, so hide them for Google traffic.
const APR_CAP = SOURCE === 'google' ? 36 : null;
// Template landing pages: /v2/debt-consolidation etc. (message match with the ad).
const LP_SLUGS = {'emergency-expense':'emergency','debt-consolidation':'debt','home-repair':'home','everyday-bills':'bills'};
const LP_SEG = location.pathname.split('/').filter(Boolean).pop() || '';
const LP_KEY = LP_SLUGS[LP_SEG] || null;
const LP_SLUG = LP_KEY ? LP_SEG : '';
const T0 = Date.now();

// Analytics: events go to window.dataLayer (GTM → Google Ads / Meta pixel + CAPI server-side).
// Only whitelisted, non-personal properties are allowed through.
window.dataLayer = window.dataLayer || [];
const EVENTS = [];
const SAFE_PROPS = ['credit','template','amount','priority','step','offers','lenders','lender','source','landing','state','military'];
function track(event, props = {}){
  const clean = {}; SAFE_PROPS.forEach(k => { if (props[k] !== undefined) clean[k] = props[k]; });
  const e = {event, ...clean, source: SOURCE, landing: LP_SLUG || 'home'};
  window.dataLayer.push(e); EVENTS.push({t: ((Date.now()-T0)/1000).toFixed(1), ...e});
}

/* =====================================================================
   DATA (all fictional)
   ===================================================================== */
const ICON = {
  emergency:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
  debt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="15" height="10" rx="2"/><path d="M2 10h15"/><rect x="7" y="9" width="15" height="10" rx="2" fill="#fff"/><path d="M7 13h15M11 16h3"/></svg>',
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/></svg>',
  bills:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 7h6M9 11h6M9 15h3"/></svg>',
  other:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>',
  cost:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v2M12 16v2"/></svg>',
  monthly:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M9 15l2 2 4-4"/></svg>',
  fast:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18h16"/><path d="M4 18l5-6 4 3 7-9"/><path d="M15 6h5v5"/></svg>',
  flex:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 12l5 5 9-10"/></svg>',
  alert:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/></svg>',
  info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
  why:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 015 .5c0 1.5-2.5 2-2.5 3.5M12 17v.5"/></svg>',
  lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>',
  bulb:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 00-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0012 3z"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
};
const TEMPLATES = [
  {key:'emergency', label:'Emergency expense', es:'Gasto de emergencia', about:'an emergency expense', aboutEs:'un gasto de emergencia', amount:2000, bg:'#FCE6D8', fg:'#B4532A', h1:'Unexpected expense?', h1es:'¿Un gasto inesperado?'},
  {key:'debt',      label:'Consolidate credit card debt', es:'Consolidar deudas de tarjetas', about:'consolidating credit card debt', aboutEs:'consolidar deudas de tarjetas', amount:5000, bg:'#DDF1E5', fg:'#1F4D3A', h1:'Pay off credit cards with one loan?', h1es:'¿Pagar tus tarjetas con un solo préstamo?'},
  {key:'home',      label:'Home repair', es:'Reparaciones del hogar', about:'a home repair', aboutEs:'una reparación del hogar', amount:3000, bg:'#FBF0CF', fg:'#8A6411', h1:'Home repair coming up?', h1es:'¿Necesitas reparar tu casa?'},
  {key:'bills',     label:'Everyday bills', es:'Gastos del día a día', about:'everyday bills', aboutEs:'gastos del día a día', amount:1000, bg:'#E5ECF7', fg:'#2D4F86', h1:'Short on bills this month?', h1es:'¿Te faltan fondos para las cuentas?'}
];
const PREFS = [
  {key:'cost',    label:t('Lowest total cost','Menor costo total'),        short:t('Total cost','Costo total'),   hint:t('Pay the least overall','Paga lo menos posible en total')},
  {key:'monthly', label:t('Lowest monthly payment','Pago mensual más bajo'), short:t('Monthly','Mensual'),          hint:t('Smaller payments, usually a longer term','Pagos más bajos, normalmente a más plazo')},
  {key:'fast',    label:t('Pay it off faster','Pagarlo más rápido'),        short:t('Payoff speed','Rapidez'),     hint:t('Shorter term, higher payments','Plazo más corto, pagos más altos')},
  {key:'flex',    label:t('Flexible on credit','Flexible con el crédito'),  short:t('Credit fit','Crédito'),       hint:t('Lenders that consider fair credit','Prestamistas que aceptan crédito regular')}
];
const CREDIT = [
  {v:'',  label:'Not sure'},{v:'3',label:'Excellent (720+)'},{v:'2',label:'Good (660–719)'},
  {v:'1', label:'Fair (580–659)'},{v:'0',label:'Below 580'}
];
const CREDIT_NAME = ['below 580','fair','good','excellent'];
const STATES = ['','AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'];
const LENDERS = [
  {id:'maple', name:'Maple Ridge Lending',  color:'#2F6B52', apr:18.9,  term:36, fee:4, min:2000, max:35000, minCredit:2, excluded:[]},
  {id:'bright',name:'Brightpath Credit',    color:'#C06A3A', apr:24.99, term:24, fee:5, min:500,  max:10000, minCredit:1, excluded:[]},
  {id:'harbor',name:'Harbor Loan Co.',      color:'#2D4F86', apr:29.9,  term:48, fee:3, min:1500, max:20000, minCredit:1, excluded:['NY','CT']},
  {id:'cedar', name:'Cedar & Pine Finance', color:'#7A5A2E', apr:15.5,  term:24, fee:6, min:1000, max:25000, minCredit:2, excluded:[]},
  {id:'lumen', name:'Lumen Personal Loans', color:'#6B4C9A', apr:35.5,  term:18, fee:0, min:300,  max:5000,  minCredit:0, excluded:['NY','CT','PA','NJ','VT','MD']},
  // APR ≥ 36%: never shown to search-ad traffic or Military Lending Act-covered borrowers.
  {id:'quick', name:'QuickBridge Installment', color:'#8A3B5C', apr:59.9, term:12, fee:0, min:300, max:3000, minCredit:0, excluded:['NY','CT','PA','NJ','VT','MD','CA','AR']}
];
const AMT_MIN = 500, AMT_MAX = 15000;
// Rough ZIP3 → state lookup (demo only)
const ZIP3 = [[10,27,'MA'],[28,29,'RI'],[30,38,'NH'],[39,49,'ME'],[50,59,'VT'],[60,69,'CT'],[70,89,'NJ'],[100,149,'NY'],[150,196,'PA'],[197,199,'DE'],[200,205,'DC'],[206,219,'MD'],[220,246,'VA'],[247,268,'WV'],[270,289,'NC'],[290,299,'SC'],[300,319,'GA'],[320,349,'FL'],[350,369,'AL'],[370,385,'TN'],[386,397,'MS'],[400,427,'KY'],[430,459,'OH'],[460,479,'IN'],[480,499,'MI'],[500,528,'IA'],[530,549,'WI'],[550,567,'MN'],[570,577,'SD'],[580,588,'ND'],[590,599,'MT'],[600,629,'IL'],[630,658,'MO'],[660,679,'KS'],[680,693,'NE'],[700,714,'LA'],[716,729,'AR'],[730,749,'OK'],[750,799,'TX'],[800,816,'CO'],[820,831,'WY'],[832,838,'ID'],[840,847,'UT'],[850,865,'AZ'],[870,884,'NM'],[889,898,'NV'],[900,961,'CA'],[967,968,'HI'],[970,979,'OR'],[980,994,'WA'],[995,999,'AK']];
const UNSERVED = ['NY','VT','WV']; // demo: no partner coverage

/* =====================================================================
   HELPERS
   ===================================================================== */
const $ = s => document.querySelector(s);
const money = n => '$' + Math.round(n).toLocaleString('en-US');
const money2 = n => '$' + n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const clamp = n => Math.min(AMT_MAX, Math.max(AMT_MIN, Math.round(n/100)*100));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const zipToState = z => { const n = parseInt(z.slice(0,3),10); const r = ZIP3.find(([a,b]) => n>=a && n<=b); return r ? r[2] : ''; };

// APR as disclosed under Truth in Lending: the yearly rate at which the payments repay the
// amount actually received (loan minus origination fee). With a fee, APR > interest rate.
function trueApr(financed, payment, n){
  let lo = 0, hi = 1;
  for (let i = 0; i < 60; i++){ const r = (lo + hi) / 2, pv = payment * (1 - Math.pow(1 + r, -n)) / r; pv > financed ? lo = r : hi = r; }
  return (lo + hi) / 2 * 12 * 100;
}
// l.apr in LENDERS is the lender's interest rate; the returned object carries rate and true APR.
function calc(l, amount){
  const rate = l.apr, r = rate/100/12, n = l.term;
  const monthly = amount*r/(1-Math.pow(1+r,-n));
  const interest = monthly*n - amount;
  const feeAmt = amount*l.fee/100;
  const apr = feeAmt ? trueApr(amount - feeAmt, monthly, n) : rate;
  return {...l, rate, apr, amount, monthly, interest, feeAmt, totalCost: interest+feeAmt, total: monthly*n + feeAmt};
}
const SORTS = {
  cost:   (a,b) => a.totalCost-b.totalCost,
  monthly:(a,b) => a.monthly-b.monthly,
  fast:   (a,b) => a.term-b.term || a.totalCost-b.totalCost,
  flex:   (a,b) => a.minCredit-b.minCredit || a.totalCost-b.totalCost
};
// "Best overall": every option is scored on total cost, monthly payment, payoff speed and
// credit fit (each normalized 0–1, lower is better). The visitor's priority counts 3×.
function rank(pref, amount, st, credit = null, strict = false){
  const list = LENDERS.filter(l => amount>=l.min && amount<=l.max && !l.excluded.includes(st) && !(strict && credit !== null && credit < l.minCredit))
    .map(l => calc(l, amount))
    .filter(l => !(APR_CAP && l.apr >= APR_CAP) && !(A.military === 'yes' && l.apr >= 36));
  const norm = (k, l) => { const v = list.map(x => x[k]), mn = Math.min(...v), mx = Math.max(...v); return mx === mn ? 0 : (l[k]-mn)/(mx-mn); };
  const W = {cost:1, monthly:1, fast:1, flex:1}; W[pref] = 3;
  list.forEach(l => {
    l.score = W.cost*norm('totalCost', l) + W.monthly*norm('monthly', l) + W.fast*norm('term', l) + W.flex*norm('minCredit', l)
            + (credit !== null && credit < l.minCredit ? 3 : 0);
  });
  return {all:list, top:[...list].sort((a,b) => a.score-b.score).slice(0,3)};
}
// Pros and cons are worked out from the actual numbers, relative to the other options shown.
function prosCons(l, set, credit = null){
  const min = k => Math.min(...set.map(x => x[k])), max = k => Math.max(...set.map(x => x[k]));
  const many = set.length > 1;
  const pros = [], cons = [];
  if (many && l.totalCost === min('totalCost')) pros.push(['cost', `Lowest total cost, ${money(max('totalCost') - l.totalCost)} less than the priciest here`]);
  if (many && l.monthly === min('monthly')) pros.push(['monthly', `Lowest monthly payment (${money(l.monthly)}/mo)`]);
  if (many && l.term === min('term')) pros.push(['fast', `Paid off fastest: ${l.term} months`]);
  if (l.fee === 0) pros.push(['fee', 'No origination fee']);
  if (l.minCredit <= 1) pros.push(['flex', `Considers ${CREDIT_NAME[l.minCredit]} credit`]);
  if (many && l.apr === min('apr')) pros.push(['apr', `Lowest APR here (${l.apr.toFixed(2)}%)`]);
  else if (l.apr < 20) pros.push(['apr', `Low APR (${l.apr.toFixed(2)}%)`]);
  if (!pros.length) pros.push(['bal', 'Balanced payment and total cost']);

  if (credit !== null && credit < l.minCredit) cons.push(`May not qualify. Usually needs ${CREDIT_NAME[l.minCredit]} credit`);
  if (many && l.totalCost === max('totalCost')) cons.push(`Costs ${money(l.totalCost - min('totalCost'))} more overall than the cheapest here`);
  if (many && l.monthly === max('monthly')) cons.push(`Highest monthly payment (${money(l.monthly)}/mo)`);
  if (l.term >= 36) cons.push(`Longer term (${l.term} mo) adds interest`);
  if (l.apr >= 30) cons.push(`High APR (${l.apr.toFixed(2)}%)`);
  if (l.fee >= 5) cons.push(`${l.fee}% origination fee (${money(l.feeAmt)})`);
  if (l.minCredit >= 2 && !(credit !== null && credit < l.minCredit)) cons.push('Usually needs good credit (660+)');
  if (!cons.length) cons.push('Not available in every state');
  // Lead with the pro that matches the visitor's priority.
  pros.sort((a,b) => (b[0] === S.pref) - (a[0] === S.pref));
  return {pros: pros.slice(0,3), cons: cons.slice(0,2)};
}
const TAG_FOR = {cost:'Lowest total cost', monthly:'Lowest monthly', fast:'Fastest payoff', fee:'No fee', flex:'Easier credit', apr:'Lowest APR', bal:'Balanced'};
const MINUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 12h12"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12l5 5 9-10"/></svg>';
/* ---- Compare at a glance — also where the visitor picks. One column per product, one row per
        thing to compare; ✓ marks the best value in each row; tap a row name for a plain-English note. ---- */
const IS_V2 = true;
const cmpT = (en, es) => (typeof LANG !== 'undefined' && LANG === 'es') ? es : en;
const advHTML = () => `<details class="adv" style="margin:0 0 10px"><summary>${t('Advertiser disclosure · how we rank','Divulgación de anunciantes · cómo ordenamos')}</summary><p>${t('Credybara is paid by lenders in our network, which may affect which offers appear and their order. “Top pick” uses total cost, monthly payment, payoff speed and credit fit. Not every lender or loan in the market is shown.','Credybara recibe pagos de los prestamistas de su red, lo que puede influir en qué ofertas aparecen y en qué orden. “Mejor opción” considera costo total, pago mensual, plazo y crédito. No mostramos todos los prestamistas del mercado.')}</p></details>`;
const CMP_IC = {
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  stack:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
  pct:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/></svg>'
};
function compareHTML(list, mode, sel = new Set()){
  if (!list.length) return '';
  const pick = mode !== 'readonly';
  const mn = k => Math.min(...list.map(l => l[k])), mx = k => Math.max(...list.map(l => l[k]));
  const short = l => l.name.split(' ')[0];
  const bar = f => `<span class="cbar"><i style="width:${Math.max(6, f*100)}%"></i></span>`;
  const maxTerm = mx('term'), maxTotal = mx('total');
  const timeline = l => `<span class="ctl"><i style="width:${l.term/maxTerm*100}%"></i>${Array.from({length: Math.ceil(maxTerm/12) - 1}, (_,y) => `<u style="left:${(y+1)*12/maxTerm*100}%"></u>`).join('')}</span>`;
  const stack = l => `<span class="cstack"><i style="width:${l.amount/maxTotal*100}%;background:var(--green-2)"></i><i style="width:${l.interest/maxTotal*100}%;background:var(--peach)"></i><i style="width:${l.feeAmt/maxTotal*100}%;background:var(--honey)"></i></span>`;
  const apr = l => `<span class="capr"><i style="left:${Math.min(l.apr, 60)/60*100}%"></i></span>`;
  const dots = l => `<span class="cdots">${[0,1,2,3].map(i => `<i class="${i <= l.minCredit ? 'on' : ''}" style="--i:${i}"></i>`).join('')}</span>`;
  const CREDIT_SHORT = [cmpT('Any','Cualquiera'), cmpT('Fair+','Regular+'), cmpT('Good+','Bueno+'), cmpT('Excellent','Excelente')];
  const rows = [
    {k:'monthly', ic:ICON.monthly, lbl:cmpT('Monthly','Mensual'),
      tip:cmpT('What you pay each month. Lower feels easier, but it often means a longer loan.','Lo que pagas cada mes. Más bajo se siente más fácil, pero suele significar un préstamo más largo.'),
      val:l => money(l.monthly), num:l => l.monthly, f:'money', viz:l => bar(l.monthly/mx('monthly'))},
    {k:'term', ic:CMP_IC.clock, lbl:cmpT('Payoff time','Plazo'),
      tip:cmpT('How long you\'ll be paying. Each tick is one year. Shorter loans usually cost less overall.','Cuánto tiempo pagarás. Cada marca es un año. Los préstamos más cortos suelen costar menos.'),
      val:l => `${l.term} ${cmpT('mo','m')}`, num:l => l.term, f:'mo', viz:timeline},
    {k:'total', ic:CMP_IC.stack, lbl:cmpT('Total cost','Costo total'),
      tip:cmpT('Everything you repay. Green is what you borrowed, orange is interest, yellow is fees. Fees come out of the cash you receive.','Todo lo que pagas. Verde es lo prestado, naranja el interés y amarillo los cargos. Los cargos se descuentan del dinero que recibes.'),
      val:l => money(l.total), num:l => l.total, f:'money', sub:l => `<span class="extra">+${money(l.totalCost)}</span>`, viz:stack},
    {k:'apr', ic:CMP_IC.pct, lbl:'APR',
      tip:cmpT('The yearly cost of the loan, including interest and most fees. The best single number for comparing. Green = lower, orange = higher.','El costo anual del préstamo, con intereses y la mayoría de cargos: el mejor número para comparar. Verde = más bajo, naranja = más alto.'),
      val:l => `${l.apr.toFixed(1)}%`, num:l => l.apr, f:'pct', viz:apr},
    {k:'minCredit', ic:ICON.flex, lbl:cmpT('Credit needed','Crédito'),
      tip:cmpT('The credit level this lender usually looks for. Fewer bars = easier to qualify. Not a guarantee either way.','El nivel de crédito que suele pedir. Menos barras = más fácil calificar. No es una garantía.'),
      val:l => CREDIT_SHORT[l.minCredit], sub:l => (S.credit !== '' && +S.credit < l.minCredit) ? `<span class="extra">${cmpT('May not qualify','Podrías no calificar')}</span>` : '', viz:dots}
  ];
  const isWin = (r, l) => list.length > 1 && l[r.k] === mn(r.k) && mn(r.k) !== mx(r.k);
  const wins = Object.fromEntries(list.map(l => [l.id, rows.filter(r => isWin(r, l)).length]));
  const on = l => sel.has(l.id) ? 'sel' : '';
  const ok = `<span class="ok">${CHECK}</span>`;
  return `<section class="cmp ${pick ? '' : 'ro'}" aria-label="${cmpT('Compare at a glance','Compara de un vistazo')}">
    <div class="cmp-top"><h3>${cmpT('Compare at a glance','Compara de un vistazo')}</h3>
      <p class="cap"><span>${money(list[0].amount)}${mode === 'offers' ? cmpT(' · estimates',' · estimados') : ''}</span><span><span class="okk">${CHECK}</span>${cmpT('best in row','mejor en la fila')}</span>
        <span><i style="background:var(--green-2)"></i>${cmpT('borrowed','prestado')}</span><span><i style="background:var(--peach)"></i>${cmpT('interest','interés')}</span><span><i style="background:var(--honey)"></i>${cmpT('fees','cargos')}</span></p></div>
    <div class="cmp-grid" style="--n:${list.length}">
      <div class="cmp-corner"></div>
      ${list.map((l,i) => `<div class="cmp-h ${on(l)}" data-col="${l.id}" style="--d:${i*80}">${pick ? `<button class="box" type="button" data-pick="${l.id}" aria-label="${cmpT('Select','Elegir')} ${l.name}">${CHECK}</button>` : ''}
        <span class="mono" style="background:${l.color}">${l.name[0]}</span>${short(l)}
        ${i === 0 ? `<span class="toppick">${cmpT('Top pick','Mejor opción')}</span>` : ''}<small>${wins[l.id] ? cmpT(`Best in ${wins[l.id]}`, `Mejor en ${wins[l.id]}`) : ''}</small></div>`).join('')}
      ${rows.map((r, ri) => `<div class="cmp-l" style="--d:${200 + ri*110}"><span class="ri ri-${r.k}">${r.ic}</span><details><summary>${r.lbl}</summary><p>${r.tip}</p></details></div>
        ${list.map((l, ci) => `<div class="cmp-c ${isWin(r, l) ? 'win' : ''} ${on(l)}" data-col="${l.id}" style="--d:${260 + ri*110 + ci*70}"><b><span class="cv"${r.num ? ` data-n="${r.num(l)}" data-f="${r.f}"` : ''}>${r.val(l)}</span>${isWin(r, l) ? ok : ''}</b>${r.sub ? r.sub(l) : ''}${r.viz(l)}</div>`).join('')}`).join('')}
      ${pick ? `<div class="cmp-corner cmp-f"></div>${list.map((l, ci) => `<div class="cmp-f ${on(l)}" data-col="${l.id}" style="--d:${260 + rows.length*110 + ci*70}"><button class="pickbtn" type="button" data-pick="${l.id}">${cmpT('Select','Elegir')}</button></div>`).join('')}` : ''}
    </div>
  </section>`;
}
// One or two plain-language takeaways from these exact numbers (customer education).
function lessonsHTML(list){
  if (list.length < 2) return '';
  const short = l => l.name.split(' ')[0];
  const byMonthly = [...list].sort((a,b) => a.monthly - b.monthly)[0], byCost = [...list].sort((a,b) => a.totalCost - b.totalCost)[0];
  const priciest = [...list].sort((a,b) => b.totalCost - a.totalCost)[0];
  const out = [];
  if (byMonthly.id !== byCost.id) out.push(cmpT(
    `<b>Lowest monthly isn't cheapest:</b> ${short(byMonthly)} costs ${money(byMonthly.totalCost - byCost.totalCost)} more overall than ${short(byCost)}.`,
    `<b>El pago más bajo no es el más barato:</b> ${short(byMonthly)} cuesta ${money(byMonthly.totalCost - byCost.totalCost)} más que ${short(byCost)}.`));
  if (priciest.id !== byCost.id) out.push(cmpT(
    `${short(byCost)} instead of ${short(priciest)} saves ${money(priciest.totalCost - byCost.totalCost)}.`,
    `${short(byCost)} en vez de ${short(priciest)} ahorra ${money(priciest.totalCost - byCost.totalCost)}.`));
  return out.length ? `<div class="cmp-learn">${ICON.bulb}<ul>${out.slice(0,2).map(x => `<li>${x}</li>`).join('')}</ul></div>` : '';
}
// Bar under the table: how many are picked + the next-step button.
const barHTML = () => `<div class="applybar"><span data-count></span><button class="all" type="button" data-all></button><button class="btn" type="button" data-cta></button></div>`;
function bindPicker(root, sel, list, {cta, go, actionBar}){
  const bar = actionBar || root.querySelector('.applybar');
  const sync = () => {
    root.querySelectorAll('[data-col]').forEach(el => el.classList.toggle('sel', sel.has(el.dataset.col)));
    root.querySelectorAll('.pickbtn').forEach(b => { const on = sel.has(b.dataset.pick); b.innerHTML = on ? CHECK + cmpT('Selected','Elegida') : cmpT('Select','Elegir'); b.setAttribute('aria-pressed', on); });
    root.querySelectorAll('.box').forEach(b => b.setAttribute('aria-pressed', sel.has(b.dataset.pick)));
    const n = sel.size;
    bar.classList.remove('bump'); void bar.offsetWidth; bar.classList.add('bump');
    bar.querySelector('[data-count]').textContent = n ? cmpT(`${n} selected`, `${n} elegida${n>1?'s':''}`) : cmpT('Pick one or more','Elige una o más');
    const b = bar.querySelector('[data-cta]'); b.textContent = cta(n); b.disabled = !n && !IS_V2;
    bar.querySelector('[data-all]').textContent = n === list.length ? cmpT('Clear','Quitar') : cmpT('Select all','Elegir todas');
    if (actionBar) updatePendingSummary();
  };
  root.onclick = e => {
    const b = e.target.closest('[data-pick]');
    if (!b || root.classList.contains('locked-offers')) return;
    const id = b.dataset.pick; sel.has(id) ? sel.delete(id) : sel.add(id); sync();
  };
  bar.querySelector('[data-all]').addEventListener('click', () => { if (sel.size === list.length) sel.clear(); else list.forEach(l => sel.add(l.id)); sync(); });
  bar.querySelector('[data-cta]').addEventListener('click', () => go(sel.size ? list.filter(l => sel.has(l.id)).map(l => l.id) : [list[0].id]));
  sync();
}

// Comparison motion: start the entrance when the table scrolls into view, and count numbers up.
function countUp(root){
  root.querySelectorAll('.cv[data-n]').forEach(el => {
    const end = +el.dataset.n, f = el.dataset.f, final = el.textContent;
    const delay = parseFloat(getComputedStyle(el.closest('.cmp-c')).getPropertyValue('--d')) || 0;
    const fmt = v => f === 'money' ? money(v) : f === 'mo' ? `${Math.round(v)} ${cmpT('mo','m')}` : `${v.toFixed(1)}%`;
    const t0 = performance.now() + delay + 100;
    el.textContent = fmt(0);
    const tick = now => {
      const p = Math.min(1, Math.max(0, (now - t0) / 750));
      el.textContent = p < 1 ? fmt(end * (1 - Math.pow(1 - p, 3))) : final;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
const cmpIO = (!reduceMotion && 'IntersectionObserver' in window)
  ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ e.target.classList.add('go'); countUp(e.target); cmpIO.unobserve(e.target); } }), {threshold: .12})
  : null;
new MutationObserver(() => document.querySelectorAll('.cmp:not([data-w])').forEach(c => {
  c.dataset.w = '1';
  cmpIO ? cmpIO.observe(c) : c.classList.add('go');
})).observe(document.body, {childList: true, subtree: true});

function pcHTML(pc){
  return `<div class="pc"><div><h5>Pros</h5><ul>${pc.pros.map(([,t]) => `<li class="pro">${CHECK}<span>${t}</span></li>`).join('')}</ul></div>
    <div><h5>Cons</h5><ul>${pc.cons.map(t => `<li class="con">${MINUS}<span>${t}</span></li>`).join('')}</ul></div></div>`;
}

/* =====================================================================
   STATE
   S = comparison (phase 1), A = application answers (phase 2)
   ===================================================================== */
const S = {phase:'compare', step:1, purpose:null, purposeKey:null, amount:null, pref:null, st:'', credit:'', open:{}};
// Demo: prefilled with fictional data so the flow can be clicked straight through.
const A0 = () => ({lender:null, zip:'75201', st:'TX', income:3500, military:'no', first:'Alex', last:'Rivera', email:'alex@example.com', phone:'', dob:'1990-05-01', street:'123 Main St', ssn4:'', honeypot:'', c1:true, tcpa:false, submitted:false});
let A = A0();
const F0 = () => ({offers:[], sel:new Set(), applied:false, resp:[], none:false, lender:null, stage:1, left:false, verified:false, bank:null, signed:false, funded:false, autopay:false});
let F = F0();
let availableProducts = null, availableOwner = null, restoredProducts = false, productsExpiryTimer, finalProductsPinned = false;
const chat = $('#chat');
let dockedChoice = null;
function togglePending(open){
  const dialog = $('#pendingPopover'); if (!dialog) return;
  if (!open){ if (dialog.open) dialog.close(); $('#pendingToggle').setAttribute('aria-expanded','false'); updatePendingSummary(); return; }
  if (!dockedChoice) dockPendingChoice();
  if (!dockedChoice) return;
  dialog.classList.toggle('comparison', dockedChoice.step === 4);
  const embedded = dockedChoice.step === 4 && matchMedia('(min-width:1024px)').matches;
  dialog.classList.toggle('embedded-comparison', embedded);
  (embedded ? $('.wrap>.panel') : document.body).appendChild(dialog);
  $('#choiceDescription').textContent = dockedChoice.step === 4
    ? t('Compare the full picture. Adjust your choices, then continue when you’re ready.','Compara todos los detalles. Ajusta tus opciones y continúa cuando quieras.')
    : t('Pick what fits you. Your conversation will be right where you left it.','Elige lo que más te convenga. Tu conversación se mantiene donde la dejaste.');
  updatePendingSummary();
  if (!dialog.open){ if (embedded) dialog.show(); else dialog.showModal(); }
  $('#pendingToggle').setAttribute('aria-expanded','true');
  updatePendingSummary();
}
function releasePending(){
  if (!dockedChoice) return;
  togglePending(false);
  const {node, anchor} = dockedChoice;
  if (node.isConnected && anchor.isConnected) anchor.replaceWith(node);
  else anchor.remove();
  dockedChoice = null;
  $('#pendingChoice').hidden = true;
  $('#pendingToggle').setAttribute('aria-expanded','false');
}
function updatePendingSummary(){
  const bar = $('#composerActions .applybar');
  const review = bar?.querySelector('.review-options');
  if (review){
    const opened = !!$('#pendingPopover')?.open;
    review.textContent = opened ? t('Back to chat','Volver al chat') : t('Review options','Revisar opciones');
    review.setAttribute('aria-expanded',String(opened));
  }
  if ($('#choiceSelection')){
    const comparing = (dockedChoice?.step || S.step) === 4 && !!bar;
    $('#choiceSelection').textContent = comparing ? bar.querySelector('[data-count]').textContent : t('You can change your answer later.','Puedes cambiar tu respuesta después.');
    $('#choiceSelectAll').hidden = !comparing;
    $('#choiceContinue').hidden = !comparing;
    if (comparing){
      $('#choiceSelectAll').textContent = bar.querySelector('[data-all]').textContent;
      $('#choiceContinue').textContent = bar.querySelector('[data-cta]').textContent;
      $('#choiceContinue').disabled = bar.querySelector('[data-cta]').disabled;
    }
  }
  if (!dockedChoice) return;
  $('#pendingSummary').textContent = dockedChoice.step === 4
    ? t(`${S.picks?.size || 0} selected · review or change your choices`,`${S.picks?.size || 0} elegidas · revisa o cambia tus opciones`)
    : t('Still open · tap to continue choosing','Pendiente · toca para seguir eligiendo');
}
function dockPendingChoice(){
  if (!$('#pendingChoice') || S.phase !== 'compare') return;
  if (dockedChoice){ togglePending(false); updatePendingSummary(); return; }
  const card = S.step === 2 ? chat.querySelector('.plan:not(.credit-q)')
    : S.step === 3 ? chat.querySelector('.credit-q') : S.step === 4 ? $('#results') : null;
  const node = card?.closest('.block'); if (!node) return;
  const title = S.step === 2 ? t('Choose what matters most','Elige qué es más importante')
    : S.step === 3 ? t('Your credit, roughly','Tu crédito, aproximado') : t('Your loan options','Tus opciones de préstamo');
  const anchor = document.createElement('button');
  anchor.type = 'button'; anchor.className = 'choice-history';
  anchor.textContent = t(`Review: ${title.toLowerCase()}`,`Revisar: ${title.toLowerCase()}`);
  anchor.addEventListener('click', () => {
    togglePending(true);
  });
  node.replaceWith(anchor);
  $('#pendingContent').appendChild(node);
  dockedChoice = {node, anchor, step:S.step};
  $('#pendingTitle').textContent = title; $('#pendingHeading').textContent = title;
  $('#pendingChoice').hidden = S.step === 4;
  updatePendingSummary(); togglePending(false);
}
if ($('#pendingToggle')){
  $('#pendingToggle').addEventListener('click', () => togglePending(true));
  $('#pendingClose').addEventListener('click', () => togglePending(false));
  $('#choiceDone').addEventListener('click', () => togglePending(false));
  $('#choiceSelectAll').addEventListener('click', () => $('#composerActions [data-all]')?.click());
  $('#choiceContinue').addEventListener('click', () => $('#composerActions [data-cta]')?.click());
  $('#pendingPopover').addEventListener('close', () => {
    $('#pendingToggle').setAttribute('aria-expanded','false');
    updatePendingSummary();
    const trigger = dockedChoice?.step === 4 ? $('#composerActions .review-options') : !$('#pendingChoice').hidden ? $('#pendingToggle') : null;
    trigger?.focus({preventScroll:true});
  });
  $('#pendingPopover').addEventListener('click', e => {
    if (e.target !== e.currentTarget) return;
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) togglePending(false);
  });
  document.addEventListener('keydown', e => {
    const dialog = $('#pendingPopover');
    if (e.key === 'Escape' && dialog.open && dialog.classList.contains('embedded-comparison') && !document.querySelector('.account-dialog[open]')){
      e.preventDefault(); togglePending(false);
    }
  });
}

function add(html, cls, parent = chat){
  const follow = cls.includes('user') || chat.scrollHeight - chat.scrollTop - chat.clientHeight < 64;
  const d = document.createElement('div'); d.className = cls; d.innerHTML = html; parent.appendChild(d);
  if (follow && (parent === chat || chat.contains(parent)) && document.body.classList.contains('loan-flow') && matchMedia('(min-width:1024px)').matches){
    requestAnimationFrame(() => { chat.scrollTop = chat.scrollHeight; });
  }
  return d;
}
const baraMsg = (html, parent) => add(`<svg class="av" aria-hidden="true"><use href="#bara"/></svg><div class="bubble">${html}</div>`, 'msg', parent);
const userMsg = (html, icon, parent) => add(`<div class="bubble">${icon?ICON[icon]:''}<span>${html}</span></div>`, 'msg user', parent);
async function typing(parent = chat){
  if (reduceMotion) return;
  const t = add(`<svg class="av" aria-hidden="true"><use href="#bara"/></svg><div class="bubble typing" aria-label="Bara is typing"><span></span><span></span><span></span></div>`, 'msg', parent);
  await sleep(500); t.remove();
}
function scrollToEl(el){
  if (document.body.classList.contains('loan-flow') && matchMedia('(min-width:1024px)').matches && chat.contains(el)){
    const y = el.getBoundingClientRect().top - chat.getBoundingClientRect().top + chat.scrollTop - 16;
    chat.scrollTo({top:y,behavior:reduceMotion?'auto':'smooth'});
    return;
  }
  const y = el.getBoundingClientRect().top + scrollY - 130;
  window.scrollTo({top:y, behavior: reduceMotion ? 'auto' : 'smooth'});
}

if (document.body.classList.contains('loan-flow')){
  const intro = $('.wrap>.intro'), panel = $('.wrap>.panel');
  const sizeConversation = () => {
    if (matchMedia('(min-width:1024px)').matches) panel.style.setProperty('--conversation-height', intro.getBoundingClientRect().height + 'px');
    else {
      panel.style.removeProperty('--conversation-height');
      if ($('#pendingPopover')?.open && $('#pendingPopover').classList.contains('embedded-comparison')) togglePending(false);
    }
    panel.style.setProperty('--conversation-head-height', panel.querySelector('.panel-head').getBoundingClientRect().height + 'px');
    panel.style.setProperty('--conversation-composer-height', panel.querySelector('.conversation-composer').getBoundingClientRect().height + 'px');
  };
  const layoutObserver = new ResizeObserver(sizeConversation);
  [intro,panel.querySelector('.panel-head'),panel.querySelector('.conversation-composer')].forEach(el=>layoutObserver.observe(el));
  window.addEventListener('resize', sizeConversation);
  sizeConversation();
}

/* =====================================================================
   PROGRESS + SIDE PANEL — one header for both phases
   ===================================================================== */
// The whole journey is 5 taps/forms: purpose → priority → check real options → ZIP & income → contact & send.
const JOURNEY = [t('Pick what the loan is for','Elige para qué es'),t('Choose what matters most','Elige lo más importante'),t('Your credit, roughly','Tu crédito, aproximado'),t('Compare and pick','Compara y elige'),t('One short form → your offers','Un formulario corto → tus ofertas')];
function overallStep(){
  if (S.phase === 'compare') return Math.min(S.step, 4);
  return A.submitted ? 6 : 5;
}
function renderProgress(){
  if (S.phase === 'fund') return renderFundProgress();
  const n = overallStep();
  $('#steps').innerHTML = `<span>${n > 5 ? (F.none ? t('No match','Sin ofertas') : t('Checking…','Revisando…')) : t(`Step ${n} of 5`, `Paso ${n} de 5`)}</span>` + JOURNEY.map((_,i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('');
  $('#restart').classList.toggle('show', S.step > 1 || S.phase !== 'compare');
  const chk = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12l5 5 9-10"/></svg>';
  $('#side').innerHTML = `<h2>${t('5 steps to your 3 best options','5 pasos para tus 3 mejores opciones')}</h2><ol>${JOURNEY.map((t,i) =>
    `<li class="${i+1 < n ? 'done' : i+1 === n ? 'cur' : 'todo'}"><span class="n">${i+1 < n ? '✓' : i+1}</span>${t}</li>`).join('')}</ol>
    <h2 style="margin-top:22px">${t('Our promise','Nuestro compromiso')}</h2>
    <ul class="promise"><li>${chk}${t('Free to use. No obligation to accept any offer.','Gratis. Sin obligación de aceptar ninguna oferta.')}</li><li>${chk}${t('Nothing is shared until you agree.','No compartimos nada hasta que aceptes.')}</li><li>${chk}${t('Credybara is not a lender. Each lender sets its own terms.','Credybara no es un prestamista. Cada prestamista fija sus propios términos.')}</li></ul>`;
}
function renderFundProgress(){
  const expired = availableProducts && availableProducts.expiresAt <= Date.now();
  const ready = !!availableProducts;
  const label = expired ? t('Results expired','Resultados caducados') : F.left ? t('Continue with lender','Continúa con el prestamista') : ready ? t('Products ready','Productos disponibles') : F.applied ? t('Checking availability','Revisando disponibilidad') : t('Review your offers','Revisa tus ofertas');
  $('#steps').innerHTML = `<span class="result-progress">${ready && !expired ? '✓ ' : ''}${label}</span>`;
  $('#restart').classList.add('show');
  $('#side').innerHTML = `<h2>${ready ? t('Your Credybara results','Tus resultados en Credybara') : t('Your next step','Tu siguiente paso')}</h2><ol>${JOURNEY.map((label,i)=>{
    const done = ready || i < JOURNEY.length-1;
    return `<li class="${done?'done':'cur'}"><span class="n">${done?'✓':i+1}</span>${label}</li>`;
  }).join('')}</ol><div class="lender-next-step"><span aria-hidden="true">↗</span><b>${expired ? t('Find new products','Busca nuevos productos') : t('Next, on the lender’s site','Después, en el sitio del prestamista')}</b><p>${expired ? t('These products have expired. Start a new search to see what is available now.','Estos productos caducaron. Inicia una nueva búsqueda.') : t('Choose a product to continue with that lender. Their review, signing and funding happen on their site. Credybara cannot track those steps.','Elige un producto para continuar con el prestamista. La revisión, firma y financiación ocurren en su sitio. Credybara no puede seguir esos pasos.')}</p></div>`;
}
function setStep(n){ if (n !== S.step) releasePending(); S.step = n; renderProgress(); syncComposer(); }
function syncComposer(){
  const placeholders = {
    1:t('Or type it: “$1,500 for a car repair”','Escribe: “$1,500 para reparar el auto”'),
    2:t('Tell Bara what matters most, or ask a question…','Dile a Bara qué es más importante, o pregunta…'),
    3:t('Describe your credit, or ask Bara a question…','Describe tu crédito, o pregunta a Bara…')
  };
  $('#freeInput').placeholder = S.phase === 'compare' && placeholders[S.step]
    ? placeholders[S.step] : t('Ask Bara about your options or the next step…','Pregunta a Bara sobre tus opciones o el siguiente paso…');
}

/* =====================================================================
   PHASE 1 · COMPARE
   ===================================================================== */
function renderTemplates(){
  $('#tplGrid').innerHTML = TEMPLATES.map(tp => `
    <button class="tpl" type="button" data-k="${tp.key}">
      <span class="ic" style="background:${tp.bg};color:${tp.fg}">${ICON[tp.key]}</span>
      <span class="lbl">${t(tp.label, tp.es)}</span>
      <span class="amt num">${money(tp.amount)}</span>
    </button>`).join('');
}
$('#tplGrid').addEventListener('click', e => {
  const b = e.target.closest('.tpl'); if (!b) return;
  pickTemplate(b.dataset.k);
});
function pickTemplate(key, amount, fromAd){
  const tp = TEMPLATES.find(x => x.key === key), label = t(tp.label, tp.es), amt = amount || tp.amount;
  $('#tplBlock').classList.add('done');
  track('template_selected', {template:key, amount:amt});
  startPlan(label, key, amt, `${label} · <b class="num">${money(amt)}</b>`,
    fromAd ? t(`Looks like you're here about <b>${tp.about}</b>, so I started with <b>${money(amt)}</b>. You can change it below.`,
               `Parece que vienes por <b>${tp.aboutEs}</b>, así que empecé con <b>${money(amt)}</b>; cámbialo abajo si quieres.`) : null);
}
let composerBusy = false;
$('#freeInput').addEventListener('input', e => { $('#freeBtn').disabled = composerBusy || !e.target.value.trim(); });
$('#freeInput').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing){
    e.preventDefault();
    if (e.target.value.trim()) $('#freeForm').requestSubmit();
  }
});
$('#freeForm').addEventListener('submit', async e => {
  e.preventDefault();
  const text = $('#freeInput').value.trim(); if (!text || composerBusy) return;
  composerBusy = true;
  $('#freeInput').value = ''; $('#freeBtn').disabled = true;
  try { await replyToMessage(text); }
  finally { composerBusy = false; $('#freeBtn').disabled = !$('#freeInput').value.trim(); }
});
// Local prototype responses use the same choices and state as the cards.
async function replyToMessage(text){
  if (S.phase === 'compare' && S.step === 1){
    const p = parseFree(text);
    $('#tplBlock').classList.add('done');
    await startPlan(p.label, p.key, p.amount, esc(text),
      `Sounds like <b>${p.label.toLowerCase()}</b>${p.guessed ? '. I started with <b>'+money(p.amount)+'</b>; change it below if needed' : ', about <b>'+money(p.amount)+'</b>'}.`);
    return;
  }
  const question = /\?|\b(why|what|how|explain)\b|为什么|什么|怎么/i.test(text);
  if (!question && S.phase === 'compare' && S.step === 2){
    const priority = [
      ['monthly', /monthly|smaller payments|每月|月供/i],
      ['cost', /total cost|least overall|总成本|总费用/i],
      ['fast', /faster|quickly|pay.*off|尽快|快.*还/i],
      ['flex', /flexible|credit|信用/i]
    ].find(([, re]) => re.test(text));
    const block = document.querySelector('.plan:not(.credit-q)')?.closest('.block');
    if (priority && block) return choosePref(priority[0], block, text);
  }
  if (!question && S.phase === 'compare' && S.step === 3){
    const score = text.match(/\b[3-8]\d{2}\b/);
    const credit = score ? [+score[0] >= 720 ? '3' : +score[0] >= 660 ? '2' : +score[0] >= 580 ? '1' : '0']
      : [['3', /excellent|优秀/i], ['2', /\bgood\b|良好/i], ['1', /\bfair\b|一般/i], ['0', /needs work|poor|bad|较差/i], ['', /not sure|unsure|don.t know|不确定|不知道/i]].find(([, re]) => re.test(text));
    const block = document.querySelector('.credit-q')?.closest('.block');
    if (credit && block) return chooseCredit(credit[0], block, text);
  }
  if (availableProducts){ finalProductsPinned = true; renderFinalProductsDock(); }
  else dockPendingChoice();
  const selectAll = !question && S.phase === 'compare' && S.step === 4 && /^(select\s+)?all(?:\s+(?:three|3|options))?[.!]?$|全选|全部/i.test(text);
  if (selectAll){
    const bar = $('#composerActions .applybar');
    if (bar && bar.querySelector('[data-all]').textContent !== cmpT('Clear','Quitar')) bar.querySelector('[data-all]').click();
  }
  userMsg(esc(text));
  await typing();
  let reply;
  if (selectAll) reply = t(`All ${S.picks.size} options are selected. You can review them above the message box, then continue when you're ready.`,`Las ${S.picks.size} opciones están elegidas. Revísalas encima del mensaje y continúa cuando quieras.`);
  else if (/\bapr\b|interest|利率/i.test(text)) reply = t('APR includes interest and certain fees, so it helps you compare borrowing costs. You can review APR, monthly payments and total repayment together in the comparison cards.','La APR incluye intereses y ciertos cargos. Puedes compararla junto con los pagos mensuales y el total a pagar.');
  else if (/monthly|月供|每月/i.test(text)) reply = t('A lower monthly payment usually means a longer repayment term and may increase the total you repay. Compare both monthly payment and total repayment before choosing.','Un pago mensual menor suele implicar un plazo más largo y puede aumentar el total a pagar. Compara ambos antes de elegir.');
  else if (!availableProducts && /credit|score|信用/i.test(text)) reply = t('For this comparison, a rough credit range is enough. Choosing a range here does not check your credit. If you don’t know, choose “Not sure.”','Para esta comparación basta un rango aproximado. Elegirlo no consulta tu crédito. Puedes elegir “No sé”.');
  else if (S.phase === 'compare' && S.step === 2) reply = t('What matters most: the lowest total cost, a lower monthly payment, paying it off faster, or flexibility on credit? Tell me here or choose a card above.','¿Qué es más importante: costo total, pago mensual, pagar más rápido o flexibilidad de crédito? Dímelo aquí o elige una tarjeta.');
  else if (S.phase === 'compare' && S.step === 3) reply = t('How would you describe your credit: excellent, good, fair, needs work, or not sure? You can reply here or choose a card above.','¿Tu crédito es excelente, bueno, regular, necesita mejorar o no estás seguro? Responde aquí o elige una tarjeta.');
  else if (S.phase === 'compare') reply = t('You can compare APR, monthly payments and total repayment in the cards above. Select the options you want to explore, then choose “Check real options.” What would you like explained?','Compara APR, pagos mensuales y total a pagar en las tarjetas. Selecciona tus opciones y continúa. ¿Qué quieres que explique?');
  else if (availableProducts){
    const expired = availableProducts.expiresAt <= Date.now();
    reply = /[\u3400-\u9fff]/.test(text)
      ? expired ? '这些产品已过期，请重新查找当前可用的产品。' : '可用产品已保留在输入框上方。你可以比较月供、期限和 APR，选好后点击 Continue，前往机构网站继续。机构的审批、签约和放款状态需在机构侧确认，这里不会显示它们的进度。'
      : expired ? t('These products have expired. Start a new search for current options.','Estos productos caducaron. Inicia una nueva búsqueda.') : t('Your available products are pinned above the message box. Compare the monthly payment, term and APR, then choose Continue to finish on the lender’s site. The lender confirms review, signing and funding; Credybara cannot track those steps.','Tus productos están encima del mensaje. Compara pago, plazo y APR y elige Continuar. El prestamista confirma revisión, firma y financiación; Credybara no puede seguir esos pasos.');
  }
  else reply = t('I can help explain loan terms and the next step. Use the form above for your application details, review your information and permissions, then continue when you’re ready.','Puedo explicar los términos y el siguiente paso. Usa el formulario para tus datos y revisa la información y los permisos antes de continuar.');
  const message = baraMsg(reply);
  scrollToEl(message);
}
function parseFree(text){
  const t = text.toLowerCase();
  const m = t.match(/\$?\s*(\d[\d,]*(?:\.\d+)?)\s*(k|thousand)?/);
  let amount = 2000, guessed = true;
  if (m){ amount = parseFloat(m[1].replace(/,/g,'')) * (m[2] ? 1000 : 1); guessed = false; }
  amount = clamp(amount);
  const rules = [
    [/debt|credit card|consolidat|pay off card/, 'debt', 'Debt consolidation'],
    [/rent|bill|utilit|groceries|phone|everyday/, 'bills', 'Everyday bills'],
    [/roof|repair|home|house|plumb|hvac|furnace/, 'home', 'Home repair'],
    [/car|auto|vehicle|tire|transmission/, 'other', 'Car repair'],
    [/medical|doctor|dental|hospital|vet/, 'emergency', 'Medical bill'],
    [/emergency|urgent|unexpected/, 'emergency', 'Emergency expense'],
    [/moving|move/, 'other', 'Moving costs']
  ];
  const hit = rules.find(([re]) => re.test(t));
  return {amount, guessed, key: hit ? hit[1] : 'other', label: hit ? hit[2] : 'Personal expense'};
}

async function startPlan(label, key, amount, userHtml, ack){
  S.purpose = label; S.purposeKey = key; S.amount = amount;
  userMsg(userHtml, key);
  setStep(2);
  await typing();
  baraMsg(`${ack || t(`Got it: <b>${money(amount)}</b> for ${label.toLowerCase()}.`, `Entendido: <b>${money(amount)}</b> para ${label.toLowerCase()}.`)} <b>${t('What matters most to you this time?','¿Qué es lo más importante para ti esta vez?')}</b>`);
  const blk = add(`
    <div class="plan" role="group" aria-label="Your priority">
      <div class="plan-q"><span>${t('Pick one · you can switch later','Elige una · puedes cambiarla después')}</span><span class="num">1–4</span></div>
      ${PREFS.map((p,i) => `
        <button class="opt" type="button" data-p="${p.key}">
          <span class="k">${i+1}</span><span class="oi">${ICON[p.key]}</span>
          <span><span class="t">${p.label}</span><span class="h">${p.hint}</span></span>
        </button>`).join('')}
    </div>
    <div class="req">${t('Borrowing','Monto')} ${stepperHTML()} ${t('for','para')} <b>${esc(label.toLowerCase())}</b></div>`, 'block');
  bindStepper(blk, () => {});
  blk.querySelector('.plan').addEventListener('click', e => { const b = e.target.closest('.opt'); if (b) choosePref(b.dataset.p, blk); });
  document.addEventListener('keydown', keyPick);
  scrollToEl(blk.previousElementSibling);
}
function keyPick(e){
  if (document.querySelector('.account-dialog[open]') || S.step !== 2 || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
  const p = PREFS[+e.key - 1]; const blk = document.querySelector('.plan')?.closest('.block');
  if (p && blk) choosePref(p.key, blk);
}
const stepperHTML = () => `<span class="stepper"><button type="button" data-d="-500" aria-label="Decrease by $500">−</button><input class="num" inputmode="numeric" aria-label="Loan amount" value="${money(S.amount)}"><button type="button" data-d="500" aria-label="Increase by $500">+</button></span>`;
function bindStepper(root, onChange){
  const input = root.querySelector('.stepper input');
  const set = v => { S.amount = clamp(v); input.value = money(S.amount); onChange(); };
  root.querySelectorAll('.stepper button').forEach(b => b.addEventListener('click', () => set(S.amount + +b.dataset.d)));
  input.addEventListener('focus', () => { input.value = S.amount; input.select(); });
  input.addEventListener('change', () => set(parseFloat(input.value.replace(/[^\d.]/g,'')) || S.amount));
  input.addEventListener('blur', () => { input.value = money(S.amount); });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') input.blur(); });
}
async function choosePref(key, blk, text){
  document.removeEventListener('keydown', keyPick);
  S.pref = key;
  blk.remove(); // the answer bubble below now carries the choice
  userMsg(text ? esc(text) : PREFS.find(x => x.key === key).label, key);
  track('priority_selected', {priority:key});
  setStep(3);
  await typing();
  askCredit();
}
// One more question before the options, so the 3 picks reflect the visitor's situation.
// Self-reported and approximate — nothing is checked and no personal details are needed.
const CREDIT_Q = [
  ['3', t('Excellent','Excelente'), '720+'], ['2', t('Good','Bueno'), '660–719'], ['1', t('Fair','Regular'), '580–659'],
  ['0', t('Needs work','Por mejorar'), t('Below 580','Menos de 580')], ['', t('Not sure','No sé'), t('That\'s okay','No pasa nada')]
];
function askCredit(){
  baraMsg(t(`Last question before I show options: <b>how would you describe your credit?</b> A rough guess is fine. This doesn't check your credit.`,
            `Una última pregunta antes de mostrarte opciones: <b>¿cómo describirías tu crédito?</b> Un cálculo aproximado basta; esto no revisa tu crédito.`));
  const blk = add(`<div class="plan credit-q" role="group" aria-label="${t('Your credit','Tu crédito')}">
      <div class="plan-q"><span>${t('Pick the closest','Elige la más cercana')}</span><span>${t('Score range','Rango')}</span></div>
      ${CREDIT_Q.map(([v, label, range], i) => `<button class="opt" type="button" data-cr="${v}">
        <span class="k">${i+1}</span><span class="cbars">${[0,1,2,3].map(k => `<i class="${v !== '' && k <= +v ? 'on' : ''}"></i>`).join('')}</span>
        <span><span class="t">${label}</span></span><span class="h" style="margin-left:auto">${range}</span></button>`).join('')}
    </div>`, 'block');
  blk.querySelectorAll('[data-cr]').forEach(b => b.addEventListener('click', () => chooseCredit(b.dataset.cr, blk)));
  scrollToEl(blk.previousElementSibling);
}
async function chooseCredit(v, blk, text){
  S.credit = v;
  blk.remove();
  const q = CREDIT_Q.find(x => x[0] === v);
  userMsg(text ? esc(text) : `${q[1]} · ${q[2]}`, 'flex');
  track('credit_selected', {credit:v || 'unsure'});
  setStep(4);
  await typing();
  const intro = baraMsg(''); intro.id = 'resIntro';
  add('<div class="results" id="results"></div>', 'block');
  renderResults();
  track('examples_viewed', {amount:S.amount, priority:S.pref});
  scrollToEl(intro);
}

function renderResults(){
  if (S.retired) return;   // replaced by the offers table further down
  const credit = S.credit === '' ? null : +S.credit;
  const {all, top} = rank(S.pref, S.amount, S.st, credit);
  const p = PREFS.find(x => x.key === S.pref);
  const stTxt = S.st ? ` in <b>${S.st}</b>` : '';
  $('#resIntro .bubble').innerHTML = top.length
    ? t(`Here ${top.length===1?'is':'are'} your <b>${top.length} best overall option${top.length>1?'s':''}</b> for <b>${money(S.amount)}</b>${stTxt}, balanced across cost, payment, payoff speed and credit fit, with extra weight on <b>${p.label.toLowerCase()}</b>${S.credit !== '' ? ` and lenders that fit <b>${CREDIT_Q.find(x => x[0] === S.credit)[1].toLowerCase()}</b> credit` : ''}. Tick the ones you like, then continue. Estimated terms, subject to lender review.`,
        `Estas son tus <b>${top.length} mejores opciones</b> para <b>${money(S.amount)}</b>${stTxt}, equilibrando costo, pago, plazo y crédito, con más peso en <b>${p.label.toLowerCase()}</b>. Marca las que te gusten y continúa. Términos estimados, sujetos a la revisión del prestamista.`)
    : `No lenders in our network cover <b>${money(S.amount)}</b>${stTxt}. Try a different amount or state.`;

  const applying = S.phase === 'apply';
  if (!S.picks) S.picks = new Set();
  [...S.picks].forEach(id => { if (!top.some(l => l.id === id)) S.picks.delete(id); });
  if (!S.picks.size && top.length) S.picks.add(top[0].id);
  const R = $('#results');
  R.innerHTML = `
    <div class="res-mini"><span>${ICON.check.replace('<svg','<svg width="16" height="16" style="color:var(--green-2)"')}</span>
      <span><b>${top.length} ${cmpT('best options','mejores opciones')}</b> · <b>${money(S.amount)}</b> · ${p.short.toLowerCase()}</span>
      <button type="button" data-toggle>${cmpT('Show comparison','Ver comparación')}</button></div>
    ${applying ? `<div style="text-align:right"><button class="edit" type="button" data-toggle>${cmpT('Hide comparison','Ocultar')}</button></div>` : ''}
    <div class="controls" aria-label="Change your comparison">
      <div class="seg" role="group" aria-label="Give extra weight to">
        ${PREFS.map(x => `<button type="button" data-p="${x.key}" aria-pressed="${x.key===S.pref}">${ICON[x.key]}${x.short}</button>`).join('')}
      </div>
      <div class="ctl-row">${stepperHTML()}</div>
    </div>
    ${top.length ? `${advHTML()}${compareHTML(top, applying ? 'readonly' : 'examples', S.picks)}
      ${applying ? '' : barHTML()}
      ${lessonsHTML(top)}
      <p class="fine" style="margin-top:8px">${cmpT('Examples assume a fixed APR and on-time payments. Not offers, approvals or rate quotes.','Los ejemplos suponen APR fija y pagos a tiempo. No son ofertas, aprobaciones ni cotizaciones.')}</p>` : ''}`;
  R.querySelector('.seg').addEventListener('click', e => { const b = e.target.closest('button'); if (b){ S.pref = b.dataset.p; renderResults(); } });
  bindStepper(R.querySelector('.controls'), renderResults);
  R.querySelectorAll('[data-toggle]').forEach(b => b.addEventListener('click', () => { R.classList.toggle('collapsed'); }));
  const actionHost = $('#composerActions');
  if (actionHost){
    actionHost.replaceChildren();
    const bar = R.querySelector('.applybar');
    if (bar){
      actionHost.appendChild(bar);
      const review = document.createElement('button');
      review.type = 'button'; review.className = 'review-options'; review.textContent = t('Review options','Revisar opciones');
      review.setAttribute('aria-haspopup','dialog'); review.setAttribute('aria-controls','pendingPopover');
      review.addEventListener('click', () => togglePending(!$('#pendingPopover').open));
      bar.querySelector('[data-count]').after(review);
    }
  }
  if (!applying && top.length) bindPicker(R, S.picks, top, {
    actionBar:actionHost?.querySelector('.applybar'),
    cta: n => n > 1 ? cmpT(`Check real options with ${n}`, `Ver ofertas de ${n}`) : cmpT('Check real options','Ver mis ofertas'),
    go: ids => startApply(ids)
  });
}

/* =====================================================================
   PHASE 2 · CHECK REAL OPTIONS — continues in the same conversation.
   Demo scope: two short forms (steps 4 and 5). A live flow would add what partner lenders require.
   ===================================================================== */
// One form, after the visitor has confirmed what they need: everything lenders need in one place.
const PART = {valid: () => true};   // stand-in for the two sections rendered inside the single form
const APP = [
  {id:'details', q:t('One short form and you\'ll see your offers.','Un formulario corto y verás tus ofertas.'),
    sub:t('Just what lenders need to estimate your offers with a soft credit check. No SSN needed here.','Solo lo que necesitan los prestamistas para estimar tus ofertas con una consulta suave. Aquí no se pide el SSN.'),
    why:t('A soft check finds your credit file with your name, date of birth and address. Income shows what you can afford. Anything else, like your phone or full SSN, is asked by the lender you choose on its own site.',
          'La consulta suave encuentra tu historial con tu nombre, fecha de nacimiento y dirección. El ingreso muestra lo que puedes pagar. Lo demás, como teléfono o SSN completo, lo pide el prestamista que elijas en su sitio.'),
    ui:uiDetails, valid:(show, blk) => validBasics(show, blk) & validContact(show, blk),
    answer:() => `${A.first} ${A.last} · ${A.zip} ${A.st} · ${money(A.income)}/mo · ${A.email}`, final:true, cta:t('See my offers','Ver mis ofertas')}
];
let appIdx = -1;
const curStep = () => APP[appIdx];

async function startApply(ids){
  releasePending();
  S.phase = 'apply'; A = A0(); A.lender = ids[0]; A.picks = ids; appIdx = -1;
  $('#results').classList.add('collapsed');
  renderResults();
  const names = ids.map(id => LENDERS.find(x => x.id === id).name.split(' ')[0]);
  const u = userMsg(`${cmpT('Check real options','Ver mis ofertas')} · ${esc(names.join(', '))}`, null); u.id = 'applyAsk';
  track('check_options_click', {lenders:ids.join(',')});
  renderProgress();
  await typing();
  baraMsg(t(`<b>One quick form</b> and I'll check pre-qualified offers for you. It's a soft check and doesn't affect your credit score.`,
            `Perfecto. <b>Un formulario rápido</b> y reviso tus ofertas precalificadas, con una consulta suave que no afecta tu puntaje.`));
  armNudge();
  nextQ();
}
async function nextQ(){
  appIdx++;
  if (appIdx >= APP.length) return;
  renderProgress();
  await typing();
  askStep(APP[appIdx]);
}
// Each question lives in a .qa container: Bara's question, then either the active form or the answer bubble.
function askStep(s){
  const qa = add('', 'qa'); qa.dataset.s = s.id;
  baraMsg(`<span class="q">${s.q}</span>${s.sub ? `<span class="s">${s.sub}</span>` : ''}
    ${s.why ? `<details class="askwhy"><summary>${ICON.why}${t('Why we ask','Por qué lo pedimos')}</summary><p>${s.why}</p></details>` : ''}`, qa);
  openInput(s, qa, false);
  scrollToEl(qa);
}
function openInput(s, qa, editing){
  qa.querySelector('.block')?.remove();
  const blk = add('', 'block', qa);
  const ans = qa.querySelector('.msg.user'); if (ans) ans.style.display = 'none';
  s.ui(blk, () => commit(s, qa, editing), editing);
}
function commit(s, qa, editing){
  qa.querySelector('.block')?.remove();
  let ans = qa.querySelector('.msg.user');
  if (!ans){
    ans = userMsg('', null, qa);
    ans.insertAdjacentHTML('afterbegin', `<button class="edit" type="button">${t('Edit','Editar')}</button>`);
    ans.querySelector('.edit').addEventListener('click', () => openInput(s, qa, true));
  }
  ans.style.display = '';
  ans.querySelector('.bubble span').textContent = s.answer();
  if (!editing){ if (s.id === 'details') track('details_completed', {state:A.st}); s.final ? submit() : nextQ(); }
}

/* --- form renderers (scoped to their block) --- */
function formShell(blk, inner, s, done, editing, extraFoot = ''){
  blk.innerHTML = `<div class="form">${inner}<div class="form-foot">${extraFoot}<button class="btn primary" type="button" data-next>${editing ? t('Save','Guardar') : (s.cta || t('Continue','Continuar'))}</button></div></div>`;
  const btn = blk.querySelector('[data-next]');
  const refresh = () => { btn.disabled = false; };  // demo: no input validation
  blk.addEventListener('input', refresh); blk.addEventListener('change', refresh); blk.addEventListener('click', refresh);
  btn.addEventListener('click', () => done());
  blk.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox'){ e.preventDefault(); btn.click(); } });
  refresh();
}
function mark(blk, name, ok, msg){
  const f = blk.querySelector(`[data-f="${name}"]`); if (!f) return;
  f.classList.toggle('bad', !ok); f.querySelector('.msg').textContent = ok ? '' : msg;
}
const fieldHTML = (name, label, attrs, help='') =>
  `<div class="field" data-f="${name}"><label for="f-${name}">${label}</label><input id="f-${name}" ${attrs}>${help?`<span class="help">${help}</span>`:''}<span class="msg"></span></div>`;

// Renders the "about you" and "contact" sections inside one form with a single button.
function uiDetails(blk, done, editing){
  formShell(blk, `<p class="part-h">${cmpT('About you','Sobre ti')}</p><div data-part1></div><p class="part-h" style="margin-top:6px">${cmpT('Your details','Tus datos')}</p><div data-part2></div>`, APP[0], done, editing);
  const p1 = blk.querySelector('[data-part1]'), p2 = blk.querySelector('[data-part2]');
  uiBasics(p1, () => {}, true); uiContact(p2, () => {}, editing);
  [p1, p2].forEach(p => p.querySelector('.form-foot')?.remove());
  if (!editing) p1.querySelector('#f-zip').focus({preventScroll:true});
}
function uiBasics(blk, done, editing){
  const presets = [1500, 2500, 3500, 5000];
  formShell(blk, `<div class="row2">${fieldHTML('zip',t('ZIP code','Código postal'),`inputmode="numeric" autocomplete="postal-code" maxlength="5" placeholder="e.g. 75201" value="${esc(A.zip)}"`)}
      ${fieldHTML('st',t('State','Estado'),`readonly placeholder="—" value="${esc(A.st)}"`)}</div><div data-stop></div>
    <div class="field" style="margin-bottom:6px"><label>${t('Monthly take-home pay','Ingreso mensual neto')}</label></div>
    <div class="chips">${presets.map(p => `<button type="button" class="chip" data-v="${p}" aria-pressed="${A.income===p}">${money(p)}${p===5000?'+':''}</button>`).join('')}</div>
    ${fieldHTML('inc',t('Or enter an amount','O escribe un monto'),`class="num" inputmode="numeric" placeholder="$0 / month" value="${A.income ? money(A.income) : ''}"`)}<div data-inc></div>`,
    PART, done, editing);
  const z = blk.querySelector('#f-zip'), inc = blk.querySelector('#f-inc');
  z.addEventListener('input', () => {
    z.value = z.value.replace(/\D/g,''); A.zip = z.value; A.st = A.zip.length === 5 ? zipToState(A.zip) : '';
    blk.querySelector('#f-st').value = A.st; blk.querySelector('[data-stop]').innerHTML = ''; mark(blk,'zip',true);
  });
  const set = v => {
    A.income = v; blk.querySelectorAll('.chip[data-v]').forEach(c => c.setAttribute('aria-pressed', +c.dataset.v === v));
    const pays = LENDERS.filter(l => S.amount>=l.min && S.amount<=l.max).map(l => calc(l, S.amount).monthly);
    const pay = pays.length ? Math.min(...pays) : null;
    blk.querySelector('[data-inc]').innerHTML = !v ? '' : v < 1000
      ? `<div class="soft">${ICON.alert}<span>Many lenders look for at least $1,000 a month. You can still continue.</span></div>`
      : pay ? `<div class="note">${ICON.info}<span>For ${money(S.amount)}, example payments start around <b>${money(pay)}/mo</b> (about ${Math.max(1, Math.round(pay/v*100))}% of your take-home pay).</span></div>` : '';
  };
  blk.querySelectorAll('.chip[data-v]').forEach(c => c.addEventListener('click', () => { inc.value = money(+c.dataset.v); set(+c.dataset.v); }));
  inc.addEventListener('input', () => set(parseInt(inc.value.replace(/\D/g,''),10) || null));
  inc.addEventListener('blur', () => { if (A.income) inc.value = money(A.income); });
  if (A.income) set(A.income);
  if (!editing) z.focus({preventScroll:true});
}
function validBasics(show, blk){
  const okZ = /^\d{5}$/.test(A.zip) && !!A.st, okI = A.income > 0;
  if (show && !okZ) mark(blk, 'zip', false, 'Enter a valid 5-digit U.S. ZIP code.');
  if (show && !okI) mark(blk, 'inc', false, 'Pick or enter your monthly take-home pay.');
  if (show && okZ && UNSERVED.includes(A.st)){ stop(blk, 'state'); return false; }
  return okZ && okI;
}
const DISPOSABLE = ['mailinator.com','tempmail.com','10minutemail.com','guerrillamail.com','yopmail.com','trashmail.com'];
const fmtPhone = v => { const d = v.replace(/\D/g,'').slice(0,10); return d.length<4 ? d : d.length<7 ? `(${d.slice(0,3)}) ${d.slice(3)}` : `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`; };
function age(dob){ const d = new Date(dob+'T00:00'); if (isNaN(d)) return -1; const n = new Date(); let a = n.getFullYear()-d.getFullYear(); if (n < new Date(n.getFullYear(), d.getMonth(), d.getDate())) a--; return a; }
// Consent text is versioned so the exact wording can be stored with the lead (consent certificate).
const CONSENT_VERSION = 'terms-softpull-v4';
function uiContact(blk, done, editing){
  formShell(blk, `<div class="row2">${fieldHTML('first',t('First name','Nombre'),`autocomplete="given-name" value="${esc(A.first)}"`)}${fieldHTML('last',t('Last name','Apellido'),`autocomplete="family-name" value="${esc(A.last)}"`)}</div>
    <div class="row2 stack">${fieldHTML('dob',t('Date of birth','Fecha de nacimiento'),`type="date" autocomplete="bday" max="${new Date().toISOString().slice(0,10)}" value="${esc(A.dob)}"`)}
      ${fieldHTML('email',t('Email','Correo electrónico'),`type="email" autocomplete="email" placeholder="you@example.com" value="${esc(A.email)}"`)}</div>
    ${fieldHTML('street',t('Street address','Dirección'),`autocomplete="address-line1" placeholder="123 Main St, Apt 4" value="${esc(A.street)}"`, `${esc(A.zip)} · ${esc(A.st)}`)}
    <div style="position:absolute;left:-9999px" aria-hidden="true"><label>Company<input tabindex="-1" autocomplete="off" data-hp2></label></div>
    <div class="lock">${ICON.lock}<span>${t('Review your details before continuing. By agreeing below, you authorize sharing your application with the lenders you select.','Revisa tus datos antes de continuar. Al aceptar abajo, autorizas compartir tu solicitud con los prestamistas que selecciones.')}</span></div>
    ${editing ? '' : `<label class="consent req"><input type="checkbox" data-c1 ${A.c1?'checked':''}><span><span class="tagr">${t('Required','Obligatorio')}</span>${t(
      'I agree to the <a href="#">Terms</a> and <a href="#">Privacy Policy</a>, and authorize Credybara to obtain my credit report through a <b>soft inquiry</b> (no impact on my score) to get pre-qualified offers from <a href="#">lenders in its network</a>. My application goes only to lenders I choose; they may run a hard inquiry.',
      'Acepto los <a href="#">Términos</a> y la <a href="#">Política de privacidad</a>, y autorizo a Credybara a obtener mi reporte de crédito mediante una <b>consulta suave</b> (no afecta mi puntaje) para ver ofertas precalificadas de <a href="#">prestamistas de su red</a>. Mi solicitud solo va a los prestamistas que yo elija; ellos pueden hacer una consulta dura.')} </span></label>`}`,
    PART, done, editing, '');
  ['first','last','email','street','dob'].forEach(k => blk.querySelector('#f-'+k).addEventListener('input', e => { A[k] = e.target.value.trim(); }));
  // Explain right away if the date of birth is under 18 (otherwise the button just stays disabled).
  blk.querySelector('#f-dob').addEventListener('change', () => {
    const a = age(A.dob);
    mark(blk, 'dob', !(a >= 0 && a < 18), t('You must be 18 or older to apply.','Debes tener 18 años o más.'));
  });
  blk.querySelector('[data-hp2]').addEventListener('input', e => { A.honeypot = e.target.value; });
  blk.querySelector('[data-c1]')?.addEventListener('change', e => { A.c1 = e.target.checked; });
  if (!editing) blk.querySelector('#f-first').focus({preventScroll:true});
}
function validContact(show, blk){
  const dom = (A.email.split('@')[1] || '').toLowerCase(), a = age(A.dob);
  const okF = A.first.length > 0, okL = A.last.length > 0, okS = A.street.length > 4, okD = a >= 18 && a < 120;
  const okE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(A.email) && !DISPOSABLE.includes(dom);
  if (show){
    mark(blk,'first',okF,t('Enter your first name.','Escribe tu nombre.')); mark(blk,'last',okL,t('Enter your last name.','Escribe tu apellido.'));
    mark(blk,'dob',okD, a >= 0 && a < 18 ? t('You must be 18 or older to apply.','Debes tener 18 años o más.') : t('Enter your date of birth.','Escribe tu fecha de nacimiento.'));
    mark(blk,'street',okS,t('Enter your street address.','Escribe tu dirección.'));
    mark(blk,'email',okE, DISPOSABLE.includes(dom) ? t('Please use a permanent email address.','Usa un correo permanente.') : t('Enter a valid email address.','Escribe un correo válido.'));
  }
  return okF && okL && okS && okD && okE && A.c1;
}
// Honest stop: explain, offer alternatives, let them change the answer in place.
function stop(blk, reason){
  const t = {
    state:[`We can't match you in ${esc(A.st)} yet`, `None of our partner lenders serve ${esc(A.st)} right now, so we stopped here. You don't need to share anything else.`]
  }[reason];
  blk.querySelector('[data-stop]').innerHTML = `<div class="stop"><h4>${t[0]}</h4><p>${t[1]}</p>
    <ul><li><b>Local credit unions</b> often offer small personal loans to members.</li>
    <li><b>Nonprofit credit counseling</b> can help with budgets and debt, often for free: <a href="https://www.nfcc.org" target="_blank" rel="noopener">nfcc.org</a>.</li></ul></div>`;
}

/* =====================================================================
   PHASE 3 · MATCH → LENDER SITE → FUNDING (mock)
   How US loan marketplaces work: Credybara never approves a loan.
   · Pingtree: the request goes to lenders in the network; one accepts the lead and the
     visitor is redirected to that lender's site to apply.
   · Pre-qualified offers: a soft check returns estimated offers via lender APIs; the
     visitor picks one and is redirected.
   Either way the lender runs the full application, decides, e-signs and funds.
   ===================================================================== */
const shortName = l => l.name.split(' ')[0];
const addMonths = (d, n) => { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; };
const fmtDay = d => d.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'});
const lpHTML = (l, inner) => `<div class="lp"><div class="lp-hd" style="background:${l.color}"><span class="mono">${l.name[0]}</span>
  <div><b>${l.name}</b><small>Personal loan application</small></div></div><div class="lp-body">${inner}</div></div>`;

async function submit(){
  A.submitted = true;
  chat.classList.add('locked');
  renderProgress();
  await typing();
  buildLead();
  track('lead_submitted', {state:A.st, amount:S.amount, credit:S.credit || 'unsure'});
  baraMsg(t('Checking which lenders can pre-qualify you.','Listo: estoy revisando qué prestamistas pueden precalificarte.'));
  const steps = [t(`Checking lender rules for ${esc(A.st)}`,`Revisando las reglas de ${esc(A.st)}`), t('Soft credit check (doesn\'t affect your score)','Consulta suave: no afecta tu puntaje')];
  const list = add(`<ul class="checks">${steps.map(x => `<li><span class="c">${ICON.check}</span>${x}</li>`).join('')}</ul>`, 'block');
  scrollToEl(list);
  for (const li of list.querySelectorAll('li')){ await sleep(reduceMotion ? 50 : 650); li.classList.add('done'); }
  await sleep(300);
  outcome();
}

function outcome(){
  const credit = S.credit === '' ? null : +S.credit;
  const {top} = rank(S.pref, S.amount, A.st, credit, true);
  if (!top.length){ F.none = true; renderProgress(); return noMatch(); }
  S.phase = 'fund'; F.stage = 1; renderProgress();
  showOffers(top, credit);
}

function noMatch(){
  const m = baraMsg(`No lender in our network could pre-qualify you for <b>${money(S.amount)}</b> this time. That doesn't mean you can't get credit elsewhere.`);
  add(`<div class="alts">
    <div class="alt"><b>Try a smaller amount</b>Some lenders accept smaller first loans. Tap <b>Start over</b> to try again.</div>
    <div class="alt"><b>Local credit unions</b>Many offer small personal loans and payday-alternative loans to members.</div>
    <div class="alt"><b>Nonprofit credit counseling</b>Free or low-cost help with budgets and debt. <a href="https://www.nfcc.org" target="_blank" rel="noopener">nfcc.org</a></div></div>`, 'block');
  scrollToEl(m);
}

// Pre-qualified offers (estimates from a soft check), shown in the same comparison table.
// The visitor's earlier picks stay selected; they can change them and apply to several at once.
async function showOffers(top, credit){
  F.offers = top;
  // Keep a single comparison on the page: the example table collapses into one line.
  S.retired = true;
  const R = $('#results'); R.classList.remove('collapsed');
  R.innerHTML = `<div class="res-mini" style="display:flex">${ICON.check.replace('<svg','<svg width="16" height="16" style="color:var(--green-2)"')}<span>${cmpT('Your comparison has been updated with your pre-qualified offers below.','Tu comparación se actualizó con tus ofertas precalificadas abajo.')}</span></div>`;
  F.sel = new Set((A.picks || []).filter(id => top.some(l => l.id === id)));
  if (!F.sel.size) F.sel.add(top[0].id);
  const ready = cmpT(`${esc(A.first)}, you pre-qualified with <b>${top.length} lender${top.length>1?'s':''}</b>. These are <b>estimates</b>. Your picks are ticked. Change them if you like, then apply.`,
                     `${esc(A.first)}, precalificaste con <b>${top.length} prestamista${top.length>1?'s':''}</b>. Son <b>estimados</b>. Tus elecciones están marcadas; cámbialas si quieres y aplica.`);
  const m = baraMsg(IS_V2 ? cmpT('Checking lenders in our network… <b data-found>0</b> offers so far.', 'Revisando prestamistas de nuestra red… <b data-found>0</b> ofertas hasta ahora.') : ready);
  const blk = add(`<div data-match>${advHTML()}<div data-cmp></div></div>`, 'block');
  const slot = blk.querySelector('[data-cmp]');
  scrollToEl(m);
  if (IS_V2){
    // Real lender APIs answer at different speeds, so results arrive one by one.
    slot.innerHTML = `<div class="cmp-loading">${top.map(() => `<span><i class="sp"></i>${cmpT('Checking a lender…','Revisando un prestamista…')}</span>`).join('')}</div>`;
    for (let i = 0; i < top.length; i++){
      await sleep(reduceMotion ? 60 : 700 + i*250);
      const tile = slot.querySelectorAll('.cmp-loading span')[i];
      tile.classList.add('on'); tile.innerHTML = `<i class="found">${CHECK}</i>${cmpT('Offer found','Oferta encontrada')}`;
      m.querySelector('[data-found]').textContent = i + 1;
    }
    m.querySelector('.bubble').innerHTML = ready;
  }
  slot.innerHTML = `${compareHTML(top, 'offers', F.sel)}${barHTML()}${lessonsHTML(top)}
    <p class="fine" style="margin-top:8px">${cmpT('Pre-qualified offers aren\'t approvals. Each lender you apply to reviews your application on its own site, may run a hard credit check, and sets the final terms.','Las ofertas precalificadas no son aprobaciones. Cada prestamista revisa tu solicitud en su sitio, puede hacer una consulta dura y fija los términos finales.')}</p>
    `;
  bindPicker(blk, F.sel, top, {
    cta: n => n > 1 ? cmpT(`Apply to ${n} lenders`, `Aplicar con ${n} prestamistas`) : cmpT('Apply','Aplicar'),
    go: ids => applyTo(ids, blk)
  });
  if (IS_V2){
    track('offers_viewed', {offers:top.length, lenders:top.map(l => l.id).join(',')});
  }
}

// Each selected lender decides whether to take the application (like accepting a lead).
// Accepting is NOT an approval: the lender reviews and decides on its own site.
// Scripted for the demo: the 3rd lender (if selected) passes.
async function applyTo(ids, blk){
  if (!ids.length || F.applied) return;
  F.applied = true; F.stage = 2; renderProgress();
  blk.classList.add('locked-offers'); blk.querySelector('.applybar').remove();
  const chosen = F.offers.filter(l => ids.includes(l.id));
  const names = chosen.map(l => l.name.split(' ')[0]);
  const and = t(' and ',' y ');
  userMsg(`${t('Apply to','Aplicar con')} ${names.length < 3 ? names.join(and) : names.slice(0,-1).join(', ') + and + names.at(-1)}`, null);
  track('apply_click', {lenders:ids.join(','), offers:ids.length});
  await typing();
  baraMsg(t(`Sending your application to <b>${chosen.length} lender${chosen.length>1?'s':''}</b>. Each one decides whether to take it.`, `Enviando tu solicitud a <b>${chosen.length} prestamista${chosen.length>1?'s':''}</b>. Cada uno decide si la acepta.`));
  const st = add(`<div class="status" data-resp>${chosen.map(l => `
    <div class="srow" data-r="${l.id}"><span class="mono" style="background:${l.color}">${l.name[0]}</span>
      <div class="nm">${l.name}<small data-sub>${t('Sending your application…','Enviando tu solicitud…')}</small></div>
      <span class="badge"><span class="spin"></span>${t('Sending','Enviando')}</span></div>`).join('')}</div>
    <p class="fine" style="margin-top:8px">${t('“Accepted” means the lender wants to review your application. It isn\'t an approval yet.','“Aceptada” significa que el prestamista quiere revisar tu solicitud; todavía no es una aprobación.')}</p>`, 'block');
  scrollToEl(st);
  F.resp = chosen.map((l, i) => ({l, ok: i < 2 || chosen.length < 3}));
  for (const r of F.resp){
    await sleep(reduceMotion ? 60 : 700);
    const row = st.querySelector(`[data-r="${r.l.id}"]`), b = row.querySelector('.badge'), sub = row.querySelector('[data-sub]');
    if (r.ok){
      b.className = 'badge ok'; b.textContent = t('Accepted','Aceptada');
      sub.textContent = t('Ready for you to finish on their site','Lista para terminar en su sitio');
      row.insertAdjacentHTML('beforeend', `<button class="btn primary go" type="button" data-go2="${r.l.id}">${t('Continue','Continuar')}</button>`);
    } else {
      b.className = 'badge no'; b.textContent = t('Not available','No disponible');
      sub.textContent = t('This lender can\'t take your application right now','Este prestamista no puede tomar tu solicitud ahora');
    }
  }
  const ok = F.resp.filter(r => r.ok);
  const createdAt = Date.now();
  availableProducts = {version:1,id:'products-'+createdAt+'-'+Math.random().toString(36).slice(2,8),createdAt,expiresAt:createdAt+7*24*60*60*1000,amount:S.amount,purposeKey:S.purposeKey,pref:S.pref,
    products:ok.map(({l}) => ({lenderId:l.id,term:l.term,apr:l.apr,rate:l.rate,monthly:l.monthly,total:l.total,fee:l.fee,feeAmt:l.feeAmt}))};
  availableOwner = null; restoredProducts = false;
  st.setAttribute('data-available-products','');
  renderProgress();
  st.querySelectorAll('[data-go2]').forEach(b => {
    const product = ok.find(r => r.l.id === b.dataset.go2)?.l;
    if (product) b.closest('.srow').querySelector('[data-sub]').textContent = `${money2(product.monthly)}/mo · ${product.term} months · ${product.apr.toFixed(1)}% APR`;
  });
  st.insertAdjacentHTML('beforeend','<div class="retain-results" data-retain-results aria-live="polite"></div>');
  armProductsExpiry();
  document.dispatchEvent(new Event('credy:products-ready'));
  await typing();
  const m = baraMsg(ok.length > 1
    ? t(`<b>${ok.length} products are available until ${fmtDay(new Date(availableProducts.expiresAt))}.</b> Tap <b>Continue</b> to finish with the lender you choose.`,
        `<b>${ok.length} productos disponibles hasta el ${fmtDay(new Date(availableProducts.expiresAt))}.</b> Toca <b>Continuar</b> para terminar con el prestamista que elijas.`)
    : t(`<b>${ok[0].l.name}</b> accepted. Tap <b>Continue</b> to finish your application on their site.`, `<b>${ok[0].l.name}</b> aceptó. Toca <b>Continuar</b> para terminar tu solicitud en su sitio.`));
  st.querySelectorAll('[data-go2]').forEach(b => b.addEventListener('click', () => {
    if (availableProducts.expiresAt <= Date.now()){ expireProducts(); return; }
    st.querySelectorAll('[data-go2]').forEach(x => x.disabled = true);
    goLender(LENDERS.find(l => l.id === b.dataset.go2));
  }));
  scrollToEl(m);
}

function expireProducts(){
  document.querySelectorAll('[data-go2],[data-product-continue],[data-final-continue]').forEach(b => b.disabled = true);
  document.querySelectorAll('[data-r] .badge').forEach(b => { b.className = 'badge no'; b.textContent = t('Expired','Caducado'); });
  document.dispatchEvent(new Event('credy:products-expired'));
  renderFinalProductsDock(); renderProgress();
}
function renderFinalProductsDock(){
  const dock = $('#finalProductsDock'); if (!dock) return;
  dock.hidden = !finalProductsPinned || !availableProducts;
  if (dock.hidden){ dock.replaceChildren(); return; }
  const expired = availableProducts.expiresAt <= Date.now();
  dock.innerHTML = `<div class="final-dock-heading"><b>${availableProducts.products.length} ${expired?t('saved products · expired','productos guardados · caducados'):t('available products','productos disponibles')}</b><button class="final-details" type="button">${t('View details','Ver detalles')} ↑</button></div>
    <div class="final-product-grid">${availableProducts.products.map(product=>{
      const lender = LENDERS.find(l=>l.id===product.lenderId);
      return `<article class="final-product-tile"><span class="mono" style="background:${lender.color}">${lender.name[0]}</span><div class="final-product-copy"><b>${esc(lender.name)}</b><small><strong>${money2(product.monthly)}/mo</strong> · ${product.term} mo · ${product.apr.toFixed(1)}% APR</small></div><button class="btn primary" type="button" data-final-continue="${lender.id}" ${expired || F.left?'disabled':''}>${t('Continue','Continuar')}</button></article>`;
    }).join('')}</div><div class="final-dock-meta"><span>${expired ? t('Expired','Caducado') : `${availableOwner?t('Automatically saved','Guardado automáticamente'):t('Available','Disponible')} · ${t('until','hasta')} ${fmtDay(new Date(availableProducts.expiresAt))}`}</span>${!availableOwner && !expired ? `<button type="button" data-keep-results="login">${t('Log in to keep','Inicia sesión para guardar')}</button>`:''}${expired?`<button type="button" data-new-search>${t('Find new products','Busca nuevos productos')}</button>`:''}</div>`;
  dock.querySelector('.final-details').addEventListener('click',()=>{
    const results = document.querySelector('[data-available-products]');
    if (results) scrollToEl(results);
  });
  dock.querySelectorAll('[data-final-continue]').forEach(button=>button.addEventListener('click',()=>{
    if (availableProducts.expiresAt <= Date.now()){ expireProducts(); return; }
    goLender(LENDERS.find(l=>l.id===button.dataset.finalContinue));
  }));
}
function armProductsExpiry(){
  clearTimeout(productsExpiryTimer);
  if (!availableProducts) return;
  const left = availableProducts.expiresAt - Date.now();
  if (left <= 0) expireProducts();
  else productsExpiryTimer = setTimeout(expireProducts,left);
}
function restoreProducts(snapshot, owner){
  const saved = window.CredybaraSavedProducts?.clean(snapshot); if (!saved) return false;
  $('#restart').click();
  availableProducts = saved; availableOwner = owner; restoredProducts = true;
  S.phase = 'fund'; S.amount = saved.amount; S.purposeKey = saved.purposeKey; S.pref = saved.pref;
  S.purpose = TEMPLATES.find(tp => tp.key === saved.purposeKey)?.label || 'Personal expense';
  $('#tplBlock').classList.add('done'); $('#hello').closest('.msg').hidden = true;
  F.stage = 2; F.applied = true;
  F.resp = saved.products.map(p => ({ok:true,l:{...calc(LENDERS.find(l=>l.id===p.lenderId),saved.amount),...p,id:p.lenderId}}));
  F.offers = F.resp.map(r=>r.l); renderProgress(); syncComposer();
  const expired = saved.expiresAt <= Date.now();
  baraMsg(expired ? t('Your saved products have expired. Start a new search to see what is available now.','Tus productos guardados caducaron. Inicia una nueva búsqueda.') : t('Welcome back. Your saved products are still here.','Bienvenido de nuevo. Tus productos guardados están listos.'));
  const block = add(`<div class="saved-products-heading"><h3>${t('Your available products','Tus productos disponibles')}</h3><p>${money(saved.amount)} · ${t('Available until','Disponibles hasta')} ${fmtDay(new Date(saved.expiresAt))}</p></div>
    <div class="status">${F.resp.map(({l})=>`<div class="srow" data-r="${l.id}"><span class="mono" style="background:${l.color}">${l.name[0]}</span><div class="nm">${esc(l.name)}<small>${money2(l.monthly)}/mo · ${l.term} months · ${l.apr.toFixed(1)}% APR</small></div><span class="badge ${expired?'no':'ok'}">${expired?t('Expired','Caducado'):t('Available','Disponible')}</span><button type="button" class="btn primary go" data-product-continue="${l.id}" ${expired?'disabled':''}>${t('Continue','Continuar')}</button></div>`).join('')}</div>
    <p class="fine">${t('These results are not final approvals. Each lender reviews your application and confirms the final terms.','Estos resultados no son aprobaciones finales. Cada prestamista confirma los términos finales.')}</p><div class="retain-results" data-retain-results aria-live="polite"></div>`, 'block');
  block.setAttribute('data-available-products','');
  block.querySelectorAll('[data-product-continue]').forEach(button=>button.addEventListener('click',()=>{
    if (saved.expiresAt <= Date.now()){ expireProducts(); return; }
    goLender(LENDERS.find(l=>l.id===button.dataset.productContinue));
  }));
  armProductsExpiry(); scrollToEl(block);
  return true;
}

// Hand-off: the visitor leaves Credybara for the lender's own website (v3: a separate page).
// In production the application goes to the lender server-to-server and the visitor lands on the
// lender's site with a one-time token. In this demo the token points to sessionStorage.
async function goLender(lender){
  if (F.left) return;
  if (availableProducts && availableProducts.expiresAt <= Date.now()){ expireProducts(); return; }
  document.querySelectorAll('[data-go2],[data-product-continue],[data-final-continue]').forEach(button=>button.disabled = true);
  const quote = availableProducts?.products.find(p => p.lenderId === lender.id);
  const l = {...calc(lender, S.amount),...(restoredProducts && quote ? quote : {})};
  F.lender = l; F.left = true; F.stage = 3; renderProgress();
  renderFinalProductsDock();
  track('redirect_to_lender', {lender:l.id});
  userMsg(`${cmpT('Continue to','Continuar con')} ${esc(l.name)}`, null);
  await typing();
  const token = Math.random().toString(36).slice(2, 12);
  const others = F.resp.filter(r => r.ok && r.l.id !== l.id).map(r => r.l.id);
  try {
    sessionStorage.setItem('credy_handoff_' + token, JSON.stringify({
      lender: {id:l.id, name:l.name, color:l.color, apr:l.rate, term:l.term, fee:l.fee, min:l.min, max:l.max},
      loan: {amount:S.amount, purpose:S.purpose, purposeKey:S.purposeKey},
      resumeProducts:restoredProducts,
      applicant: restoredProducts ? {first:'',last:'',email:'',phone:'',dob:'',street:'',zip:'',st:'',income:'',ssn4:'',military:'no'} : {first:A.first, last:A.last, email:A.email, phone:A.phone, dob:A.dob, street:A.street, zip:A.zip, st:A.st, income:A.income, ssn4:A.ssn4, military:A.military},
      source: {partner:'credybara', lead_id: LEAD ? LEAD.lead_id : null, sub_id: ATTR.utm_campaign || SOURCE},
      others
    }));
  } catch(e){}
  const hop = add(`<div class="leave"><b>${cmpT(`Taking you to ${l.name}…`, `Te llevamos a ${l.name}…`)}</b>
      <p class="fine" style="margin:4px 0 8px">${cmpT(`You're leaving Credybara. ${l.name}'s own terms and privacy policy apply on their site.`, `Sales de Credybara. En el sitio de ${l.name} aplican sus propios términos y política de privacidad.`)}</p>
      <div class="hopbar"><span></span></div></div>`, 'block');
  scrollToEl(hop);
  await sleep(reduceMotion ? 50 : 1300);
  location.href = `lender.html?lender=${l.id}&ref=credybara&token=${token}`;
}

// Lender site · step 1: finish the application (details carried over from Credybara).
function lenderApply(l){
  const masked = A.email.replace(/^(.).*(@.*)$/, '$1••••$2');
  const v = add(lpHTML(l, `<div data-lapp>
      <h4>Finish your application</h4><p class="lead">Welcome, ${esc(A.first)}. We pre-filled what you shared with Credybara.</p>
      <div class="lp-sec"><h5>From Credybara</h5>
        <dl class="facts num" style="grid-template-columns:1fr 1fr">
          <div><dt>Amount</dt><dd>${money(S.amount)}</dd></div><div><dt>Purpose</dt><dd style="font-size:13px">${esc(S.purpose)}</dd></div>
          <div><dt>Location</dt><dd>${esc(A.zip)} · ${esc(A.st)}</dd></div><div><dt>Income</dt><dd>${money(A.income)}/mo</dd></div>
        </dl></div>
      <div class="lp-sec"><h5>1 · Verify it's you</h5>
        ${fieldHTML('otp', `6-digit code sent to ${esc(masked)}`, 'inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="••••••"', 'Enter the 6-digit verification code.')}</div>
      <div class="lp-sec"><h5>2 · Where should funds go if you're approved?</h5>
        <div class="choices">
          <button class="choice" type="button" role="radio" data-bank="Checking ••••4321" aria-checked="false"><span class="dot"></span><span>Checking ••••4321<small>Linked bank</small></span></button>
          <button class="choice" type="button" role="radio" data-bank="Savings ••••8890" aria-checked="false"><span class="dot"></span><span>Savings ••••8890<small>Linked bank</small></span></button>
        </div></div>
      <label class="consent req"><input type="checkbox" data-hp><span><span class="tagr">Required</span>I authorize ${esc(l.name)} to obtain my credit report to review this application. <b>This may be a hard inquiry, which can affect my credit score.</b></span></label>
      <div class="form-foot"><button class="btn primary" type="button" data-vgo>Submit application</button></div></div>`), 'block');
  const otp = v.querySelector('#f-otp'), hp = v.querySelector('[data-hp]'), go = v.querySelector('[data-vgo]');
  const ref = () => {};  // demo: no input validation
  if (!F.bank) F.bank = 'Checking ••••4321';
  otp.addEventListener('input', () => { otp.value = otp.value.replace(/\D/g,'').slice(0,6); ref(); });
  hp.addEventListener('change', ref);
  v.querySelectorAll('[data-bank]').forEach(b => b.addEventListener('click', () => {
    F.bank = b.dataset.bank; v.querySelectorAll('[data-bank]').forEach(x => x.setAttribute('aria-checked', x === b)); ref();
  }));
  go.addEventListener('click', () => { v.querySelectorAll('input,button').forEach(x => x.disabled = true); F.verified = true; lenderDecision(l); });
  scrollToEl(v);
  otp.focus({preventScroll:true});
}

// Lender site · step 2: the lender decides (the approval comes from the lender, not Credybara), then e-sign.
async function lenderDecision(l){
  F.stage = 4; renderProgress();
  const rv = add(lpHTML(l, `<div class="srow" style="padding:0"><div class="nm">Reviewing your application…<small>Verifying identity, income and credit</small></div>
      <span class="badge"><span class="spin"></span>Reviewing</span></div>`), 'block');
  scrollToEl(rv);
  await sleep(reduceMotion ? 50 : 1600);
  rv.querySelector('.badge').className = 'badge ok'; rv.querySelector('.badge').textContent = 'Approved';
  rv.querySelector('.nm').innerHTML = `${esc(l.name)} approved your loan<small>Decision made by ${esc(l.name)}</small>`;
  await sleep(400);
  const financed = S.amount - l.feeAmt, charge = l.interest + l.feeAmt, payments = l.monthly * l.term;
  const first = addMonths(new Date(), 1), last = addMonths(new Date(), l.term);
  const sg = add(lpHTML(l, `<div data-sign>
      <h4>Your loan agreement</h4><p class="lead">Final terms from ${esc(l.name)} (Truth in Lending disclosure).</p>
      <dl class="tila num">
        <div><dt>Annual Percentage Rate<small>Cost of credit as a yearly rate</small></dt><dd>${l.apr.toFixed(2)}%</dd></div>
        <div><dt>Finance Charge<small>Dollar amount the credit will cost you</small></dt><dd>${money2(charge)}</dd></div>
        <div><dt>Amount Financed<small>Credit provided to you</small></dt><dd>${money2(financed)}</dd></div>
        <div><dt>Total of Payments<small>After all payments are made</small></dt><dd>${money2(payments)}</dd></div>
      </dl>
      <p class="fine" style="margin:0 0 12px">${l.term} monthly payments of <b>${money2(l.monthly)}</b>, ${fmtDay(first)} – ${fmtDay(last)}. ${l.fee ? `${l.fee}% origination fee (${money2(l.feeAmt)}) is deducted from your loan, so you receive ${money2(financed)}.` : 'No origination fee.'}</p>
      <label class="consent"><input type="checkbox" data-auto><span><span class="tagr">Optional</span>Set up autopay from ${esc(F.bank)}. You can turn it off anytime.</span></label>
      <label class="consent req"><input type="checkbox" data-read><span><span class="tagr">Required</span>I've read the <a href="#">loan agreement</a> and agree to its terms.</span></label>
      ${fieldHTML('sig', 'Type your full name to sign', `autocomplete="off" placeholder="${esc(A.first)} ${esc(A.last)}"`)}
      <div class="form-foot"><button class="btn primary" type="button" data-sgo>Sign agreement</button></div></div>`), 'block');
  const read = sg.querySelector('[data-read]'), sig = sg.querySelector('#f-sig'), go = sg.querySelector('[data-sgo]');
  const ref = () => {};  // demo: no input validation
  read.addEventListener('change', ref); sig.addEventListener('input', ref);
  sg.querySelector('[data-auto]').addEventListener('change', e => { F.autopay = e.target.checked; });
  go.addEventListener('click', () => { sg.querySelectorAll('input,button').forEach(x => x.disabled = true); F.signed = true; fund(l, financed, first); });
}

// Lender site · step 3: funding.
async function fund(l, financed, first){
  F.stage = 5; renderProgress();
  const steps = ['Agreement signed', `${esc(l.name)} sent your funds`, `Deposited to ${esc(F.bank)}`];
  const list = add(lpHTML(l, `<ul class="checks" style="border:0;padding:0">${steps.map(x => `<li><span class="c">${ICON.check}</span>${x}</li>`).join('')}</ul>`), 'block');
  scrollToEl(list);
  for (const li of list.querySelectorAll('li')){ await sleep(reduceMotion ? 50 : 650); li.classList.add('done'); }
  await sleep(300);
  F.funded = true; renderProgress();
  track('funded_demo', {lender:l.id, amount:S.amount});
  const colors = ['#2F6B52','#F2A97E','#E7C46A','#BFE3CE','#C06A3A'];
  const confetti = reduceMotion ? '' : `<div class="confetti">${Array.from({length:28}, (_,i) =>
    `<i style="left:${(i*37)%100}%;background:${colors[i%5]};animation-delay:${(i%7)*0.08}s"></i>`).join('')}</div>`;
  const done = add(`<div class="funded">${confetti}
      <div class="big">${CHECK}</div>
      <h3>You're funded, ${esc(A.first)}!</h3>
      <div class="amt num">${money2(financed)}</div>
      <p class="fine" style="margin:0">deposited to ${esc(F.bank)} by ${esc(l.name)} · timing depends on the lender and your bank</p>
      <dl class="num">
        <dt>Lender</dt><dd>${esc(l.name)}</dd>
        <dt>Loan amount</dt><dd>${money(S.amount)}</dd>
        <dt>Monthly payment</dt><dd>${money2(l.monthly)}</dd>
        <dt>First payment</dt><dd>${fmtDay(first)}</dd>
        <dt>Payments</dt><dd>${l.term}</dd>
        <dt>Autopay</dt><dd>${F.autopay ? 'On' : 'Off'}</dd>
      </dl>
      <p class="fine" style="margin-top:14px">Your loan is with ${esc(l.name)}; questions about it go to them.${F.resp.filter(r => r.ok && r.l.id !== l.id).length ? ' Your other applications stay unfinished. Nothing happens unless you complete them.' : ''}</p>
      <div style="margin-top:14px"><button class="btn primary" type="button" data-again>Start a new request</button></div>
    </div>`, 'block');
  done.querySelector('[data-again]').addEventListener('click', () => $('#restart').click());
  scrollToEl(done);
}


/* =====================================================================
   GUIDED TOUR — coach marks that box the next thing to tap.
   Each step: target (selector or fn → elements), title/text,
   and either done() (advances when the user does it) or next:true (info step).
   ===================================================================== */
const TOUR = [
  {intro:true, title:'Welcome to Credybara', next:true, cta:'Let\'s start',
    text:'We help you find a personal loan. Tell Bara what you need, see pre-qualified offers from lenders in our network, and apply to the ones you like. The lender reviews, approves and funds your loan.'},
  {target:'#tplGrid', title:'Start here', text:'Tap what the loan is for. You can change the amount later.', done:() => S.step >= 2},
  {target:'.plan:not(.credit-q)', title:'Pick what matters most', text:'Bara picks your 3 best overall options, giving extra weight to this.', done:() => S.step >= 3},
  {target:'.credit-q', title:'Your credit, roughly', text:'A rough guess helps Bara skip lenders that are unlikely to work for you. It doesn\'t check your credit.', done:() => S.step >= 4},
  {target:'#results .cmp', title:'Compare at a glance', text:'One column per option, one row per thing to compare. ✓ marks the best in each row. Tap a row name to learn what it means. Tick the columns you like.', next:true},
  {target:'#composerActions [data-cta], #results [data-cta]', title:'Check real options', text:'Continue with the ones you ticked. It\'s one short form, right here in the chat.', done:() => S.phase === 'apply'},
  {target:'.qa[data-s="details"] .block', title:'One quick form', text:'Just what lenders need to estimate your offers. The lender asks for anything else on its own site. Check the box and tap “See my offers”.', done:() => A.submitted},
  {target:'[data-match]', title:'Pick and apply', text:'Same table, now with your pre-qualified estimates. Your picks are ticked. Change them if you like, then tap Apply', done:() => F.applied,
    wait:'Bara is checking pre-qualified offers…'},
  {target:'[data-resp]', title:'Lenders respond', text:'“Accepted” means a lender wants to review your application. It\'s not an approval. Tap Continue: you\'ll go to that lender\'s own website to finish.', next:true,
    wait:'Lenders are responding…'},
];
const Tour = {
  i:-1, on:false, placed:false, startAt:0,
  ring:$('#tourRing'), tip:$('#tourTip'), pill:$('#tourPill'),
  start(){ this.on = true; this.go(0); requestAnimationFrame(() => this.tick()); },
  go(i){
    this.i = i; this.placed = false; this.startAt = performance.now(); this.tipFor = -1;
    if (i >= TOUR.length) this.end();
  },
  end(){
    this.on = false; this.ring.style.display = this.tip.style.display = 'none'; this.pill.style.display = 'none'; $('#tourDim').style.display = 'none';
  },
  els(){
    const t = TOUR[this.i].target;
    if (!t) return [];
    const list = typeof t === 'function' ? t() : [document.querySelector(t)];
    return list.filter(el => el && el.offsetParent !== null && el.getBoundingClientRect().height > 0);
  },
  tick(){
    if (!this.on) return;
    const st = TOUR[this.i];
    if (st.done && st.done()){ this.go(this.i + 1); if (!this.on) return; }
    $('#tourDim').style.display = TOUR[this.i].intro ? 'block' : 'none';
    if (TOUR[this.i].intro){
      this.ring.style.display = 'none'; this.pill.style.display = 'none';
      if (this.tipFor !== this.i) this.renderTip();
      const tip = this.tip; tip.style.display = 'block'; tip.querySelector('.arrow').style.display = 'none';
      tip.style.left = (innerWidth - tip.offsetWidth)/2 + 'px'; tip.style.top = Math.max(80, (innerHeight - tip.offsetHeight)/2) + 'px';
      return requestAnimationFrame(() => this.tick());
    }
    const els = this.els();
    if (!els.length){
      // Target not on screen yet (e.g. Bara is typing, or questions in between): show a small hint instead.
      this.ring.style.display = this.tip.style.display = 'none';
      this.pill.style.display = st.wait ? 'flex' : 'none';
      $('#tourPillTxt').textContent = st.wait || '';
    } else {
      this.pill.style.display = 'none';
      this.place(els);
    }
    requestAnimationFrame(() => this.tick());
  },
  place(els){
    const r = els.map(e => e.getBoundingClientRect()).reduce((a,b) => ({left:Math.min(a.left,b.left), top:Math.min(a.top,b.top), right:Math.max(a.right,b.right), bottom:Math.max(a.bottom,b.bottom)}));
    const vh = innerHeight, vw = innerWidth, pad = 6, headH = 120;
    // Bring the target into view once, after the app's own scroll settles.
    if (!this.placed && performance.now() - this.startAt > 450){
      this.placed = true;
      const tooTall = r.bottom - r.top > vh - headH - 200;
      if (r.top < headH || r.bottom > vh - 200 || tooTall){
        window.scrollTo({top: scrollY + r.top - headH - 10, behavior: reduceMotion ? 'auto' : 'smooth'});
      }
    }
    Object.assign(this.ring.style, {display:'block', left:(r.left-pad)+'px', top:(r.top-pad)+'px', width:(r.right-r.left+pad*2)+'px', height:(r.bottom-r.top+pad*2)+'px'});
    $('#tourBadge').textContent = this.i + 1;
    if (this.tipFor !== this.i) this.renderTip();
    // Tooltip: below the target if it fits, else above, else pinned to the bottom of the screen.
    const tip = this.tip; tip.style.display = 'block';
    const th = tip.offsetHeight, tw = tip.offsetWidth, gap = 16;
    const left = Math.min(Math.max(16, (r.left + r.right)/2 - tw/2), vw - tw - 16);
    let top, arrowTop = null;
    if (r.bottom + pad + gap + th < vh - 8){ top = r.bottom + pad + gap; arrowTop = -7; }
    else if (r.top - pad - gap - th > headH - 50){ top = r.top - pad - gap - th; arrowTop = th - 9; }
    else { top = vh - th - 16; }
    tip.style.left = left + 'px'; tip.style.top = top + 'px';
    const ar = tip.querySelector('.arrow');
    if (arrowTop === null) ar.style.display = 'none';
    else { ar.style.display = 'block'; ar.style.top = arrowTop + 'px'; ar.style.left = Math.min(Math.max(16, (r.left + r.right)/2 - left - 8), tw - 32) + 'px'; }
  },
  renderTip(){
    this.tipFor = this.i;
    const st = TOUR[this.i], last = this.i === TOUR.length - 1;
    this.tip.classList.toggle('intro', !!st.intro);
    this.tip.innerHTML = `<span class="arrow"></span>
      <div class="hd"><svg aria-hidden="true"><use href="#bara"/></svg><span class="ct">Guide ${this.i+1}/${TOUR.length}</span>
        <span class="dots">${TOUR.map((_,k) => `<i class="${k<=this.i?'on':''}"></i>`).join('')}</span></div>
      <h4>${st.title}</h4><p>${st.text}</p>${st.intro ? `<ul class="intro-list">
          <li><span class="ii"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg></span>Compare lenders in one place</li>
          <li><span class="ii"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M5 7h14M5 7l-3 7a4 4 0 006 0zM19 7l-3 7a4 4 0 006 0z"/></svg></span>See pros, cons and total cost clearly</li>
          <li><span class="ii"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></svg></span>Free to use · we're not a lender</li>
        </ul>` : ''}
      <div class="act"><button class="skip" type="button" data-skip>Skip guide</button>
        ${st.next ? `<button class="btn primary go" type="button" data-nx>${st.cta || (last ? 'Done' : 'Next')}</button>`
                  : `<span class="tap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11V5a2 2 0 014 0v6"/><path d="M13 10a2 2 0 014 0v2a2 2 0 014 0v3a6 6 0 01-6 6h-2a6 6 0 01-5-2.7L5 14a2 2 0 013-2.6l1 1.1"/></svg>Tap the highlighted area</span>`}</div>`;
    this.tip.querySelector('[data-skip]').addEventListener('click', () => this.end());
    this.tip.querySelector('[data-nx]')?.addEventListener('click', () => this.go(this.i + 1));
  }
};
$('#tourPillSkip').addEventListener('click', () => Tour.end());
$('#guideBtn').addEventListener('click', () => {
  // Restart the guide from wherever the visitor is now.
  const at = S.phase === 'fund' ? (!F.applied ? 7 : 8) : S.phase === 'apply' ? (A.submitted ? 7 : 6) : S.step >= 4 ? 4 : S.step >= 3 ? 3 : S.step >= 2 ? 2 : 0;
  closeWelcome();
  if (Tour.on) Tour.go(at); else { Tour.start(); Tour.go(at); }
});

/* =====================================================================
   LOCAL LEAD PAYLOAD
   Prototype integration data. Personal details are masked; no backend is connected.
   ===================================================================== */
let LEAD = null;
function buildLead(){
  const mask = v => v ? v[0] + '•'.repeat(Math.max(0, v.length - 1)) : '';
  const secs = Math.round((Date.now() - T0) / 1000);
  LEAD = {
    lead_id: 'demo-' + Math.random().toString(36).slice(2, 10),
    created_at: new Date().toISOString(),
    attribution: {...ATTR, source: SOURCE, landing_page: LP_SLUG || 'home', language: LANG},
    loan: {amount: S.amount, purpose: S.purposeKey, priority: S.pref},
    applicant: {
      first_name: mask(A.first), last_name: mask(A.last),
      email: A.email.replace(/^(.).*(@.*)$/, '$1••••$2'),
      dob: A.dob ? '••/••/' + A.dob.slice(0, 4) : '', street: '•••', zip: A.zip, state: A.st, monthly_income: A.income,
      self_reported_credit: S.credit === '' ? 'not sure' : ['below 580','fair','good','excellent'][+S.credit]
    },
    consent: {
      terms_softpull: A.c1, consent_text_version: CONSENT_VERSION,
      certificate_url: 'https://cert.example.com/' + Math.random().toString(36).slice(2, 12) + ' (mock TrustedForm/Jornaya)',
      timestamp: new Date().toISOString(), ip: '(captured server-side)'
    },
    quality: {
      seconds_on_page: secs, honeypot_empty: !A.honeypot, too_fast: secs < 20,
      email_check: 'format ok, not disposable'
    },
    filters: {apr_cap: APR_CAP ? APR_CAP + '% (search-ad traffic)' : 'none', mla: 'asked by lender'}
  };
}

/* --- language switch: static text uses data-es; dynamic text uses t() --- */
(function setupLanguage(){
  document.documentElement.lang = LANG;
  document.querySelectorAll('.lang [data-lang]').forEach(a => {
    a.setAttribute('aria-current', a.dataset.lang === LANG);
    a.addEventListener('click', e => {
      e.preventDefault();
      const q = new URLSearchParams(location.search);
      a.dataset.lang === 'es' ? q.set('lang', 'es') : q.delete('lang');
      location.search = q.toString();
    });
  });
  if (LANG !== 'es') return;
  document.querySelectorAll('[data-es]').forEach(el => { el.innerHTML = el.dataset.es; });
  document.querySelectorAll('[data-es-ph]').forEach(el => { el.placeholder = el.dataset.esPh; });
})();

/* --- footer: rate range reflects what this visitor can actually see --- */
(function rateRange(){
  const shown = LENDERS.filter(l => !(APR_CAP && calc(l, l.min).apr >= APR_CAP));
  const aprs = shown.map(l => calc(l, l.min).apr), terms = shown.map(l => l.term);
  $('#rateRange').textContent = `Example APRs (including fees) on this page range from ${Math.min(...aprs).toFixed(2)}% to ${Math.max(...aprs).toFixed(2)}%. Example repayment terms range from ${Math.min(...terms)} to ${Math.max(...terms)} months. Loan availability and terms vary by state and lender.`
    + (APR_CAP ? ' Loans with an APR of 36% or higher are not offered to visitors from search ads.' : '');
})();

/* --- privacy choices (CCPA “Do Not Sell or Share”) + GPC --- */
(function privacy(){
  $('#dnsBtn').addEventListener('click', () => $('#dns').classList.toggle('open'));
  if (navigator.globalPrivacyControl){
    $('#dnsToggle').checked = true;
    $('#gpcNote').textContent = 'Global Privacy Control signal detected. You\'re opted out of the sale or sharing of your personal information.';
  }
})();

/* --- gentle nudge if someone stalls on the forms --- */
let nudgeTimer = null, nudged = false;
function armNudge(){
  if (nudged) return;
  const reset = () => { clearTimeout(nudgeTimer); nudgeTimer = setTimeout(fireNudge, 45000); };
  ['input','click','keydown'].forEach(ev => chat.addEventListener(ev, reset, {passive:true}));
  reset();
}
function fireNudge(){
  if (nudged || A.submitted || S.phase !== 'apply') return;
  nudged = true;
  const q = chat.querySelector('.qa:last-child');
  const m = baraMsg(t('Still there? You\'re almost done. It takes under a minute, and checking offers won\'t affect your credit score.',
                      '¿Sigues ahí? Ya casi terminas: toma menos de un minuto y ver ofertas no afecta tu puntaje.'));
  if (q) q.parentNode.insertBefore(m, q.nextSibling);
}

/* --- returning from the “saved offers” email (demo) --- */
async function resumeDemo(){
  const tp = TEMPLATES.find(x => x.key === 'debt');
  Object.assign(S, {purpose: t(tp.label, tp.es), purposeKey: 'debt', amount: 5000, pref: 'cost', phase: 'apply', step: 4});
  Object.assign(A, {zip: '75201', st: 'TX', income: 3500, military: 'no', first: 'Alex', last: 'Rivera', email: 'alex@example.com',
    phone: '(214) 555-0123', dob: '1990-05-01', street: '123 Main St', ssn4: '1234', c1: true, submitted: true});
  $('#tplBlock').classList.add('done');
  $('#hello').closest('.msg').remove();
  chat.classList.add('locked');
  baraMsg(t('<b>Welcome back, Alex.</b> Your pre-qualified offers for <b>$5,000</b> are saved. Pick up where you left off.',
            '<b>Hola de nuevo, Alex.</b> Tus ofertas precalificadas para <b>$5,000</b> están guardadas. Sigue donde lo dejaste.'));
  track('resume_from_email', {amount: 5000});
  outcome();
}

/* =====================================================================
   RESET + INIT
   ===================================================================== */
$('#restart').addEventListener('click', () => {
  availableProducts = null; availableOwner = null; restoredProducts = false; finalProductsPinned = false; clearTimeout(productsExpiryTimer);
  renderFinalProductsDock();
  $('#hello').closest('.msg').hidden = false;
  releasePending();
  $('#composerActions')?.replaceChildren();
  document.removeEventListener('keydown', keyPick);
  [...chat.children].slice(2).forEach(el => el.remove());
  chat.classList.remove('locked');
  Object.assign(S, {phase:'compare', purpose:null, purposeKey:null, amount:null, pref:null, st:'', credit:'', open:{}, retired:false, picks:new Set()});
  A = A0(); F = F0(); appIdx = -1; LEAD = null; nudged = false; clearTimeout(nudgeTimer);
  renderTemplates();
  $('#tplBlock').classList.remove('done');
  $('#freeInput').value = ''; $('#freeBtn').disabled = true;
  setStep(1);
  if (Tour.on) Tour.go(1);
  scrollToEl($('.panel'));
});
(function repExample(){
  const l = calc(LENDERS.find(x => x.id === 'bright'), 2000);
  $('#repEx').innerHTML = `A ${money(2000)} loan over ${l.term} months at a ${l.rate}% interest rate with a ${l.fee}% origination fee (${money(l.feeAmt)}, deducted from the loan) has an APR of ${l.apr.toFixed(2)}% and ${l.term} monthly payments of ${money2(l.monthly)}. You receive ${money2(2000 - l.feeAmt)}; total of payments: ${money2(l.monthly * l.term)}. Your final terms depend on the lender's review.`;
})();
renderTemplates();
setStep(1);
if (LP_KEY){
  const tp = TEMPLATES.find(x => x.key === LP_KEY);
  $('#h1').innerHTML = `${t(tp.h1, tp.h1es)} <em>${t('Start here.','Empieza aquí.')}</em>`;
}
track('lp_view', {template: LP_KEY || undefined});
if (QS.get('resume') === 'demo') resumeDemo();
else if (LP_KEY){
  // Ad → matching landing page: skip step 1 and say so.
  const amt = QS.get('amount') ? clamp(+QS.get('amount')) : null;
  setTimeout(() => pickTemplate(LP_KEY, amt, true), 500);
}
// Offer the guide on arrival; the visitor decides. Asked once per browser session.
const welcome = $('#welcome');
const closeWelcome = () => { welcome.classList.remove('show'); try { sessionStorage.setItem('credy_welcome', '1'); } catch(e){} };
$('#wYes').addEventListener('click', () => { closeWelcome(); Tour.start(); });
$('#wNo').addEventListener('click', closeWelcome);
$('#wX').addEventListener('click', closeWelcome);
let asked = false; try { asked = sessionStorage.getItem('credy_welcome') === '1'; } catch(e){}
if (!asked && QS.get('restore') !== '1') setTimeout(() => { if (!Tour.on) welcome.classList.add('show'); }, 800);

window.CredybaraDraft = {
  read() {
    return {purpose:S.purpose, purposeKey:S.purposeKey, amount:S.amount, pref:S.pref, credit:S.credit, step:S.step};
  },
  async restore(draft) {
    const validKeys = [...TEMPLATES.map(t => t.key),'other'];
    if (!validKeys.includes(draft.purposeKey) || !Number.isFinite(draft.amount)) return;
    $('#tplBlock').classList.add('done');
    await startPlan(esc(String(draft.purpose || 'Personal expense').slice(0,80)), draft.purposeKey, clamp(draft.amount), 'Continue with my saved loan preferences', 'Welcome back. Your loan preferences are ready.');
    if (PREFS.some(p => p.key === draft.pref)) {
      await choosePref(draft.pref, document.querySelector('.plan').closest('.block'));
      if (draft.step >= 4 && CREDIT_Q.some(c => c[0] === draft.credit)) {
        await chooseCredit(draft.credit, document.querySelector('.credit-q').closest('.block'));
      }
    }
  }
};
window.CredybaraResults = {
  read: () => availableProducts,
  owner: () => availableOwner,
  markOwner: owner => { availableOwner = owner; },
  refreshDock:renderFinalProductsDock,
  canRestore: () => S.phase === 'compare' && S.step === 1,
  restore:restoreProducts,
  clear: () => $('#restart').click()
};
