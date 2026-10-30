(() => {
  const frame = document.getElementById('walkthroughFrame');
  const progress = [...document.querySelectorAll('[data-scene-step]')];
  let previewVisible = true;
  const captions = ['Describe it in your own words', 'Bara picks up the details', 'Confirm only what’s needed', 'Compare your options'];
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
    const {type, step, duration, elapsed} = event.data || {};
    if (type !== 'credybara-walkthrough-step' || !Number.isInteger(step) || step < 0 || step > 3) return;
    if (!previewVisible) frame.contentWindow.postMessage({type:'credybara-walkthrough-visibility', visible:false}, location.origin);
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
  const preview = document.getElementById('processPreview');
  const progressBar = preview.querySelector('.walkthrough-progress');
  // Pause the film and its progress bar while the preview is off screen.
  new IntersectionObserver(([entry]) => {
    previewVisible = entry.isIntersecting;
    progressBar.classList.toggle('paused', !entry.isIntersecting);
    frame.contentWindow?.postMessage({type:'credybara-walkthrough-visibility', visible:entry.isIntersecting}, location.origin);
  }).observe(preview);
  document.getElementById('watchProcess').addEventListener('click', () => {
    document.getElementById('processPreview').scrollIntoView({
      behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'center'
    });
  });
})();
