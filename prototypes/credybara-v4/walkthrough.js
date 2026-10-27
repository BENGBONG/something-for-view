/* AI conversation storyboard. Recognition is a fixed prototype fixture, not a live model call.
   Actual V4 amount, credit and comparison components; one continuous 24-second clock. */
(async () => {
  const TOTAL=24000, EASE='cubic-bezier(.22,1,.36,1)', SOFT='cubic-bezier(.65,0,.35,1)';
  const root=document.body, quiet=matchMedia('(prefers-reduced-motion: reduce)'), animations=[];
  let origin=0,monitor,lastPhase=-1,geometry=null;
  track=()=>{};typing=async()=>{};scrollToEl=()=>{};
  const requestText="My car needs a repair, about $2,000. I'd like to keep my monthly payment low.";
  // The film has a known input and a reviewed interpretation. No production AI claim is made here.
  const understood={purpose:'Car repair',purposeKey:'other',amount:2000,pref:'monthly'};
  const clone=node=>node.cloneNode(true);
  const greeting=clone(document.getElementById('hello'));
  greeting.innerHTML="Hi, I'm Bara. <b>Tell me what you need, in your own words.</b> I'll help you work out the next step.";
  await startPlan(understood.purpose,understood.purposeKey,understood.amount,understood.purpose);
  await choosePref(understood.pref,document.querySelector('.plan:not(.credit-q)').closest('.block'));
  const credit=clone(document.querySelector('.credit-q'));
  const creditQuestion=document.createElement('div');creditQuestion.className='bubble';
  creditQuestion.innerHTML="One detail I couldn't get from your message: <b>how would you describe your credit?</b> A rough idea is enough — this doesn't check your credit.";
  const products=rank(understood.pref,understood.amount,'',2).top;
  const best=products.reduce((a,b)=>a.monthly<b.monthly?a:b);
  const shell=document.createElement('div');shell.innerHTML=compareHTML(products,'examples',new Set([best.id]));
  const comparison=shell.firstElementChild;comparison.classList.add('go');comparison.dataset.w='1';
  const creditRow=comparison.querySelector('.ri-minCredit').closest('.cmp-l');
  let next=creditRow.nextElementSibling;
  while(next&&next.classList.contains('cmp-c')){const current=next;next=next.nextElementSibling;current.remove();}
  creditRow.remove();comparison.querySelectorAll('.cmp-f').forEach(n=>n.remove());
  comparison.querySelectorAll('.sel').forEach(n=>n.classList.remove('sel'));
  comparison.querySelectorAll(`[data-col="${best.id}"]`).forEach(n=>n.classList.add('motion-best'));

  const stage=document.createElement('div');stage.className='motion-stage ai-story';stage.inert=true;
  stage.innerHTML=`<div class="motion-context"><div class="context-pill purpose-pill">${ICON.other}<span>Car repair <b>$2,000</b></span></div><div class="context-pill preference-pill">${ICON.monthly}<span>Lower monthly payments</span></div></div>
  <svg class="motion-avatar" aria-hidden="true"><use href="#bara"/></svg>
  <section class="motion-scene conversation-scene"><div class="motion-question"></div><div class="ai-composer form"><div class="ai-composer-label"><span>Your message</span><span class="ai-writing">Typing…</span></div><div class="ai-input"></div><div class="ai-composer-footer"><span>In your own words.</span><button class="btn primary ai-send" type="button">Send ${ICON.arrow}</button></div></div><p class="ai-input-note">Please leave out your SSN and bank details.</p></section>
  <div class="ai-user-message msg user"><div class="bubble"></div></div>
  <section class="motion-scene understanding-scene"><div class="ai-thinking"><span>Bara is reading your message</span><i></i><i></i><i></i></div><div class="motion-question"><div class="bubble ai-response"></div></div><section class="form ai-confirm-card"><h3>Confirm the amount</h3><div class="ai-amount-row"><span>Start with</span>${stepperHTML()}</div><p>You said “about $2,000”. Adjust it if you need to.</p><div class="ai-confirm-actions"><button class="btn primary ai-confirm" type="button">Use $2,000</button><button class="edit" type="button">Edit details</button></div></section></section>
  <section class="motion-scene credit-scene"><div class="motion-question"></div><div class="motion-content"></div></section>
  <section class="motion-scene comparison-scene"><div class="motion-content"></div><p class="motion-note">Estimated terms. Not an approval or a guarantee.</p></section>
  <div class="motion-bridge send-bridge"></div><div class="motion-bridge amount-bridge"></div><div class="ai-caret"></div>
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
  function bridge(node, source, target, start, land) {
    const a = localRect(source), b = localRect(target);
    const transform = r => `translate3d(${r.x}px,${r.y}px,0) scale(${r.w/a.w},${r.h/a.h})`;
    node.style.width = `${a.w}px`; node.style.height = `${a.h}px`;
    add(node,[
      {at:0,opacity:0,transform:transform(a),borderRadius:'16px'},
      {at:start,opacity:0,transform:transform(a),borderRadius:'16px'},
      {at:start+40,opacity:1,transform:transform(a),borderRadius:'16px',easing:EASE},
      {at:land-100,opacity:1,transform:transform(b),borderRadius:'28px'},
      {at:land,opacity:0,transform:transform(b),borderRadius:'28px'},
      {at:TOTAL,opacity:0,transform:transform(b),borderRadius:'28px'}
    ]);
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
    add(intro,[{at:0,opacity:1,transform:xform(0,0)},{at:3450,opacity:1,transform:xform(0,0),easing:SOFT},{at:4250,opacity:0,transform:reduced?xform(0,0):xform(-18,-14,.975)},{at:22700,opacity:0,transform:reduced?xform(0,0):xform(20,24,.98),easing:EASE},{at:23800,opacity:1,transform:xform(0,0)},{at:TOTAL,opacity:1,transform:xform(0,0)}]);
    if(reduced){
      pulseOpacity(q('.understanding-scene'),4000,4550,10000,10700);
      pulseOpacity(q('.credit-scene'),10000,10800,14500,15300);
      pulseOpacity(q('.comparison-scene'),14700,15600,22600,23700);
    }else{
      visible(q('.understanding-scene'),4000,4550,10000,10700,20);
      visible(q('.credit-scene'),10000,10800,14500,15300,28);
      visible(q('.comparison-scene'),14700,15600,22600,23700,24);
    }
    add(q('.ai-composer'),[{at:0,opacity:1,transform:xform(0,0)},{at:3030,opacity:1,transform:xform(0,0),easing:EASE},{at:3320,opacity:0,transform:reduced?xform(0,0):xform(0,-8,.99)},{at:22700,opacity:0,transform:xform(0,0)},{at:23500,opacity:1,transform:xform(0,0)},{at:TOTAL,opacity:1,transform:xform(0,0)}]);
    add(q('.ai-user-message'),[{at:0,opacity:0,transform:reduced?xform(0,-94):xform(0,0)},{at:3550,opacity:0,transform:reduced?xform(0,-94):xform(0,0),easing:EASE},{at:3930,opacity:1,transform:reduced?xform(0,-94):xform(0,0)},{at:3980,opacity:1,transform:reduced?xform(0,-94):xform(0,0),easing:EASE},{at:4550,opacity:1,transform:xform(0,-94)},{at:9950,opacity:1,transform:xform(0,-94),easing:SOFT},{at:10650,opacity:0,transform:reduced?xform(0,-94):xform(-12,-112)},{at:TOTAL,opacity:0,transform:reduced?xform(0,-94):xform(-12,-112)}]);
    pulseOpacity(q('.ai-writing'),350,600,2650,2950);
    const chars=all('.typed-char');
    chars.forEach((node,i)=>{const at=550+i*25;add(node,[{at:0,opacity:0},{at,opacity:0},{at:at+1,opacity:1},{at:22760,opacity:1},{at:22800,opacity:0},{at:TOTAL,opacity:0}]);});
    if(!reduced){
      const charRects=chars.map(localRect),first=charRects[0];
      const caret=[{at:0,opacity:0,transform:xform(first.x,first.y)},{at:540,opacity:1,transform:xform(first.x,first.y)}];
      charRects.forEach((r,i)=>caret.push({at:550+i*25,opacity:1,transform:xform(r.x+r.w,r.y),easing:'steps(1,end)'}));
      const last=charRects.at(-1);caret.push({at:2730,opacity:1,transform:xform(last.x+last.w,last.y)},{at:2850,opacity:0,transform:xform(last.x+last.w,last.y)},{at:TOTAL,opacity:0,transform:xform(last.x+last.w,last.y)});
      add(q('.ai-caret'),caret);
      bridge(q('.send-bridge'),q('.ai-composer'),q('.ai-user-message'),3050,3950);
      bridge(q('.amount-bridge'),q('.ai-confirm-card'),q('.purpose-pill'),9600,10700);
    }
    pulseOpacity(q('.ai-thinking'),4100,4300,4830,5030);
    if(!reduced)all('.ai-thinking i').forEach((dot,i)=>add(dot,[{at:0,transform:'translateY(0)'},{at:4210+i*110,transform:'translateY(0)',easing:SOFT},{at:4430+i*110,transform:'translateY(-4px)',easing:SOFT},{at:4650+i*110,transform:'translateY(0)'},{at:TOTAL,transform:'translateY(0)'}]));
    pulseOpacity(q('.ai-response'),4830,5100,10000,10600);
    all('.ai-word').forEach((node,i)=>{const at=4870+i*61;add(node,[{at:0,opacity:0},{at,opacity:0,easing:EASE},{at:at+120,opacity:1},{at:10100,opacity:1},{at:10600,opacity:0},{at:TOTAL,opacity:0}]);});
    if(reduced){pulseOpacity(q('.ai-confirm-card'),6500,7200,9600,10400);}
    else{visible(q('.ai-confirm-card'),6500,7200,9600,10400,14);press(q('.ai-send'),3020);press(confirm,9300);press(good,13300);}
    if(reduced){
      ['.purpose-pill','.preference-pill'].forEach((selector,i)=>add(q(selector),[
        {at:0,opacity:0,transform:xform(0,recognizedY)},{at:6150+i*120,opacity:0,transform:xform(0,recognizedY)},
        {at:6750+i*120,opacity:1,transform:xform(0,recognizedY)},{at:9600,opacity:1,transform:xform(0,recognizedY)},
        {at:10000,opacity:0,transform:xform(0,recognizedY)},{at:10001,opacity:0,transform:xform(0,0)},
        {at:10700,opacity:1,transform:xform(0,0)},{at:22600,opacity:1,transform:xform(0,0)},
        {at:23600,opacity:0,transform:xform(0,0)},{at:TOTAL,opacity:0,transform:xform(0,0)}
      ]));
    }else{
    ['.purpose-pill','.preference-pill'].forEach((selector,i)=>{
      add(q(selector),[{at:0,opacity:0,transform:xform(0,recognizedY,.96)},{at:6150+i*120,opacity:0,transform:xform(0,recognizedY+7,.96),easing:EASE},{at:6750+i*120,opacity:1,transform:xform(0,recognizedY)},{at:9700,opacity:1,transform:xform(0,recognizedY),easing:EASE},{at:10700,opacity:1,transform:xform(0,0)},{at:22600,opacity:1,transform:xform(0,0),easing:SOFT},{at:23600,opacity:0,transform:xform(0,-12,.96)},{at:TOTAL,opacity:0,transform:xform(0,-12,.96)}]);
    });
    }
    if(!reduced){
      all('.credit-scene .opt').forEach((node,i)=>add(node,[{at:0,opacity:0},{at:10100+i*45,opacity:0,easing:EASE},{at:10800+i*45,opacity:1},{at:14600,opacity:1},{at:15300,opacity:0},{at:TOTAL,opacity:0}]));
      all('.cmp-h').forEach((node,i)=>add(node,[{at:0,opacity:0,transform:'translateY(16px)'},{at:14900+i*65,opacity:0,transform:'translateY(16px)',easing:EASE},{at:15700+i*65,opacity:1,transform:'translateY(0)'},{at:22900,opacity:1,transform:'translateY(0)'},{at:23700,opacity:0,transform:'translateY(-8px)'},{at:TOTAL,opacity:0,transform:'translateY(-8px)'}]));
      all('.cbar i,.ctl i,.cstack').forEach((node,i)=>add(node,[{at:0,transform:'scaleX(0)'},{at:15500+i*45,transform:'scaleX(0)',easing:EASE},{at:16700+i*45,transform:'scaleX(1)'},{at:22900,transform:'scaleX(1)'},{at:TOTAL,transform:'scaleX(1)'}]));
      all('.motion-best').forEach(node=>add(node,[{at:0,backgroundColor:'#FFFFFF',boxShadow:'inset 0 0 0 #2F6B52'},{at:17750,backgroundColor:'#FFFFFF',boxShadow:'inset 0 0 0 #2F6B52',easing:EASE},{at:18200,backgroundColor:'#EEF8F2',boxShadow:'inset 2px 0 0 #2F6B52, inset -2px 0 0 #2F6B52'},{at:TOTAL,backgroundColor:'#EEF8F2',boxShadow:'inset 2px 0 0 #2F6B52, inset -2px 0 0 #2F6B52'}]));
      const box=column.querySelector('.box');
      add(box,[{at:0,backgroundColor:'#FFFFFF'},{at:17750,backgroundColor:'#FFFFFF',easing:EASE},{at:18100,backgroundColor:'#1F4D3A'},{at:TOTAL,backgroundColor:'#1F4D3A'}]);
      add(box.querySelector('svg'),[{at:0,opacity:0,transform:'scale(.6)'},{at:17800,opacity:0,transform:'scale(.6)',easing:EASE},{at:18150,opacity:1,transform:'scale(1)'},{at:TOTAL,opacity:1,transform:'scale(1)'}]);
      const targets=[q('.ai-send'),confirm,good,column].map(localRect);
      const points=targets.map((r,i)=>({x:r.x+r.w*(i===3?.8:.65),y:r.y+r.h*.55}));
      const slots=[[2860,3020,3150,3300],[9140,9300,9430,9600],[13140,13300,13430,13600],[17590,17750,17880,18050]];
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
      {at:0,transform:xform(0,0),opacity:1},{at:3900,transform:xform(0,0),opacity:1,easing:EASE},{at:4600,transform:`translateY(${aiY}px) rotate(-3deg)`,opacity:1,easing:EASE},{at:5000,transform:xform(0,aiY),opacity:1},{at:9950,transform:xform(0,aiY),opacity:1,easing:EASE},{at:10750,transform:'translateY(62px) rotate(3deg)',opacity:1,easing:EASE},{at:11100,transform:xform(0,62),opacity:1},{at:14500,transform:xform(0,62),opacity:1,easing:EASE},{at:15300,transform:xform(0,44),opacity:0},{at:22600,transform:xform(0,18),opacity:0,easing:EASE},{at:23800,transform:xform(0,0),opacity:1},{at:TOTAL,transform:xform(0,0),opacity:1}]);
    const reviewAt=new URLSearchParams(location.search).get('at');origin=document.timeline.currentTime+40;
    animations.forEach(a=>{if(reviewAt!==null&&Number.isFinite(+reviewAt)){a.pause();a.currentTime=Math.max(0,Math.min(TOTAL-1,+reviewAt));}else a.startTime=origin;});
    stage.classList.add('ready');
    function tick(){
      const elapsed=reviewAt===null?Math.max(0,document.timeline.currentTime-origin):Math.max(0,+reviewAt),t=elapsed%TOTAL;
      const phase=t<4200||t>=22900?0:t<10300?1:t<15100?2:3;
      root.dataset.walkthroughStep=String(phase);root.dataset.walkthroughCycle=String(Math.floor(elapsed/TOTAL)+1);root.dataset.motionTime=String(Math.round(t));
      if(phase!==lastPhase){const starts=[22900,4200,10300,15100],durations=[5300,6100,4800,7800],phaseElapsed=phase===0?(t+1100)%TOTAL:t-starts[phase];parent.postMessage({type:'credybara-walkthrough-step',step:phase,duration:durations[phase],elapsed:phaseElapsed},location.origin);lastPhase=phase;}
      if(reviewAt===null)monitor=requestAnimationFrame(tick);
    }
    lastPhase=-1;tick();
  }
  build();
  let resizeTimer,lastWidth=stage.clientWidth,lastHeight=stage.clientHeight;
  new ResizeObserver(()=>{if(stage.clientWidth===lastWidth&&stage.clientHeight===lastHeight)return;lastWidth=stage.clientWidth;lastHeight=stage.clientHeight;clearTimeout(resizeTimer);resizeTimer=setTimeout(build,150);}).observe(stage);
  quiet.addEventListener('change',build);
})().catch(error=>{document.body.dataset.motionError=String(error.message);console.error('AI conversation motion setup failed.',error);});
