// STYLE 8: "Mosaic". Every page is a wall of tiles on a 7 x 10 grid (30 x
// 29.7mm, 1.2mm white grout): photos, brand colours and a fine khatam
// (eight-point star) lattice. Missing content turns its tile into a pattern
// tile, so thin briefs still produce a full, deliberate page. The top-right
// 2 x 2 tiles stay white for the logo.
import { brand } from '../../brand.js';
import { esc, paras, icon, statsOrNothing, rand } from '../helpers.js';
import { svgUrl, logoImg, foot, capText, photo, contact, sigBlock, yearOf, tilesFor, baseCss } from './kit.js';

const sec = (cls, inner) => `<section class="page m ${cls}">${inner}</section>`;
const pos = (c, r, w = 1, h = 1) => `--c:${c};--r:${r};--w:${w};--h:${h};`;
const tile = (c, r, w, h, cls, inner = '', style = '', tag = 'div') => `<${tag} class="t ${cls}" style="${pos(c, r, w, h)}${style}">${inner}</${tag}>`;
const pat = (c, r, w, h, colour) => tile(c, r, w, h, `${colour} ${colour === 'pale' ? 'pat-b' : 'pat'}`);
const ptile = (img, c, r, w, h, cls = '') => !img?.url ? tile(c, r, w, h, 'blue pat pat-lg') : photo(img, `t ${cls}`, pos(c, r, w, h), 'center 35%', img?.caption ? `<div class="cap">${capText(img)}</div>` : '');
const page = (n) => String(n);
const F = (ctx, n) => foot(ctx, n, { page });
const head = (kicker, heading, extra = '') => `<div class="kicker">${esc(kicker)}</div><h2 class="h shrink" data-h="30"${extra}>${esc(heading)}</h2>`;
const SUP = (ctx, row) =>
  (ctx.copy.money.supports || []).slice(0, 3).map((s, i) => tile(i * 2, row, 2, 2, 'warm pillar support', `<div class="ico-box">${icon(s.icon)}</div><h3 class="support-title">${esc(s.title)}</h3><p class="support-text">${esc(s.text)}</p>`)).join('');
const giftTile = (ctx, h = 2) => {
  const t = [ctx.amount ? ctx.givingType : '', yearOf(ctx)].filter(Boolean).join(' · ');
  const big = h > 2;
  return tile(0, 2, 4, h, 'blue', `<div class="gift-label"${big ? ' style="top:10mm"' : ''}>Your gift</div><div class="gift-amount shrink"${big ? ' style="top:22mm;font-size:56pt"' : ''}>${esc(ctx.amount || ctx.givingType)}</div>${t ? `<div class="gift-type"${big ? ' style="top:54mm;font-size:13pt"' : ''}>${esc(t)}</div>` : ''}${big ? '<div class="pat" style="position:absolute;left:0;right:0;bottom:0;height:12mm"></div>' : ''}`);
};
const duaTile = (ctx, c, r, w, h, small = false) => {
  const t = ctx.copy.thankYou;
  return t.duaArabic
    ? tile(c, r, w, h, 'yellow', `<div class="in" style="${small ? 'inset:4mm;' : ''}display:flex;flex-direction:column;justify-content:center"><div class="dua-ar ar" dir="auto"${small ? ' style="font-size:17pt"' : ''}>${esc(t.duaArabic)}</div>${t.duaEnglish ? `<div class="dua-en"${small ? ' style="font-size:7.8pt"' : ''}>${esc(t.duaEnglish)}</div>` : ''}</div>`)
    : pat(c, r, w, h, 'yellow');
};
const COLS = ['blue', 'teal', 'purple', 'yellow'];
const SW = ['var(--blue)', 'var(--teal)', 'var(--purple)', 'var(--green)', 'var(--yellow)', 'var(--blue60)'];

const pages = {
  cover: (ctx) => {
    const c = ctx.copy.cover;
    return sec(
      'cover',
      `${tile(0, 0, 5, 4, 'blue', `<div class="cover-kicker">${esc(c.kicker)}</div><h1 class="cover-title"><span class="shrink" data-h="66">${esc(c.title)}</span></h1><div class="cover-subtitle">${esc(c.subtitle)}</div>`)}
      ${logoImg(ctx, 'box', true)}
      ${tile(5, 2, 2, 2, 'yellow pat', `<div class="cover-thanks">${esc(c.highlight || 'Thank you')}</div>`)}
      ${ptile(ctx.cover, 0, 4, 4, 6)}
      ${tile(4, 4, 3, 2, 'purple', `<div class="in"><span class="label-sm">Prepared for</span><div class="cover-donor shrink" data-h="34">${esc(ctx.donorName)}</div></div>`)}
      ${pat(4, 6, 2, 2, 'pale')}${pat(6, 6, 1, 2, 'teal')}
      ${ctx.period || ctx.place
        ? tile(4, 8, 3, 2, 'pale', `<div class="in">${ctx.period ? `<span class="label-sm">Project period</span><div class="cover-period">${esc(ctx.period)}</div>` : ''}${ctx.place ? `<span class="label-sm" style="margin-top:3mm">Place</span><div class="cover-period">${esc(ctx.place)}</div>` : ''}</div>`)
        : pat(4, 8, 3, 2, 'blue')}`
    );
  },

  letter: (ctx, n) => {
    const l = ctx.copy.ceoLetter;
    return sec(
      'letter',
      `${logoImg(ctx, 'box')}
      <div class="kicker">A message from our CEO</div>
      <h2 class="h letter-heading">Thank you</h2>
      <div class="letter-salutation">${esc(l.salutation)}</div>
      <div class="letter-col"><div class="letter-body fit" data-max="125">${paras(l.paragraphs)}</div>${sigBlock(ctx)}</div>
      ${ctx.ceo.photo ? photo({ url: ctx.ceo.photo }, 't', pos(5, 2, 2, 3), '58% 25%') : pat(5, 2, 2, 3, 'blue')}
      ${tile(5, 5, 2, 1, 'blue', `<div class="in" style="inset:4mm 5mm"><div style="font:800 11pt var(--head)">${esc(ctx.ceo.name)}</div><div style="font-size:7.5pt">${esc(ctx.ceo.title)}</div></div>`)}
      ${pat(5, 6, 1, 1, 'yellow')}${pat(6, 6, 1, 1, 'teal')}${pat(5, 7, 2, 2, 'pale').replace('pat-b', 'pat-b pat-lg')}
      ${pat(0, 8, 1, 1, 'blue')}${tile(1, 8, 1, 1, 'yellow')}${pat(2, 8, 1, 1, 'teal')}${tile(3, 8, 1, 1, 'purple')}${pat(4, 8, 1, 1, 'pale')}
      ${F(ctx, n)}`
    );
  },

  project: (ctx, n) => {
    const p = ctx.copy.project;
    const facts = (p.keyFacts || []).filter((f) => f.label && f.value).slice(0, 5);
    const FC = ['blue', 'teal', 'purple', 'green', 'yellow'];
    const factTiles = FC.map((col, i) => {
      const f = facts[i];
      return f ? tile(4, 2 + i, 3, 1, `${col} fact`, `<span class="fact-label">${esc(f.label)}</span><span class="fact-value shrink" data-h="11"${col === 'yellow' ? ' style="color:var(--blue)"' : ''}>${esc(f.value)}</span>`) : pat(4, 2 + i, 3, 1, col);
    }).join('');
    return sec(
      'project',
      `${logoImg(ctx, 'box')}
      ${head('The project', p.heading)}
      <div class="project-lead fit" data-max="100">${esc(p.lead)}</div>
      ${ptile(ctx.projectImg, 0, 3, 4, 4)}
      ${factTiles}
      <div class="project-body fit" data-max="112">${paras(p.paragraphs)}</div>
      ${F(ctx, n)}`
    );
  },

  impact: (ctx, n) => {
    const im = ctx.copy.impact;
    const st = statsOrNothing(ctx, 4);
    const pil = (im.pillars || []).slice(0, 3);
    const top = `${logoImg(ctx, 'box')}${head('Impact', im.heading)}<div class="intro fit" data-max="100" style="top:54mm;height:28mm">${esc(im.intro)}</div>`;
    if (st.length < 2) {
      const PC = ['blue', 'teal', 'purple'];
      return sec(
        'impact no-stats',
        `${top}
        ${ctx.impactImg ? ptile(ctx.impactImg, 0, 3, 7, 3) : pat(0, 3, 7, 3, 'blue')}
        ${[0, 1, 2].map((i) => (pil[i] ? tile(i * 2, 6, 2, 3, `${PC[i]} pillar tall`, `<div class="ico-box">${icon(pil[i].icon)}</div><h3 class="pillar-title">${esc(pil[i].title)}</h3><p class="pillar-text">${esc(pil[i].text)}</p>`) : pat(i * 2, 6, 2, 3, PC[i]))).join('')}
        ${pat(6, 6, 1, 3, 'yellow')}
        ${F(ctx, n)}`
      );
    }
    const slots = st.length === 2 ? [[0, 3, 2, 4], [2, 3, 2, 4]] : [[0, 3, 2, 2], [2, 3, 2, 2], [0, 5, 2, 2], [2, 5, 2, 2]];
    return sec(
      'impact',
      `${top}
      ${slots.map((s, i) => (st[i] ? tile(...s, `${COLS[i]} stat`, `<div class="stat-value shrink">${esc(st[i].value)}</div><div class="stat-label">${esc(st[i].label)}</div>`) : pat(...s, COLS[i]))).join('')}
      ${ctx.impactImg ? ptile(ctx.impactImg, 4, 2, 3, 5) : pat(4, 2, 3, 5, 'teal')}
      ${[0, 1, 2].map((i) => (pil[i] ? tile(i * 2, 7, 2, 2, 'pale pillar', `<div class="ico-box">${icon(pil[i].icon)}</div><h3 class="pillar-title">${esc(pil[i].title)}</h3><p class="pillar-text">${esc(pil[i].text)}</p>`) : pat(i * 2, 7, 2, 2, 'pale'))).join('')}
      ${pat(6, 7, 1, 2, 'blue')}
      ${F(ctx, n)}`
    );
  },

  story: (ctx, n) => {
    const s = ctx.copy.story;
    const q = s.quote ? { t: s.quote, a: s.quoteAttribution } : { t: ctx.verse.text, a: ctx.verse.ref };
    return sec(
      'story',
      `${logoImg(ctx, 'box')}
      ${ptile(ctx.storyImg, 0, 0, 4, 6)}
      ${pat(4, 0, 1, 2, 'teal')}${pat(4, 2, 1, 2, 'blue')}${pat(4, 4, 1, 2, 'green')}
      ${tile(5, 2, 2, 4, 'yellow quote', `<p class="quote-text shrink" data-h="72">${esc(q.t)}</p>${q.a ? `<div class="quote-by">${esc(q.a)}</div>` : ''}`, '', 'blockquote')}
      <div class="kicker" style="top:186mm">Story of change</div>
      <h2 class="h story-heading shrink" data-h="15">${esc(s.heading)}</h2>
      <div class="story-body fit" data-max="115">${paras(s.paragraphs)}</div>
      ${F(ctx, n)}`
    );
  },

  gallery: (ctx, n) => {
    const SLOTS = [[0, 3, 4, 3], [4, 3, 3, 2], [4, 5, 3, 2], [0, 6, 2, 3], [2, 6, 2, 3], [4, 7, 2, 2]];
    const ORDER = [0, 1, 4, 2, 3, 5];
    const PC = ['blue', 'teal', 'purple', 'pale', 'green', 'yellow'];
    const g = ctx.gallery;
    const assign = {};
    ORDER.slice(0, g.length).forEach((slot, i) => (assign[slot] = g[i]));
    return sec(
      'gallery',
      `${logoImg(ctx, 'box')}
      ${head('Gallery', ctx.copy.gallery.heading)}
      <div class="intro fit" data-max="100" style="top:54mm;height:28mm;width:118mm">${esc(ctx.copy.gallery.intro)}</div>
      ${pat(5, 2, 2, 1, 'yellow')}
      ${SLOTS.map((s, i) => (assign[i] ? ptile(assign[i], ...s) : pat(...s, PC[i]))).join('')}
      ${pat(6, 7, 1, 2, 'teal')}
      ${F(ctx, n)}`
    );
  },

  money: (ctx, n) => {
    const m = ctx.copy.money;
    const rows = ctx.budget.slice(0, 5);
    if (!rows.length) {
      return sec(
        'money no-breakdown',
        `${logoImg(ctx, 'box')}
        ${head('Your gift at work', m.heading)}
        ${giftTile(ctx, 3)}
        ${tile(4, 2, 3, 3, 'pale', `<div class="in fit" data-max="110" style="font-size:10.5pt;line-height:1.5">${esc(m.intro)}</div>`)}
        ${ctx.moneyImg ? ptile(ctx.moneyImg, 0, 5, 7, 2) : pat(0, 5, 7, 2, 'blue')}
        ${SUP(ctx, 7)}${pat(6, 7, 1, 2, 'yellow')}
        <div class="money-note" style="top:270mm">${esc(m.note)}</div>
        ${F(ctx, n)}`
      );
    }
    const total = rows.reduce((a, b) => a + b.amount, 0);
    const counts = tilesFor(rows, total);
    const waffle = counts.flatMap((k, i) => Array(k).fill(`<i style="background:${SW[i % 6]}"></i>`)).join('');
    return sec(
      'money',
      `${logoImg(ctx, 'box')}
      ${head('Your gift at work', m.heading)}
      ${giftTile(ctx)}
      ${tile(4, 2, 3, 2, 'pale', `<div class="in fit" data-max="105" style="font-size:9.8pt;line-height:1.5">${esc(m.intro)}</div>`)}
      <div class="spend-title">How your gift was spent</div>
      <div class="waffle">${waffle}</div>
      <div class="waffle-note">Each tile is 5% of the total</div>
      <ul class="spend-list">${rows.map((b, i) => `<li class="spend-row"><span class="spend-swatch" style="background:${SW[i % 6]}"></span><span class="spend-label">${esc(b.label)}</span><span class="spend-amount">${rand(b.amount)}</span><span class="spend-pct">${Math.round((b.amount / total) * 100)}%</span></li>`).join('')}</ul>
      ${SUP(ctx, 6)}${pat(6, 6, 1, 2, 'yellow')}
      <div class="money-note" style="top:243mm">${esc(m.note)}</div>
      ${F(ctx, n)}`
    );
  },

  back: (ctx, n) => {
    const t = ctx.copy.thankYou;
    const a = ctx.copy.ahead;
    const bullets = (a.bullets || []).slice(0, 3);
    return sec(
      'back',
      `${logoImg(ctx, 'box', true)}
      ${tile(0, 0, 5, 4, 'blue', `<div class="in" style="inset:10mm 10mm 8mm"><div class="label-sm" style="margin-bottom:3mm">What happens next</div><h2 class="ahead-heading">${esc(a.heading)}</h2><div class="ahead-fit fit" data-max="105">${paras((a.paragraphs || []).slice(0, 2), 'ahead-text')}${bullets.length ? `<ul class="ahead-list">${bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}</div></div>`)}
      ${pat(5, 2, 2, 2, 'yellow')}
      <h2 class="h back-thanks shrink" data-h="20">${esc(t.heading)}</h2>
      <div class="back-message fit" data-max="108"><p>${esc(t.message)}</p></div>
      ${duaTile(ctx, 4, 5, 3, 2)}
      ${tile(0, 7, 7, 1, 'purple', `<div class="in verse fit" data-max="105" style="inset:4mm 10mm 3mm 14mm"><p>“${esc(ctx.verse.text)}”<span class="verse-ref">${esc(ctx.verse.ref)}</span></p></div>`)}
      ${contact('top:247mm')}
      ${F(ctx, n)}`
    );
  },

  impactStory: (ctx, n) => {
    const im = ctx.copy.impact;
    const s = ctx.copy.story;
    const st = statsOrNothing(ctx, 4);
    const pil = (im.pillars || []).slice(0, 3);
    const q = s.quote ? { t: s.quote, a: s.quoteAttribution } : { t: ctx.verse.text, a: ctx.verse.ref };
    const SL = [[0, 2, 2, 1], [2, 2, 2, 1], [0, 3, 2, 1], [2, 3, 2, 1]];
    const statTiles = st.length >= 2
      ? SL.map((sl, i) => (st[i] ? tile(...sl, `${COLS[i]} stat sm`, `<div class="stat-value shrink">${esc(st[i].value)}</div><div class="stat-label">${esc(st[i].label)}</div>`) : pat(...sl, COLS[i]))).join('')
      : `${pat(0, 2, 2, 2, 'blue')}${tile(2, 2, 2, 2, 'yellow', `<div class="in fit" data-max="105" style="font:600 11pt/1.4 var(--head);color:var(--blue)">${esc(im.intro)}</div>`)}`;
    const PC = ['blue', 'teal', 'purple'];
    return sec(
      'impact-story',
      `${logoImg(ctx, 'box')}
      <div class="kicker">Impact and story</div>
      <h2 class="h shrink" data-h="28" style="font-size:34pt">${esc(im.heading)}</h2>
      ${statTiles}
      ${ptile(ctx.storyImg, 4, 2, 3, 4)}
      <h3 class="abs combo-h shrink" data-h="9">${esc(s.heading)}</h3>
      <div class="abs combo-story fit" data-max="110">${paras(s.paragraphs)}</div>
      ${[0, 1, 2].map((i) => `${tile(0, 6 + i, 1, 1, PC[i], `<div class="ico-box" style="margin:8.9mm auto 0;background:none;color:${i === 1 ? 'var(--ink)' : '#fff'}">${icon(pil[i]?.icon || ['water', 'heart', 'clock'][i])}</div>`)}${pil[i] ? tile(1, 6 + i, 3, 1, 'pillar-row', `<div class="fit" data-max="100" style="padding:2.6mm 3mm;height:100%"><h3 class="pillar-title" style="margin:0 0 .8mm;font-size:11pt">${esc(pil[i].title)}</h3><p class="pillar-text" style="font-size:8.4pt">${esc(pil[i].text)}</p></div>`) : pat(1, 6 + i, 3, 1, 'pale')}`).join('')}
      ${tile(4, 6, 3, 2, 'yellow quote', `<p class="quote-text shrink" data-h="30" style="font-size:11.5pt">${esc(q.t)}</p>${q.a ? `<div class="quote-by" style="font-size:7.5pt">${esc(q.a)}</div>` : ''}`, 'padding:5mm 6mm', 'blockquote')}
      ${pat(4, 8, 3, 1, 'pale')}
      ${F(ctx, n)}`
    );
  },

  closing: (ctx, n) => {
    const m = ctx.copy.money;
    const t = ctx.copy.thankYou;
    return sec(
      'closing',
      `${logoImg(ctx, 'box')}
      ${head('Your gift at work', m.heading)}
      ${giftTile(ctx)}
      ${tile(4, 2, 3, 2, 'pale', `<div class="in fit" data-max="105" style="font-size:9.8pt;line-height:1.5">${esc(m.intro)}</div>`)}
      ${SUP(ctx, 4)}${pat(6, 4, 1, 2, 'teal')}
      ${tile(0, 6, 5, 2, 'blue', `<div class="in" style="inset:6mm 8mm;display:flex;flex-direction:column"><h2 class="shrink" style="font:800 28pt/1 var(--head);color:var(--yellow);margin:0 0 3mm;white-space:nowrap">${esc(t.heading)}</h2><div class="fit" data-max="105" style="flex:1;font-size:9.3pt;line-height:1.45"><p>${esc(t.message)}</p></div></div>`)}
      ${duaTile(ctx, 5, 6, 2, 2, true)}
      ${contact('top:245mm')}
      ${F(ctx, n)}`
    );
  },
};

const lattice = (stroke, op) =>
  svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><g fill='none' stroke='${stroke}' stroke-opacity='${op}' stroke-width='1'><rect x='10' y='10' width='20' height='20'/><path d='M20 5.86L34.14 20 20 34.14 5.86 20z'/><path d='M0 0l10 10M40 0L30 10M0 40l10-10M40 40L30 30M20 0v5.86M20 40v-5.86M0 20h5.86M40 20h-5.86'/></g></svg>`);
const star = () => svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><g fill='${brand.colors.yellow}' stroke='${brand.colors.blue}' stroke-width='2'><rect x='8' y='8' width='24' height='24'/><path d='M20 3L37 20 20 37 3 20z'/></g></svg>`);

const css = () => `${baseCss('m')}
.m .footer{align-items:center}
.m .footer-page{display:inline-block;min-width:6.2mm;height:6.2mm;line-height:6.2mm;text-align:center;background:var(--blue);color:#fff;font-size:8.5pt}
.m .t{position:absolute;left:calc(var(--c)*30mm + .6mm);top:calc(var(--r)*29.7mm + .6mm);width:calc(var(--w,1)*30mm - 1.2mm);height:calc(var(--h,1)*29.7mm - 1.2mm);overflow:hidden;margin:0}
.m .blue{background-color:var(--blue);color:#fff}
.m .teal{background-color:var(--teal);color:var(--ink)}
.m .purple{background-color:var(--purple);color:#fff}
.m .yellow{background-color:var(--yellow);color:var(--ink)}
.m .green{background-color:var(--green);color:var(--ink)}
.m .warm{background-color:var(--warm);color:var(--ink)}
.m .pale{background-color:var(--blue20);color:var(--ink)}
.m .pat{background-image:${lattice('#fff', 0.42)};background-size:12mm 12mm;background-position:center}
.m .pat-b{background-image:${lattice(brand.colors.blue, 0.45)};background-size:12mm 12mm;background-position:center}
.m .pat-lg{background-size:20mm 20mm}
.m .in{position:absolute;inset:6mm}
.m .kicker{position:absolute;left:14mm;top:14mm;font:700 8.5pt/1.2 var(--head);letter-spacing:.16em;text-transform:uppercase;color:var(--blue);max-width:130mm;padding-left:5mm}
.m .kicker::before{content:"";position:absolute;left:0;top:.4mm;width:3.2mm;height:3.2mm;background:${star()} center/contain no-repeat}
.m .h{position:absolute;left:14mm;top:21mm;width:132mm;font:700 38pt/1.02 var(--head);color:var(--blue);letter-spacing:-.005em;text-wrap:balance;margin:0}
.m .intro{position:absolute;left:14mm;width:132mm;font-size:10.5pt;line-height:1.5}
.m .cap{position:absolute;left:0;right:0;bottom:0;background:#fff;color:var(--ink);padding:1.6mm 2.6mm 1.4mm;font:600 7.5pt/1.25 var(--head)}
.m .ico-box{width:11mm;height:11mm;padding:2mm;background:#fff;color:var(--blue)}
.m .label-sm{display:block;font:700 6.8pt/1.2 var(--head);letter-spacing:.15em;text-transform:uppercase;opacity:.85}

.m .cover-kicker{position:absolute;left:10mm;top:10mm;font:700 9pt var(--head);letter-spacing:.18em;text-transform:uppercase}
.m .cover-title{position:absolute;left:10mm;top:20mm;width:128mm;height:66mm;font:800 48pt/.98 var(--head);letter-spacing:-.01em;text-wrap:balance;display:flex;align-items:flex-end;margin:0}
.m .cover-title span{display:block;width:100%}
.m .cover-subtitle{position:absolute;left:10mm;top:92mm;width:124mm;font-size:11.5pt;line-height:1.35}
.m .cover-thanks{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(-6deg);font:400 32pt/1 var(--marker);color:var(--blue);background:#fff;padding:1mm 3.5mm 2mm;white-space:nowrap}
.m .cover-donor{font:800 17pt/1.1 var(--head);margin-top:1.5mm}
.m .cover-period{font:700 11pt/1.3 var(--head)}

.m .letter-heading{top:20mm;font-size:58pt;font-weight:800}
.m .letter-salutation{position:absolute;left:14mm;top:50mm;width:128mm;font:700 12.5pt/1.25 var(--head)}
.m .letter-col{position:absolute;left:14mm;top:60mm;width:128mm;height:172mm;display:flex;flex-direction:column}
.m .letter-body{flex:1;font-size:10.2pt;line-height:1.52}
.m .letter-sign{flex:none;padding-top:4mm}
.m .letter-name{text-transform:none;letter-spacing:0}

.m .project-lead{position:absolute;left:14mm;top:60mm;width:102mm;height:28mm;font:600 13pt/1.38 var(--head);color:var(--blue)}
.m .project-body{position:absolute;left:14mm;top:214mm;width:182mm;height:62mm;column-count:2;column-gap:8mm;font-size:9.8pt;line-height:1.5}
.m .fact{padding:4.2mm 5mm}
.m .fact-label{display:block;font:700 6.8pt var(--head);letter-spacing:.15em;text-transform:uppercase;opacity:.85}
.m .fact-value{display:block;font:800 14pt/1.15 var(--head);margin:1mm 0 0}

.m .stat-value{position:absolute;left:6mm;top:6mm;right:4mm;font:800 32pt/1 var(--head);white-space:nowrap;overflow:hidden}
.m .stat-label{position:absolute;left:6mm;right:6mm;bottom:5.5mm;font:700 9.5pt/1.3 var(--body)}
.m .yellow .stat-value{color:var(--blue)}
.m .stat.sm .stat-value{top:4.5mm;font-size:22pt}
.m .stat.sm .stat-label{bottom:3.6mm;font-size:8pt}
.m .pillar{padding:5mm}
.m .pillar-title{font:800 12.5pt/1.1 var(--head);margin:2.6mm 0 1.2mm}
.m .pillar-text{font-size:8.8pt;line-height:1.42;margin:0}
.m .pillar.tall{padding:7mm 6mm}
.m .pillar.tall .ico-box{width:13mm;height:13mm;padding:2.6mm}
.m .pillar.tall .pillar-title{font-size:16pt;margin:5mm 0 2mm}
.m .pillar.tall .pillar-text{font-size:9.8pt}
.m .teal .ico-box,.m .yellow .ico-box{color:var(--ink)}

.m .quote{padding:7mm 6mm;display:flex;flex-direction:column}
.m .quote::before{content:"\\201C";font:800 46pt/.8 var(--head);color:var(--blue);display:block;height:11mm;flex:none}
.m .quote-text{font:700 13pt/1.3 var(--head);color:var(--blue);margin:0}
.m .quote-by{font:700 8pt/1.3 var(--body);letter-spacing:.06em;text-transform:uppercase;margin-top:auto}
.m .story-heading{top:192mm;width:182mm;font-size:34pt;white-space:nowrap}
.m .story-body{position:absolute;left:14mm;top:210mm;width:182mm;height:66mm;column-count:2;column-gap:8mm;font-size:9.5pt;line-height:1.48}
.m .combo-h{left:14mm;top:123mm;width:104mm;font:800 18pt/1.05 var(--head);color:var(--blue);margin:0;white-space:nowrap;overflow:hidden}
.m .combo-story{left:14mm;top:133mm;width:104mm;height:42mm;font-size:9.3pt;line-height:1.48}

.m .gift-label{position:absolute;left:7mm;top:7mm;font:700 7.5pt var(--head);letter-spacing:.16em;text-transform:uppercase}
.m .gift-amount{position:absolute;left:7mm;right:7mm;top:15mm;font:800 46pt/1 var(--head);white-space:nowrap;overflow:hidden}
.m .gift-type{position:absolute;left:7mm;top:40mm;font:700 11pt var(--head);color:var(--yellow)}
.m .spend-title{position:absolute;left:14mm;top:125mm;font:800 11pt var(--head);color:var(--blue)}
.m .waffle{position:absolute;left:14mm;top:133mm;display:grid;grid-template-columns:repeat(10,7.6mm);grid-auto-rows:7.6mm;gap:1mm}
.m .waffle i{display:block}
.m .waffle-note{position:absolute;left:14mm;top:152.5mm;font:600 7.5pt var(--head);color:var(--grey);letter-spacing:.04em}
.m .spend-list{position:absolute;left:110mm;top:125mm;width:86mm;margin:0;padding:0;list-style:none}
.m .spend-row{display:grid;grid-template-columns:4mm 1fr 22mm 11mm;gap:2.4mm;align-items:center;padding:1.9mm 0;border-bottom:.3mm solid var(--warm);font-size:9.3pt}
.m .spend-row:last-child{border-bottom:0}
.m .spend-swatch{width:3.6mm;height:3.6mm}
.m .spend-amount{text-align:right;color:var(--grey);font-variant-numeric:tabular-nums}
.m .spend-pct{text-align:right;font:800 10.5pt var(--head);color:var(--blue);font-variant-numeric:tabular-nums}
.m .support-title{font:800 12pt/1.1 var(--head);margin:2.6mm 0 1.2mm}
.m .support-text{font-size:8.8pt;line-height:1.42;margin:0}
.m .money-note{position:absolute;left:14mm;width:182mm;font:italic 400 8pt/1.4 var(--body);color:var(--grey)}

.m .ahead-heading{font:800 28pt/1 var(--head);margin:0}
.m .ahead-fit{position:absolute;left:0;right:0;top:17mm;bottom:0}
.m .ahead-text{font-size:9.8pt;line-height:1.5;margin-top:3mm;width:128mm}
.m .ahead-list{margin:3mm 0 0;padding:0;list-style:none;font:600 10.5pt/1.3 var(--head)}
.m .ahead-list li{position:relative;padding-left:6.5mm;margin-bottom:2mm}
.m .ahead-list li::before{content:"";position:absolute;left:0;top:.8mm;width:3.2mm;height:3.2mm;background:var(--yellow);transform:rotate(45deg) scale(.8)}
.m .back-thanks{top:125mm;width:182mm;font-size:44pt;font-weight:800;white-space:nowrap}
.m .back-message{position:absolute;left:14mm;top:153mm;width:100mm;height:52mm;font-size:10.5pt;line-height:1.5}
.m .dua-ar{font:700 22pt/1.6 var(--arabic);color:var(--blue);text-align:center}
.m .dua-en{font:italic 400 8.5pt/1.35 var(--body);text-align:center;margin-top:1mm}
.m .verse{font:italic 400 9.3pt/1.5 var(--body)}
.m .verse-ref{display:inline-block;margin-left:2mm;font:700 8pt var(--head);letter-spacing:.14em;text-transform:uppercase;color:var(--yellow);font-style:normal}
.m .contact{gap:3mm 7mm}
.m .contact-label{color:var(--grey);opacity:1}
.m .contact-value{color:var(--blue)}
.m .contact-reg .contact-value{color:var(--ink)}
`;

export default {
  id: 'mosaic',
  name: 'Mosaic',
  description: 'A wall of tiles on every page: photos, brand colours and a fine geometric pattern.',
  bestFor: 'Families and community donors who give every year; reports with many photos.',
  get swatch() {
    return [brand.colors.blue, brand.colors.teal, brand.colors.yellow];
  },
  pages,
  get css() {
    return css();
  },
};
