// Admin dashboard: users, usage, reports and every setting of the report engine.
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const fmtDate = (d) => (d ? new Date(d).toLocaleString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Never');
const fmtDay = (d) => (d ? new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const usd = (n) => `$${(n || 0).toFixed(n < 1 ? 3 : 2)}`;
const num = (n) => (n || 0).toLocaleString('en-ZA');
// Section links (admin#users, #users…) switch sections in place. The page has a
// <base href> (so it can live under a path like /acme), which would otherwise
// send bare "#…" links to the Studio home page.
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
  const m = a.getAttribute('href').match(/^(?:admin)?(#[\w-]*)$/);
  if (!m) return;
  e.preventDefault();
  if (location.hash !== m[1]) location.hash = m[1];
});
const initials = (n) => String(n || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

async function api(url, opts = {}) {
  const isForm = opts.body instanceof FormData;
  const res = await fetch(url, { ...opts, headers: isForm ? undefined : { 'Content-Type': 'application/json' }, body: opts.body && !isForm && typeof opts.body !== 'string' ? JSON.stringify(opts.body) : opts.body });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) location.href = 'login?next=admin';
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
function toast(msg, err = false, ms = 3500) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = `toast${err ? ' err' : ''}`;
  t.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => (t.hidden = true), ms);
}
function dialog(html, onOpen) {
  $('#dlg').onclose = null; // drop handlers left over from a previous dialog
  $('#dlgBody').innerHTML = html;
  $$('#dlgBody [data-close]').forEach((b) => (b.onclick = () => $('#dlg').close()));
  $('#dlg').showModal();
  onOpen?.($('#dlgBody'));
}
const confirmBox = (title, text, okLabel = 'Confirm', danger = false) =>
  new Promise((resolve) => {
    dialog(`<h2>${esc(title)}</h2><p>${text}</p><div class="actions"><button class="btn" data-close>Cancel</button><button class="btn ${danger ? 'danger' : 'primary'}" id="okBtn">${esc(okLabel)}</button></div>`, (el) => {
      $('#okBtn', el).onclick = () => { $('#dlg').close(); resolve(true); };
      $('#dlg').onclose = () => resolve(false);
    });
  });
const copy = async (text) => { try { await navigator.clipboard.writeText(text); toast('Copied to clipboard'); } catch { toast('Copy failed: please select and copy manually', true); } };

// ---------- boot ----------
let ME;
let SV; // { settings, defaults, styles, styleIds, version }
try {
  ME = (await api('api/me')).user;
} catch {
  location.href = 'login?next=admin';
}
if (ME.role !== 'admin') location.href = './';
SV = await api('api/admin/settings');
applyChrome();

function applyChrome() {
  const s = SV.settings;
  document.documentElement.style.setProperty('--blue', s.colors.blue);
  ['purple', 'teal', 'green', 'yellow'].forEach((k) => document.documentElement.style.setProperty(`--${k}`, s.colors[k]));
  $('#topLogo').src = `brand/${s.logos.white}?v=${SV.version}`;
  $('#topOrg').textContent = `${s.org.orgName} · ${s.studio.title}`;
  $('#meBtn').textContent = initials(ME.name);
  $('#meBtn').title = `${ME.name} (${ME.username})`;
}

$('#meBtn').onclick = (e) => { e.stopPropagation(); $('#meMenu').hidden = !$('#meMenu').hidden; };
document.addEventListener('click', () => ($('#meMenu').hidden = true));
$('#signOut').onclick = async () => { await api('api/auth/logout', { method: 'POST' }); location.href = 'login'; };
$('#menuBtn').onclick = () => $('#side').classList.toggle('open');

const SECTIONS = { overview, users, usage, reports, branding, ceo, assistant, languages, styles, ai, account };
async function go() {
  const id = (location.hash.slice(1) || 'overview').split('?')[0];
  const fn = SECTIONS[id] || overview;
  $$('#side a').forEach((a) => a.classList.toggle('on', a.dataset.s === id));
  $('#side').classList.remove('open');
  $('#main').innerHTML = '<p class="muted">Loading…</p>';
  try {
    await fn($('#main'));
  } catch (e) {
    $('#main').innerHTML = `<div class="notice warn">Couldn’t load this page: ${esc(e.message)}</div>`;
  }
  window.scrollTo(0, 0);
}

const head = (title, sub, right = '') => `<div class="head"><div><h1>${esc(title)}</h1>${sub ? `<p>${sub}</p>` : ''}</div><div>${right}</div></div>`;

// Save a settings section and refresh local state.
async function saveSettings(patch, msg = 'Saved. Changes are live in the Studio and new reports.') {
  SV = await api('api/admin/settings', { method: 'PATCH', body: patch });
  applyChrome();
  toast(msg);
}
async function resetSection(section, label) {
  if (!(await confirmBox(`Reset ${label}?`, `This restores the original ${label.toLowerCase()} settings. You can change them again afterwards.`, 'Reset'))) return false;
  SV = await api('api/admin/settings/reset', { method: 'POST', body: { section } });
  applyChrome();
  toast(`${label} reset to defaults`);
  return true;
}

// ===================================================================
// OVERVIEW
// ===================================================================
const EVENT_LABEL = {
  login: 'signed in', message: 'chatted with the assistant', photo: 'uploaded photos', report: 'created a report', update: 'updated a report', rewrite: 'asked for a rewrite', download: 'downloaded a PDF', session: 'started a new report', password: 'changed their password', ai: 'used AI', admin: 'changed admin settings',
};
const describe = (e) => {
  if (e.type === 'report') return `created a report for <b>${esc(e.donor || 'a donor')}</b> (${esc(e.styleId || '')}, ${e.pages || ''} pages)`;
  if (e.type === 'photo') return `uploaded ${e.count || 1} photo${e.count === 1 ? '' : 's'}`;
  if (e.type === 'admin') return `admin: ${esc((e.action || '').replace('.', ' '))}${e.target ? ` (${esc(e.target)})` : ''}`;
  if (e.type === 'ai') return `used Claude for ${esc(e.purpose || 'AI')} (${num(e.inTok + e.outTok)} tokens, ${usd(e.cost)})`;
  return EVENT_LABEL[e.type] || esc(e.type);
};
function chart(daily, key, fmt = num) {
  const max = Math.max(1, ...daily.map((d) => d[key]));
  return `<div class="chart">${daily.map((d) => `<div style="height:${(d[key] / max) * 100}%" data-t="${fmtDay(d.date)}: ${fmt(d[key])}"></div>`).join('')}</div>
    <div class="chart-x"><span>${fmtDay(daily[0]?.date)}</span><span>${fmtDay(daily.at(-1)?.date)}</span></div>`;
}
function aiCard(ai) {
  const cls = ai.ok ? 'ok' : ai.off ? 'warn' : 'bad';
  return `<div class="status ${cls}"><span class="dot"></span><div><b>${ai.ok ? 'Claude is connected' : ai.off ? 'AI is switched off' : 'AI needs attention'}</b>
    <span class="small">${ai.ok ? `Model ${esc(ai.model)} · key from ${esc(ai.source)} (${esc(ai.key)})` : esc(ai.problem || '')}</span></div></div>`;
}

async function overview(el) {
  const o = await api('api/admin/overview');
  const t = o.usage.totals;
  el.innerHTML = `${head('Overview', `Welcome back, ${esc(ME.name.split(' ')[0])}. Here’s how the Studio is being used in the last 30 days.`, '<a class="btn primary" href="admin#users">+ Add a user</a>')}
    ${o.placeholders?.length ? `<div class="notice warn"><b>Before sharing reports:</b> the ${esc(o.placeholders.join(' and '))} under Branding still hold placeholder values, so they are left off reports for now. <a href="admin#branding">Add the real details</a>.</div>` : ''}
    ${o.storage.persistent ? '' : `<div class="notice warn"><b>Important:</b> permanent storage isn’t set up yet, so users, settings and reports are lost whenever the server restarts. In Render, add a <b>Disk</b> mounted at <code>/data</code> and the environment variable <code>DATA_DIR=/data</code>.</div>`}
    ${o.ai.ok ? '' : `<div class="notice warn"><b>AI:</b> ${esc(o.ai.problem)} <a href="admin#ai">Fix it in AI connection →</a></div>`}
    ${setupCard(o)}
    <div class="kpis">
      <div class="kpi"><span>Reports (30 days)</span><b>${num(o.reports.last30)}</b><small>${num(o.reports.total)} in total</small></div>
      <div class="kpi"><span>Active users</span><b>${num(o.users.active)}</b><small>${num(o.users.admins)} admin${o.users.admins === 1 ? '' : 's'}</small></div>
      <div class="kpi"><span>Conversations</span><b>${num(t.messages)}</b><small>${num(t.photos)} photos uploaded</small></div>
      <div class="kpi"><span>AI cost (30 days)</span><b>${usd(t.cost)}</b><small>${num(t.aiCalls)} Claude calls (estimate)</small></div>
    </div>
    <div class="grid2">
      <div class="card"><h2>Reports created <small>per day</small></h2>${chart(o.usage.daily, 'reports')}</div>
      <div class="card"><h2>AI connection</h2>${aiCard(o.ai)}<div class="actions"><a class="btn sm" href="admin#ai">Manage</a></div>
        <h2 style="margin-top:14px">Drafts in progress</h2><p class="muted">${num(o.reports.drafts)} conversation${o.reports.drafts === 1 ? '' : 's'} without a finished report yet.</p></div>
    </div>
    <div class="grid2">
      <div class="card"><h2>Most active people</h2>${o.usage.perUser.slice(0, 6).length ? `<table><tr><th>Person</th><th class="num">Reports</th><th class="num">Messages</th></tr>${o.usage.perUser.slice(0, 6).map((u) => `<tr><td>${esc(u.name)}</td><td class="num">${u.reports}</td><td class="num">${u.messages}</td></tr>`).join('')}</table>` : '<p class="empty">No activity yet.</p>'}</div>
      <div class="card"><h2>Recent activity</h2>${feed(o.usage.recent.filter((e) => e.type !== 'ai').slice(0, 10))}</div>
    </div>`;
  if ($('#demoReset')) $('#demoReset').onclick = async () => {
    if (!confirm('Reset the demo? This puts back the demo organisation, its colours and logo, and deletes all reports and uploaded photos. Users are kept.')) return;
    $('#demoReset').disabled = true;
    await api('api/admin/demo/reset', { method: 'POST' });
    SV = await api('api/admin/settings');
    applyChrome();
    toast('Demo reset. The illustrations and style previews refresh in a few seconds.');
    go();
  };
}

// Getting started: the few steps that make the Studio the organisation's own.
function setupCard(o) {
  const steps = o.setup || [];
  const done = steps.filter((x) => x.done).length;
  if (!steps.length || (done === steps.length && !o.demo)) return '';
  return `<div class="card setup"><div class="setup-head"><h2>Getting started <small>${done} of ${steps.length} done</small></h2>${o.demo ? '<button class="btn sm" id="demoReset">Reset demo</button>' : ''}</div>
    <div class="setup-bar"><i style="width:${Math.round((done / steps.length) * 100)}%"></i></div>
    <ol class="setup-list">${steps.map((x, i) => `<li class="${x.done ? 'done' : ''}"><span class="n">${x.done ? '✓' : i + 1}</span><a href="admin#${x.href}">${esc(x.label)}</a></li>`).join('')}</ol></div>`;
}
const feed = (items) => (items.length ? `<ul class="feed">${items.map((e) => `<li><time>${fmtDate(e.t)}</time><span><b>${esc(e.name)}</b> ${describe(e)}</span></li>`).join('')}</ul>` : '<p class="empty">Nothing yet.</p>');

// ===================================================================
// USERS
// ===================================================================
async function users(el) {
  const [list, usage] = await Promise.all([api('api/admin/users'), api('api/admin/usage?days=30')]);
  const repByUser = Object.fromEntries(usage.perUser.map((u) => [u.userId, u]));
  el.innerHTML = `${head('Users', 'Create a unique sign-in for each person. Staff can use the Studio; admins can also use this dashboard.', '<button class="btn primary" id="addUser">+ Add user</button>')}
    <div class="card tablewrap"><table>
      <tr><th>Person</th><th>Username</th><th>Role</th><th>Status</th><th>Last sign-in</th><th class="num">Reports (30d)</th><th></th></tr>
      ${list.map((u) => `<tr>
        <td><div class="who"><span class="av">${esc(initials(u.name))}</span><div><b>${esc(u.name)}</b>${u.id === ME.id ? ' <span class="pill staff">You</span>' : ''}<div class="small muted">${esc(u.email || '')}</div></div></div></td>
        <td><code>${esc(u.username)}</code></td>
        <td><span class="pill ${u.role}">${u.role === 'admin' ? 'Admin' : 'Staff'}</span></td>
        <td><span class="pill ${u.active ? 'on' : 'off'}">${u.active ? 'Active' : 'Disabled'}</span>${u.mustChange && u.active ? ' <span class="pill warn" title="Has a temporary password">New password pending</span>' : ''}</td>
        <td class="small">${fmtDate(u.lastLoginAt)}</td>
        <td class="num">${repByUser[u.id]?.reports || 0}</td>
        <td><div class="row-acts">
          <button class="btn sm" data-edit="${u.id}">Edit</button>
          <button class="btn sm" data-reset="${u.id}">Reset password</button>
          ${u.id === ME.id ? '' : `<button class="btn sm" data-toggle="${u.id}">${u.active ? 'Disable' : 'Enable'}</button><button class="btn sm danger" data-del="${u.id}">Delete</button>`}
        </div></td></tr>`).join('')}
    </table></div>
    <div class="notice info">Usernames are unique and can’t be changed. To rename someone, edit their full name. New users get a temporary password and must choose their own at first sign-in.</div>`;
  const byId = Object.fromEntries(list.map((u) => [u.id, u]));
  $('#addUser').onclick = addUserDialog;
  $$('[data-edit]').forEach((b) => (b.onclick = () => editUserDialog(byId[b.dataset.edit])));
  $$('[data-reset]').forEach((b) => (b.onclick = async () => {
    const u = byId[b.dataset.reset];
    if (!(await confirmBox('Reset password?', `${esc(u.name)} will get a new temporary password and be signed out everywhere. They’ll choose their own password at next sign-in.`, 'Reset password'))) return;
    const r = await api(`api/admin/users/${u.id}/reset-password`, { method: 'POST' });
    showCredentials(u.username, r.password, `New password for ${u.name}`);
    if (u.id === ME.id) setTimeout(() => (location.href = 'login'), 4000);
  }));
  $$('[data-toggle]').forEach((b) => (b.onclick = async () => {
    const u = byId[b.dataset.toggle];
    try {
      await api(`api/admin/users/${u.id}`, { method: 'PATCH', body: { active: !u.active } });
      toast(u.active ? `${u.name} can no longer sign in` : `${u.name} can sign in again`);
      go();
    } catch (e) { toast(e.message, true); }
  }));
  $$('[data-del]').forEach((b) => (b.onclick = async () => {
    const u = byId[b.dataset.del];
    if (!(await confirmBox('Delete user?', `Delete <b>${esc(u.name)}</b> (${esc(u.username)})? Their reports are kept and stay visible to admins. This can’t be undone.`, 'Delete', true))) return;
    try {
      await api(`api/admin/users/${u.id}`, { method: 'DELETE' });
      toast('User deleted');
      go();
    } catch (e) { toast(e.message, true); }
  }));
}

function showCredentials(username, password, title = 'User created') {
  const text = `Sign in at: ${location.origin}/login\nUsername: ${username}\nTemporary password: ${password}\n\nYou'll be asked to choose your own password when you first sign in.`;
  dialog(`<h2>${esc(title)}</h2><p>Share these sign-in details with the person privately. <b>This password is shown only once.</b></p>
    <div class="cred">${esc(text)}</div>
    <div class="actions"><button class="btn" id="cpy">Copy details</button><button class="btn primary" data-close>Done</button></div>`, (el) => {
    $('#cpy', el).onclick = () => copy(text);
    $('#dlg').onclose = () => go();
  });
}

function addUserDialog() {
  dialog(`<h2>Add a user</h2>
    <form id="uf" class="form">
      <label class="f full">Full name<input id="uName" required placeholder="e.g. Fatima Patel"></label>
      <label class="f">Username <small>(unique, used to sign in)</small><input id="uUser" required pattern="[a-z0-9][a-z0-9._\\-]{2,31}" placeholder="e.g. fatima.patel" autocapitalize="none" spellcheck="false"></label>
      <label class="f">Email <small>(optional)</small><input id="uEmail" type="email" placeholder="name@organisation.org"></label>
      <label class="f">Role<select id="uRole"><option value="staff">Staff: uses the Studio</option><option value="admin">Admin: Studio + this dashboard</option></select></label>
      <label class="f">Password<select id="uPwMode"><option value="gen">Generate a temporary password</option><option value="set">I’ll set one</option></select></label>
      <label class="f full" id="uPwWrap" hidden>Temporary password <small>(10+ characters with a number)</small><input id="uPw" type="text" autocomplete="off"></label>
      <p class="err full" id="uErr" style="color:var(--red);margin:0"></p>
      <div class="actions full"><button type="button" class="btn" data-close>Cancel</button><button class="btn primary" type="submit">Create user</button></div>
    </form>`, (el) => {
    let touched = false;
    $('#uName', el).oninput = () => {
      if (touched) return;
      $('#uUser', el).value = $('#uName', el).value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '').slice(0, 32);
    };
    $('#uUser', el).oninput = () => (touched = true);
    $('#uPwMode', el).onchange = () => ($('#uPwWrap', el).hidden = $('#uPwMode', el).value !== 'set');
    $('#uf', el).onsubmit = async (e) => {
      e.preventDefault();
      try {
        const r = await api('api/admin/users', { method: 'POST', body: { name: $('#uName', el).value, username: $('#uUser', el).value, email: $('#uEmail', el).value, role: $('#uRole', el).value, password: $('#uPwMode', el).value === 'set' ? $('#uPw', el).value : undefined } });
        showCredentials(r.user.username, r.password, `${r.user.name} can now sign in`);
      } catch (err) {
        $('#uErr', el).textContent = err.message;
      }
    };
    $('#uName', el).focus();
  });
}

function editUserDialog(u) {
  dialog(`<h2>Edit ${esc(u.name)}</h2>
    <form id="ef" class="form">
      <label class="f full">Full name<input id="eName" value="${esc(u.name)}" required></label>
      <label class="f">Username<input value="${esc(u.username)}" disabled></label>
      <label class="f">Email<input id="eEmail" type="email" value="${esc(u.email)}"></label>
      <label class="f full">Role<select id="eRole" ${u.id === ME.id ? 'disabled' : ''}><option value="staff" ${u.role === 'staff' ? 'selected' : ''}>Staff: uses the Studio</option><option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin: Studio + this dashboard</option></select></label>
      <p class="err full" id="eErr" style="color:var(--red);margin:0"></p>
      <div class="actions full"><button type="button" class="btn" id="eSignout">Sign out of all devices</button><button type="button" class="btn" data-close>Cancel</button><button class="btn primary" type="submit">Save</button></div>
    </form>`, (el) => {
    $('#eSignout', el).onclick = async () => {
      await api(`api/admin/users/${u.id}/sign-out`, { method: 'POST' });
      toast(`${u.name} has been signed out everywhere`);
      if (u.id === ME.id) location.href = 'login';
    };
    $('#ef', el).onsubmit = async (e) => {
      e.preventDefault();
      try {
        const body = { name: $('#eName', el).value, email: $('#eEmail', el).value };
        if (u.id !== ME.id) body.role = $('#eRole', el).value;
        await api(`api/admin/users/${u.id}`, { method: 'PATCH', body });
        $('#dlg').close();
        toast('Saved');
        go();
      } catch (err) {
        $('#eErr', el).textContent = err.message;
      }
    };
  });
}

// ===================================================================
// USAGE
// ===================================================================
let usageDays = 30;
async function usage(el) {
  const u = await api(`api/admin/usage?days=${usageDays}`);
  const t = u.totals;
  el.innerHTML = `${head('Usage', 'Who is using the Studio, how much, and what Claude costs. AI costs are estimates from token counts.', `<div class="chips">${[7, 30, 90, 365].map((d) => `<button class="chip ${d === usageDays ? 'on' : ''}" data-days="${d}">${d === 365 ? '1 year' : `${d} days`}</button>`).join('')}</div>`)}
    <div class="kpis">
      <div class="kpi"><span>Reports created</span><b>${num(t.reports)}</b><small>${num(t.updates)} updates · ${num(t.downloads)} downloads</small></div>
      <div class="kpi"><span>Messages</span><b>${num(t.messages)}</b><small>${num(t.photos)} photos</small></div>
      <div class="kpi"><span>Sign-ins</span><b>${num(t.logins)}</b><small>across all users</small></div>
      <div class="kpi"><span>AI cost (estimate)</span><b>${usd(t.cost)}</b><small>${num(t.inTok + t.outTok)} tokens · ${num(t.aiCalls)} calls</small></div>
    </div>
    <div class="grid2">
      <div class="card"><h2>Reports per day</h2>${chart(u.daily, 'reports')}</div>
      <div class="card"><h2>AI cost per day</h2>${chart(u.daily, 'cost', usd)}</div>
    </div>
    <div class="card tablewrap"><h2>By person</h2><table>
      <tr><th>Person</th><th class="num">Reports</th><th class="num">Updates</th><th class="num">Downloads</th><th class="num">Messages</th><th class="num">Photos</th><th class="num">Claude calls</th><th class="num">Tokens</th><th class="num">Est. cost</th><th>Last active</th></tr>
      ${u.perUser.map((p) => `<tr><td><b>${esc(p.name)}</b><div class="small muted">${esc(p.username)}</div></td><td class="num">${p.reports}</td><td class="num">${p.updates}</td><td class="num">${p.downloads}</td><td class="num">${p.messages}</td><td class="num">${p.photos}</td><td class="num">${p.aiCalls}</td><td class="num">${num(p.inTok + p.outTok)}</td><td class="num">${usd(p.cost)}</td><td class="small">${fmtDate(p.lastActive)}</td></tr>`).join('')}
    </table></div>
    <div class="card"><h2>Activity log</h2>${feed(u.recent.slice(0, 40))}</div>`;
  $$('[data-days]').forEach((b) => (b.onclick = () => { usageDays = Number(b.dataset.days); go(); }));
}

// ===================================================================
// REPORTS
// ===================================================================
async function reports(el) {
  const list = await api('api/admin/reports');
  const styleName = Object.fromEntries(SV.styles.map((s) => [s.id, s.name]));
  el.innerHTML = `${head('Reports', 'Every report and draft created in the Studio, by everyone.', '<input id="q" placeholder="Search donor, project or person…" style="min-width:260px">')}
    <div class="card tablewrap"><table id="rt">
      <tr><th>Donor</th><th>Project</th><th>Created by</th><th>Style</th><th>Status</th><th>Updated</th><th></th></tr>
      ${list.map((r) => `<tr data-q="${esc(`${r.donor} ${r.project} ${r.ownerName}`.toLowerCase())}">
        <td><b>${esc(r.donor || '(no donor yet)')}</b>${r.givingType ? `<div class="small muted">${esc(r.givingType)}</div>` : ''}</td>
        <td class="small">${esc(r.project)}</td><td class="small">${esc(r.ownerName || '—')}</td>
        <td class="small">${r.hasReport ? `${esc(styleName[r.styleId] || r.styleId)} · ${r.pages}p` : ''}</td>
        <td>${r.hasReport ? '<span class="pill on">PDF ready</span>' : '<span class="pill warn">Draft</span>'}</td>
        <td class="small">${fmtDate(r.updatedAt)}</td>
        <td><div class="row-acts"><a class="btn sm" href="./#s=${r.id}" target="_blank" rel="noopener">Open</a>${r.hasReport ? `<a class="btn sm" href="reports/${r.id}/pdf">PDF</a>` : ''}<button class="btn sm danger" data-del="${r.id}">Delete</button></div></td></tr>`).join('') || '<tr><td colspan="7" class="empty">No reports yet.</td></tr>'}
    </table></div>`;
  $('#q').oninput = () => { const q = $('#q').value.toLowerCase(); $$('#rt tr[data-q]').forEach((tr) => (tr.style.display = tr.dataset.q.includes(q) ? '' : 'none')); };
  $$('[data-del]').forEach((b) => (b.onclick = async () => {
    if (!(await confirmBox('Delete report?', 'This permanently deletes the report, its conversation and its photos.', 'Delete', true))) return;
    await api(`api/admin/reports/${b.dataset.del}`, { method: 'DELETE' });
    toast('Report deleted');
    go();
  }));
}

// ===================================================================
// BRANDING
// ===================================================================
const COLOR_LABELS = { blue: 'Primary', purple: 'Secondary', teal: 'Accent 1', green: 'Accent 2', yellow: 'Highlight', warmGrey: 'Soft background', ink: 'Text colour' };
// One-click colour themes for demos and quick starts.
const LOOKS = [
  { name: 'Horizon', c: { blue: '#1B5FAA', purple: '#6A4C93', teal: '#2A9D8F', green: '#7CB342', yellow: '#FFC93C', warmGrey: '#ECE8E2', ink: '#1F2328' } },
  { name: 'Forest', c: { blue: '#1E6B4F', purple: '#3D5A80', teal: '#4E9F9A', green: '#9BC24A', yellow: '#F2C14E', warmGrey: '#EEE9DF', ink: '#1E2421' } },
  { name: 'Sunrise', c: { blue: '#C2410C', purple: '#5B3A8C', teal: '#0E7C86', green: '#84A93A', yellow: '#FDBA3B', warmGrey: '#F3ECE4', ink: '#25211F' } },
  { name: 'Royal', c: { blue: '#3B2A80', purple: '#8E3B8A', teal: '#2E8BA8', green: '#6BA86B', yellow: '#F4C542', warmGrey: '#EDE9F2', ink: '#211D2E' } },
  { name: 'Ocean', c: { blue: '#0B6E99', purple: '#4E5BA6', teal: '#19A7A0', green: '#7DC27A', yellow: '#FFD15C', warmGrey: '#E9EEF1', ink: '#1B2730' } },
  { name: 'Ruby', c: { blue: '#A61E4D', purple: '#5C2A7A', teal: '#1F8A8A', green: '#8AB547', yellow: '#F9C74F', warmGrey: '#F2EAE6', ink: '#261C20' } },
];
function assetSlot(slot, label, file, { dark = false, hint = '', removable = true } = {}) {
  return `<div class="asset"><b>${esc(label)}</b><div class="pv ${dark ? 'dark' : ''}">${file ? `<img src="brand/${esc(file)}?v=${SV.version}" alt="">` : '<span class="muted small">Not set</span>'}</div>
    ${hint ? `<span class="small muted">${hint}</span>` : ''}
    <div class="btns"><label class="btn sm primary">Upload<input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" hidden data-slot="${slot}"></label>${removable && file && file.startsWith('custom-') ? `<button class="btn sm" data-unslot="${slot}">Use default</button>` : ''}</div></div>`;
}
function wireAssets(el, after) {
  $$('[data-slot]', el).forEach((inp) => (inp.onchange = async () => {
    if (!inp.files[0]) return;
    const fd = new FormData();
    fd.append('file', inp.files[0]);
    toast('Uploading…');
    try {
      SV = await api(`api/admin/assets/${inp.dataset.slot}`, { method: 'POST', body: fd });
      applyChrome();
      toast('Uploaded. It’s now used in the Studio and in new reports.');
      after();
    } catch (e) { toast(e.message, true); }
  }));
  $$('[data-unslot]', el).forEach((b) => (b.onclick = async () => {
    SV = await api(`api/admin/assets/${b.dataset.unslot}`, { method: 'DELETE' });
    applyChrome();
    toast('Back to the default image');
    after();
  }));
}

async function branding(el) {
  const s = SV.settings;
  const draft = { org: { ...s.org }, colors: { ...s.colors }, studio: { ...s.studio }, signin: { images: [...(s.signin?.images || [])], headline: s.signin?.headline || '' } };
  const f = (sec, k, label, ph = '') => `<label class="f">${label}<input data-sec="${sec}" data-k="${k}" value="${esc(draft[sec][k])}" placeholder="${esc(ph)}"></label>`;
  el.innerHTML = `${head('Branding', 'Organisation details, colours, logos and photos. These apply to the Studio and to every new report.')}
    <div class="card"><h2>Quick looks <small>one click restyles the Studio, every report and the illustrations</small></h2>
      <div class="looks">${LOOKS.map((l, i) => `<button class="look" data-look="${i}" title="Apply the ${l.name} colours"><span class="look-sw">${['blue', 'purple', 'teal', 'yellow'].map((k) => `<i style="background:${l.c[k]}"></i>`).join('')}</span><b>${l.name}</b></button>`).join('')}</div></div>
    <div class="card"><h2>Organisation</h2><div class="form">
      ${f('org', 'orgName', 'Organisation name')}${f('org', 'shortName', 'Short name')}
      ${f('org', 'tagline', 'Tagline')}${f('studio', 'title', 'Studio name (top of the app)')}
      ${f('org', 'website', 'Website')}${f('org', 'email', 'Email')}
      ${f('org', 'phone', 'Phone')}${f('org', 'socials', 'Social handle')}
      ${f('org', 'address', 'Address / city')}${f('org', 'registration', 'Registration numbers (optional)')}
      ${f('org', 'currency', 'Currency symbol', 'e.g. R, $, £, €, KSh')}
      <label class="f full">About the organisation <small>one or two sentences; helps the AI write in context</small><textarea data-sec="org" data-k="about" rows="2">${esc(draft.org.about || '')}</textarea></label>
    </div></div>
    <div class="grid2">
      <div class="card"><h2>Colours <small>or pick a quick look above</small></h2><div class="swatches">
        ${Object.keys(COLOR_LABELS).map((k) => `<div class="sw"><input type="color" data-color="${k}" value="${esc(draft.colors[k])}"><div><b>${COLOR_LABELS[k]}</b><input type="text" data-hex="${k}" value="${esc(draft.colors[k])}" maxlength="7"></div></div>`).join('')}
      </div><div class="actions"><button class="btn sm" id="resetColors">Reset to default colours</button></div></div>
      <div class="card"><h2>Preview</h2><div class="preview-card" id="pv"><img src="brand/${esc(s.logos.white)}?v=${SV.version}" alt=""><span class="hl">Thank you</span><span class="k">Impact report 2026</span><h3>A library in every classroom</h3></div>
        <p class="small muted">Style previews, the default logo and the illustrations are redrawn in your colours a few seconds after you save.</p></div>
    </div>
    <div class="card"><h2>Logos</h2><div class="assets">
      ${assetSlot('logo-box', 'Logo in box (covers)', s.logos.box, { hint: 'Used top-right on report covers.' })}
      ${assetSlot('logo-colour', 'Colour logo (light backgrounds)', s.logos.colour)}
      ${assetSlot('logo-white', 'White logo (blue/dark backgrounds)', s.logos.white, { dark: true })}
    </div><p class="small muted">PNG with a transparent background works best (SVG and JPG also accepted). Until you upload one, a logo is drawn automatically from your name and colours.</p></div>
    <div class="card"><h2>Photo library <small>used when staff add few or no photos</small></h2>
      <p class="small muted">Add a few of your best photos of your work. They’re used (marked as illustrative) when a report needs more images. Until then, illustrations in your colours are used.</p>
      <div class="lib">${(SV.library || []).map((im) => `<figure><img src="${im.url}" alt=""><input data-lcap="${esc(im.file)}" value="${esc(im.alt)}" maxlength="120" title="Caption"><button class="btn sm danger" data-ldel="${esc(im.file)}">Remove</button></figure>`).join('') || '<p class="muted small">No photos yet.</p>'}</div>
      <div class="actions" style="justify-content:flex-start"><label class="btn primary">Add photos<input type="file" accept="image/*" multiple hidden id="libUp"></label></div></div>
    <div class="card"><h2>Sign-in page <small>photos that fade behind the sign-in box</small></h2>
      <label class="f full">Headline<input id="siHead" value="${esc(draft.signin.headline)}" maxlength="120" placeholder="Every donor deserves a beautiful thank-you"></label>
      <label class="f full" style="margin-top:12px">Photo links <small>one https link per line (up to 8). If none can load, your photo library or illustrations are shown instead.</small><textarea id="siImgs" rows="5" spellcheck="false">${esc(draft.signin.images.join('\n'))}</textarea></label>
      <div class="si-thumbs">${draft.signin.images.map((u) => `<img src="${esc(u)}" alt="" loading="lazy" onerror="this.classList.add('bad');this.title='This link could not be loaded'">`).join('')}</div></div>
    <div class="savebar"><button class="btn primary" id="saveB">Save branding</button></div>`;
  $('#siHead').oninput = (e) => (draft.signin.headline = e.target.value);
  $('#siImgs').oninput = (e) => (draft.signin.images = e.target.value.split('\n').map((l) => l.trim()).filter(Boolean));
  const preview = () => { const p = $('#pv'); p.style.background = draft.colors.blue; p.querySelector('.hl').style.background = draft.colors.yellow; p.querySelector('.hl').style.color = draft.colors.blue; p.querySelector('.k').style.color = draft.colors.yellow; };
  preview();
  $$('[data-sec]').forEach((i) => (i.oninput = () => (draft[i.dataset.sec][i.dataset.k] = i.value)));
  $$('[data-color]').forEach((i) => (i.oninput = () => { draft.colors[i.dataset.color] = i.value.toUpperCase(); $(`[data-hex="${i.dataset.color}"]`).value = i.value.toUpperCase(); preview(); }));
  $$('[data-hex]').forEach((i) => (i.oninput = () => { if (/^#[0-9a-fA-F]{6}$/.test(i.value)) { draft.colors[i.dataset.hex] = i.value.toUpperCase(); $(`[data-color="${i.dataset.hex}"]`).value = i.value; preview(); } }));
  $('#resetColors').onclick = async () => { if (await resetSection('colors', 'Colours')) go(); };
  $$('[data-look]').forEach((b) => (b.onclick = async () => {
    const l = LOOKS[+b.dataset.look];
    try {
      await saveSettings({ colors: l.c });
      toast(`${l.name} colours applied. Reports, the logo and illustrations update in a few seconds.`);
      go();
    } catch (e) { toast(e.message, true); }
  }));
  $('#libUp').onchange = async (e) => {
    const files = [...e.target.files];
    if (!files.length) return;
    const fd = new FormData();
    files.forEach((f) => fd.append('photos', f));
    toast(`Uploading ${files.length} photo${files.length > 1 ? 's' : ''}…`);
    try { SV.library = await api('api/admin/library', { method: 'POST', body: fd }); toast('Added to your photo library.'); go(); } catch (err) { toast(err.message, true); }
  };
  $$('[data-lcap]').forEach((i) => (i.onchange = async () => { SV.library = await api(`api/admin/library/${encodeURIComponent(i.dataset.lcap)}`, { method: 'PATCH', body: JSON.stringify({ alt: i.value }) }); toast('Caption saved'); }));
  $$('[data-ldel]').forEach((b) => (b.onclick = async () => { SV.library = await api(`api/admin/library/${encodeURIComponent(b.dataset.ldel)}`, { method: 'DELETE' }); go(); }));
  $('#saveB').onclick = async () => { try { await saveSettings(draft); } catch (e) { toast(e.message, true); } };
  wireAssets(el, go);
}

// ===================================================================
// CEO & LETTER
// ===================================================================
async function ceo(el) {
  const s = SV.settings;
  const d = { ...s.ceo };
  el.innerHTML = `${head('CEO & thank-you letter', 'Every report includes a personal thank-you letter from your CEO. Set who signs it and what it always says.')}
    <div class="grid2">
      <div class="card"><h2>Who signs the letter</h2><div class="form">
        <label class="f full">Name<input id="cName" value="${esc(d.name)}"></label>
        <label class="f full">Title<input id="cTitle" value="${esc(d.title)}" placeholder="e.g. Chief Executive Officer"></label>
        <label class="f full">Closing line<input id="cClosing" value="${esc(d.closing)}" placeholder="With heartfelt gratitude,"></label>
      </div></div>
      <div class="card"><h2>Photo &amp; signature</h2><div class="assets">
        ${assetSlot('ceo-photo', 'CEO photo', d.photo, { hint: 'Head-and-shoulders photo works best. Until then, a placeholder with initials is used.' })}
        ${assetSlot('ceo-signature', 'Signature image (optional)', d.signature, { hint: 'Transparent PNG of the real signature.' })}
      </div>${d.signature ? '' : `<p class="small muted">No signature image, so the name is written in a script font:</p><div class="sig-preview" id="sigPv">${esc(d.name)}</div>`}</div>
    </div>
    <div class="card"><h2>Always include in the letter <small>optional</small></h2>
      <label class="f">Points the CEO wants in every letter (the AI weaves them in naturally)<textarea id="cPoints" rows="4" placeholder="e.g. Mention that 100% of donations reach our programmes. Invite them to our annual open day.">${esc(d.letterPoints)}</textarea></label>
      <p class="small muted">Staff can still add personal notes for a specific donor while chatting with the assistant.</p></div>
    <div class="savebar"><button class="btn primary" id="saveC">Save letter settings</button></div>`;
  $('#cName').oninput = () => { const p = $('#sigPv'); if (p) p.textContent = $('#cName').value; };
  $('#saveC').onclick = async () => {
    try {
      await saveSettings({ ceo: { name: $('#cName').value, title: $('#cTitle').value, closing: $('#cClosing').value, letterPoints: $('#cPoints').value } });
    } catch (e) { toast(e.message, true); }
  };
  wireAssets(el, go);
}

// ===================================================================
// ASSISTANT & QUESTIONS
// ===================================================================
async function assistant(el) {
  const s = SV.settings;
  const topics = structuredClone(s.agent.topics);
  const draw = () => {
    $('#topics').innerHTML = topics.map((t, i) => `<div class="topic ${t.enabled ? '' : 'off'}">
      <div class="ord"><b>${i + 1}</b><button class="icon-btn" data-up="${i}" ${i === 0 ? 'disabled' : ''} title="Move up">↑</button><button class="icon-btn" data-down="${i}" ${i === topics.length - 1 ? 'disabled' : ''} title="Move down">↓</button></div>
      <div class="flds"><input data-tl="${i}" value="${esc(t.label)}" placeholder="Short label"><textarea data-tq="${i}" rows="2" placeholder="The question the assistant asks">${esc(t.question)}</textarea></div>
      <div class="side-acts"><label class="switch"><input type="checkbox" data-te="${i}" ${t.enabled ? 'checked' : ''} ${t.required ? 'disabled' : ''}>${t.required ? 'Always on' : 'On'}</label>${t.builtin ? '<span class="small muted">Built-in</span>' : `<button class="btn sm danger" data-tdel="${i}">Remove</button>`}</div></div>`).join('');
    $$('[data-up]').forEach((b) => (b.onclick = () => { const i = +b.dataset.up; [topics[i - 1], topics[i]] = [topics[i], topics[i - 1]]; draw(); }));
    $$('[data-down]').forEach((b) => (b.onclick = () => { const i = +b.dataset.down; [topics[i + 1], topics[i]] = [topics[i], topics[i + 1]]; draw(); }));
    $$('[data-tl]').forEach((x) => (x.oninput = () => (topics[+x.dataset.tl].label = x.value)));
    $$('[data-tq]').forEach((x) => (x.oninput = () => (topics[+x.dataset.tq].question = x.value)));
    $$('[data-te]').forEach((x) => (x.onchange = () => { topics[+x.dataset.te].enabled = x.checked; draw(); }));
    $$('[data-tdel]').forEach((b) => (b.onclick = () => { topics.splice(+b.dataset.tdel, 1); draw(); }));
  };
  el.innerHTML = `${head('Assistant & questions', 'Shape how the assistant talks to staff and which questions it asks, in what order.')}
    <div class="grid2">
      <div class="card"><h2>Personality</h2><div class="form">
        <label class="f full">Assistant name<input id="aName" value="${esc(s.studio.assistantName)}" data-was="${esc(s.studio.assistantName)}"></label>
        <label class="f full">Opening greeting <small>Write {name} where the assistant’s name should appear</small><textarea id="aGreet" rows="4">${esc(s.studio.greeting)}</textarea></label>
      </div></div>
      <div class="card"><h2>Extra rules <small>optional</small></h2>
        <label class="f">Anything the assistant should always do or avoid<textarea id="aRules" rows="7" placeholder="e.g. Always ask whether the donor wants to remain anonymous. Never ask for donors’ ID numbers.">${esc(s.agent.extraRules)}</textarea></label></div>
    </div>
    <div class="card"><h2>Questions <small>asked in this order, skipping what staff have already said</small></h2>
      <div class="topics" id="topics"></div>
      <div class="actions" style="justify-content:flex-start"><button class="btn" id="addTopic">+ Add your own question</button></div>
      <p class="small muted">Built-in questions fill specific parts of the report. Answers to your own questions are passed to the writer as extra notes. With Claude connected, the assistant follows these naturally; in simple mode it asks them word for word.</p></div>
    <div class="card"><h2>Giving types <small>one per line; the assistant and reports use these words</small></h2>
      <textarea id="aGiving" rows="6">${esc((s.agent.givingTypes || []).join('\n'))}</textarea>
      <p class="small muted">e.g. Donation, Monthly giving, Grant, Corporate / CSI, Sponsorship, Bequest. Faith-based organisations can add their own, such as Zakat, Tithe or Tzedakah.</p></div>
    <div class="card"><h2>Tone of voice <small>one rule per line; used for every report</small></h2>
      <textarea id="aVoice" rows="9">${esc(s.voice.join('\n'))}</textarea></div>
    <div class="savebar"><button class="btn" id="resetA">Reset to defaults</button><button class="btn primary" id="saveA">Save assistant settings</button></div>`;
  draw();
  $('#addTopic').onclick = () => { topics.push({ id: `custom-${Date.now().toString(36)}`, label: 'New question', question: '', enabled: true, builtin: false }); draw(); $$('[data-tq]').at(-1).focus(); };
  $('#resetA').onclick = async () => { if (await resetSection('agent', 'Questions')) go(); };
  $('#saveA').onclick = async () => {
    const empty = topics.find((t) => !t.question.trim());
    if (empty) return toast(`Please write the question for “${empty.label}” or remove it.`, true);
    try {
      await saveSettings({ studio: { assistantName: $('#aName').value.trim() || 'Ava', greeting: $('#aGreet').value.split($('#aName').dataset.was || '\u0000').join('{name}') }, agent: { topics, extraRules: $('#aRules').value, givingTypes: $('#aGiving').value.split('\n').map((l) => l.trim()).filter(Boolean) }, voice: $('#aVoice').value.split('\n').map((l) => l.trim()).filter(Boolean) });
    } catch (e) { toast(e.message, true); }
  };
}

// ===================================================================
// LANGUAGES (English / Arabic)
// ===================================================================
const AR_STYLES = [
  ['warm', 'Warm, simple Modern Standard Arabic (recommended)'],
  ['formal', 'Formal, eloquent Modern Standard Arabic (institutions, government)'],
  ['gulf', 'Modern Standard Arabic with a light Gulf touch in greetings'],
  ['levant', 'Modern Standard Arabic with a light Levantine touch in greetings'],
];
async function languages(el) {
  const s = SV.settings;
  const L = structuredClone(s.languages || { offered: ['en'], defaultReport: 'en', defaultUi: 'en' });
  const A = structuredClone(s.ar || {});
  const topics = structuredClone(s.agent.topics);
  const D = Object.fromEntries((SV.defaults?.agent?.topics || []).map((t) => [t.id, t]));
  const rtl = 'dir="rtl" lang="ar"';
  const f = (k, label, ph = '') => `<label class="f">${label}<input data-ar="${k}" value="${esc(A[k] || '')}" placeholder="${esc(ph)}" ${rtl}></label>`;
  el.innerHTML = `${head('Languages', 'Offer reports and the Studio in English, Arabic or both, and set the Arabic wording and writing style.')}
    <div class="card"><h2>Languages on offer</h2>
      <div class="chips" style="margin-bottom:12px">${[['en', 'English'], ['ar', 'Arabic (العربية)']].map(([k, n]) => `<label class="switch"><input type="checkbox" data-off="${k}" ${L.offered.includes(k) ? 'checked' : ''}>${n}</label>`).join('')}</div>
      <div class="form">
        <label class="f">Default report language<select id="defRep">${['en', 'ar'].map((k) => `<option value="${k}" ${L.defaultReport === k ? 'selected' : ''}>${k === 'ar' ? 'Arabic' : 'English'}</option>`).join('')}</select></label>
        <label class="f">Default Studio language <small>staff can switch with the English / عربي button</small><select id="defUi">${['en', 'ar'].map((k) => `<option value="${k}" ${L.defaultUi === k ? 'selected' : ''}>${k === 'ar' ? 'Arabic' : 'English'}</option>`).join('')}</select></label>
      </div>
      <p class="small muted">Staff choose the report language for each report before creating it (it is then fixed, like the style and page count). They can type or speak in either language: the assistant replies in the language they use.</p></div>
    <div class="card"><h2>Arabic names <small>used in Arabic reports and the Arabic Studio</small></h2><div class="form">
      ${f('orgName', 'Organisation name in Arabic', 'مثال: مؤسسة الأمل')}${f('shortName', 'Short name in Arabic')}
      ${f('tagline', 'Tagline in Arabic')}${f('assistantName', 'Assistant name in Arabic <small>empty = same as English</small>')}
      ${f('ceoName', 'CEO name in Arabic')}${f('ceoTitle', 'CEO title in Arabic', 'الرئيس التنفيذي')}
      ${f('closing', 'Letter closing line in Arabic', 'مع خالص الشكر والامتنان،')}
    </div></div>
    <div class="card"><h2>Arabic greeting <small>write {name} where the assistant’s name should appear</small></h2>
      <textarea id="arGreet" rows="3" ${rtl}>${esc(A.greeting || '')}</textarea></div>
    <div class="grid2">
      <div class="card"><h2>Arabic writing style</h2>
        <label class="f">Style of Arabic for reports<select id="arStyle">${AR_STYLES.map(([k, n]) => `<option value="${k}" ${(A.style || 'warm') === k ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        <label class="f" style="margin-top:12px">Arabic tone of voice <small>one rule per line; the AI follows these for every Arabic report</small><textarea id="arVoice" rows="8" ${rtl}>${esc((A.voice || []).join('\n'))}</textarea></label></div>
      <div class="card"><h2>Arabic giving types <small>one per line, in the same order as the English list</small></h2>
        <div class="gt-pair"><textarea id="arGiving" rows="11" ${rtl}>${esc((A.givingTypes || []).join('\n'))}</textarea><ol class="small muted">${(s.agent.givingTypes || []).map((g) => `<li>${esc(g)}</li>`).join('')}</ol></div>
        <p class="small muted">The English list is on the Assistant &amp; questions page.</p></div>
    </div>
    <div class="card"><h2>Assistant questions in Arabic <small>asked when staff use the Studio in Arabic</small></h2>
      <div class="ar-q">${topics.map((t, i) => `<div class="ar-row"><div class="small muted"><b>${esc(t.label)}</b><br>${esc(t.question)}</div><div><input data-ql="${i}" value="${esc(t.labelAr || D[t.id]?.labelAr || '')}" placeholder="Label in Arabic" ${rtl}><textarea data-qq="${i}" rows="2" placeholder="The question in Arabic" ${rtl}>${esc(t.questionAr || D[t.id]?.questionAr || '')}</textarea></div></div>`).join('')}</div></div>
    <div class="card"><h2>Arabic closing quotes <small>one per line as “quote — author”</small></h2>
      <textarea id="arQuotes" rows="5" ${rtl}>${esc((A.quotes || []).map((q) => `${q.text}${q.by ? ` — ${q.by}` : ''}`).join('\n'))}</textarea></div>
    <div class="savebar"><button class="btn primary" id="saveL">Save language settings</button></div>`;
  $('#saveL').onclick = async () => {
    const offered = $$('[data-off]').filter((x) => x.checked).map((x) => x.dataset.off);
    if (!offered.length) return toast('Offer at least one language.', true);
    const ar = { ...A, greeting: $('#arGreet').value, style: $('#arStyle').value };
    $$('[data-ar]').forEach((i) => (ar[i.dataset.ar] = i.value.trim()));
    ar.voice = $('#arVoice').value.split('\n').map((l) => l.trim()).filter(Boolean);
    ar.givingTypes = $('#arGiving').value.split('\n').map((l) => l.trim()).filter(Boolean);
    ar.quotes = $('#arQuotes').value.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const [q, ...by] = l.split(/\s+[—–-]\s+/); return { text: q.replace(/^["“«]|["”»]$/g, ''), by: by.join(' - ') }; });
    $$('[data-ql]').forEach((i) => (topics[+i.dataset.ql].labelAr = i.value.trim()));
    $$('[data-qq]').forEach((i) => (topics[+i.dataset.qq].questionAr = i.value.trim()));
    const pick = (v) => (offered.includes(v) ? v : offered[0]);
    try {
      await saveSettings({ languages: { offered, defaultReport: pick($('#defRep').value), defaultUi: pick($('#defUi').value) }, ar, agent: { topics } });
    } catch (e) { toast(e.message, true); }
  };
}

// ===================================================================
// REPORT STYLES
// ===================================================================
async function styles(el) {
  const r = structuredClone(SV.settings.report);
  const draw = () => {
    el.innerHTML = `${head('Report styles', 'Choose which designs staff can pick, the default, and the page counts on offer.')}
      <div class="card"><h2>Styles</h2><div class="styles">${SV.styles.map((st) => `<div class="style ${r.styles[st.id] ? '' : 'off'}"><img src="styles/${st.id}.png?v=${SV.version}" alt="">
        <div><b>${esc(st.name)}</b><small>${esc(st.bestFor)}</small>
        <label class="switch"><input type="checkbox" data-st="${st.id}" ${r.styles[st.id] ? 'checked' : ''}>Offered</label>
        <label class="switch"><input type="radio" name="def" data-def="${st.id}" ${r.defaultStyle === st.id ? 'checked' : ''} ${r.styles[st.id] ? '' : 'disabled'}>Default</label></div></div>`).join('')}</div></div>
      <div class="grid2">
        <div class="card"><h2>Page counts</h2><p class="small muted">Which report lengths staff can choose.</p>
          <div class="chips">${[4, 5, 6, 7, 8].map((n) => `<button class="chip ${r.pageOptions.includes(n) ? 'on' : ''}" data-po="${n}">${n} pages</button>`).join('')}</div>
          <label class="f" style="margin-top:12px">Default length<select id="defPages">${r.pageOptions.map((n) => `<option ${n === Number(r.defaultPages) ? 'selected' : ''}>${n}</option>`).join('')}</select></label></div>
        <div class="card"><h2>Content</h2>
          <label class="switch"><input type="checkbox" id="bless" ${r.blessing?.enabled ? 'checked' : ''}>Add a blessing line on the thank-you page</label>
          <div class="form" id="blessF" style="margin:10px 0 14px;${r.blessing?.enabled ? '' : 'display:none'}">
            <label class="f full">Blessing <small>any language or script, e.g. a faith-based blessing</small><input id="blessT" value="${esc(r.blessing?.text || '')}" placeholder="e.g. Siyabonga · God bless you · جزاكم الله خيرا"></label>
            <label class="f full">Translation <small>optional</small><input id="blessE" value="${esc(r.blessing?.translation || '')}" placeholder="e.g. We thank you"></label></div>
          <label class="switch"><input type="checkbox" id="lib" ${r.useLibraryPhotos ? 'checked' : ''}>Fill gaps with library photos (labelled “illustrative”) when staff upload few photos</label>
          <label class="f" style="margin-top:16px">AI rewrites allowed per report <small>After a report is created, staff can edit the wording freely; each AI rewrite uses tokens. Style and page count are fixed once a report exists.</small><input type="number" id="maxRw" min="0" max="10" value="${Number(r.maxRewrites ?? 3)}" style="max-width:120px"></label></div>
      </div>
      <div class="card"><h2>Closing quotes <small>one per line as “quote — author”; each report uses one</small></h2>
        <textarea id="quotes" rows="6">${esc((r.quotes || []).map((q) => `${q.text}${q.by ? ` — ${q.by}` : ''}`).join('\n'))}</textarea>
        <p class="small muted">Shown on the closing page. Use your own values, a founder’s words, a proverb or a scripture verse. Leave empty for no quote.</p></div>
      <div class="savebar"><button class="btn primary" id="saveS">Save report settings</button></div>`;
    $$('[data-st]').forEach((x) => (x.onchange = () => { r.styles[x.dataset.st] = x.checked; if (!x.checked && r.defaultStyle === x.dataset.st) r.defaultStyle = Object.keys(r.styles).find((k) => r.styles[k]) || r.defaultStyle; draw(); }));
    $$('[data-def]').forEach((x) => (x.onchange = () => (r.defaultStyle = x.dataset.def)));
    $$('[data-po]').forEach((b) => (b.onclick = () => { const n = +b.dataset.po; r.pageOptions = r.pageOptions.includes(n) ? r.pageOptions.filter((x) => x !== n) : [...r.pageOptions, n].sort(); if (!r.pageOptions.includes(Number(r.defaultPages))) r.defaultPages = r.pageOptions[0]; draw(); }));
    $('#defPages').onchange = () => (r.defaultPages = Number($('#defPages').value));
    $('#bless').onchange = () => { r.blessing = { ...(r.blessing || {}), enabled: $('#bless').checked }; $('#blessF').style.display = $('#bless').checked ? '' : 'none'; };
    $('#blessT').oninput = () => (r.blessing = { ...(r.blessing || {}), text: $('#blessT').value });
    $('#blessE').oninput = () => (r.blessing = { ...(r.blessing || {}), translation: $('#blessE').value });
    $('#quotes').oninput = () => (r.quotes = $('#quotes').value.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const [t, ...by] = l.split(/\s+[—–-]\s+/); return { text: t.replace(/^["“]|["”]$/g, ''), by: by.join(' - ') }; }));
    $('#lib').onchange = () => (r.useLibraryPhotos = $('#lib').checked);
    $('#maxRw').onchange = () => (r.maxRewrites = Number($('#maxRw').value));
    $('#saveS').onclick = async () => {
      if (!Object.values(r.styles).some(Boolean)) return toast('Keep at least one style switched on.', true);
      if (!r.pageOptions.length) return toast('Offer at least one page count.', true);
      try { await saveSettings({ report: r }); } catch (e) { toast(e.message, true); }
    };
  };
  draw();
}

// ===================================================================
// AI CONNECTION
// ===================================================================
const MODELS = [
  ['claude-opus-5-5', 'Claude Opus 5.5 (recommended: best writing)', '≈ $0.10–0.30 per report'],
  ['claude-sonnet-5-5', 'Claude Sonnet 5.5 (faster, about half the cost)', '≈ $0.05–0.15 per report'],
  ['claude-haiku-5-5', 'Claude Haiku 5.5 (cheapest, simpler writing)', '≈ under $0.01 per report'],
];
async function ai(el) {
  const s = SV.settings.ai;
  const st = await api('api/status');
  el.innerHTML = `${head('AI connection', 'Connect Claude so the assistant can understand conversations and write the reports.')}
    <div class="card"><h2>Status</h2>${aiCard(st)}<div class="actions"><button class="btn" id="test">Test connection</button></div></div>
    <div class="grid2">
      <div class="card"><h2>API key</h2>
        ${s.apiKeySet ? `<p>Saved key: <code>${esc(s.apiKeyPreview)}</code></p><div class="actions" style="justify-content:flex-start"><button class="btn" id="replace">Replace key</button><button class="btn danger" id="removeKey">Remove key</button></div>` : '<p class="muted">No key saved in the dashboard yet.</p>'}
        <form id="kf" ${s.apiKeySet ? 'hidden' : ''}><label class="f">Paste your Anthropic API key<input id="key" type="password" autocomplete="off" placeholder="sk-ant-api03-…" spellcheck="false"></label>
          <div class="actions"><button class="btn primary" type="submit">Save &amp; test key</button></div></form>
        ${s.envKeyPreview ? `<p class="small muted">A key is also set on the server (${esc(s.envKeyPreview)}). A key saved here takes priority.</p>` : ''}
        <p class="small muted">Get a key at <a href="https://console.anthropic.com" target="_blank" rel="noopener">console.anthropic.com</a> → API Keys (add billing credit first). The key is stored on your server only, is never shown in full again, and is never sent to staff browsers.</p></div>
      <div class="card"><h2>Settings</h2>
        <label class="switch"><input type="checkbox" id="enabled" ${s.enabled !== false ? 'checked' : ''}>Use Claude (when off, the assistant uses simple mode and template wording)</label>
        <label class="f" style="margin-top:14px">Model<select id="model">${MODELS.map(([id, label]) => `<option value="${id}" ${s.model === id ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
        <p class="small muted" id="modelHint"></p>
        <div class="actions"><button class="btn primary" id="saveAI">Save</button></div></div>
    </div>`;
  const hint = () => ($('#modelHint').textContent = `Estimated cost: ${MODELS.find((m) => m[0] === $('#model').value)?.[2] || ''}`);
  hint();
  $('#model').onchange = hint;
  $('#test').onclick = async () => { $('#test').disabled = true; const r = await api('api/admin/ai/test', { method: 'POST' }); toast(r.ok ? 'Claude is connected ✓' : r.problem, !r.ok, 7000); go(); };
  if ($('#replace')) $('#replace').onclick = () => { $('#kf').hidden = false; $('#key').focus(); };
  if ($('#removeKey')) $('#removeKey').onclick = async () => { if (!(await confirmBox('Remove the API key?', 'The assistant will switch to simple mode until a new key is added (unless a key is also set on the server).', 'Remove', true))) return; await saveSettings({ ai: { apiKey: '' } }, 'Key removed'); go(); };
  $('#kf').onsubmit = async (e) => {
    e.preventDefault();
    const key = $('#key').value.trim();
    if (!/^sk-ant-/.test(key)) return toast('That doesn’t look like an Anthropic API key (it should start with sk-ant-api).', true, 6000);
    try {
      await saveSettings({ ai: { apiKey: key, enabled: true } }, 'Key saved, testing…');
      const r = await api('api/admin/ai/test', { method: 'POST' });
      toast(r.ok ? 'Key saved and Claude is connected ✓' : `Key saved, but: ${r.problem}`, !r.ok, 8000);
      go();
    } catch (err) { toast(err.message, true); }
  };
  $('#saveAI').onclick = async () => { await saveSettings({ ai: { enabled: $('#enabled').checked, model: $('#model').value } }); go(); };
}

// ===================================================================
// MY ACCOUNT
// ===================================================================
async function account(el) {
  el.innerHTML = `${head('My account', '')}
    <div class="grid2">
      <div class="card"><h2>You</h2><div class="who"><span class="av">${esc(initials(ME.name))}</span><div><b>${esc(ME.name)}</b><div class="small muted">${esc(ME.username)} · ${ME.role === 'admin' ? 'Admin' : 'Staff'}</div></div></div>
        <div class="actions" style="justify-content:flex-start"><button class="btn" id="everywhere">Sign out of all devices</button><button class="btn" id="out">Sign out</button></div></div>
      <div class="card"><h2>Change password</h2><form id="pf" class="form">
        <label class="f full">Current password<input id="p0" type="password" autocomplete="current-password" required></label>
        <label class="f">New password<input id="p1" type="password" autocomplete="new-password" required></label>
        <label class="f">Repeat new password<input id="p2" type="password" autocomplete="new-password" required></label>
        <p class="small muted full">At least 10 characters, with letters and a number.</p>
        <div class="actions full"><button class="btn primary" type="submit">Change password</button></div></form></div>
    </div>`;
  $('#out').onclick = async () => { await api('api/auth/logout', { method: 'POST' }); location.href = 'login'; };
  $('#everywhere').onclick = async () => { await api(`api/admin/users/${ME.id}/sign-out`, { method: 'POST' }); location.href = 'login'; };
  $('#pf').onsubmit = async (e) => {
    e.preventDefault();
    if ($('#p1').value !== $('#p2').value) return toast('The new passwords don’t match.', true);
    try {
      await api('api/me/password', { method: 'POST', body: { current: $('#p0').value, next: $('#p1').value } });
      toast('Password changed');
      $('#pf').reset();
    } catch (err) { toast(err.message, true); }
  };
}

// Start routing only once everything above is defined.
window.addEventListener('hashchange', go);
go();
