// Donor Report Studio: chat with the assistant (typed or spoken), watch the report card
// fill in, pick a style, create the PDF. English or Arabic (right-to-left).
import { AR, STYLE_AR, EXAMPLES_AR } from './i18n-ar.js';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const fmtN = (n) => (/^\d{4,}$/.test(String(n || '').trim()) ? Number(n).toLocaleString('en-ZA').replace(/[,\s ]/g, ' ') : n);
const fmtR = (n) => { const v = Number(String(n || '').replace(/[^\d.]/g, '')); return v ? `${(typeof ST !== 'undefined' && ST.org.currency) || 'R'} ` + Math.round(v).toLocaleString('en-ZA').replace(/[,\s ]/g, ' ') : ''; };

let config;
let S = null; // current session view
let thinking = false;
const LAST = 'drs-last-session';
let shownFor = null;
let shown = 0;
// Interface language: the viewer's choice, else the organisation's default.
const LANG_KEY = 'drs-lang';
let LANG = (() => { try { return localStorage.getItem(LANG_KEY) || ''; } catch { return ''; } })();
/** Translate interface text (English is the key). */
const t = (s, v = {}) => { let o = (LANG === 'ar' && AR[s]) || s; for (const [k, x] of Object.entries(v)) o = o.split(`{${k}}`).join(x); return o; };
const EXAMPLES = () => {
  const c = ST.org.currency || 'R';
  if (LANG === 'ar') return EXAMPLES_AR(c);
  return [
    ['Family', `The Naidoo family gave ${c} 120 000 to our Reading for Life programme in Soweto. 1 800 learners now have classroom libraries.`],
    ['Corporate', `Acme Holdings gave ${c} 80 000 in CSI funding for winter blankets and food parcels for 300 families in Gauteng.`],
    ['Trust', `The Ubuntu Trust gave a ${c} 250 000 grant for a mobile health clinic that saw 3 400 patients this year.`],
  ];
};


async function api(url, opts = {}) {
  const res = await fetch(url, { ...opts, headers: opts.body instanceof FormData ? { 'X-Lang': LANG || 'en' } : { 'Content-Type': 'application/json', 'X-Lang': LANG || 'en', ...(opts.headers || {}) } });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) { location.href = `login?next=${encodeURIComponent(location.pathname + location.hash)}`; throw new Error('Please sign in'); }
  if (res.status === 403 && data.mustChange) { location.href = 'login?change=1'; throw new Error('Please change your password'); }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
function toast(msg, ms = 3500) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => (t.hidden = true), ms);
}

// ---------------- boot ----------------
config = await api('api/config');
const ST = config.settings;
const OFFERED = ST.languages?.offered || ['en'];
if (!OFFERED.includes(LANG)) LANG = ST.languages?.defaultUi || 'en';
if (LANG === 'ar') {
  document.documentElement.lang = 'ar';
  document.documentElement.dir = 'rtl';
  const css = document.querySelector('link[href="app.css"]');
  if (css) css.href = 'app.rtl.css';
}
const NAME = (LANG === 'ar' && ST.studio.assistantNameAr) || ST.studio.assistantName || 'Ava';
const ORG = (LANG === 'ar' && (ST.ar?.shortName || ST.ar?.orgName)) || ST.org.shortName || ST.org.orgName;
const ORGNAME = (LANG === 'ar' && ST.ar?.orgName) || ST.org.orgName;
const styleLabel = (st) => (LANG === 'ar' && STYLE_AR[st.id] ? { name: STYLE_AR[st.id][0], bestFor: STYLE_AR[st.id][1] } : st);
// Static text in the page
$$('[data-tab="chat"]').forEach((b) => (b.textContent = t('Chat')));
$('[data-tab="card"]').childNodes[0].textContent = `${t('Report')} `;
$('#btnHistory .lbl').textContent = t('My reports');
$('#btnHistory').setAttribute('aria-label', t('My reports'));
$('#btnNew').textContent = t('+ New');
$('.attach').title = t('Add photos');
$('#mic').title = t('Speak');
$('#send').title = t('Send');
$('#listening').lastChild.textContent = ` ${t('Listening… tap the mic to stop')}`;
$('.composer-hint').textContent = t('Enter to send · Shift + Enter for a new line · Drop photos anywhere in the chat');
// English / Arabic switch (only when both are offered)
if (OFFERED.length > 1) {
  const sw = document.createElement('button');
  sw.type = 'button';
  sw.className = 'ghost sm lang-btn';
  sw.textContent = LANG === 'ar' ? 'English' : 'عربي';
  sw.title = LANG === 'ar' ? 'Switch to English' : 'التبديل إلى العربية';
  sw.onclick = () => { try { localStorage.setItem(LANG_KEY, LANG === 'ar' ? 'en' : 'ar'); } catch {} location.reload(); };
  $('#btnHistory').before(sw);
}
const LOGO = (k) => `brand/${ST.logos[k]}?v=${ST.version}`;
(function applyBranding() {
  const r = document.documentElement.style;
  const c = ST.colors;
  r.setProperty('--blue', c.blue);
  r.setProperty('--blue-d', c.blue);
  r.setProperty('--blue20', c.blue20);
  r.setProperty('--blue10', c.blue20 + '80');
  ['purple', 'teal', 'green', 'yellow'].forEach((k) => r.setProperty(`--${k}`, c[k]));
  r.setProperty('--warm', c.warmGrey);
  r.setProperty('--logo-white', `url('${LOGO('white')}')`);
  $('.top-logo').src = LOGO('box');
  $('.top-logo').alt = ST.org.orgName;
  $('.top-title b').textContent = ST.studio.title;
  $('.top-title span').textContent = ORGNAME;
  document.title = `${ST.studio.title} · ${ORGNAME}`;
  $('#msg').placeholder = t('Tell {name} about the donor and project…', { name: NAME });
  $('#mic').setAttribute('aria-label', t('Speak to {name}', { name: NAME }));
  const u = config.user;
  const ini = u.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const me = document.createElement('div');
  me.className = 'me';
  me.innerHTML = `<button type="button" class="me-btn" title="${esc(u.name)}">${esc(ini)}</button><div class="me-menu" hidden><div class="me-name"><b>${esc(u.name)}</b><span>${esc(u.username)} · ${u.role === 'admin' ? t('Admin') : t('Staff')}</span></div>${u.role === 'admin' ? `<a href="admin">${t('Admin dashboard')}</a>` : ''}<a href="login?change=1">${t('Change password')}</a><button type="button" data-signout>${t('Sign out')}</button></div>`;
  $('.top').appendChild(me);
  $('.me-btn', me).onclick = (e) => { e.stopPropagation(); $('.me-menu', me).hidden = !$('.me-menu', me).hidden; };
  document.addEventListener('click', () => ($('.me-menu', me).hidden = true));
  $('[data-signout]', me).onclick = async () => { await fetch('api/auth/logout', { method: 'POST' }); location.href = 'login'; };
})();
const fromHash = location.hash.match(/s=([a-f0-9-]{36})/)?.[1];
const remembered = (() => { try { return localStorage.getItem(LAST); } catch { return null; } })();
try {
  const id = fromHash || remembered;
  if (!id) throw new Error('new');
  S = await api(`api/sessions/${id}`);
} catch {
  S = await api('api/sessions', { method: 'POST' });
}
remember();
renderAll();
if (S.report && fromHash) showResult();

function remember() {
  try { localStorage.setItem(LAST, S.id); } catch {}
  history.replaceState(null, '', `#s=${S.id}`);
}
function renderAll() {
  renderThread();
  syncSend();
  renderChips();
  renderCard();
}

// ---------------- chat ----------------
function scrollThread() {
  const t = $('#thread');
  t.scrollTop = t.scrollHeight;
  requestAnimationFrame(() => (t.scrollTop = t.scrollHeight));
}
function renderThread() {
  if (shownFor !== S.id) { shownFor = S.id; shown = 0; }
  const fresh = !S.transcript.some((m) => m.role === 'user');
  const N = { name: esc(NAME) };
  const intro = `<div class="intro"><span class="hl">${t('Welcome')}</span><h1>${t('Let’s thank a donor')}</h1><p>${t('Talk or type naturally. {name} turns your words into a beautiful, on-brand impact report.', N)}</p></div>
    ${fresh ? `<div class="how"><div><b>1</b><span><strong>${t('Talk')}</strong>${t('Tell {name} about the donor and project. Tap the mic or type.', N)}</span></div><div><b>2</b><span><strong>${t('Add photos')}</strong>${t('Drop them in. No photos? {name} uses your library images.', N)}</span></div><div><b>3</b><span><strong>${t('Create')}</strong>${t('Pick a style and get a polished PDF in about a minute.')}</span></div></div>` : ''}`;
  const tail = fresh ? `<div class="examples"><p>${t('Not sure how to start? Tap an example:')}</p>${EXAMPLES().map(([k, x]) => `<button type="button" class="ex" dir="auto" data-ex="${esc(x)}"><em>${k}</em>${esc(x)}</button>`).join('')}</div>` : '';
  const msgs = S.transcript.map((m, i) => `<div class="msg ${m.role}${i >= shown ? ' new' : ''}">${m.role === 'agent' ? '<div class="av"></div>' : ''}<div class="bub" dir="auto">${esc(m.text)}${m.photos?.length ? `<div class="pics">${m.photos.map((f) => `<img src="reports/${S.id}/files/${f}" alt="">`).join('')}</div>` : ''}</div></div>`).join('');
  $('#thread').innerHTML = intro + msgs + tail + (thinking ? '<div class="msg agent typing new"><div class="av"></div><div class="bub"><i></i><i></i><i></i></div></div>' : '');
  shown = S.transcript.length;
  $$('#thread [data-ex]').forEach((b) => (b.onclick = () => { $('#msg').value = b.dataset.ex; autosize(); syncSend(); $('#msg').focus(); }));
  scrollThread();
  $$('#thread img').forEach((im) => { if (!im.complete) im.addEventListener('load', scrollThread, { once: true }); });
}
function renderChips() {
  const chips = thinking ? [] : S.suggestions || [];
  $('#chips').innerHTML = chips.map((c) => `<button type="button">${esc(c)}</button>`).join('');
  // The chips take room below the thread: keep the newest message in view.
  scrollThread();
  $$('#chips button').forEach((b) => (b.onclick = () => {
    const x = b.textContent;
    if (/^(paste my notes|ألصق ملاحظاتي)$/i.test(x)) { $('#msg').focus(); $('#msg').placeholder = t('Paste your notes, an email or a field report here…'); return; }
    if (/create my report|أنشئ تقريري/i.test(x)) return createReport();
    send(x);
  }));
}

async function send(text) {
  text = String(text || '').trim();
  if (!text || thinking) return;
  stopMic();
  S.transcript.push({ role: 'user', text });
  $('#msg').value = '';
  autosize();
  thinking = true;
  renderThread();
  renderChips();
  try {
    S = await api(`api/sessions/${S.id}/messages`, { method: 'POST', body: JSON.stringify({ text }) });
  } catch (e) {
    S.transcript.push({ role: 'agent', text: t('Sorry, I couldn’t process that ({e}). Please try again.', { e: e.message }) });
  }
  thinking = false;
  renderAll();
}

async function uploadPhotos(files, note = '') {
  const list = [...files].filter((f) => f.type.startsWith('image/')).slice(0, 12);
  if (!list.length) return;
  // Photos added while the assistant is still replying wait their turn
  // instead of being dropped.
  if (thinking) toast(t('Adding your photos as soon as the reply is in…'));
  while (thinking) await new Promise((r) => setTimeout(r, 250));
  const fd = new FormData();
  list.forEach((f) => fd.append('photos', f));
  if (note) fd.append('text', note);
  S.transcript.push({ role: 'user', text: note || (LANG === 'ar' ? t('Uploading {n} photo(s)…', { n: list.length }) : `Uploading ${list.length} photo${list.length > 1 ? 's' : ''}…`) });
  thinking = true;
  renderThread();
  renderChips();
  try {
    S = await api(`api/sessions/${S.id}/photos`, { method: 'POST', body: fd });
  } catch (e) {
    toast(t('Photo upload failed: {e}', { e: e.message }));
    S = await api(`api/sessions/${S.id}`);
  }
  thinking = false;
  renderAll();
}

$('#composer').onsubmit = (e) => { e.preventDefault(); send($('#msg').value); };
$('#msg').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send($('#msg').value); } });
function syncSend() { $('#send').disabled = !$('#msg').value.trim() || thinking; }
const autosize = () => { const t = $('#msg'); t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 180) + 'px'; };
$('#msg').addEventListener('input', () => { autosize(); syncSend(); });
if (matchMedia('(max-width: 900px)').matches) $('#msg').placeholder = t('Message {name}…', { name: NAME });
$('#photoInput').onchange = (e) => { uploadPhotos(e.target.files, $('#msg').value.trim()); $('#msg').value = ''; e.target.value = ''; };
const chat = $('#chatPane');
chat.addEventListener('dragover', (e) => { e.preventDefault(); chat.classList.add('drag'); });
chat.addEventListener('dragleave', () => chat.classList.remove('drag'));
chat.addEventListener('drop', (e) => { e.preventDefault(); chat.classList.remove('drag'); uploadPhotos(e.dataTransfer.files); });
document.addEventListener('paste', (e) => { const imgs = [...(e.clipboardData?.files || [])].filter((f) => f.type.startsWith('image/')); if (imgs.length) uploadPhotos(imgs); });

// ---------------- voice (Web Speech API) ----------------
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null;
let recBase = '';
if (!SR) $('#mic').title = t('Voice typing works in Chrome, Edge and Safari');
$('#mic').onclick = () => {
  if (!SR) return toast(t('Voice typing works in Chrome, Edge and Safari. On a phone you can also use your keyboard’s microphone.'));
  if (rec) return stopMic();
  rec = new SR();
  rec.lang = LANG === 'ar' ? 'ar-SA' : 'en-ZA';
  rec.continuous = true;
  rec.interimResults = true;
  recBase = $('#msg').value ? $('#msg').value.trim() + ' ' : '';
  rec.onresult = (ev) => {
    let finalT = '';
    let interim = '';
    for (let i = 0; i < ev.results.length; i++) (ev.results[i].isFinal ? (finalT += ev.results[i][0].transcript) : (interim += ev.results[i][0].transcript));
    $('#msg').value = recBase + finalT + interim;
    autosize();
    syncSend();
  };
  rec.onerror = (ev) => { if (ev.error === 'not-allowed') toast(t('Please allow microphone access to talk to {name}.', { name: NAME })); stopMic(); };
  rec.onend = () => { if (rec) stopMic(); };
  rec.start();
  $('#mic').classList.add('on');
  $('#composer').classList.add('rec');
};
function stopMic() {
  if (!rec) return;
  const r = rec;
  rec = null;
  try { r.stop(); } catch {}
  $('#mic').classList.remove('on');
  $('#composer').classList.remove('rec');
}

// ---------------- report card ----------------
function renderCard() {
  const b = S.brief;
  const d = b.donor || {};
  const p = b.project || {};
  const r = b.report || {};
  const done = S.checklist.filter((c) => c.done).length;
  const pct = Math.round((done / S.checklist.length) * 100);
  const cover = S.photos[0]?.url;
  const style = r.style || 'signature';
  const fact = (label, v) => `<div class="fact"><label>${t(label)}</label><div class="${v ? '' : 'empty'}">${esc(v || t('Not yet'))}</div></div>`;
  const rlang = r.language || ST.languages?.defaultReport || 'en';
  const N = { name: esc(NAME) };
  $('#tabCount').textContent = `${pct}%`;
  $('#cardView').innerHTML = `<div class="rc">
    <div class="rc-cover">${cover ? `<div class="bgimg" style="background-image:url('${cover}')"></div>` : ''}
      <img class="logo" src="${LOGO('white')}" alt="">
      <small>${esc(d.givingType ? t('{type} impact report', { type: gtLabel(d.givingType) }) : t('Impact report'))}</small>
      <h2>${esc(p.name || t('Your project'))}</h2>
      <div class="for ${d.name ? '' : 'ph-empty'}">${d.name ? `${t('For {name}', { name: esc(d.name) })}${d.amount ? ` · ${fmtR(d.amount)}` : ''}` : t('Tell {name} who the donor is…', N)}</div>
    </div>
    <div class="meter"><div class="ring" style="--p:${pct}"><b>${pct}%</b></div><div><strong>${t(pct < 40 ? 'Getting started' : pct < 75 ? 'Looking good' : 'Ready to shine')}</strong><p>${S.ready ? t('You can create the report any time. {name} fills the gaps.', N) : t('Start with the donor’s name.')}</p></div></div>
    <div class="checks">${S.checklist.map((c) => (c.done ? `<span class="done">${esc(t(c.label))}</span>` : `<button type="button" data-need="${c.id}" title="${t('Ask {name} to help add this', N)}">${esc(t(c.label))} +</button>`)).join('')}</div>
    <div class="box"><h3>${t('Details')} <button type="button" id="editBrief">${t('Edit')}</button></h3>
      <div class="facts">${fact('Donor', d.name)}${fact('Gift', [gtLabel(d.givingType), fmtR(d.amount)].filter(Boolean).join(' · '))}${fact('Project', p.name)}${fact('Where', [p.location, p.country].filter(Boolean).join(', '))}${fact('People reached', fmtN(p.beneficiaries))}${fact('Period', [p.startDate, p.endDate].filter(Boolean).join(' – '))}</div>
      ${p.outputs?.length ? `<h3 style="margin-top:12px">${t('Results')}</h3><div class="stat-row">${p.outputs.map((o) => `<span><b>${esc(o.value)}</b>${esc(o.label)}</span>`).join('')}</div>` : ''}
      ${p.budget?.length ? `<h3 style="margin-top:12px">${t('Spending')}</h3><div class="stat-row">${p.budget.map((o) => `<span><b>${fmtR(o.amount)}</b>${esc(o.label)}</span>`).join('')}</div>` : ''}
    </div>
    <div class="box"><h3>${t('Photos')} <span style="font-family:var(--body);font-size:.75rem;color:var(--grey);text-transform:none;letter-spacing:0">${S.photos.length}/14</span></h3>
      <div class="strip">${S.photos.map((ph) => `<div class="p"><img src="${ph.url}" alt="" title="${esc(ph.caption)}"><button type="button" data-del="${ph.file}" title="${t('Remove')}">×</button></div>`).join('')}<label class="add" title="${t('Add photos')}">+<input type="file" accept="image/*" multiple hidden id="addMore"></label></div>
      <p class="hint">${S.photos.length ? t('{name} picks the best cover and story photos.', N) : t('No photos? Library images are used automatically.')}</p>
    </div>
    <div class="box"><h3>${t('Thank-you letter from')}</h3><div class="ceo"><img src="${config.ceo.photo}" alt=""><p><b>${esc((LANG === 'ar' && ST.ar?.ceoName) || config.ceo.name)}</b>${esc((LANG === 'ar' && ST.ar?.ceoTitle) || config.ceo.title)}. ${t('Always included as page 2.')}</p></div></div>
    ${S.report ? lockedBox() : `${OFFERED.length > 1 ? `<div class="box"><h3>${t('Report language')}</h3><div class="pages langs">${OFFERED.map((l) => `<button type="button" data-rlang="${l}" class="${l === rlang ? 'sel' : ''}">${l === 'ar' ? 'العربية' : 'English'}</button>`).join('')}</div></div>` : ''}
    <div class="box"><h3>${t('Style')}</h3><div class="styles">${config.styles.map((st) => `<button type="button" class="sty ${st.id === style ? 'sel' : ''}" data-style="${st.id}" title="${esc(styleLabel(st).bestFor)}"><img src="${st.thumb}" alt=""><b>${esc(styleLabel(st).name)}</b><span class="sw">${st.swatch.map((c) => `<i style="background:${c}"></i>`).join('')}</span></button>`).join('')}</div>
      <p class="hint">${esc(styleLabel(config.styles.find((s) => s.id === style) || {}).bestFor || '')}</p></div>
    <div class="box"><h3>${t('Pages')}</h3><div class="pages">${ST.report.pageOptions.map((n) => `<button type="button" data-pages="${n}" class="${n === Number(r.pages || ST.report.defaultPages) ? 'sel' : ''}">${n}</button>`).join('')}</div>
      <p class="hint">${t('Choose carefully: the style, language and number of pages can’t be changed once the report is created.')}</p></div>`}
    <div class="go">${S.report ? `<button type="button" class="primary yellow" id="btnView">${t('View my report')}</button>` : `<button type="button" class="primary yellow" id="btnCreate" ${S.ready ? '' : 'disabled'}>${t('Create my report')}</button>`}
      ${config.aiEnabled ? `<p class="ai-ok">✓ ${t('Claude is connected. {name} writes the copy in {org}’s voice.', { name: esc(NAME), org: esc(ORG) })}</p>` : `<p class="ai-off"><b>${t('AI not working:')}</b> ${esc(config.ai?.problem || 'No API key found.')} <button type="button" id="btnRecheck">${t('Check again')}</button></p>`}</div>
  </div>`;
  $('#editBrief').onclick = editBrief;
  $$('[data-need]').forEach((x) => (x.onclick = () => {
    if (x.dataset.need === 'photos') return $('#photoInput').click();
    const ask = t({ donor: 'Who is the donor?', gift: 'Let me tell you about the gift', project: 'Let me tell you about the project', place: 'Let me tell you where the project is', results: 'Let me share the results', story: 'I have a story to share', money: 'Let me tell you how the money was spent' }[x.dataset.need]);
    $$('.tab-btn[data-tab="chat"]')[0]?.click();
    send(ask);
  }));
  $('#addMore').onchange = (e) => uploadPhotos(e.target.files);
  $$('[data-del]').forEach((x) => (x.onclick = async () => { S = await api(`api/sessions/${S.id}/photos/${x.dataset.del}`, { method: 'DELETE' }); renderAll(); }));
  $$('[data-style]').forEach((x) => (x.onclick = () => patchBrief({ 'report.style': x.dataset.style })));
  $$('[data-pages]').forEach((x) => (x.onclick = () => patchBrief({ 'report.pages': Number(x.dataset.pages) })));
  $$('[data-rlang]').forEach((x) => (x.onclick = () => patchBrief({ 'report.language': x.dataset.rlang })));
  if ($('#btnCreate')) $('#btnCreate').onclick = createReport;
  if ($('#btnRecheck')) $('#btnRecheck').onclick = async () => {
    const st = await api('api/status');
    config.ai = st;
    config.aiEnabled = st.enabled && st.ok;
    renderCard();
    toast(st.ok ? t('Claude is connected ✓') : st.problem, 6000);
  };
  if ($('#btnView')) $('#btnView').onclick = showResult;
}
async function patchBrief(fields, extra = {}) {
  S = await api(`api/sessions/${S.id}/brief`, { method: 'PATCH', body: JSON.stringify({ fields, ...extra }) });
  renderCard();
}

function editBrief() {
  const b = S.brief;
  const g = (p) => p.split('.').reduce((o, k) => o?.[k], b) ?? '';
  const F = [
    ['donor.name', 'Donor name'], ['donor.salutation', 'Greeting in letter'], ['donor.givingType', 'Type of giving'], ['donor.amount', t('Amount ({c})', { c: ST.org.currency || 'R' })],
    ['project.name', 'Project'], ['project.sector', 'Sector'], ['project.country', 'Country'], ['project.location', 'Area / community'],
    ['project.startDate', 'Start'], ['project.endDate', 'End'], ['project.beneficiaries', 'People reached'], ['project.beneficiaryDesc', 'Who they are'],
  ];
  const TX = [['project.objective', 'Goal'], ['project.activities', 'What was done'], ['project.story', 'Story'], ['project.quote', 'Quote'], ['project.quoteBy', 'Quote by'], ['report.ceoMessage', 'Personal note for the CEO letter']];
  openDialog(`<h2>${t('Report details')}</h2><div class="grid2">${F.map(([k, l]) => `<label>${t(l)}<input data-k="${k}" value="${esc(g(k))}"></label>`).join('')}</div>
    ${TX.map(([k, l]) => `<label>${t(l)}<textarea data-k="${k}" rows="2">${esc(g(k))}</textarea></label>`).join('')}
    <label>${t('Results (one per line: number | what it counts)')}<textarea id="eOut" rows="3">${esc((b.project.outputs || []).map((o) => `${o.value} | ${o.label}`).join('\n'))}</textarea></label>
    <label>${t('Spending (one per line: item | amount)')}<textarea id="eBud" rows="3">${esc((b.project.budget || []).map((o) => `${o.label} | ${o.amount}`).join('\n'))}</textarea></label>
    <div class="acts"><button type="button" class="ghost" data-close>${t('Cancel')}</button><button type="button" class="primary" id="eSave">${t('Save')}</button></div>`);
  $('#eSave').onclick = async () => {
    const fields = Object.fromEntries($$('#dlgBody [data-k]').map((i) => [i.dataset.k, i.value.trim()]));
    const lines = (id) => $(id).value.split('\n').map((l) => l.split('|').map((x) => x.trim())).filter((x) => x[0] && x[1]);
    await patchBrief(fields, { outputs: lines('#eOut').map(([value, label]) => ({ value, label })), budget: lines('#eBud').map(([label, amount]) => ({ label, amount })) });
    $('#dlg').close();
  };
}

// ---------------- create + result ----------------
const STEPS = ['Reading your conversation', 'Writing the CEO’s thank-you letter', 'Telling the impact story', 'Choosing the best photos', 'Designing your pages', 'Exporting the PDF'];
async function createReport() {
  stopMic();
  const ov = document.createElement('div');
  ov.className = 'building';
  ov.innerHTML = `<div><div class="orb"><i></i><i></i><i></i><img src="${LOGO('white')}" alt=""></div><h2>${t('Creating your report')}</h2><p>${t('Usually under two minutes.')}</p><ol>${STEPS.map((s) => `<li>${t(s)}</li>`).join('')}</ol></div>`;
  document.body.appendChild(ov);
  let i = 0;
  const lis = $$('li', ov);
  const tick = () => { lis.forEach((li, k) => { li.className = k < i ? 'done' : k === i ? 'on' : ''; }); if (i < lis.length - 1) i++; };
  tick();
  const timer = setInterval(tick, config.aiEnabled ? 9000 : 1200);
  try {
    S = await api(`api/sessions/${S.id}/report`, { method: 'POST', body: JSON.stringify({ styleId: S.brief.report.style, pages: S.brief.report.pages, language: S.brief.report.language || ST.languages?.defaultReport || 'en' }) });
    i = lis.length; tick(); lis.forEach((li) => (li.className = 'done'));
    await new Promise((r) => setTimeout(r, 500));
    renderAll();
    showResult();
  } catch (e) {
    toast(t('Couldn’t create the report: {e}', { e: e.message }), 6000);
  } finally {
    clearInterval(timer);
    ov.remove();
  }
}

function showResult() {
  const r = S.report;
  if (!r) return;
  const box = $('#result');
  box.hidden = false;
  const canRewrite = r.aiWritten && r.rewritesLeft > 0;
  box.innerHTML = `<div class="res-side">
      <span class="hl" style="align-self:flex-start;font-size:1.5rem">${t('Well done!')}</span>
      <h1>${t('Your report is ready')}</h1>
      <p class="sub" dir="auto">${esc((r.language === 'ar' && r.copy?.locale?.donorName) || S.brief.donor?.name)} · ${esc((r.language === 'ar' && r.copy?.cover?.title) || S.brief.project?.name || '')}</p>
      <div class="row"><a class="primary" href="${r.pdfUrl}" download>${t('Download PDF')}</a>${navigator.canShare ? `<button type="button" class="primary yellow" id="btnShare">${t('Share')}</button>` : ''}</div>
      <a class="ghost" href="${r.previewUrl}" target="_blank" rel="noopener" style="text-align:center;text-decoration:none">${t('Open full screen')}</a>
      <div class="fixed"><b>${esc(styleName(r.styleId))}</b> · ${langName(r.language)} · ${t('{n} pages', { n: r.pages })}<small>${t('Style, language and pages are fixed for this report.')}</small></div>
      <div class="row"><button type="button" class="ghost" id="btnWording">${t('Edit wording')}</button><button type="button" class="ghost" id="btnPhotos">${t('Photos')}</button></div>
      <div class="lbl">${t('Ask {name} to rewrite the wording', { name: esc(NAME) })}</div>
      ${canRewrite ? `<textarea id="chg" rows="3" placeholder="${t('e.g. Make the CEO letter warmer and mention their late father')}"></textarea>
      <button type="button" class="primary" id="btnRewrite">${t('Rewrite wording')}</button>
      <p class="hint">${LANG === 'ar' ? t('{n} AI rewrite(s) left for this report.', { n: r.rewritesLeft }) : `${r.rewritesLeft} AI rewrite${r.rewritesLeft === 1 ? '' : 's'} left for this report.`}</p>` : `<p class="hint">${!r.aiWritten ? t('AI is off. Use “Edit wording” to change any text.') : t('All AI rewrites for this report have been used. You can still edit the wording yourself.')}</p>`}
      <button type="button" class="ghost" id="btnBack">${t('← Back to chat')}</button>
    </div>
    <div class="res-main"><iframe id="pv" src="${r.previewUrl}" title="${t('Report preview')}"></iframe><div class="res-busy" id="rb" hidden>${t('Updating…')}</div></div>`;
  $('#btnPhotos').onclick = editPhotos;
  $('#btnBack').onclick = () => { box.hidden = true; };
  if ($('#btnShare')) $('#btnShare').onclick = sharePdf;
  $('#btnWording').onclick = editWording;
  if ($('#btnRewrite')) $('#btnRewrite').onclick = () => busy(async () => { S = await api(`api/sessions/${S.id}/report/rewrite`, { method: 'POST', body: JSON.stringify({ instructions: $('#chg').value }) }); });
}
async function sharePdf() {
  try {
    const blob = await (await fetch(S.report.pdfUrl)).blob();
    const file = new File([blob], `${ORG.replace(/[^a-z0-9]+/gi, '-')}-Impact-Report-${(S.brief.donor?.name || 'donor').replace(/[^a-z0-9]+/gi, '-')}.pdf`, { type: 'application/pdf' });
    if (navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: `Your ${ORG} impact report`, text: `With gratitude from ${ST.org.orgName}` });
    else toast(t('Sharing files isn’t supported here. Please download the PDF instead.'));
  } catch (e) {
    if (e.name !== 'AbortError') toast(t('Couldn’t share. Please download the PDF instead.'));
  }
}
async function busy(fn) {
  $('#rb').hidden = false;
  try { await fn(); showResult(); renderCard(); } catch (e) { toast(e.message); $('#rb').hidden = true; }
}
function styleName(id) { return (LANG === 'ar' && STYLE_AR[id]?.[0]) || config.styles.find((s) => s.id === id)?.name || id; }
/** Giving type in the interface language (the Arabic list matches the English one by position). */
function gtLabel(g) { if (LANG !== 'ar' || !g) return g; const i = (ST.givingTypes || []).findIndex((x) => x.toLowerCase() === String(g).toLowerCase()); return (i >= 0 && ST.ar?.givingTypes?.[i]) || g; }
function langName(l) { return t(l === 'ar' ? 'Arabic' : 'English'); }
function lockedBox() { return `<div class="box"><h3>${t('Style, language & pages')}</h3><div class="fixed"><b>${esc(styleName(S.report.styleId))}</b> · ${langName(S.report.language)} · ${t('{n} pages', { n: S.report.pages })}<small>${t('Fixed once the report is created. You can still edit the wording, change the photos or ask for a rewrite.')}</small></div></div>`; }

// Choose cover and story photos, edit captions and add newly uploaded photos.
// Handled without the AI, so it costs nothing.
function editPhotos() {
  const r = S.report;
  const fresh = S.photos.filter((p) => !r.images.some((im) => !im.library && im.url.endsWith(`/${p.file}`)));
  openDialog(`<h2>${t('Photos')}</h2><p class="hint">${t('Pick the cover and story photos and edit the captions. Library photos are marked as illustrative.')}</p>
    <div class="ph-list">${r.images.map((im) => `<div class="ph-row"><img src="${im.url}" alt=""><div>
      <input type="text" data-cap="${im.index}" value="${esc(im.caption)}" maxlength="120" placeholder="${t('Caption')}">
      <label><input type="radio" name="cov" value="${im.index}" ${im.index === r.coverIndex ? 'checked' : ''}> ${t('Cover')}</label>
      <label><input type="radio" name="sto" value="${im.index}" ${im.index === r.storyIndex ? 'checked' : ''}> ${t('Story')}</label>
      ${im.library ? `<small>${t('Library photo')}</small>` : ''}</div></div>`).join('')}
    ${fresh.map((p) => `<div class="ph-row"><img src="${p.url}" alt=""><div><label><input type="checkbox" data-add="${p.file}" checked> ${t('Add this new photo to the report')}</label></div></div>`).join('')}</div>
    <div class="acts"><button type="button" class="ghost" data-close>${t('Cancel')}</button><button type="button" class="primary" id="pSave">${t('Save & update')}</button></div>`);
  $('#pSave').onclick = () => {
    const photos = {
      coverIndex: Number($('#dlgBody input[name=cov]:checked')?.value),
      storyIndex: Number($('#dlgBody input[name=sto]:checked')?.value),
      captions: $$('#dlgBody [data-cap]').map((t) => ({ index: Number(t.dataset.cap), caption: t.value.trim() })),
      add: $$('#dlgBody [data-add]:checked').map((c) => c.dataset.add),
    };
    $('#dlg').close();
    patchReport({ photos });
  };
}
function patchReport(body) { return busy(async () => { S = await api(`api/sessions/${S.id}/report`, { method: 'PATCH', body: JSON.stringify(body) }); }); }

const WORDING = [
  ['cover.title', 'Cover title'], ['cover.subtitle', 'Cover subtitle'], ['cover.highlight', 'Cover highlight (marker)'],
  ['ceoLetter.salutation', 'CEO letter greeting'], ['ceoLetter.paragraphs', 'CEO letter (blank line between paragraphs)', 'p'],
  ['project.heading', 'Project heading'], ['project.lead', 'Project lead'], ['project.paragraphs', 'Project text', 'p'],
  ['impact.heading', 'Impact heading'], ['impact.intro', 'Impact intro'],
  ['story.heading', 'Story heading'], ['story.paragraphs', 'Story', 'p'], ['story.quote', 'Quote'], ['story.quoteAttribution', 'Quote by'],
  ['money.heading', 'Money heading'], ['money.intro', 'Money intro'], ['money.note', 'Money note'],
  ['ahead.heading', 'Looking ahead heading'], ['ahead.paragraphs', 'Looking ahead', 'p'], ['ahead.bullets', 'Looking ahead bullets (one per line)', 'l'],
  ['thankYou.heading', 'Thank-you heading'], ['thankYou.message', 'Thank-you message'],
];
function editWording() {
  const c = S.report.copy;
  const g = (p) => p.split('.').reduce((o, k) => o?.[k], c);
  const rtl = S.report.language === 'ar' ? ' dir="rtl"' : '';
  openDialog(`<h2>${t('Edit wording')}</h2>${WORDING.map(([k, l, ty]) => { const v = g(k); const txt = Array.isArray(v) ? v.join(ty === 'l' ? '\n' : '\n\n') : v ?? ''; return `<label>${t(l)}<textarea data-w="${k}" data-t="${ty || ''}" rows="${ty ? 5 : 1}"${rtl}>${esc(txt)}</textarea></label>`; }).join('')}
    <div class="acts"><button type="button" class="ghost" data-close>${t('Cancel')}</button><button type="button" class="primary" id="wSave">${t('Save & update')}</button></div>`);
  $('#wSave').onclick = () => {
    const copy = structuredClone(c);
    $$('#dlgBody [data-w]').forEach((t) => {
      const [a, b] = t.dataset.w.split('.');
      copy[a][b] = t.dataset.t === 'p' ? t.value.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean) : t.dataset.t === 'l' ? t.value.split('\n').map((x) => x.trim()).filter(Boolean) : t.value;
    });
    $('#dlg').close();
    patchReport({ copy });
  };
}

// ---------------- dialogs, history, new, tabs ----------------
function openDialog(html) {
  $('#dlgBody').innerHTML = html;
  $$('#dlgBody [data-close]').forEach((b) => (b.onclick = () => $('#dlg').close()));
  $('#dlg').showModal();
}
$('#btnHistory').onclick = async () => {
  const list = await api('api/sessions');
  openDialog(`<h2>${t('My reports')}</h2>${list.length ? list.map((r) => `<div class="hist"><div><b>${esc(r.donor)}</b><br><small>${esc(r.project)} · ${new Date(r.updatedAt).toLocaleDateString(LANG === 'ar' ? 'ar' : 'en-ZA')}${r.hasReport ? ` · ${t('PDF ready')}` : ''}</small></div><span class="hist-acts"><button type="button" class="ghost sm" data-open="${r.id}">${t('Open')}</button><button type="button" class="del" data-delete="${r.id}" title="${t('Delete this report')}">${t('Delete')}</button></span></div>`).join('') : `<p>${t('No reports yet.')}</p>`}<div class="acts"><button type="button" class="ghost" data-close>${t('Close')}</button></div>`);
  $$('[data-delete]').forEach((b) => (b.onclick = async () => {
    if (!confirm(t('Delete this report and its photos? This cannot be undone.'))) return;
    await api(`api/sessions/${b.dataset.delete}`, { method: 'DELETE' });
    b.closest('.hist').style.display = 'none';
    if (b.dataset.delete === S.id) $('#btnNew').click();
  }));
  $$('[data-open]').forEach((b) => (b.onclick = async () => { S = await api(`api/sessions/${b.dataset.open}`); $('#dlg').close(); $('#result').hidden = true; remember(); renderAll(); if (S.report) showResult(); }));
};
$('#btnNew').onclick = async () => { S = await api('api/sessions', { method: 'POST' }); $('#result').hidden = true; remember(); renderAll(); $('#msg').focus(); };
$$('.tab-btn').forEach((b) => (b.onclick = () => {
  $('#studio').classList.toggle('show-card', b.dataset.tab === 'card');
  $$('.tab-btn').forEach((x) => x.classList.toggle('on', x === b));
}));
$('.tab-btn[data-tab="chat"]').classList.add('on');

// When an admin changes settings, open Studio tabs pick them up the next time
// they are focused (only if nothing is being typed or processed).
async function checkForNewSettings() {
  if (document.hidden || thinking || $('#msg').value.trim() || !$('#result').hidden) return;
  try {
    const c = await (await fetch('api/public-config')).json();
    if (c.version && c.version !== ST.version) location.reload();
  } catch {}
}
document.addEventListener('visibilitychange', checkForNewSettings);
window.addEventListener('focus', checkForNewSettings);
setInterval(checkForNewSettings, 60000);
