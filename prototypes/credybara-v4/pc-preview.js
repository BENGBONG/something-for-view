(() => {
  const WIDTH = 1600, HEIGHT = 1000;
  const stage = document.querySelector('.desktop-stage');
  const frame = document.getElementById('desktopApp');
  const base = new URL('./', location.href);
  const appBase = new URL('app/', base);
  const pages = new Set(['index.html','flow.html','lender.html','motion-review.html','walkthrough.html']);
  const entry = pages.has(frame.dataset.page) ? frame.dataset.page : 'index.html';
  function fit(){
    const gap = innerWidth <= 600 ? 12 : 24;
    const scale = Math.max(.05, Math.min(1,(innerWidth-gap)/WIDTH,(innerHeight-gap)/HEIGHT));
    stage.style.setProperty('--preview-scale',String(scale));
    stage.style.setProperty('--preview-width',WIDTH*scale+'px');
    stage.style.setProperty('--preview-height',HEIGHT*scale+'px');
  }
  function appURL(page){
    const url = new URL(page,appBase);
    url.search = location.search; url.hash = location.hash;
    return url;
  }
  function syncRoute(){
    try {
      const inner = new URL(frame.contentWindow.location.href);
      if (inner.origin !== location.origin || !inner.pathname.startsWith(appBase.pathname)) return;
      const file = inner.pathname.slice(appBase.pathname.length) || 'index.html';
      if (!pages.has(file)) return;
      const outer = new URL(file === 'index.html' ? './' : file,base);
      outer.search = inner.search; outer.hash = inner.hash;
      if (outer.href !== location.href) history.replaceState({page:file},'',outer);
      document.title = frame.contentDocument.title || 'Credybara · PC preview';
      stage.dataset.page = file;
    } catch { /* External destinations keep their own navigation. */ }
  }
  frame.addEventListener('load',()=>{
    syncRoute();
    try {
      frame.contentWindow.addEventListener('hashchange',syncRoute);
      frame.contentWindow.addEventListener('popstate',syncRoute);
    } catch {}
  });
  window.addEventListener('resize',fit,{passive:true});
  window.addEventListener('popstate',()=>{
    const file = location.pathname.slice(base.pathname.length) || 'index.html';
    if (!pages.has(file)) return;
    const target = appURL(file);
    try { if (frame.contentWindow.location.href !== target.href) frame.contentWindow.location.replace(target.href); } catch {}
  });
  fit();
  frame.src = appURL(entry).href;
})();
