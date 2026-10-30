(() => {
  const SESSION = 'credy_v4_account', DRAFT = 'credy_v4_loan_preferences';
  const products = window.CredybaraSavedProducts;
  const encode = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function read(key) { try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch { return null; } }
  function write(key, value) { try { sessionStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
  let account = read(SESSION), returnFocus, pendingSave = false, toastTimer;
  let registration = null, accountMode = null, resendAt = 0, verificationTimer;
  let pendingResults = false, draftTimer;
  if (!account || typeof account.username !== 'string') account = null;
  const dialog = document.createElement('dialog');
  dialog.className = 'account-dialog'; dialog.setAttribute('aria-labelledby','accountTitle');
  document.body.append(dialog);
  const notification = document.createElement('div'); notification.className = 'toast'; notification.role = 'status'; notification.hidden = true; document.body.append(notification);
  function toast(text) { notification.textContent = text; notification.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { notification.hidden = true; }, 4500); }
  const resultDate = value => new Date(value).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  function savedProducts(){ return account ? products?.read(account.username) : null; }
  function renderResultGuidance(){
    const result = window.CredybaraResults?.read(); if (!result) return;
    const expired = result.expiresAt <= Date.now(), saved = savedProducts();
    document.querySelectorAll('[data-retain-results]').forEach(el=>{
      if (expired){
        el.className = 'retain-results expired';
        el.innerHTML = '<div><b>These products have expired</b><p>Check again to find the products currently available to you.</p></div><button class="btn primary" type="button" data-new-search>Find new options</button>';
      } else if (!account){
        el.className = 'retain-results';
        el.innerHTML = `<div><b>Keep these results</b><p>Create an account or log in to save these ${result.products.length} products automatically. Return anytime before <b>${resultDate(result.expiresAt)}</b>.</p></div><div class="retain-actions"><button class="btn primary" type="button" data-keep-results="register">Create account &amp; keep results</button><button class="btn ghost" type="button" data-keep-results="login">Log in</button></div>`;
      } else {
        const stored = saved && saved.id === result.id && !saved.expired;
        el.className = 'retain-results '+(stored?'saved':'save-failed');
        el.innerHTML = stored
          ? `<div><b>✓ Automatically saved to your account</b><p>Available until <b>${resultDate(result.expiresAt)}</b>. Log in as <b>${encode(account.username)}</b> to pick up these products next time.</p></div><span class="retained-badge">${result.products.length} products saved</span>`
          : '<div><b>Your results are ready, but could not be saved</b><p>Keep this page open and try saving again.</p></div><button class="btn secondary" type="button" data-retry-results>Try again</button>';
      }
    });
    window.CredybaraResults?.refreshDock?.();
  }
  function keepResults(){
    const result = window.CredybaraResults?.read();
    if (!account || !result) return false;
    const owner = window.CredybaraResults.owner();
    if (owner && owner !== products?.owner(account.username)) return false;
    const saved = products?.save(account.username,result) || false;
    if (saved) window.CredybaraResults.markOwner(products.owner(account.username));
    renderResultGuidance(); return saved;
  }
  function restoreResults(force = false){
    const saved = savedProducts();
    if (!saved || !window.CredybaraResults || (!force && !window.CredybaraResults.canRestore())) return false;
    const restored = window.CredybaraResults.restore(saved,products.owner(account.username));
    renderResultGuidance(); return restored;
  }
  function nav() {
    document.querySelectorAll('[data-account-nav]').forEach(el => {
      el.innerHTML = account
        ? `<button class="site-text-btn account-name" type="button" data-account="profile">Hi, ${encode(account.username)}</button><button class="site-text-btn" type="button" data-signout>Log out</button>`
        : '<button class="site-text-btn" type="button" data-account="login">Log in</button><button class="site-btn primary compact" type="button" data-account="register">Create account</button>';
    });
    const draft = read(DRAFT);
    document.querySelectorAll('[data-saved-home]').forEach(el => el.remove());
    const result = savedProducts();
    if (account && result && document.querySelector('.home-hero')){
      const strip = document.createElement('div'); strip.className = 'saved-strip'; strip.dataset.savedHome = '';
      strip.innerHTML = result.expired ? `<p><b>Welcome back, ${encode(account.username)}.</b> Your previous products have expired.</p><a href="flow.html?fresh=1">Find new options</a>` : `<p><b>Welcome back, ${encode(account.username)}.</b> ${result.products.length} saved products are available until ${resultDate(result.expiresAt)}.</p><a href="flow.html?results=1">View my products</a>`;
      document.querySelector('main').prepend(strip);
    } else if (account && draft && draft.owner === account.username && document.querySelector('.home-hero')) {
      const strip = document.createElement('div'); strip.className = 'saved-strip'; strip.dataset.savedHome = '';
      strip.innerHTML = `<p><b>Welcome back, ${encode(account.username)}.</b> Your loan preferences are saved for this visit.</p><a href="flow.html?restore=1">Continue exploring</a>`;
      document.querySelector('main').prepend(strip);
    }
    renderResultGuidance();
  }
  function close() {
    clearInterval(verificationTimer);
    registration = null; resendAt = 0; accountMode = null;
    dialog.querySelectorAll('form').forEach(form => form.reset());
    dialog.close(); pendingSave = false; pendingResults = false; returnFocus?.focus({preventScroll:true});
  }
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  function field(name, label, type = 'text', help = '', options = '') {
    const password = type === 'password';
    return `<div class="field"><label for="auth-${name}">${label}</label><div${password ? ' class="password-wrap"' : ''}><input id="auth-${name}" name="${name}" type="${type}" ${options} ${help ? `aria-describedby="hint-${name} error-${name}"` : `aria-describedby="error-${name}"`} required>${password ? `<button type="button" data-show="auth-${name}" aria-label="Show ${label.toLowerCase()}">Show</button>` : ''}</div>${help ? `<div class="hint" id="hint-${name}">${help}</div>` : ''}<span class="error" id="error-${name}" hidden></span></div>`;
  }
  function render(mode) {
    clearInterval(verificationTimer);
    if (mode === 'verify' && !registration) mode = 'register';
    if (!['register','verify'].includes(mode)) { registration = null; resendAt = 0; }
    accountMode = mode;
    const isRegister = mode === 'register', isLogin = mode === 'login';
    const title = ({login:'Welcome back',register:'Create an account',verify:'Verify your email',forgot:'Forgot your password?',sent:'Check your inbox',profile:'Your account'})[mode] || 'Welcome back';
    const headline = (isRegister || mode === 'verify') ? 'Save your results<br>and <span>come back later.</span>' : 'Welcome back.<br>Your results <span>are here.</span>';
    let content = '';
    if (isLogin || isRegister) {
      const rules = '<ul class="password-rules"><li>Use at least 12 characters.</li><li>Avoid your username or email and commonly used passwords.</li><li>Don\'t use only numbers.</li></ul>';
      content = `${isRegister ? registrationSteps(1) : ''}<form id="accountForm" novalidate>
      ${field('username','Username','text', isRegister ? '150 characters or fewer. Letters, digits and @ . + - _ only.' : '', 'autocomplete="username" maxlength="150"')}
      ${isRegister ? field('email','Email','email','','autocomplete="email" maxlength="254"') : ''}
      ${field('password','Password','password', isRegister ? rules : '', `autocomplete="${isRegister ? 'new-password' : 'current-password'}"`)}
      ${isRegister ? field('confirm','Confirm password','password','Enter the same password again.','autocomplete="new-password"') : ''}
      ${isRegister ? '<label class="terms-check"><input name="terms" type="checkbox" aria-describedby="error-terms"><span>I agree to the <button type="button" data-policy="terms">Terms of Use</button> and acknowledge the <button type="button" data-policy="privacy">Privacy Notice</button>.</span></label><span id="error-terms" class="error" hidden></span>' : ''}
      <button type="submit" class="site-btn primary">${isRegister ? 'Send verification code' : 'Log in'}</button>
      <div class="auth-links">${isRegister ? '<span>Already have an account? <button type="button" data-switch="login">Log in</button></span>' : '<button type="button" data-switch="forgot">Forgot your password?</button><span>New here? <button type="button" data-switch="register">Create an account</button></span>'}</div>
      </form>`;
    } else if (mode === 'verify') {
      content = `${registrationSteps(2)}
      <p class="verification-intro">We sent a 6-digit code to <b>${encode(registration.email)}</b></p>
      <button class="verification-change" type="button" data-change-email>Change email address</button>
      <form id="verificationForm" novalidate>
        ${field('code','Verification code','text','Enter the code from your email.','class="verification-code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" minlength="6" pattern="[0-9]{6}" spellcheck="false"')}
        <button class="site-btn primary verification-submit" type="submit" disabled>Verify &amp; create account</button>
      </form>
      <div class="verification-delivery"><span>Didn't get the email?</span><button type="button" data-resend-code disabled>Resend code</button></div>
      <p class="hint verification-help">Check your spam folder or make sure your email address is correct.</p>
      <p class="verification-status" role="status" aria-live="polite"></p>`;
    } else if (mode === 'forgot') {
      content = `<p class="policy-copy">Enter the email address associated with your account. We'll send you a link to reset your password.</p><form id="forgotForm" novalidate>${field('email','Email','email','','autocomplete="email" maxlength="254"')}<button class="site-btn primary" type="submit">Send reset link</button></form><div class="auth-links"><button type="button" data-switch="login">Back to log in</button></div>`;
    } else if (mode === 'sent') {
      content = '<div class="account-status">If an account uses this email address, you\'ll receive a password reset link.</div><p class="policy-copy">Check your spam folder too. For your privacy, we don\'t confirm whether an email address has an account.</p><button type="button" class="site-btn secondary" data-switch="login">Back to log in</button><div class="auth-links"><button type="button" data-switch="forgot">Try another email</button></div>';
    } else if (mode === 'profile') {
      const draft = read(DRAFT), hasDraft = draft && draft.owner === account?.username;
      const result = savedProducts();
      const resultContent = result ? result.expired
        ? '<div class="account-status">Your saved products have expired. Start a new search to see what is available now.</div><a class="site-btn primary" href="flow.html?fresh=1">Find new options</a>'
        : `<div class="account-status"><b>${result.products.length} products automatically saved</b><br>Available until ${resultDate(result.expiresAt)}. Your results will be here when you return.</div><a class="site-btn primary" href="flow.html?results=1">View my products</a>` : '';
      content = `<p class="policy-copy">Hi, <b>${encode(account?.username)}</b>. Here’s what you’ve saved.</p>${account?.emailVerified ? '<span class="verified-badge">✓ Email verified</span>' : ''}${resultContent || (hasDraft ? '<div class="account-status">Your loan preferences are saved for this visit.</div><a class="site-btn primary" href="flow.html?restore=1">Continue exploring</a>' : '<p class="policy-copy">Your saved products will appear here when they are ready.</p><a class="site-btn primary" href="flow.html">Find my options</a>')}<div class="auth-links"><button type="button" data-signout>Log out</button></div>`;
    }
    dialog.innerHTML = `<div class="account-shell"><div class="account-top"><a class="site-brand" href="./"><img src="bara.svg" alt="" width="36" height="36">Credybara</a><button class="account-close" type="button" data-close aria-label="Close account page">×</button></div><div class="account-layout"><section class="account-copy"><p class="eyebrow">Credybara account</p><h1>${headline}</h1><p class="account-lead">An account saves your loan preferences and matched products on this device, so you don’t have to start over.</p><p>You can compare options without one. Creating an account doesn’t apply for a loan or check your credit.</p><button class="account-browse" type="button" data-close>${account ? 'Back to exploring' : 'Keep exploring without an account'}</button></section><section class="account-card"><h2 id="accountTitle">${title}</h2>${pendingSave ? '<p class="account-context">Log in or create an account to save your loan preferences. Your current page will stay right here.</p>' : ''}${content}</section></div><p class="account-disclaimer">Creating an account does not apply for a loan or authorize a credit check.</p></div>`;
    if (pendingResults){
      const context = document.createElement('p'); context.className = 'account-context';
      context.textContent = 'Your products will be saved automatically after you log in or create an account. Your current results will stay right here.';
      dialog.querySelector('#accountTitle').after(context);
    }
    dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', close));
    dialog.querySelectorAll('[data-switch]').forEach(button => button.addEventListener('click', () => render(button.dataset.switch)));
    dialog.querySelectorAll('[data-show]').forEach(button => button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.show), reveal = input.type === 'password';
      input.type = reveal ? 'text' : 'password'; button.textContent = reveal ? 'Hide' : 'Show'; button.setAttribute('aria-label', `${reveal ? 'Hide' : 'Show'} ${input.name === 'confirm' ? 'confirm password' : 'password'}`);
    }));
    dialog.querySelector('#accountForm')?.addEventListener('submit', event => submit(event, isRegister));
    if (isRegister && registration) {
      const form = dialog.querySelector('#accountForm');
      ['username','email','password','confirm'].forEach(name => { form.elements[name].value = registration[name] || ''; });
      form.elements.terms.checked = registration.terms === true;
    }
    if (mode === 'verify') setupVerification();
    dialog.querySelector('#forgotForm')?.addEventListener('submit', event => {
      event.preventDefault(); clearErrors();
      const input = dialog.querySelector('[name=email]');
      if (!input.validity.valid) { error('email','Enter a valid email address.'); input.focus(); return; }
      input.value = ''; render('sent');
    });
    dialog.scrollTop = 0;
    (dialog.querySelector('input') || dialog.querySelector('[data-close]')).focus({preventScroll:true});
  }
  function clearErrors() {
    dialog.querySelectorAll('.error').forEach(el => { el.hidden = true; el.textContent = ''; });
    dialog.querySelectorAll('input').forEach(el => el.removeAttribute('aria-invalid'));
  }
  function error(name, text) {
    const el = document.getElementById(`error-${name}`); if (el) { el.textContent = text; el.hidden = false; }
    dialog.querySelector(`[name="${name}"]`)?.setAttribute('aria-invalid','true');
  }
  function submit(event, isRegister) {
    event.preventDefault(); clearErrors();
    const form = event.target, username = form.elements.username.value.trim(), password = form.elements.password.value;
    if (!/^[\p{L}\p{N}@.+_-]{1,150}$/u.test(username)) error('username','Use letters, digits and @ . + - _ (up to 150 characters).');
    if (!password) error('password','Enter your password.');
    if (isRegister) {
      const email = form.elements.email.value.trim();
      if (!form.elements.email.validity.valid || !email) error('email','Enter a valid email address.');
      if (password.length < 12) error('password','Use at least 12 characters.');
      else if (/^\d+$/.test(password)) error('password','Your password can’t contain only numbers.');
      else if ([username,email.split('@')[0]].filter(v => v.length >= 3).some(v => password.toLowerCase().includes(v.toLowerCase()))) error('password','Choose a password that does not include your username or email.');
      else if (new Set(['password1234','password12345','qwerty123456','123456789012','letmein123456','iloveyou12345']).has(password.toLowerCase())) error('password','Choose a less common password.');
      if (form.elements.confirm.value !== password) error('confirm','Your passwords don’t match.');
      if (!form.elements.terms.checked) error('terms','Please agree to the Terms of Use and acknowledge the Privacy Notice.');
    }
    const invalid = form.querySelector('[aria-invalid=true]'); if (invalid) { invalid.focus(); return; }
    if (isRegister) {
      // Form state stays only in memory until completion/cancellation; no real email is sent.
      registration = {username,email:form.elements.email.value.trim(),password,confirm:form.elements.confirm.value,terms:form.elements.terms.checked};
      resendAt = Date.now() + 60000;
      render('verify');
      return;
    }
    finishAuthentication(username, false);
  }
  function registrationSteps(step) {
    return `<ol class="registration-steps" aria-label="Registration progress"><li class="${step === 1 ? 'current' : 'complete'}" ${step === 1 ? 'aria-current="step"' : ''}><span>${step === 2 ? '✓' : '1'}</span>Account details</li><li class="${step === 2 ? 'current' : ''}" ${step === 2 ? 'aria-current="step"' : ''}><span>2</span>Verify email</li></ol>`;
  }
  function setupVerification() {
    const form = dialog.querySelector('#verificationForm'), input = form.elements.code;
    const button = form.querySelector('[type=submit]'), resend = dialog.querySelector('[data-resend-code]');
    input.addEventListener('input', () => {
      input.value = input.value.normalize('NFKC').replace(/[^0-9]/g,'').slice(0,6);
      input.removeAttribute('aria-invalid');
      const message = document.getElementById('error-code');message.hidden = true;message.textContent = '';
      button.disabled = !/^[0-9]{6}$/.test(input.value);
    });
    form.addEventListener('submit', event => {
      event.preventDefault();clearErrors();
      if (!/^[0-9]{6}$/.test(input.value)) { error('code','Enter a 6-digit verification code.');input.focus();return; }
      // Prototype rule requested by the user: every six-digit numeric code passes.
      finishAuthentication(registration.username, true);
    });
    const countdown = () => {
      const remaining = Math.max(0,Math.ceil((resendAt-Date.now())/1000));
      resend.disabled = remaining > 0;
      resend.textContent = remaining ? `Resend code in ${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}` : 'Resend code';
      if (!remaining) clearInterval(verificationTimer);
    };
    resend.addEventListener('click', () => {
      resendAt = Date.now()+60000;
      input.value = '';button.disabled = true;clearErrors();
      dialog.querySelector('.verification-status').textContent = 'A new code has been sent. Please check your inbox.';
      clearInterval(verificationTimer);countdown();verificationTimer = setInterval(countdown,1000);input.focus();
    });
    dialog.querySelector('[data-change-email]').addEventListener('click', () => {
      render('register');dialog.querySelector('[name=email]').focus();
    });
    countdown();verificationTimer = setInterval(countdown,1000);
  }
  function finishAuthentication(username, isRegistration) {
    // No password, email or verification code is written to browser storage.
    account = {username,...(isRegistration ? {emailVerified:true} : {})};
    if (!write(SESSION,account)) {
      account = null;
      error(accountMode === 'verify' ? 'code' : 'password','This browser could not keep your session. Please enable session storage and try again.');
      return;
    }
    const saveAfterLogin = pendingSave;
    const resultsOwner = window.CredybaraResults?.owner();
    close();nav();
    if (resultsOwner && resultsOwner !== products?.owner(username)) window.CredybaraResults.clear();
    const kept = keepResults();
    if (!window.CredybaraResults?.read()) restoreResults();
    autoSaveDraft(); nav();
    if (saveAfterLogin) save();
    else toast(kept ? 'Your products have been saved automatically.' : isRegistration ? 'Email verified. Your account is ready.' : 'Welcome back. Continue at your own pace.');
  }
  function open(mode = 'login') {
    if (!dialog.open) { returnFocus = document.activeElement; dialog.showModal(); }
    render(mode);
  }
  function save() {
    if (!account) { pendingSave = true; open('login'); return; }
    const draft = window.CredybaraDraft?.read();
    if (!draft || !draft.purposeKey) { toast('Choose what your loan is for, then save your preferences.'); return; }
    if (!write(DRAFT,{...draft,owner:account.username,savedAt:Date.now()})) { toast('We couldn’t save this time. Keep this page open and try again.'); return; }
    toast('Loan preferences saved for this visit.'); nav();
  }
  function autoSaveDraft(){
    if (!account) return;
    const draft = window.CredybaraDraft?.read();
    if (draft?.purposeKey) write(DRAFT,{...draft,owner:account.username,savedAt:Date.now()});
  }
  document.addEventListener('click', event => {
    const keepButton = event.target.closest('[data-keep-results]');
    if (keepButton){ event.preventDefault(); pendingResults = true; pendingSave = false; open(keepButton.dataset.keepResults); }
    if (event.target.closest('[data-retry-results]')) { keepResults(); nav(); }
    if (event.target.closest('[data-new-search]')) window.CredybaraResults?.clear();
    const accountButton = event.target.closest('[data-account]');
    if (accountButton) { event.preventDefault(); pendingSave = false; open(accountButton.dataset.account); }
    if (event.target.closest('[data-save-progress]')) { event.preventDefault(); save(); }
    if (event.target.closest('[data-signout]')) {
      if (window.CredybaraResults?.owner()) window.CredybaraResults.clear();
      account = null; try { sessionStorage.removeItem(SESSION); sessionStorage.removeItem(DRAFT); } catch {}
      if (dialog.open) close(); nav(); toast('You’re logged out. You can keep exploring.');
    }
    const policyButton = event.target.closest('[data-policy]');
    if (policyButton) {
      const policy = document.createElement('dialog'); policy.className = 'account-card'; policy.style.maxWidth = '560px';
      policy.setAttribute('aria-labelledby','policyTitle');
      const terms = policyButton.dataset.policy === 'terms';
      policy.innerHTML = `<h2 id="policyTitle">${terms ? 'Terms of Use' : 'Privacy Notice'}</h2><div class="policy-copy">${terms ? '<p>Credybara helps you explore personal loan options. Credybara is not a lender, does not make credit decisions and does not guarantee approval or funding.</p><p>Creating an account is separate from applying for a loan. You choose whether to continue with a lender, whose own terms apply.</p>' : '<p>Your account helps you keep your loan preferences. Creating an account does not authorize sharing a loan application or obtaining a credit report.</p><p>We ask for separate authorization before sending an application to a lender. Please keep Social Security numbers and bank information out of the conversation with Bara.</p>'}</div><button class="site-btn secondary" type="button">Back</button>`;
      document.body.append(policy); policy.querySelector('button').addEventListener('click',() => policy.close()); policy.addEventListener('close', () => { policy.remove(); policyButton.focus(); }); policy.showModal();
    }
  });
  document.addEventListener('credy:products-ready', () => { keepResults(); autoSaveDraft(); nav(); });
  document.addEventListener('credy:products-expired', () => { renderResultGuidance(); nav(); });
  const steps = document.getElementById('steps');
  const queueDraft = () => { clearTimeout(draftTimer); draftTimer = setTimeout(autoSaveDraft,150); };
  if (steps) new MutationObserver(queueDraft).observe(steps,{childList:true,subtree:true});
  ['input','change','click'].forEach(type=>document.addEventListener(type,event=>{
    if (event.target.closest('#chat,#pendingContent')) queueDraft();
  }));
  window.CredybaraAccount = {open,save};
  nav();
  const mode = new URLSearchParams(location.search).get('account');
  if (['login','register','forgot'].includes(mode)) open(mode);
  const draft = read(DRAFT);
  const params = new URLSearchParams(location.search);
  const restored = account && params.get('fresh') !== '1' && restoreResults(params.get('results') === '1');
  if (!restored && account && draft && draft.owner === account.username && params.get('restore') === '1') {
    window.CredybaraDraft?.restore(draft);
  }
})();
