// STYLE 9: "Journey". The report follows the gift from the donor to the
// community: one dashed route runs down every page and each section is a
// numbered stop on it. Topographic contours, map-pin captions, a postcard CEO
// photo with a postmark, polaroid gallery and a ticket for the gift.
import { brand } from '../../brand.js';
import { esc, paras, icon, statsOrNothing, rand } from '../helpers.js';
import { logoImg, foot, capText, photo, contact, sigBlock, yearOf, baseCss } from './kit.js';

const sec = (cls, inner) => `<section class="page j ${cls}">${inner}</section>`;
const stopNo = (n) => String(Math.max(1, n - 1)).padStart(2, '0');
const F = (ctx, n, o = {}) => foot(ctx, n, { page: stopNo, ...o });
const rail = (top, h, light = false, style = '') => `<div class="rail${light ? ' light' : ''}" style="top:${top}mm;height:${h}mm;${style}"></div>`;
const pin = (n, top = 21, cls = '', style = '') => `<div class="stop-pin ${cls}" style="top:${top}mm;${style}">${stopNo(n)}</div>`;
const kicker = (t, extra = '', top = 24, style = '') => `<div class="kicker" style="top:${top}mm;${style}">${esc(t)}${extra ? ` <b>· ${esc(extra)}</b>` : ''}</div>`;
const chip = (img, style) => (img?.caption ? `<div class="chip" style="${style}">${capText(img)}</div>` : '');

const TOPO_D = 'M100 14C152 12 190 58 184 106 178 152 140 190 92 184 46 178 14 140 20 94 26 50 56 16 100 14Z';
const topo = (style) =>
  `<svg class="topo" style="${style}" viewBox="0 0 200 200"><g fill="none" stroke="currentColor" stroke-width=".55">${[
    '', 'translate(100 100) scale(.84) translate(-100 -100)', 'translate(102 98) scale(.68) rotate(8) translate(-100 -100)', 'translate(104 96) scale(.52) rotate(14) translate(-100 -100)',
    'translate(106 95) scale(.36) rotate(22) translate(-100 -100)', 'translate(108 94) scale(.2) rotate(30) translate(-100 -100)',
  ].map((t) => `<path${t ? ` transform="${t}"` : ''} d="${TOPO_D}"/>`).join('')}</g></svg>`;
const mappin = (x, y, s) => `<svg x="${x}" y="${y}" width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M12 23C6.5 16.4 4 12.6 4 9a8 8 0 0 1 16 0c0 3.6-2.5 7.4-8 14z" fill="${brand.colors.yellow}" stroke="${brand.colors.blue}" stroke-width="1.2"/><circle cx="12" cy="9" r="3" fill="${brand.colors.blue}"/></svg>`;

const statsBand = (st, cls = '', style = '') =>
  `<div class="stats-band ${cls}"${style ? ` style="${style}"` : ''}>${cls ? '' : topo('left:120mm;top:-40mm;width:130mm;height:130mm;color:var(--blue80)')}<div class="stats-route"></div>
    <div class="stats" style="grid-template-columns:repeat(${Math.max(st.length, 2)},1fr)">${st.map((s) => `<div class="stat"><div class="stat-value shrink">${esc(s.value)}</div><div class="stat-label">${esc(s.label)}</div></div>`).join('')}</div></div>`;
const supports = (ctx, cls = '', style = '') =>
  `<div class="supports ${cls}"${style ? ` style="${style}"` : ''}>${(ctx.copy.money.supports || []).slice(0, 3).map((s) => `<div class="support"><div class="icon-dot y">${icon(s.icon)}</div><h3 class="support-title">${esc(s.title)}</h3><p class="support-text">${esc(s.text)}</p></div>`).join('')}</div>`;
const ticket = (ctx, cls = '') => {
  const t = [ctx.amount ? ctx.givingType : '', yearOf(ctx)].filter(Boolean).join(' · ');
  return `<div class="ticket ${cls}">${topo('left:40mm;top:-30mm;width:110mm;height:110mm;color:var(--blue80)')}
    <div class="gift-label">Your gift</div><div class="gift-amount shrink">${esc(ctx.amount || ctx.givingType)}</div>${t ? `<div class="gift-type">${esc(t)}</div>` : ''}
    <div class="ticket-perf"></div>
    <div class="ticket-stub"><span>From</span>${esc(ctx.donorName)}<span>To</span>${esc(ctx.place || ctx.brief.project?.name || 'Families in need')}</div></div>`;
};
const duaCard = (ctx, style = '', small = false) => {
  const t = ctx.copy.thankYou;
  if (!t.duaArabic) return '';
  return `<div class="dua-card"${style ? ` style="${style}"` : ''}><div class="dua-ar ar" dir="auto"${small ? ' style="font-size:15pt"' : ''}>${esc(t.duaArabic)}</div>${t.duaEnglish ? `<div class="dua-en"${small ? ' style="font-size:7.5pt"' : ''}>${esc(t.duaEnglish)}</div>` : ''}</div>`;
};
const SW = ['var(--blue)', 'var(--teal)', 'var(--purple)', 'var(--green)', 'var(--yellow)', 'var(--blue60)'];

// Polaroid positions for 1–6 photos (x, y, w, h, rotation).
const POLA = {
  6: [[28, 84, 104, 86, -1.2], [138, 80, 58, 92, 1.6], [28, 180, 52, 88, 1.2], [86, 182, 52, 66, -1.4], [144, 179, 52, 46, 0.8], [144, 230, 52, 44, -0.9]],
  5: [[28, 84, 104, 86, -1.2], [138, 80, 58, 92, 1.6], [28, 180, 52, 88, 1.2], [86, 182, 52, 66, -1.4], [144, 182, 52, 88, 0.8]],
  4: [[28, 84, 104, 86, -1.2], [138, 80, 58, 92, 1.6], [28, 180, 80, 88, 1.2], [116, 182, 80, 66, -1.4]],
  3: [[28, 84, 104, 100, -1.2], [138, 80, 58, 104, 1.6], [60, 192, 110, 76, 0.8]],
  2: [[28, 84, 168, 100, -1], [60, 192, 110, 76, 1.2]],
  1: [[28, 90, 168, 150, -1]],
};

const pages = {
  cover: (ctx) => {
    const c = ctx.copy.cover;
    return sec(
      'cover',
      `<div class="abs" style="left:0;top:0;width:210mm;height:184mm;background:var(--blue)"></div>
      ${topo('left:-70mm;top:70mm;width:170mm;height:170mm;color:var(--blue80)')}
      ${logoImg(ctx, 'white', true)}
      <div class="cover-kicker">${esc(c.kicker)}</div>
      <h1 class="cover-title"><span class="shrink" data-h="74">${esc(c.title)}</span></h1>
      <div class="cover-subtitle">${esc(c.subtitle)}</div>
      ${photo(ctx.cover, 'cover-photo', '', 'center 35%')}
      ${ctx.place ? `<svg class="abs" style="left:0;top:0;width:210mm;height:297mm;z-index:3" viewBox="0 0 210 297"><path d="M212 72C176 80 198 122 176 140S140 176 152 206" fill="none" stroke="${brand.colors.yellow}" stroke-width="1.3" stroke-dasharray="3 2.2" stroke-linecap="round"/>${mappin(143, 190, 18)}</svg>
      <div class="chip" style="left:160mm;top:197mm;max-width:46mm">${esc(ctx.place)}</div>` : ''}
      <div class="cover-thanks">${esc(c.highlight || 'Thank you')}</div>
      <div class="cover-for"><div class="cover-for-label">Prepared for</div><div class="cover-donor shrink" data-h="12">${esc(ctx.donorName)}</div></div>
      <div class="cover-meta">${ctx.period ? `<div>${esc(ctx.period)}</div>` : ''}${ctx.amount ? `<div class="coords">${esc(ctx.givingType)} · ${esc(ctx.amount)}</div>` : ''}</div>`
    );
  },

  letter: (ctx, n) => {
    const l = ctx.copy.ceoLetter;
    const yr = yearOf(ctx) || String(new Date().getFullYear());
    const ring = `${brand.shortName || brand.orgName} · ${yr} · `.toUpperCase();
    return sec(
      'letter',
      `${rail(0, 297)}
      ${logoImg(ctx, 'box')}
      ${pin(n)}${kicker('A message from our CEO')}
      <h2 class="h letter-heading">Thank you</h2>
      <svg class="abs" style="left:28mm;top:57mm;width:76mm;height:6mm" viewBox="0 0 76 6"><path d="M1 4C14 1 22 5.5 36 3S60 1 75 3.5" fill="none" stroke="${brand.colors.yellow}" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="3 2"/></svg>
      <div class="letter-salutation">${esc(l.salutation)}</div>
      <div class="letter-col"><div class="letter-body fit" data-max="125">${paras(l.paragraphs)}</div>${sigBlock(ctx)}</div>
      ${ctx.ceo.photo ? `<div class="postcard">${photo({ url: ctx.ceo.photo }, 'ceo-photo', '', '58% 25%')}</div>
      <svg class="postmark" viewBox="0 0 40 40"><defs><path id="pm" d="M20 20m-14 0a14 14 0 1 1 28 0a14 14 0 1 1-28 0"/></defs><circle cx="20" cy="20" r="19" fill="none" stroke="currentColor" stroke-width=".7"/><circle cx="20" cy="20" r="10" fill="none" stroke="currentColor" stroke-width=".5"/><text font-family="Geogrotesque,Arial" font-weight="700" font-size="${ring.length > 40 ? 3.4 : 4.2}" letter-spacing=".9" fill="currentColor"><textPath href="#pm">${esc(ring)}</textPath></text><path d="M14 20h12M16 17.5h8M16 22.5h8" stroke="currentColor" stroke-width=".5"/></svg>` : ''}
      ${topo('left:132mm;top:170mm;width:110mm;height:110mm;color:var(--blue20)')}
      ${F(ctx, n)}`
    );
  },

  project: (ctx, n) => {
    const p = ctx.copy.project;
    const facts = (p.keyFacts || []).filter((f) => f.label && f.value).slice(0, 5);
    return sec(
      'project',
      `${photo(ctx.projectImg, 'project-photo')}
      ${rail(0, 118, true)}${rail(118, 179)}
      ${logoImg(ctx, 'white')}
      ${chip(ctx.projectImg, 'left:28mm;top:106mm')}
      ${pin(n, 126)}${kicker('The project', ctx.place, 129)}
      <h2 class="h project-heading"><span class="shrink" data-h="26">${esc(p.heading)}</span></h2>
      <div class="project-lead fit" data-max="100">${esc(p.lead)}</div>
      <div class="project-body fit" data-max="112"${facts.length ? '' : ' style="width:168mm;column-count:2;column-gap:8mm"'}>${paras(p.paragraphs)}</div>
      ${facts.length ? `<dl class="facts">${facts.map((f) => `<div class="fact"><dt class="fact-label">${esc(f.label)}</dt><dd class="fact-value">${esc(f.value)}</dd></div>`).join('')}</dl>` : ''}
      ${F(ctx, n)}`
    );
  },

  impact: (ctx, n) => {
    const im = ctx.copy.impact;
    const st = statsOrNothing(ctx, 4);
    const pil = (im.pillars || []).slice(0, 3);
    const top = `${logoImg(ctx, 'box')}${pin(n)}${kicker('Impact')}<h2 class="h impact-heading shrink" data-h="30">${esc(im.heading)}</h2><div class="intro impact-intro fit" data-max="100">${esc(im.intro)}</div>`;
    if (st.length < 2) {
      return sec(
        'impact no-stats',
        `${rail(0, 297)}${top}
        ${photo(ctx.impactImg || ctx.cover, 'impact-photo-lg')}
        <div class="pillar-rows">${pil.map((p) => `<div class="pillar-row"><div class="icon-dot y">${icon(p.icon)}</div><div><h3 class="pillar-title">${esc(p.title)}</h3><p class="pillar-text">${esc(p.text)}</p></div></div>`).join('')}</div>
        ${F(ctx, n)}`
      );
    }
    return sec(
      'impact',
      `${rail(0, 90)}${rail(90, 68, true)}${rail(158, 139)}${top}
      ${statsBand(st)}
      <div class="pillars">${pil.map((p) => `<div class="pillar"><div class="icon-dot">${icon(p.icon)}</div><h3 class="pillar-title">${esc(p.title)}</h3><p class="pillar-text">${esc(p.text)}</p></div>`).join('')}</div>
      ${ctx.impactImg ? photo(ctx.impactImg, 'impact-photo') : ''}
      ${F(ctx, n)}`
    );
  },

  story: (ctx, n) => {
    const s = ctx.copy.story;
    const q = s.quote ? { t: s.quote, a: s.quoteAttribution } : { t: ctx.verse.text, a: ctx.verse.ref };
    return sec(
      'story',
      `${photo(ctx.storyImg, 'story-photo', '', 'center 30%')}
      ${rail(0, 297)}
      ${logoImg(ctx, 'white')}
      ${pin(n)}${kicker('Story of change', '', 24, 'max-width:72mm')}
      <h2 class="h story-heading"><span class="shrink" data-h="40">${esc(s.heading)}</span></h2>
      <div class="story-body fit" data-max="115">${paras(s.paragraphs)}</div>
      ${chip(ctx.storyImg, 'left:116mm;top:200mm')}
      <blockquote class="quote-card"><p class="quote-text shrink" data-h="32">${esc(q.t)}</p>${q.a ? `<div class="quote-by">${esc(q.a)}</div>` : ''}</blockquote>
      <footer class="footer" style="right:116mm"><span class="footer-page">${stopNo(n)}</span><span class="footer-web">${esc(brand.website)}</span></footer>
      <footer class="footer" style="left:116mm;color:#fff"><span class="footer-title">${esc(brand.orgName)} · ${esc(ctx.copy.cover.kicker)}</span></footer>`
    );
  },

  gallery: (ctx, n) => {
    const g = ctx.gallery.slice(0, 6);
    const spots = POLA[g.length] || [];
    const year = yearOf(ctx);
    const where = (ctx.place || ctx.brief.project?.location || '').split(/[,،]/)[0].trim();
    const note = [where, year].filter(Boolean).join(', ');
    return sec(
      'gallery',
      `${rail(0, 297, false, 'border-left-color:var(--blue60)')}
      ${logoImg(ctx, 'box')}
      ${pin(n, 21, '', 'box-shadow:0 0 0 1.1mm var(--blue20)')}${kicker('Gallery')}
      <h2 class="h gallery-heading shrink" data-h="24">${esc(ctx.copy.gallery.heading)}</h2>
      <div class="intro gallery-intro">${esc(ctx.copy.gallery.intro)}</div>
      <svg class="gallery-route" viewBox="0 0 210 297"><path d="M17 96C60 92 70 128 110 126S170 110 180 150 120 178 80 176 30 200 60 236 150 230 190 250" fill="none" stroke="${brand.colors.blue}" stroke-width=".7" stroke-dasharray="2.4 1.8" opacity=".55"/></svg>
      ${g.map((im, i) => {
        const [x, y, w, h, r] = spots[i];
        return `<figure class="polaroid" style="left:${x}mm;top:${y}mm;width:${w}mm;height:${h}mm;transform:rotate(${r}deg)">${photo(im)}<figcaption class="gallery-caption">${capText(im)}</figcaption></figure>`;
      }).join('')}
      ${note && g.length >= 4 && g.length !== 5 ? `<div class="abs gallery-note" style="${g.length === 6 ? 'left:86mm;top:254mm' : 'left:116mm;top:254mm'}">${esc(note)}</div>` : ''}
      ${F(ctx, n)}`
    );
  },

  money: (ctx, n) => {
    const m = ctx.copy.money;
    const rows = ctx.budget.slice(0, 5);
    const head = `${rail(0, 297)}${logoImg(ctx, 'box')}${pin(n)}${kicker('Your gift at work')}<h2 class="h money-heading shrink" data-h="20">${esc(m.heading)}</h2>${ticket(ctx)}<div class="intro money-intro fit" data-max="100">${esc(m.intro)}</div>`;
    if (!rows.length) {
      return sec(
        'money no-breakdown',
        `${head}
        ${photo(ctx.moneyImg || ctx.cover, 'money-photo')}
        ${chip(ctx.moneyImg, 'left:32mm;top:188mm')}
        ${supports(ctx, '', 'top:206mm')}
        <div class="money-note" style="top:262mm">${esc(m.note)}</div>
        ${F(ctx, n)}`
      );
    }
    const total = rows.reduce((a, b) => a + b.amount, 0);
    return sec(
      'money',
      `${head}
      <div class="spend-title">How your gift was spent</div>
      <div class="spend-bar">${rows.map((b, i) => `<i style="flex:${b.amount};background:${SW[i % 6]}"></i>`).join('')}</div>
      <ul class="spend-list">${rows.map((b, i) => `<li class="spend-row"><span class="spend-swatch" style="background:${SW[i % 6]}"></span><span class="spend-label">${esc(b.label)}</span><span class="spend-amount">${rand(b.amount)}</span><span class="spend-pct">${Math.round((b.amount / total) * 100)}%</span></li>`).join('')}</ul>
      ${supports(ctx, '', rows.length > 4 ? 'top:208mm' : '')}
      <div class="money-note">${esc(m.note)}</div>
      ${F(ctx, n)}`
    );
  },

  back: (ctx, n) => {
    const t = ctx.copy.thankYou;
    const a = ctx.copy.ahead;
    const bullets = (a.bullets || []).slice(0, 3);
    return sec(
      'back',
      `${topo('left:90mm;top:96mm;width:180mm;height:180mm;color:var(--blue80)')}
      ${rail(0, 104, true)}
      <svg class="abs" style="left:9mm;top:101mm;width:16mm;height:16mm;z-index:3" viewBox="0 0 16 16">${mappin(0, 0, 16)}</svg>
      ${logoImg(ctx, 'white', true)}
      ${pin(n, 21, 'on-blue')}${kicker('What happens next')}
      <h2 class="h ahead-heading shrink" data-h="14">${esc(a.heading)}</h2>
      <div class="ahead-wrap fit" data-max="105">${paras((a.paragraphs || []).slice(0, bullets.length ? 1 : 2), 'ahead-text')}${bullets.length ? `<ul class="ahead-list">${bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}</div>
      <h2 class="h back-thanks shrink" data-h="46">${esc(t.heading)}</h2>
      <div class="back-message fit" data-max="105"><p>${esc(t.message)}</p></div>
      ${duaCard(ctx)}
      <div class="verse"${ctx.copy.thankYou.duaArabic ? '' : ' style="left:28mm;width:168mm"'}>“${esc(ctx.verse.text)}”<span class="verse-ref">${esc(ctx.verse.ref)}</span></div>
      <div class="contact-band">${contact('top:8mm')}${F(ctx, n)}</div>`
    );
  },

  impactStory: (ctx, n) => {
    const im = ctx.copy.impact;
    const s = ctx.copy.story;
    const st = statsOrNothing(ctx, 4);
    const pil = (im.pillars || []).slice(0, 3);
    const q = s.quote ? { t: s.quote, a: s.quoteAttribution } : { t: ctx.verse.text, a: ctx.verse.ref };
    return sec(
      'impact-story',
      `${st.length >= 2 ? `${rail(0, 66)}${rail(66, 46, true)}${rail(112, 185)}` : rail(0, 297)}
      ${logoImg(ctx, 'box')}
      ${pin(n)}${kicker('Impact and story')}
      <h2 class="h impact-heading shrink" data-h="26" style="font-size:34pt">${esc(im.heading)}</h2>
      ${st.length >= 2 ? statsBand(st, 'combo-stats') : `<div class="intro fit" data-max="105" style="top:70mm;width:168mm;height:40mm;font-size:12pt">${esc(im.intro)}</div>`}
      ${photo(ctx.storyImg, 'combo-photo')}
      ${chip(ctx.storyImg, 'left:31mm;top:214mm')}
      <h3 class="combo-story-head shrink" data-h="16">${esc(s.heading)}</h3>
      <div class="combo-story fit" data-max="110">${paras(s.paragraphs)}</div>
      <blockquote class="quote-card combo-quote"><p class="quote-text shrink" data-h="18">${esc(q.t)}</p>${q.a ? `<div class="quote-by">${esc(q.a)}</div>` : ''}</blockquote>
      <div class="pillars combo-pillars">${pil.map((p) => `<div class="pillar"><div class="icon-dot">${icon(p.icon)}</div><h3 class="pillar-title">${esc(p.title)}</h3><p class="pillar-text">${esc(p.text)}</p></div>`).join('')}</div>
      ${F(ctx, n)}`
    );
  },

  closing: (ctx, n) => {
    const m = ctx.copy.money;
    const t = ctx.copy.thankYou;
    const hasDua = !!t.duaArabic;
    return sec(
      'closing',
      `${rail(0, 150)}${rail(150, 147, true)}
      ${logoImg(ctx, 'box')}
      ${pin(n)}${kicker('Your gift at work')}
      <h2 class="h money-heading shrink" data-h="18" style="font-size:34pt">${esc(m.heading)}</h2>
      ${ticket(ctx, 'closing-ticket')}
      ${supports(ctx, 'closing-supports')}
      <div class="closing-panel">
        ${topo('left:110mm;top:30mm;width:150mm;height:150mm;color:var(--blue80)')}
        ${pin(n + 1, 10, 'on-blue')}
        <h2 class="h shrink" data-h="30" style="top:10mm;width:${hasDua ? 118 : 168}mm;font-size:40pt;line-height:.95;color:var(--yellow)">${esc(t.heading)}</h2>
        <div class="abs fit" data-max="105" style="left:28mm;top:44mm;width:${hasDua ? 118 : 168}mm;height:36mm;font-size:10.5pt;line-height:1.5"><p>${esc(t.message)}</p></div>
        ${duaCard(ctx, 'left:152mm;top:10mm;width:44mm;height:52mm;padding:3mm', true)}
        ${contact('top:86mm')}
        ${F(ctx, n)}
      </div>`
    );
  },
};

const css = `${baseCss('j')}
.j .rail{position:absolute;left:16.6mm;width:0;border-left:.7mm dashed var(--blue40);z-index:2}
.j .rail.light{border-left-color:rgba(255,255,255,.75)}
.j .stop-pin{position:absolute;left:12.2mm;width:9.6mm;height:9.6mm;border-radius:50%;background:var(--yellow);color:var(--blue);font:800 10.5pt/9.6mm var(--head);text-align:center;box-shadow:0 0 0 1.1mm #fff;z-index:3}
.j .stop-pin.on-blue{box-shadow:0 0 0 1.1mm var(--blue)}
.j .kicker{position:absolute;left:28mm;font:700 8.5pt/1.2 var(--head);letter-spacing:.16em;text-transform:uppercase;color:var(--blue);max-width:140mm}
.j .kicker b{color:var(--grey);font-weight:700}
.j .h{position:absolute;left:28mm;font:800 38pt/1 var(--head);color:var(--blue);letter-spacing:-.005em;text-wrap:balance;margin:0}
.j .h > span{display:block;width:100%}
.j .intro{position:absolute;left:28mm;font:400 10.5pt/1.5 var(--body);color:var(--ink)}
.j .chip{position:absolute;background:#fff;color:var(--blue);font:700 7.5pt/1.25 var(--head);letter-spacing:.03em;padding:1.4mm 2.6mm;border-radius:1.2mm;max-width:80mm;z-index:3}
.j .chip::before{content:"";display:inline-block;width:1.6mm;height:1.6mm;border-radius:50%;background:var(--yellow);box-shadow:0 0 0 .35mm var(--blue);margin-right:1.6mm;vertical-align:.2mm}
.j .topo{position:absolute;pointer-events:none}
.j .footer{left:28mm}
.j .footer-page::before{content:"Stop ";font-weight:600;color:var(--grey);font-size:7.5pt}
.j .icon-dot{width:11mm;height:11mm;border-radius:50%;background:var(--blue20);color:var(--blue);padding:2.4mm}
.j .icon-dot.y{background:var(--yellow)}

.j .cover-kicker{position:absolute;left:14mm;top:24mm;font:700 9.5pt var(--head);letter-spacing:.18em;text-transform:uppercase;color:#fff}
.j .cover-kicker::before{content:"";display:inline-block;width:2.4mm;height:2.4mm;border-radius:50%;background:var(--yellow);margin-right:2.4mm;vertical-align:.3mm}
.j .cover-title{position:absolute;left:14mm;top:50mm;width:138mm;height:74mm;font:800 52pt/.96 var(--head);color:#fff;letter-spacing:-.01em;text-wrap:balance;display:flex;align-items:flex-end;margin:0}
.j .cover-title span{display:block;width:100%}
.j .cover-subtitle{position:absolute;left:14mm;top:127mm;width:150mm;max-height:11mm;overflow:hidden;font:400 12pt/1.35 var(--body);color:#fff}
.j .cover-thanks{position:absolute;left:12mm;top:141mm;transform:rotate(-2.5deg);background:var(--yellow);color:var(--blue);font:400 30pt/1 var(--marker);padding:1.2mm 4mm 2mm;z-index:4}
.j .cover-photo{left:14mm;top:158mm;width:182mm;height:104mm;border-radius:4mm;box-shadow:0 0 0 1.8mm #fff}
.j .cover-for{position:absolute;left:14mm;top:268mm;width:120mm}
.j .cover-for-label{font:700 7.5pt var(--head);letter-spacing:.16em;text-transform:uppercase;color:var(--grey)}
.j .cover-donor{font:800 16pt/1.1 var(--head);color:var(--blue)}
.j .cover-meta{position:absolute;right:14mm;top:268mm;width:60mm;text-align:right;font:600 9pt/1.35 var(--head);color:var(--ink)}
.j .coords{font:500 7.5pt var(--head);letter-spacing:.08em;color:var(--grey)}

.j .letter-heading{top:34mm;font-size:60pt}
.j .letter-salutation{position:absolute;left:28mm;top:70mm;width:108mm;font:700 12.5pt/1.3 var(--head);color:var(--ink)}
.j .letter-col{position:absolute;left:28mm;top:82mm;width:108mm;height:192mm;display:flex;flex-direction:column}
.j .letter-body{flex:1;font-size:10pt;line-height:1.52}
.j .letter-sign{flex:none;padding-top:4mm}
.j .letter-name{text-transform:none;letter-spacing:0}
.j .postcard{position:absolute;left:146mm;top:52mm;width:50mm;height:64mm;background:#fff;padding:2.2mm;transform:rotate(2deg);box-shadow:0 .5mm 2.4mm rgba(0,0,0,.2)}
.j .postcard .ph{inset:2.2mm}
.j .postmark{position:absolute;left:139mm;top:104mm;width:28mm;height:28mm;color:var(--blue60);transform:rotate(-12deg);z-index:3}

.j .project-photo{left:0;top:0;width:210mm;height:118mm}
.j .project-heading{top:136mm;width:150mm;height:26mm;display:flex;align-items:flex-end}
.j .project-lead{position:absolute;left:28mm;top:166mm;width:168mm;height:22mm;font:600 13pt/1.38 var(--head);color:var(--blue)}
.j .project-body{position:absolute;left:28mm;top:192mm;width:104mm;height:84mm;font-size:9.8pt;line-height:1.5}
.j .facts{position:absolute;left:140mm;top:192mm;width:56mm;background:var(--blue20);border-radius:2.5mm;padding:4mm 4.5mm;margin:0}
.j .fact{padding:2mm 0;border-bottom:.35mm dashed var(--blue40)}
.j .fact:first-child{padding-top:0}.j .fact:last-child{border-bottom:0;padding-bottom:0}
.j .fact-label{display:block;font:700 6.8pt var(--head);letter-spacing:.14em;text-transform:uppercase;color:var(--grey)}
.j .fact-value{display:block;font:800 12pt/1.15 var(--head);color:var(--blue);margin:0}

.j .impact-heading{top:34mm;width:150mm}
.j .impact-intro{top:66mm;width:150mm;height:20mm}
.j .stats-band{position:absolute;left:0;top:90mm;width:210mm;height:68mm;background:var(--blue);overflow:hidden}
.j .stats-route{position:absolute;left:28mm;right:0;top:34mm;border-top:.7mm dashed var(--yellow)}
.j .stats{position:absolute;left:28mm;top:0;width:168mm;height:100%;display:grid;gap:4mm}
.j .stat{position:relative;min-width:0}
.j .stat-value{position:absolute;left:0;right:0;top:10mm;font:800 30pt/1 var(--head);color:#fff;white-space:nowrap;overflow:hidden}
.j .stat::after{content:"";position:absolute;left:0;top:32.2mm;width:4.4mm;height:4.4mm;border-radius:50%;background:var(--yellow);box-shadow:0 0 0 1mm var(--blue)}
.j .stat-label{position:absolute;left:0;right:2mm;top:41mm;font:700 9.5pt/1.3 var(--body);color:#fff}
.j .pillars{position:absolute;left:28mm;top:168mm;width:168mm;display:grid;grid-template-columns:repeat(3,1fr);gap:6mm}
.j .pillar-title{font:800 13pt/1.1 var(--head);color:var(--blue);margin:3mm 0 1.4mm}
.j .pillar-text{font-size:9pt;line-height:1.45;margin:0}
.j .impact-photo{left:28mm;top:228mm;width:168mm;height:46mm;border-radius:3mm}
.j .impact-photo-lg{left:28mm;top:90mm;width:168mm;height:82mm;border-radius:3mm}
.j .pillar-rows{position:absolute;left:28mm;top:182mm;width:168mm;display:flex;flex-direction:column;gap:6mm}
.j .pillar-row{display:grid;grid-template-columns:14mm 1fr;gap:5mm;align-items:start}
.j .pillar-row .icon-dot{width:14mm;height:14mm;padding:3mm}
.j .pillar-row .pillar-title{margin:.6mm 0 1mm;font-size:15pt}
.j .pillar-row .pillar-text{font-size:10pt}

.j .story-photo{left:108mm;top:0;width:102mm;height:297mm}
.j .story-heading{top:34mm;width:74mm;height:40mm;font-size:34pt;display:flex;align-items:flex-end}
.j .story-body{position:absolute;left:28mm;top:80mm;width:72mm;height:126mm;font-size:9.6pt;line-height:1.48}
.j .quote-card{position:absolute;left:28mm;top:214mm;width:150mm;min-height:50mm;background:var(--yellow);border-radius:3mm;padding:7mm 8mm 6mm 22mm;z-index:3;margin:0}
.j .quote-card::before{content:"\\201C";position:absolute;left:6mm;top:2mm;font:800 54pt/1 var(--head);color:var(--blue)}
.j .quote-text{font:700 14.5pt/1.3 var(--head);color:var(--blue);margin:0}
.j .quote-by{font:700 8.5pt var(--body);letter-spacing:.06em;color:var(--ink);margin-top:3mm;text-transform:uppercase}

.j.gallery{background:var(--blue20)}
.j .gallery-heading{top:34mm;width:150mm}
.j .gallery-intro{top:62mm;width:150mm}
.j .polaroid{position:absolute;background:#fff;box-shadow:0 .4mm 1.8mm rgba(0,0,0,.16);z-index:2;margin:0}
.j .polaroid .ph{left:2.2mm;top:2.2mm;right:2.2mm;bottom:11mm}
.j .gallery-caption{position:absolute;left:3mm;right:3mm;bottom:2mm;height:8.4mm;font:600 7.6pt/1.2 var(--head);color:var(--ink);display:flex;align-items:center;overflow:hidden}
.j .gallery-route{position:absolute;left:0;top:0;width:210mm;height:297mm;z-index:1}
.j .gallery-note{width:80mm;font:400 17pt/1.1 var(--marker);color:var(--blue);transform:rotate(-2deg)}

.j .money-heading{top:34mm;width:150mm;white-space:nowrap}
.j .ticket{position:absolute;left:28mm;top:58mm;width:168mm;height:52mm;background:var(--blue);border-radius:3mm;color:#fff;overflow:hidden}
.j .ticket::before,.j .ticket::after{content:"";position:absolute;left:118mm;width:6mm;height:6mm;border-radius:50%;background:#fff}
.j .ticket::before{top:-3mm}.j .ticket::after{bottom:-3mm}
.j .ticket-perf{position:absolute;left:121mm;top:4mm;bottom:4mm;border-left:.5mm dashed rgba(255,255,255,.6)}
.j .gift-label{position:absolute;left:8mm;top:7mm;font:700 8pt var(--head);letter-spacing:.16em;text-transform:uppercase}
.j .gift-amount{position:absolute;left:8mm;width:106mm;top:14mm;font:800 46pt/1 var(--head);white-space:nowrap;overflow:hidden}
.j .gift-type{position:absolute;left:8mm;top:36mm;font:700 11pt var(--head);letter-spacing:.04em;color:var(--yellow)}
.j .ticket-stub{position:absolute;left:127mm;top:7mm;right:6mm;font:600 8.5pt/1.25 var(--head)}
.j .ticket-stub span{display:block;font-size:6.8pt;letter-spacing:.14em;text-transform:uppercase;opacity:.8;margin-top:2.4mm}
.j .ticket-stub span:first-child{margin-top:0}
.j .money-intro{top:116mm;width:168mm;height:18mm}
.j .spend-title{position:absolute;left:28mm;top:136mm;font:800 11pt var(--head);color:var(--blue)}
.j .spend-bar{position:absolute;left:28mm;top:143mm;width:168mm;height:6mm;display:flex;gap:.8mm}
.j .spend-bar i{display:block;height:100%}
.j .spend-bar i:first-child{border-radius:3mm 0 0 3mm}.j .spend-bar i:last-child{border-radius:0 3mm 3mm 0}
.j .spend-list{position:absolute;left:28mm;top:154mm;width:168mm;margin:0;padding:0;list-style:none}
.j .spend-row{display:grid;grid-template-columns:4mm 1fr 30mm 14mm;gap:3mm;align-items:center;padding:1.8mm 0;border-bottom:.3mm dashed var(--blue40);font-size:9.8pt}
.j .spend-row:last-child{border-bottom:0}
.j .spend-swatch{width:3.2mm;height:3.2mm;border-radius:50%}
.j .spend-amount{text-align:right;font-variant-numeric:tabular-nums;color:var(--grey)}
.j .spend-pct{text-align:right;font:800 11pt var(--head);color:var(--blue);font-variant-numeric:tabular-nums}
.j .supports{position:absolute;left:28mm;top:202mm;width:168mm;display:grid;grid-template-columns:repeat(3,1fr);gap:6mm}
.j .support-title{font:800 12pt/1.1 var(--head);color:var(--blue);margin:2.6mm 0 1.2mm}
.j .support-text{font-size:9pt;line-height:1.42;margin:0}
.j .money-note{position:absolute;left:28mm;top:258mm;width:168mm;font:italic 400 8pt/1.4 var(--body);color:var(--grey)}
.j .money-photo{left:28mm;top:138mm;width:168mm;height:60mm;border-radius:3mm}

.j.back{background:var(--blue);color:#fff}
.j.back .kicker{color:#fff}
.j .ahead-heading{top:34mm;width:125mm;color:#fff;font-size:32pt;white-space:nowrap}
.j .ahead-wrap{position:absolute;left:28mm;top:50mm;width:140mm;height:56mm}
.j .ahead-text{width:126mm;font-size:10pt;line-height:1.5}
.j .ahead-list{margin:3mm 0 0;padding:0;list-style:none;font:600 10.5pt/1.3 var(--head)}
.j .ahead-list li{position:relative;padding-left:7mm;margin-bottom:2.4mm}
.j .ahead-list li::before{content:"";position:absolute;left:0;top:.9mm;width:3mm;height:3mm;border-radius:50%;background:var(--yellow)}
.j .back-thanks{top:112mm;width:168mm;color:var(--yellow);font-size:54pt;line-height:.95}
.j .back-message{position:absolute;left:28mm;top:162mm;width:140mm;height:24mm;font-size:11pt;line-height:1.5}
.j .dua-card{position:absolute;left:28mm;top:190mm;width:80mm;height:44mm;background:var(--yellow);color:var(--ink);border-radius:3mm;padding:5mm 6mm;text-align:center;display:flex;flex-direction:column;justify-content:center}
.j .dua-ar{font:700 21pt/1.6 var(--arabic);color:var(--blue)}
.j .dua-en{font:italic 400 8.5pt/1.35 var(--body);margin-top:1mm}
.j .verse{position:absolute;left:116mm;top:190mm;width:80mm;font:italic 400 9.3pt/1.5 var(--body)}
.j .verse-ref{display:block;font:700 8pt var(--head);letter-spacing:.14em;text-transform:uppercase;color:var(--yellow);margin-top:2mm;font-style:normal}
.j .contact-band{position:absolute;left:0;top:246mm;width:210mm;height:51mm;background:#fff;color:var(--ink)}
.j .contact{left:28mm;width:168mm;gap:3mm 7mm}
.j .contact-label{color:var(--grey);opacity:1}
.j .contact-value{color:var(--blue)}
.j .contact-reg .contact-value{color:var(--ink)}

.j .combo-stats{top:66mm;height:46mm}
.j .combo-stats .stats-route{top:23mm}
.j .combo-stats .stat-value{top:7mm;font-size:24pt}
.j .combo-stats .stat::after{top:21.2mm}
.j .combo-stats .stat-label{top:28.5mm;font-size:8.5pt}
.j .combo-photo{left:28mm;top:120mm;width:80mm;height:104mm;border-radius:3mm}
.j .combo-story-head{position:absolute;left:116mm;top:120mm;width:80mm;font:800 19pt/1.05 var(--head);color:var(--blue);margin:0}
.j .combo-story{position:absolute;left:116mm;top:137mm;width:80mm;height:55mm;font-size:9.4pt;line-height:1.48}
.j .combo-quote{left:116mm;top:194mm;width:80mm;min-height:30mm;padding:4.5mm 5mm 4mm 14mm}
.j .combo-quote::before{left:3.5mm;top:1mm;font-size:36pt}
.j .combo-quote .quote-text{font-size:11pt}
.j .combo-quote .quote-by{font-size:7.5pt;margin-top:1.6mm}
.j .combo-pillars{top:232mm}
.j .combo-pillars .pillar{display:grid;grid-template-columns:9mm 1fr;gap:2.6mm;align-items:start}
.j .combo-pillars .icon-dot{width:9mm;height:9mm;padding:1.8mm}
.j .combo-pillars .pillar-title{margin:0 0 .8mm;font-size:11pt;line-height:9mm;height:9mm;white-space:nowrap;overflow:hidden}
.j .combo-pillars .pillar-text{grid-column:1/-1;font-size:8.4pt}
.j .closing-ticket{top:54mm;height:44mm}
.j .closing-ticket .gift-amount{top:12mm;font-size:40pt}
.j .closing-ticket .gift-type{top:30mm}
.j .closing-supports{top:106mm}
.j .closing-panel{overflow:hidden;position:absolute;left:0;top:150mm;width:210mm;height:147mm;background:var(--blue);color:#fff}
.j .closing-panel .footer{color:rgba(255,255,255,.85)}
.j .closing-panel .footer-page{color:var(--yellow)}
.j .closing-panel .footer-page::before{color:rgba(255,255,255,.85)}
.j .closing-panel .contact-label{color:rgba(255,255,255,.75)}
.j .closing-panel .contact-value,.j .closing-panel .contact-reg .contact-value{color:#fff}
`;

export default {
  id: 'journey',
  name: 'Journey',
  description: 'Follows the gift from donor to community: a dashed route, numbered stops, map pins, postcards and a gift ticket.',
  bestFor: 'Individual donors and families; project reports that tell the story of a place.',
  get swatch() {
    return [brand.colors.blue, brand.colors.yellow, brand.colors.blue20];
  },
  pages,
  css,
};
