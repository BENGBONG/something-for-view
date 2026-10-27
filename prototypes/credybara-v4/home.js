(() => {
  const frame = document.getElementById('walkthroughFrame');
  const progress = [...document.querySelectorAll('[data-scene-step]')];
  const names = ['Tell Bara', 'AI understands', 'One quick question', 'Your options'];
  const captions = ['Describe it in your own words', 'Bara picks up the details', 'Confirm only what’s needed', 'Compare your options'];
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
    const {type, step, duration, elapsed} = event.data || {};
    if (type !== 'credybara-walkthrough-step' || !Number.isInteger(step) || step < 0 || step > 3) return;
    document.getElementById('walkthroughStep').textContent = names[step];
    document.getElementById('sceneCount').textContent = `0${step + 1} / 04`;
    document.getElementById('sceneCaption').textContent = captions[step];
    progress.forEach((segment, index) => {
      segment.classList.toggle('complete', index < step);
      segment.classList.remove('active');
      if (index === step) {
        segment.style.setProperty('--step-duration', `${Math.max(1000, Math.min(15000, duration || 4000))}ms`);
        segment.style.animationDelay = `${-Math.max(0,Math.min(duration || 4000,elapsed || 0))}ms`;
        segment.querySelector('i').style.animationDelay = segment.style.animationDelay;
        // A fresh progress fill marks each turn of the continuous loop.
        void segment.offsetWidth;
        segment.classList.add('active');
      }
    });
  });
  document.getElementById('watchProcess').addEventListener('click', () => {
    document.getElementById('processPreview').scrollIntoView({
      behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'center'
    });
  });
})();
