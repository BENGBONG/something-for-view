/* AI conversation storyboard. Recognition is a fixed prototype fixture, not a live model call.
   Actual V4 amount, credit and comparison components; one continuous 24-second clock. */
(async () => {
  const TOTAL=24000, EASE='cubic-bezier(.22,1,.36,1)', SOFT='cubic-bezier(.65,0,.35,1)';
  const root=document.body, quiet=matchMedia('(prefers-reduced-motion: reduce)'), animations=[];
  let origin=0,monitor,lastPhase=-1,geometry=null,offscreen=false,resume=()=>{};
  track=()=>{};typing=async()=>{};scrollToEl=()=>{};
  const requestText="My car needs a repair, about $2,000. I'd like to keep my monthly payment low.";
  // The film has a known input and a reviewed interpretation. No production AI claim is made here.
  const understood={purpose:'Car repair',purposeKey:'other',amount:2000,pref:'monthly'};
  const clone=node=>node.cloneNode(true);
  // Typing rhythm: about 32ms a character, with a short pause after each clause.
  const typedAt=[];[...requestText].reduce((at,char,i,list)=>{typedAt.push(at);return at+32+(/[,.]/.test(char)&&list[i+1]===' '?160:0);},550);
  const greeting=clone(document.getElementById('hello'));
  greeting.innerHTML="Hi, I'm Bara. <b>Tell me what you need, in your own words.</b> I'll help you work out the next step.";
  await startPlan(understood.purpose,understood.purposeKey,understood.amount,understood.purpose);
  await choosePref(understood.pref,document.querySelector('.plan:not(.credit-q)').closest('.block'));
  const credit=clone(document.querySelector('.credit-q'));
  const creditQuestion=document.createElement('div');creditQuestion.className='bubble';
  creditQuestion.innerHTML="One detail I couldn't get from your message: <b>how would you describe your credit?</b> A rough idea is enough. This doesn't check your credit.";
  const products=rank(understood.pref,understood.amount,'',2).top;
  const best=products.reduce((a,b)=>a.monthly<b.monthly?a:b);
  const shell=document.createElement('div');shell.innerHTML=compareHTML(products,'examples',new Set([best.id]));
  const comparison=shell.firstElementChild;comparison.classList.add('go');comparison.dataset.w='1';
  // The film keeps three rows (monthly, total cost, APR) so the numbers stay readable at preview size.
  ['.ri-minCredit','.ri-term'].forEach(icon=>{
    const row=comparison.querySelector(icon).closest('.cmp-l');
    let next=row.nextElementSibling;
    while(next&&next.classList.contains('cmp-c')){const current=next;next=next.nextElementSibling;current.remove();}
    row.remove();
  });comparison.querySelectorAll('.cmp-f').forEach(n=>n.remove());
  comparison.querySelectorAll('.sel').forEach(n=>n.classList.remove('sel'));
  comparison.querySelectorAll(`[data-col="${best.id}"]`).forEach(n=>n.classList.add('motion-best'));
  // The request asks for a low monthly payment, so the badge sits on the column the film selects.
  const badge=comparison.querySelector('.toppick'),bestHead=comparison.querySelector(`.cmp-h[data-col="${best.id}"]`);
  if(badge&&bestHead){badge.textContent='Lowest monthly';bestHead.querySelector('small').before(badge);}

  const stage=document.createElement('div');stage.className='motion-stage ai-story';stage.inert=true;
  stage.innerHTML=`<div class="motion-context"><div class="context-pill purpose-pill">${ICON.other}<span>Car repair <b>$2,000</b></span></div><div class="context-pill preference-pill">${ICON.monthly}<span>Lower monthly payments</span></div></div>
  <svg class="motion-avatar" aria-hidden="true"><use href="#bara"/></svg>
  <section class="motion-scene conversation-scene"><div class="motion-question"></div><div class="ai-composer form"><div class="ai-composer-label"><span>Your message</span><span class="ai-writing">Typing…</span></div><div class="ai-input"></div><div class="ai-composer-footer"><span>In your own words.</span><button class="btn primary ai-send" type="button">Send ${ICON.arrow}</button></div></div><p class="ai-input-note">Please leave out your SSN and bank details.</p></section>
  <div class="ai-user-message msg user"><div class="bubble"></div></div>
  <section class="motion-scene understanding-scene"><div class="ai-thinking"><span>Bara is reading your message</span><i></i><i></i><i></i></div><div class="motion-question"><div class="bubble ai-response"></div></div><section class="form ai-confirm-card"><h3>Confirm the amount</h3><div class="ai-amount-row"><span>Start with</span>${stepperHTML()}</div><p>You said “about $2,000”. Adjust it if you need to.</p><div class="ai-confirm-actions"><button class="btn primary ai-confirm" type="button">Use $2,000</button><button class="edit" type="button">Edit details</button></div></section></section>
  <section class="motion-scene credit-scene"><div class="motion-question"></div><div class="motion-content"></div></section>
  <section class="motion-scene comparison-scene"><div class="motion-content"></div><p class="motion-note">Estimated terms. Not an approval or a guarantee.</p></section>
  <div class="ai-caret"></div>
  <div class="motion-tap"></div><svg class="motion-cursor" viewBox="0 0 28 34" aria-hidden="true"><path d="M3 2v26l6-6 5 10 5-2-5-10 10-1z" fill="white" stroke="#1F4D3A" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
  stage.querySelector('.conversation-scene .motion-question').append(greeting);
  stage.querySelector('.ai-user-message .bubble').textContent=requestText;
  [...requestText].forEach(char=>{const span=document.createElement('span');span.className='typed-char';span.textContent=char;stage.querySelector('.ai-input').append(span);});
  const response="I understand: a car repair and a preference for lower monthly payments. Should I use $2,000 to start?";
  response.split(' ').forEach((word,i)=>{const span=document.createElement('span');span.className='ai-word';span.textContent=(i?' ':'')+word;stage.querySelector('.ai-response').append(span);});
  stage.querySelector('.credit-scene .motion-question').append(creditQuestion);
  stage.querySelector('.credit-scene .motion-content').append(credit);
  stage.querySelector('.comparison-scene .motion-content').append(comparison);
  stage.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
  document.body.append(stage);document.querySelector('.wrap').remove();document.querySelector('.top')?.remove();document.querySelector('.disc')?.remove();
  await document.fonts.ready;
  const q=s=>stage.querySelector(s),all=s=>[...stage.querySelectorAll(s)];
  function add(node, stops) {
    const frames = stops.map(({at,...style}) => ({...style,offset:at/TOTAL}));
    const animation = node.animate(frames,{duration:TOTAL,iterations:Infinity,fill:'both'});
    animations.push(animation);
    return animation;
  }
  function visible(node, start, enter, exit, end, distance = 24) {
    add(node,[
      {at:0,opacity:0,transform:`translate3d(${distance}px,12px,0) scale(.975)`},
      {at:start,opacity:0,transform:`translate3d(${distance}px,12px,0) scale(.975)`,easing:EASE},
      {at:enter,opacity:1,transform:'translate3d(0,0,0) scale(1)'},
      {at:exit,opacity:1,transform:'translate3d(0,0,0) scale(1)',easing:SOFT},
      {at:end,opacity:0,transform:'translate3d(-24px,-16px,0) scale(.97)'},
      {at:TOTAL,opacity:0,transform:'translate3d(-24px,-16px,0) scale(.97)'}
    ]);
  }
  function localRect(node) {
    if (geometry?.has(node)) return geometry.get(node);
    const r = node.getBoundingClientRect(), s = stage.getBoundingClientRect();
    return {x:r.left-s.left,y:r.top-s.top,w:r.width,h:r.height};
  }
  function press(node, time) {
    const primary=node.matches('.btn.primary');
    const resting=primary?'#1F4D3A':'#FFFFFF', active=primary?'#2F6B52':'#DDF1E5';
    add(node,[
      {at:0,transform:'scale(1)'},{at:time,transform:'scale(1)',easing:SOFT},
      {at:time+130,transform:'scale(.972)',easing:EASE},
      {at:time+300,transform:'scale(1.012)',easing:EASE},
      {at:time+490,transform:'scale(1)'},{at:TOTAL,transform:'scale(1)'}
    ]);
    add(node,[
      {at:0,backgroundColor:resting,borderColor:'#E6DFD1'},
      {at:time,backgroundColor:resting,borderColor:'#E6DFD1',easing:EASE},
      {at:time+200,backgroundColor:active,borderColor:'#2F6B52'},
      {at:time+1400,backgroundColor:active,borderColor:'#2F6B52'},
      {at:time+1800,backgroundColor:resting,borderColor:'#E6DFD1'},
      {at:TOTAL,backgroundColor:resting,borderColor:'#E6DFD1'}
    ]);
  }
  function pulseOpacity(node,start,land,exit,end){add(node,[{at:0,opacity:0},{at:start,opacity:0,easing:EASE},{at:land,opacity:1},{at:exit,opacity:1,easing:SOFT},{at:end,opacity:0},{at:TOTAL,opacity:0}]);}
  function build(){
    cancelAnimationFrame(monitor);animations.splice(0).forEach(a=>a.cancel());geometry=null;
    const measured=all('.ai-composer,.ai-user-message,.ai-confirm-card,.ai-confirm,.ai-send,[data-cr="2"],.context-pill,.cmp-h,.typed-char');
    geometry=new Map(measured.map(n=>[n,localRect(n)]));
    const reduced=quiet.matches, mobile=stage.clientWidth<430;
    const recognizedY=mobile?232:206;
    const confirm=q('.ai-confirm'),good=q('[data-cr="2"]'),column=q(`.cmp-h[data-col="${best.id}"]`);
    const xform=(x,y,s=1)=>`translate3d(${x}px,${y}px,0) scale(${s})`;
    const intro=q('.conversation-scene');
    add(intro,[{at:0,opacity:1,transform:xform(0,0)},{at:4450,opacity:1,transform:xform(0,0),easing:SOFT},{at:5250,opacity:0,transform:reduced?xform(0,0):xform(-18,-14,.975)},{at:23150,opacity:0,transform:reduced?xform(0,0):xform(20,24,.98),easing:EASE},{at:23850,opacity:1,transform:xform(0,0)},{at:TOTAL,opacity:1,transform:xform(0,0)}]);
    if(reduced){
      pulseOpacity(q('.understanding-scene'),5000,5550,10650,11150);
      pulseOpacity(q('.credit-scene'),11500,12200,15500,16300);
      pulseOpacity(q('.comparison-scene'),15700,16600,22300,22950);
    }else{
      visible(q('.understanding-scene'),5000,5550,10650,11150,20);
      visible(q('.credit-scene'),11500,12200,15500,16300,28);
      visible(q('.comparison-scene'),15700,16600,22300,22950,24);
    }
    add(q('.ai-composer'),[{at:0,opacity:1,transform:xform(0,0)},{at:4030,opacity:1,transform:xform(0,0),easing:EASE},{at:4320,opacity:0,transform:reduced?xform(0,0):xform(0,-8,.99)},{at:23150,opacity:0,transform:xform(0,0)},{at:23750,opacity:1,transform:xform(0,0)},{at:TOTAL,opacity:1,transform:xform(0,0)}]);
    add(q('.ai-user-message'),[{at:0,opacity:0,transform:reduced?xform(0,-94):xform(0,16)},{at:4300,opacity:0,transform:reduced?xform(0,-94):xform(0,16),easing:EASE},{at:4750,opacity:1,transform:reduced?xform(0,-94):xform(0,0)},{at:4980,opacity:1,transform:reduced?xform(0,-94):xform(0,0),easing:EASE},{at:5550,opacity:1,transform:xform(0,-94)},{at:10650,opacity:1,transform:xform(0,-94),easing:SOFT},{at:11150,opacity:0,transform:reduced?xform(0,-94):xform(0,-104)},{at:TOTAL,opacity:0,transform:reduced?xform(0,-94):xform(0,-104)}]);
    pulseOpacity(q('.ai-writing'),350,600,3650,3950);
    const chars=all('.typed-char');
    chars.forEach((node,i)=>{const at=typedAt[i];add(node,[{at:0,opacity:0},{at,opacity:0},{at:at+1,opacity:1},{at:22760,opacity:1},{at:22800,opacity:0},{at:TOTAL,opacity:0}]);});
    if(!reduced){
      const charRects=chars.map(localRect),first=charRects[0];
      const caret=[{at:0,opacity:0,transform:xform(first.x,first.y)},{at:540,opacity:1,transform:xform(first.x,first.y)}];
      charRects.forEach((r,i)=>caret.push({at:typedAt[i],opacity:1,transform:xform(r.x+r.w,r.y),easing:'steps(1,end)'}));
      const last=charRects.at(-1);caret.push({at:3730,opacity:1,transform:xform(last.x+last.w,last.y)},{at:3850,opacity:0,transform:xform(last.x+last.w,last.y)},{at:TOTAL,opacity:0,transform:xform(last.x+last.w,last.y)});
      add(q('.ai-caret'),caret);
    }
    pulseOpacity(q('.ai-thinking'),5100,5300,5830,6030);
    if(!reduced)all('.ai-thinking i').forEach((dot,i)=>add(dot,[{at:0,transform:'translateY(0)'},{at:5210+i*110,transform:'translateY(0)',easing:SOFT},{at:5430+i*110,transform:'translateY(-4px)',easing:SOFT},{at:5650+i*110,transform:'translateY(0)'},{at:TOTAL,transform:'translateY(0)'}]));
    pulseOpacity(q('.ai-response'),5830,6100,10650,11150);
    all('.ai-word').forEach((node,i)=>{const at=5870+i*61;add(node,[{at:0,opacity:0},{at,opacity:0,easing:EASE},{at:at+120,opacity:1},{at:10650,opacity:1},{at:11150,opacity:0},{at:TOTAL,opacity:0}]);});
    if(reduced){pulseOpacity(q('.ai-confirm-card'),7500,8200,10550,11050);}
    else{visible(q('.ai-confirm-card'),7500,8200,10550,11050,14);press(q('.ai-send'),4020);press(confirm,10300);press(good,14300);}
    if(reduced){
      ['.purpose-pill','.preference-pill'].forEach((selector,i)=>add(q(selector),[
        {at:0,opacity:0,transform:xform(0,recognizedY)},{at:7150+i*120,opacity:0,transform:xform(0,recognizedY)},
        {at:7750+i*120,opacity:1,transform:xform(0,recognizedY)},{at:10600,opacity:1,transform:xform(0,recognizedY)},
        {at:11000,opacity:0,transform:xform(0,recognizedY)},{at:11001,opacity:0,transform:xform(0,0)},
        {at:11700,opacity:1,transform:xform(0,0)},{at:22300,opacity:1,transform:xform(0,0)},
        {at:22950,opacity:0,transform:xform(0,0)},{at:TOTAL,opacity:0,transform:xform(0,0)}
      ]));
    }else{
    ['.purpose-pill','.preference-pill'].forEach((selector,i)=>{
      add(q(selector),[{at:0,opacity:0,transform:xform(0,recognizedY,.96)},{at:7150+i*120,opacity:0,transform:xform(0,recognizedY+7,.96),easing:EASE},{at:7750+i*120,opacity:1,transform:xform(0,recognizedY)},{at:11050,opacity:1,transform:xform(0,recognizedY),easing:EASE},{at:11750,opacity:1,transform:xform(0,0)},{at:22300,opacity:1,transform:xform(0,0),easing:SOFT},{at:22950,opacity:0,transform:xform(0,-12,.96)},{at:TOTAL,opacity:0,transform:xform(0,-12,.96)}]);
    });
    }
    if(!reduced){
      all('.credit-scene .opt').forEach((node,i)=>add(node,[{at:0,opacity:0},{at:11550+i*45,opacity:0,easing:EASE},{at:12250+i*45,opacity:1},{at:15600,opacity:1},{at:16300,opacity:0},{at:TOTAL,opacity:0}]));
      all('.cmp-h').forEach((node,i)=>add(node,[{at:0,opacity:0,transform:'translateY(16px)'},{at:15900+i*65,opacity:0,transform:'translateY(16px)',easing:EASE},{at:16700+i*65,opacity:1,transform:'translateY(0)'},{at:22300,opacity:1,transform:'translateY(0)'},{at:22950,opacity:0,transform:'translateY(-8px)'},{at:TOTAL,opacity:0,transform:'translateY(-8px)'}]));
      all('.cbar i,.ctl i,.cstack').forEach((node,i)=>add(node,[{at:0,transform:'scaleX(0)'},{at:16500+i*45,transform:'scaleX(0)',easing:EASE},{at:17700+i*45,transform:'scaleX(1)'},{at:22900,transform:'scaleX(1)'},{at:TOTAL,transform:'scaleX(1)'}]));
      const bestCells=all('.motion-best');
      bestCells.forEach((node,i)=>{
        // Close the highlighted column at its top and bottom cells.
        const edge=i===0?', inset 0 2px 0 #2F6B52':i===bestCells.length-1?', inset 0 -2px 0 #2F6B52':', inset 0 0 0 #2F6B52';
        const on=`inset 2px 0 0 #2F6B52, inset -2px 0 0 #2F6B52${edge}`,off='inset 0 0 0 #2F6B52, inset 0 0 0 #2F6B52, inset 0 0 0 #2F6B52';
        add(node,[{at:0,backgroundColor:'#FFFFFF',boxShadow:off},{at:18750,backgroundColor:'#FFFFFF',boxShadow:off,easing:EASE},{at:19200,backgroundColor:'#EEF8F2',boxShadow:on},{at:TOTAL,backgroundColor:'#EEF8F2',boxShadow:on}]);
      });
      const box=column.querySelector('.box');
      add(box,[{at:0,backgroundColor:'#FFFFFF'},{at:18750,backgroundColor:'#FFFFFF',easing:EASE},{at:19100,backgroundColor:'#1F4D3A'},{at:TOTAL,backgroundColor:'#1F4D3A'}]);
      add(box.querySelector('svg'),[{at:0,opacity:0,transform:'scale(.6)'},{at:18800,opacity:0,transform:'scale(.6)',easing:EASE},{at:19150,opacity:1,transform:'scale(1)'},{at:TOTAL,opacity:1,transform:'scale(1)'}]);
      const targets=[q('.ai-send'),confirm,good,column].map(localRect);
      const points=targets.map((r,i)=>({x:r.x+r.w*(i===3?.8:.65),y:r.y+r.h*.55}));
      const slots=[[3860,4020,4150,4300],[10140,10300,10430,10600],[14140,14300,14430,14600],[18590,18750,18880,19050]];
      const off=xform(stage.clientWidth+32,stage.clientHeight-24),stops=[{at:0,opacity:0,transform:off},{at:1950,opacity:0,transform:off}];
      const ripple=[];
      points.forEach((p,i)=>{
        const [arrive,click,down,up]=slots[i],from=i===0?{x:stage.clientWidth+32,y:stage.clientHeight-24}:{x:p.x+30,y:p.y+44};
        const control={x:(from.x+p.x)/2+18,y:p.y+8};
        if(i>0)stops.push({at:arrive-850,opacity:0,transform:xform(from.x,from.y)});
        for(let j=1;j<=6;j++){const t=j/6,u=1-Math.pow(1-t,3),v=1-u;stops.push({at:arrive-850+850*t,opacity:Math.min(1,t*2),transform:xform(v*v*from.x+2*v*u*control.x+u*u*p.x,v*v*from.y+2*v*u*control.y+u*u*p.y),easing:'linear'});}
        stops.push({at:click,opacity:1,transform:xform(p.x,p.y),easing:SOFT},{at:down,opacity:1,transform:xform(p.x,p.y,.86),easing:EASE},{at:up,opacity:1,transform:xform(p.x,p.y)},{at:up+350,opacity:0,transform:xform(p.x+8,p.y+8)});
        ripple.push({at:click-20,opacity:0,transform:xform(p.x-14,p.y-14,.45)},{at:click+30,opacity:.65,transform:xform(p.x-14,p.y-14,.6),easing:EASE},{at:click+440,opacity:0,transform:xform(p.x-14,p.y-14,1.8)});
      });
      stops.push({at:22900,opacity:0,transform:off},{at:TOTAL,opacity:0,transform:off});add(q('.motion-cursor'),stops);
      add(q('.motion-tap'),[{at:0,opacity:0,transform:'scale(0)'},...ripple,{at:TOTAL,opacity:0,transform:'scale(0)'}]);
    }
    const aiY=mobile?124:110;
    add(q('.motion-avatar'),reduced?[{at:0,opacity:0},{at:TOTAL,opacity:0}]:[
      {at:0,transform:xform(0,0),opacity:1},{at:4900,transform:xform(0,0),opacity:1,easing:EASE},{at:5600,transform:`translateY(${aiY}px) rotate(-3deg)`,opacity:1,easing:EASE},{at:6000,transform:xform(0,aiY),opacity:1},{at:10650,transform:xform(0,aiY),opacity:1,easing:SOFT},{at:11100,transform:xform(0,aiY),opacity:0},{at:11450,transform:xform(0,62),opacity:0,easing:EASE},{at:12000,transform:xform(0,62),opacity:1},{at:15500,transform:xform(0,62),opacity:1,easing:EASE},{at:16300,transform:xform(0,44),opacity:0},{at:23150,transform:xform(0,18),opacity:0,easing:EASE},{at:23850,transform:xform(0,0),opacity:1},{at:TOTAL,transform:xform(0,0),opacity:1}]);
    const reviewAt=new URLSearchParams(location.search).get('at');origin=document.timeline.currentTime+40;
    animations.forEach(a=>{if(reviewAt!==null&&Number.isFinite(+reviewAt)){a.pause();a.currentTime=Math.max(0,Math.min(TOTAL-1,+reviewAt));}else a.startTime=origin;});
    stage.classList.add('ready');
    function tick(){
      const elapsed=reviewAt===null?Math.max(0,animations[0]?.currentTime??0):Math.max(0,+reviewAt),t=elapsed%TOTAL;
      const phase=t<5200||t>=22900?0:t<11300?1:t<16100?2:3;
      root.dataset.walkthroughStep=String(phase);root.dataset.walkthroughCycle=String(Math.floor(elapsed/TOTAL)+1);root.dataset.motionTime=String(Math.round(t));
      if(phase!==lastPhase){const starts=[22900,5200,11300,16100],durations=[6300,6100,4800,6800],phaseElapsed=phase===0?(t+1100)%TOTAL:t-starts[phase];parent.postMessage({type:'credybara-walkthrough-step',step:phase,duration:durations[phase],elapsed:phaseElapsed},location.origin);lastPhase=phase;}
      if(reviewAt===null&&!offscreen)monitor=requestAnimationFrame(tick);
    }
    resume=()=>{cancelAnimationFrame(monitor);tick();};
    lastPhase=-1;tick();
    if(offscreen)animations.forEach(a=>a.pause());
  }
  build();
  let resizeTimer,lastWidth=stage.clientWidth,lastHeight=stage.clientHeight;
  new ResizeObserver(()=>{if(stage.clientWidth===lastWidth&&stage.clientHeight===lastHeight)return;lastWidth=stage.clientWidth;lastHeight=stage.clientHeight;clearTimeout(resizeTimer);resizeTimer=setTimeout(build,150);}).observe(stage);
  quiet.addEventListener('change',build);
  // The home page reports when the preview leaves the viewport; nothing runs while it is out of sight.
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='credybara-walkthrough-visibility')return;
    if(new URLSearchParams(location.search).has('at'))return;
    offscreen=!event.data.visible;
    if(offscreen){cancelAnimationFrame(monitor);animations.forEach(a=>a.pause());}
    else{animations.forEach(a=>a.play());resume();}
  });
})().catch(error=>{document.body.dataset.motionError=String(error.message);console.error('AI conversation motion setup failed.',error);});
