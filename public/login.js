// Sign-in and (forced) password change.
const $ = (s) => document.querySelector(s);
// Arabic sign-in page (same language choice as the Studio).
let LANG = (() => { try { return localStorage.getItem('drs-lang') || ''; } catch { return ''; } })();
const L_AR = {
  Username: 'اسم المستخدم', Password: 'كلمة المرور', 'Sign in': 'تسجيل الدخول', Show: 'إظهار', Hide: 'إخفاء',
  'Forgotten your password? Ask your administrator to reset it.': 'نسيت كلمة المرور؟ اطلب من المسؤول إعادة تعيينها.',
  'Every donor deserves a beautiful thank-you': 'كل مانح يستحق شكراً جميلاً',
  'Thank you': 'شكراً لكم', Talk: 'تحدّث', 'Add photos': 'أضف الصور', Download: 'نزّل التقرير',
  'Demo access': 'دخول تجريبي', 'Fill in for me': 'املأ البيانات عني',
};
const lt = (s) => (LANG === 'ar' && L_AR[s]) || s;
function applyLang(offered) {
  if (!offered.includes(LANG)) LANG = 'en';
  if (LANG === 'ar') {
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
    const css = document.querySelector('link[href="login.css"]');
    if (css) css.href = 'login.rtl.css';
    document.querySelectorAll('label').forEach((l) => { const n = l.childNodes[0]; if (n && n.nodeType === 3 && L_AR[n.textContent.trim()]) n.textContent = L_AR[n.textContent.trim()]; });
    document.querySelectorAll('button, .hint, .story h2, .kicker, .demo-box b, .steps li').forEach((el) => { if (el.children.length === 0 && L_AR[el.textContent.trim()]) el.textContent = L_AR[el.textContent.trim()]; });
  }
  if (offered.length > 1) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'lang-switch';
    b.textContent = LANG === 'ar' ? 'English' : 'عربي';
    b.onclick = () => { try { localStorage.setItem('drs-lang', LANG === 'ar' ? 'en' : 'ar'); } catch {} location.reload(); };
    document.querySelector('.panel-top').append(b);
  }
}
const params = new URLSearchParams(location.search);
const safeNext = (n) => (n && n.startsWith('/') && !n.startsWith('//') ? n : null);
let lastPassword = '';

async function api(url, body) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}
const showError = (m) => ($('#err').textContent = m || '');

// Background slideshow: the online photos set in the dashboard. Each one is
// checked before it is shown; if none load (offline, blocked or a broken
// link) the organisation's own library photos or illustrations are used.
const preload = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i.naturalWidth > 1 ? src : null); i.onerror = () => ok(null); i.src = src; setTimeout(() => ok(null), 8000); });
async function slideshow(online, local) {
  const slides = document.querySelectorAll('.slide');
  const dots = $('#dots');
  const list = [];
  let shown = -1;
  let cur = 0;
  let timer;
  const show = (n) => {
    if (n === shown || !list[n]) return;
    shown = n;
    cur = 1 - cur;
    slides[cur].style.backgroundImage = `url("${list[n].replace(/"/g, '%22')}")`;
    slides[cur].classList.add('on');
    slides[1 - cur].classList.remove('on');
    dots.querySelectorAll('button').forEach((d, i) => d.classList.toggle('on', i === n));
  };
  const tick = () => { clearInterval(timer); if (list.length > 1) timer = setInterval(() => show((shown + 1) % list.length), 6500); };
  const add = (src) => {
    list.push(src);
    dots.innerHTML = list.length > 1 ? list.map((_, i) => `<button type="button" aria-label="Photo ${i + 1}" class="${i === shown ? 'on' : ''}"></button>`).join('') : '';
    dots.querySelectorAll('button').forEach((d, i) => (d.onclick = () => { show(i); tick(); }));
    if (list.length === 1) show(0);
    tick();
  };
  // Show the first photo that loads straight away, then add the rest as they arrive.
  await Promise.all(online.map((u) => preload(u).then((src) => src && add(src))));
  if (!list.length) await Promise.all(local.map((u) => preload(u).then((src) => src && add(src))));
}

// Organisation branding (colours, logo, names) from the admin settings.
fetch('api/public-config')
  .then((r) => r.json())
  .then((c) => {
    applyLang(c.languages?.offered || ['en']);
    slideshow(c.signin?.images || [], c.signin?.local || []);
    if (c.signin?.headline && LANG !== 'ar') $('#headline').textContent = c.signin.headline;
    if (c.demo) {
      $('#demoBox').hidden = false;
      $('#demoUser').textContent = c.demo.username;
      $('#demoPass').textContent = c.demo.password;
      $('#demoFill').onclick = () => { $('#username').value = c.demo.username; $('#password').value = c.demo.password; $('#loginBtn').focus(); };
    }
    const root = document.documentElement.style;
    if (c.colors?.blue) root.setProperty('--blue', c.colors.blue);
    if (c.colors?.yellow) root.setProperty('--yellow', c.colors.yellow);
    if (c.colors?.purple) root.setProperty('--purple', c.colors.purple);
    if (c.logos?.colour) $('#logo').src = `brand/${c.logos.colour}?v=${c.version}`;
    if (c.logos?.white) $('#artLogo').src = `brand/${c.logos.white}?v=${c.version}`;
    if (c.studio?.title) { $('#title').textContent = c.studio.title; document.title = `Sign in · ${c.studio.title}`; }
    if (c.org?.orgName) $('#org').textContent = `${c.org.orgName}: sign in to continue`;
    if (c.studio?.assistantName) $('#pitch').textContent = LANG === 'ar' ? `تحدّث إلى ${c.studio.assistantNameAr || c.studio.assistantName}، وأضف صورك، واحصل على تقرير أثر أنيق بهوية مؤسستك خلال دقائق.` : `Talk to ${c.studio.assistantName}, add your photos and get a polished, on-brand impact report in minutes.`;
    if (LANG === 'ar' && c.ar?.orgName) $('#org').textContent = `${c.ar.orgName}: سجّل الدخول للمتابعة`;
  })
  .catch(() => {});

document.querySelectorAll('.eye').forEach((b) => (b.onclick = () => {
  const i = document.getElementById(b.dataset.for);
  i.type = i.type === 'password' ? 'text' : 'password';
  b.textContent = i.type === 'password' ? 'Show' : 'Hide';
}));

function showChange(needCurrent) {
  $('#loginForm').hidden = true;
  $('#changeForm').hidden = false;
  $('#curWrap').hidden = !needCurrent;
  $('#title').textContent = 'Choose a new password';
  (needCurrent ? $('#cur') : $('#new1')).focus();
}

$('#loginForm').onsubmit = async (e) => {
  e.preventDefault();
  showError('');
  $('#loginBtn').disabled = true;
  try {
    const r = await api('api/auth/login', { username: $('#username').value.trim(), password: $('#password').value });
    if (r.mustChange) {
      lastPassword = $('#password').value;
      showChange(false);
    } else location.href = safeNext(params.get('next')) || r.next || './';
  } catch (err) {
    showError(err.message);
  } finally {
    $('#loginBtn').disabled = false;
  }
};

const rules = () => {
  const a = $('#new1').value;
  const b = $('#new2').value;
  const ok = { len: a.length >= 10, mix: /[a-zA-Z]/.test(a) && /[0-9]/.test(a), same: a && a === b };
  document.querySelectorAll('#rules li').forEach((li) => li.classList.toggle('ok', ok[li.dataset.r]));
  return ok.len && ok.mix && ok.same;
};
$('#new1').oninput = rules;
$('#new2').oninput = rules;

$('#changeForm').onsubmit = async (e) => {
  e.preventDefault();
  showError('');
  if (!rules()) return showError('Please meet all the password rules above.');
  $('#changeBtn').disabled = true;
  try {
    const r = await api('api/me/password', { current: lastPassword || $('#cur').value, next: $('#new1').value });
    location.href = safeNext(params.get('next')) || r.next || './';
  } catch (err) {
    showError(err.message);
  } finally {
    $('#changeBtn').disabled = false;
  }
};

if (params.get('change')) showChange(true);
else $('#username').focus();
