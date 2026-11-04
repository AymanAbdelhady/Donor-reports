// STYLE 3: "Colour Pop": friendly and community-spirited. White and warm grey
// pages, the full secondary palette, marker headlines on yellow highlights,
// round and heart-shaped photo crops and the raindrop line pattern
// (Brand Book social and campaign examples).
import { C, esc, paras, bg, icon, raindrops, texture, marker, contactBlock, duaBlock, verseBlock, signature, footer, logo, statsOrNothing } from '../helpers.js';

const sec = (cls, inner, style = '') => `<section class="page pp ${cls}"${style ? ` style="${style}"` : ''}>${inner}</section>`;
const COLORS = ['var(--blue)', 'var(--teal)', 'var(--green)', 'var(--purple)'];
const HEART_MASK = `url('data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 92" preserveAspectRatio="none"><path d="M50 90C50 90 2 62 2 28A25 25 0 0 1 50 14 25 25 0 0 1 98 28C98 62 50 90 50 90z"/></svg>')}')`;
const heart = (url, cls = '') => `<div class="pp-heart ${cls}"><div class="ph" ${bg(url)}></div></div>`;
const cap = (img, cls = '') => (img?.caption ? `<div class="pp-cap ${cls}">${esc(img.caption)}${img.illustrative ? ' <span class="illus">(illustrative)</span>' : ''}</div>` : '');
const dots = (cls = '') => `<div class="pp-dots ${cls}"><i></i><i></i><i></i><i></i><i></i></div>`;
const heading = (kicker, text, hlWord = true) => {
  // Put the last word of the heading on a yellow marker highlight.
  const words = String(text || '').trim().split(/\s+/);
  const last = hlWord && words.length > 1 ? words.pop() : '';
  return `<div class="pp-h"><div class="kicker">${esc(kicker)}</div><h2>${esc(words.join(' '))}${last ? ` ${marker(last)}` : ''}</h2></div>`;
};
const stickers = (stats) => `<div class="pp-stats n${stats.length}">${stats.map((s, i) => `<div class="st" style="--c:${COLORS[i % 4]}"><div class="v">${esc(s.value)}</div><div class="l">${esc(s.label)}</div></div>`).join('')}</div>`;
const pillars = (ctx, cls = '') => `<div class="pp-pillars ${cls}">${(ctx.copy.impact.pillars || []).slice(0, 3).map((p, i) => `<div class="pl" style="--c:${COLORS[(i + 1) % 4]}"><div class="pl-i">${icon(p.icon)}</div><div><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div></div>`).join('')}</div>`;
const supports = (ctx, cls = '') => `<div class="pp-supports ${cls}">${ctx.copy.money.supports.slice(0, 3).map((s, i) => `<div class="su" style="--c:${COLORS[i % 4]}"><div class="su-i">${icon(s.icon)}</div><div><h4>${esc(s.title)}</h4><p>${esc(s.text)}</p></div></div>`).join('')}</div>`;

const pages = {
  cover: (ctx) =>
    sec(
      'pp-cover',
      `${logo(ctx, 'box', 'logo-box')}
      <div class="pp-cv-tag">${esc(ctx.brand.tagline)}</div>
      <div class="pp-cv-blob b1"></div><div class="pp-cv-blob b2"></div><div class="pp-cv-blob b3"></div>
      <div class="pp-cv-photo ph" ${bg(ctx.cover?.url)}></div>
      <div class="pp-cv-text">
        <div class="kicker">${esc(ctx.copy.cover.kicker)}</div>
        <h1>${esc(ctx.copy.cover.title)}</h1>
        ${marker(ctx.copy.cover.highlight, 'pp-cv-hl')}
        <p>${esc(ctx.copy.cover.subtitle)}</p>
      </div>
      <div class="pp-cv-band" style="background-image:${raindrops({ base: C.blue })}"><span>Prepared for</span><strong>${esc(ctx.donorName)}</strong>${ctx.period ? `<em>${esc(ctx.period)}</em>` : ''}</div>`
    ),

  letter: (ctx, n) =>
    sec(
      'pp-letter',
      `${logo(ctx, 'colour', 'logo-sm')}
      <div class="pp-l-left">
        <div class="pp-l-photo ph" ${bg(ctx.ceo.photo, '58% 30%')}></div>
        <div class="pp-l-name">${esc(ctx.ceo.name)}</div><div class="pp-l-title">${esc(ctx.ceo.title)}</div>
        ${dots()}
      </div>
      <div class="pp-l-main">
        <div class="kicker">A message from our CEO</div>
        <h2>${marker('Thank you')}</h2>
        <div class="pp-l-card fit" data-max="135"><p class="sal">${esc(ctx.copy.ceoLetter.salutation)}</p>${paras(ctx.copy.ceoLetter.paragraphs)}${signature(ctx)}</div>
      </div>
      ${footer(ctx, n, 'pp-pf')}`
    ),

  project: (ctx, n) =>
    sec(
      'pp-project',
      `${logo(ctx, 'colour', 'logo-sm')}
      <div class="pp-p-block" style="background-image:${texture({ base: C.blue, ink: '#fff', opacity: 0.12, circles: [[1, 1, 0.6]] })}">
        <div class="kicker">The project</div><h2>${esc(ctx.copy.project.heading)}</h2><p class="lead">${esc(ctx.copy.project.lead)}</p>
      </div>
      <div class="pp-p-photo ph" ${bg(ctx.projectImg?.url)}></div><div class="pp-p-ring"></div>
      ${cap(ctx.projectImg, 'pp-p-cap')}
      <div class="pp-p-text fit" data-max="125">${paras(ctx.copy.project.paragraphs)}</div>
      <div class="pp-facts">${ctx.copy.project.keyFacts.slice(0, 5).map((f, i) => `<div class="f" style="--c:${COLORS[i % 4]}"><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</div>
      ${footer(ctx, n, 'pp-pf')}`
    ),

  impact: (ctx, n) => {
    const stats = statsOrNothing(ctx);
    return sec(
      `pp-impact ${stats.length >= 2 ? '' : 'no-stats'}`,
      `${logo(ctx, 'colour', 'logo-sm')}
      ${heading('Your impact', ctx.copy.impact.heading)}
      <p class="pp-i-intro">${esc(ctx.copy.impact.intro)}</p>
      ${stats.length >= 2 ? stickers(stats) : ''}
      <div class="pp-i-band" style="background-image:${raindrops({ base: C.blue })}">${pillars(ctx)}</div>
      ${footer(ctx, n, 'pp-pf light')}`
    );
  },

  story: (ctx, n) => {
    const s = ctx.copy.story;
    const q = s.quote ? { t: s.quote, a: s.quoteAttribution } : { t: ctx.verse.text, a: ctx.verse.ref };
    return sec(
      'pp-story',
      `${logo(ctx, 'colour', 'logo-sm')}
      ${heart(ctx.storyImg?.url, 'pp-s-heart')}
      ${cap(ctx.storyImg, 'pp-s-cap')}
      <div class="pp-s-main">${heading('A story of change', s.heading)}<div class="pp-s-text fit" data-max="125">${paras(s.paragraphs)}</div></div>
      <div class="pp-s-quote" style="background-image:${raindrops({ base: C.blue })}"><span class="qm">“</span><blockquote>${esc(q.t)}</blockquote>${q.a ? `<cite>${esc(q.a)}</cite>` : ''}<span class="qm end">”</span></div>
      ${footer(ctx, n, 'pp-pf')}`
    );
  },

  gallery: (ctx, n) =>
    sec(
      'pp-gallery',
      `${logo(ctx, 'colour', 'logo-sm')}
      ${heading('In pictures', ctx.copy.gallery.heading)}
      <p class="pp-g-intro">${esc(ctx.copy.gallery.intro)}</p>
      <div class="pp-g-grid c${ctx.gallery.length}">${ctx.gallery.map((g, i) => `<figure class="g${i}" style="--c:${COLORS[i % 4]}"><div class="ph" ${bg(g.url)}></div><figcaption>${esc(g.caption)}${g.illustrative ? ' <span class="illus">(illustrative)</span>' : ''}</figcaption></figure>`).join('')}</div>
      ${footer(ctx, n, 'pp-pf')}`
    ),

  money: (ctx, n) => {
    const m = ctx.copy.money;
    const total = ctx.budgetTotal;
    return sec(
      'pp-money',
      `${logo(ctx, 'colour', 'logo-sm')}
      ${heading('Accountability', m.heading)}
      <div class="pp-m-gift"><span>${esc(ctx.givingType)}</span><strong>${esc(ctx.amount || 'With thanks')}</strong><em>${esc(ctx.donorName)}</em></div>
      <p class="pp-m-intro">${esc(m.intro)}</p>
      ${ctx.budget.length
        ? `<div class="pp-split"><div class="bar">${ctx.budget.map((b, i) => `<span class="sw${i % 6}" style="flex:${b.amount}"></span>`).join('')}</div>
           <div class="legend">${ctx.budget.map((b, i) => `<div><i class="sw${i % 6}"></i><b>${Math.round((b.amount / total) * 100)}%</b><span>${esc(b.label)}</span><em>R&nbsp;${Math.round(b.amount).toLocaleString('en-ZA').replace(/[,\s ]/g, ' ')}</em></div>`).join('')}</div></div>`
        : `<div class="pp-m-photo ph" ${bg(ctx.moneyImg?.url)}></div>`}
      <div class="pp-m-sup"><h3>What your gift supports</h3>${supports(ctx)}</div>
      <p class="pp-note">${esc(m.note)}</p>
      ${footer(ctx, n, 'pp-pf')}`
    );
  },

  back: (ctx) => {
    const a = ctx.copy.ahead;
    return sec(
      'pp-back',
      `<div class="pp-b-top">
        ${logo(ctx, 'box', 'logo-box')}
        <div class="pp-b-ahead"><div class="kicker">What comes next</div><h3>${esc(a.heading)}</h3><div class="fit">${paras(a.paragraphs)}${a.bullets?.length ? `<ul>${a.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}</div></div>
        <div class="pp-b-photo ph" ${bg(ctx.backImg?.url)}></div>
      </div>
      <div class="pp-b-main" style="background-image:${raindrops({ base: C.blue })}">
        ${marker('Thank you', 'pp-b-hl')}
        <h2>${esc(ctx.copy.thankYou.heading)}</h2>
        <p>${esc(ctx.copy.thankYou.message)}</p>
        ${duaBlock(ctx)}
        <div class="pp-b-foot">${verseBlock(ctx)}${contactBlock()}</div>
      </div>
      <div class="pp-stripe"><i></i><i></i><i></i><i></i><i></i></div>`
    );
  },

  impactStory: (ctx, n) => {
    const stats = statsOrNothing(ctx, 3);
    const s = ctx.copy.story;
    return sec(
      'pp-is',
      `${logo(ctx, 'colour', 'logo-sm')}
      ${heading('Your impact', ctx.copy.impact.heading)}
      ${stats.length >= 2 ? stickers(stats) : ''}
      <div class="pp-is-band ${stats.length >= 2 ? '' : 'tall'}" style="background-image:${raindrops({ base: C.blue })}">${pillars(ctx, 'row')}</div>
      <div class="pp-is-bottom">${heart(ctx.storyImg?.url, 'pp-is-heart')}
        <div class="pp-is-text"><div class="kicker">A story of change</div><h3>${esc(s.heading)}</h3>
        <div class="fit">${paras(s.paragraphs)}${s.quote ? `<blockquote>“${esc(s.quote)}”${s.quoteAttribution ? `<cite>${esc(s.quoteAttribution)}</cite>` : ''}</blockquote>` : ''}</div></div>
      </div>
      ${footer(ctx, n, 'pp-pf')}`
    );
  },

  closing: (ctx) =>
    sec(
      'pp-closing',
      `${logo(ctx, 'colour', 'logo-sm')}
      ${heading('Your gift at work', ctx.copy.money.heading)}
      <div class="pp-c-row"><div class="pp-m-gift small"><span>${esc(ctx.givingType)}</span><strong>${esc(ctx.amount || 'With thanks')}</strong></div>${supports(ctx, 'col')}</div>
      <div class="pp-b-main pp-c-main" style="background-image:${raindrops({ base: C.blue })}">
        ${marker('Thank you', 'pp-b-hl')}
        <h2>${esc(ctx.copy.thankYou.heading)}</h2>
        <p>${esc(ctx.copy.thankYou.message)}</p>
        ${duaBlock(ctx)}
        <div class="pp-b-foot">${contactBlock()}<img class="pp-c-logo" src="${ctx.logos.white}" alt=""></div>
      </div>
      <div class="pp-stripe"><i></i><i></i><i></i><i></i><i></i></div>`
    ),
};

const css = `
.pp{color:var(--ink)}
.pp .kicker{color:var(--purple)}
.pp h2{font-size:34pt;color:var(--blue);text-transform:uppercase}
.pp h2 .hl{font-size:1.02em;text-transform:none;transform:rotate(-2deg);margin-left:1mm}
.pp .lead{font-family:var(--head);font-weight:600;font-size:13.5pt;line-height:1.3}
.pp-pf{color:var(--grey)}
.pp-pf b{color:var(--blue)}
.pp-pf.light,.pp-pf.light b{color:#fff}
.pp-cap{position:absolute;font-size:7.5pt;color:var(--grey);font-style:italic;z-index:5}
.pp-dots{display:flex;gap:2mm}
.pp-dots i{width:4mm;height:4mm;border-radius:50%}
.pp-dots i:nth-child(1){background:var(--blue)}.pp-dots i:nth-child(2){background:var(--teal)}.pp-dots i:nth-child(3){background:var(--green)}.pp-dots i:nth-child(4){background:var(--yellow)}.pp-dots i:nth-child(5){background:var(--purple)}
.pp-stripe{position:absolute;left:0;right:0;bottom:0;height:4mm;display:flex;z-index:6}
.pp-stripe i{flex:1}.pp-stripe i:nth-child(1){background:var(--blue)}.pp-stripe i:nth-child(2){background:var(--teal)}.pp-stripe i:nth-child(3){background:var(--green)}.pp-stripe i:nth-child(4){background:var(--yellow)}.pp-stripe i:nth-child(5){background:var(--purple)}
.pp-h{position:absolute;left:14mm;right:46mm;top:20mm}
.pp-h h2{margin-top:2mm}
.pp-heart{position:absolute}
.pp-heart .ph{width:100%;height:100%;-webkit-mask-image:${HEART_MASK};mask-image:${HEART_MASK};-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat}
.pp-cover .pp-cv-band,.pp-b-main,.pp-i-band,.pp-s-quote,.pp-is-band,.pp-p-block{background-color:var(--blue)}

/* cover */
.pp-cover{background:var(--warm)}
.pp-cv-tag{position:absolute;left:14mm;top:13mm;font-family:var(--head);font-weight:800;letter-spacing:.24em;font-size:9.5pt;text-transform:uppercase;color:var(--blue)}
.pp-cv-photo{position:absolute;left:14mm;top:34mm;width:132mm;height:132mm;border-radius:50%;border:3mm solid #fff;z-index:3}
.pp-cv-blob{position:absolute;border-radius:50%;z-index:2}
.pp-cv-blob.b1{left:4mm;top:24mm;width:152mm;height:152mm;background:var(--teal)}
.pp-cv-blob.b2{left:128mm;top:134mm;width:34mm;height:34mm;background:var(--yellow);z-index:4}
.pp-cv-blob.b3{left:150mm;top:110mm;width:16mm;height:16mm;background:var(--green);z-index:4}
.pp-cv-text{position:absolute;left:14mm;right:14mm;top:178mm;z-index:5}
.pp-cv-text .kicker{color:var(--purple);margin-bottom:2mm}
.pp-cover h1{font-size:42pt;line-height:.95;color:var(--blue);text-transform:uppercase;max-width:182mm}
.pp-cv-hl{font-size:30pt;transform:rotate(-2deg);margin:3mm 0 3mm}
.pp-cv-text p{font-size:12.5pt;line-height:1.35;max-width:160mm}
.pp-cv-band{position:absolute;left:0;right:0;bottom:0;height:30mm;color:#fff;display:flex;flex-direction:column;justify-content:center;padding:0 14mm;background-size:120px}
.pp-cv-band span{font-family:var(--head);font-weight:700;font-size:8pt;letter-spacing:.2em;text-transform:uppercase;color:var(--yellow)}
.pp-cv-band strong{font-family:var(--head);font-weight:800;font-size:18pt;text-transform:uppercase;line-height:1.05}
.pp-cv-band em{font-style:normal;font-size:8.5pt;opacity:.9}

/* letter */
.pp-letter{background:#fff}
.pp-l-left{position:absolute;left:0;top:0;bottom:0;width:66mm;background:var(--warm);padding:30mm 8mm 0;display:flex;flex-direction:column;align-items:center;text-align:center}
.pp-l-photo{width:50mm;height:50mm;border-radius:50%;border:2mm solid #fff;box-shadow:0 0 0 2mm var(--teal)}
.pp-l-name{font-family:var(--head);font-weight:800;font-size:16pt;color:var(--blue);text-transform:uppercase;margin-top:7mm;line-height:1}
.pp-l-title{font-size:9pt;color:var(--grey);margin:1.5mm 0 6mm}
.pp-l-main{position:absolute;left:76mm;right:14mm;top:30mm;bottom:20mm;display:flex;flex-direction:column}
.pp-l-main h2 .hl{font-size:38pt;margin:2mm 0 5mm}
.pp-l-card{flex:1;border-left:2mm solid var(--yellow);padding-left:6mm}
.pp-l-card p{font-size:11pt;line-height:1.6}
.pp-l-card .sal{font-family:var(--head);font-weight:700;font-size:13.5pt;color:var(--blue)}
.pp .sig-script{color:var(--blue)}
.pp .sig-name{color:var(--purple)}
.pp-letter .pf{left:76mm}

/* project */
.pp-p-block{position:absolute;left:0;top:0;width:128mm;height:132mm;color:#fff;padding:24mm 12mm 10mm 14mm;border-radius:0 0 60mm 0;background-size:cover;z-index:2}
.pp-p-block .kicker{color:var(--yellow)}
.pp-p-block h2{color:#fff;margin:2mm 0 5mm;font-size:32pt}
.pp-p-block .lead{max-width:96mm}
.pp-p-photo{position:absolute;right:-18mm;top:60mm;width:118mm;height:118mm;border-radius:50%;border:3mm solid #fff;z-index:3}
.pp-p-ring{position:absolute;right:-24mm;top:54mm;width:130mm;height:130mm;border-radius:50%;border:1.6mm dashed var(--green);z-index:1}
.pp-p-cap{right:14mm;top:182mm}
.pp-p-text{position:absolute;left:14mm;width:90mm;top:142mm;bottom:56mm}
.pp-facts{position:absolute;left:14mm;right:14mm;bottom:20mm;height:30mm;display:flex;gap:3mm}
.pp-facts .f{flex:1;background:var(--c);color:#fff;border-radius:3mm;padding:3.5mm 4mm;display:flex;flex-direction:column;justify-content:center}
.pp-facts dt{font-family:var(--head);font-weight:700;font-size:7pt;letter-spacing:.14em;text-transform:uppercase;opacity:.9}
.pp-facts dd{font-family:var(--head);font-weight:800;font-size:10.5pt;line-height:1.1}

/* impact */
.pp-impact{background:var(--warm)}
.pp-i-intro{position:absolute;left:14mm;right:46mm;top:56mm;font-size:12.5pt;line-height:1.4}
.pp-stats{position:absolute;left:12mm;right:12mm;top:80mm;display:grid;grid-template-columns:repeat(4,1fr);gap:3mm;justify-items:center}
.pp-stats.n2{grid-template-columns:repeat(2,1fr)}.pp-stats.n3{grid-template-columns:repeat(3,1fr)}
.pp-stats .st{width:44mm;height:44mm;border-radius:50%;background:var(--c);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:4mm;box-shadow:0 0 0 1.6mm #fff,0 0 0 2.6mm var(--c)}
.pp-stats .st:nth-child(even){transform:translateY(8mm)}
.pp-stats .v{font-family:var(--head);font-weight:800;font-size:25pt;line-height:1}
.pp-stats .l{font-family:var(--head);font-weight:700;font-size:8pt;text-transform:uppercase;letter-spacing:.04em;line-height:1.1;margin-top:1.2mm}
.pp-i-band{position:absolute;left:0;right:0;bottom:0;height:150mm;background-size:120px;padding:22mm 14mm 22mm;border-radius:40mm 40mm 0 0}
.pp-pillars{display:grid;grid-template-columns:1fr;gap:5mm;height:100%}
.pp-pillars .pl{background:#fff;border-radius:4mm;display:flex;gap:6mm;align-items:center;padding:5mm 7mm}
.pp-pillars .pl-i{flex:none;width:18mm;height:18mm;border-radius:50%;background:var(--yellow);color:var(--c);padding:3.6mm}
.pp-pillars h3{font-size:16pt;color:var(--c);text-transform:uppercase}
.pp-pillars p{font-size:10.5pt;line-height:1.4;margin:1mm 0 0}
.pp-impact.no-stats .pp-i-band{height:212mm}
.pp-impact.no-stats .pp-i-intro{font-size:15pt}
.pp-impact.no-stats .pp-pillars h3{font-size:20pt}

/* story */
.pp-s-heart{left:10mm;top:56mm;width:104mm;height:96mm}
.pp-s-cap{left:14mm;top:154mm;width:96mm}
.pp-s-main{position:absolute;left:0;right:0;top:0;bottom:0}
.pp-s-main .pp-h{right:14mm}
.pp-s-text{position:absolute;left:120mm;right:14mm;top:58mm;bottom:104mm}
.pp-s-quote{position:absolute;left:14mm;right:14mm;bottom:20mm;height:76mm;border-radius:6mm;color:#fff;padding:12mm 18mm 10mm;background-size:120px;display:flex;flex-direction:column;justify-content:center}
.pp-s-quote .qm{position:absolute;left:5mm;top:3mm;font-family:var(--head);font-weight:900;font-size:70pt;line-height:1;color:var(--yellow)}
.pp-s-quote .qm.end{left:auto;right:6mm;top:auto;bottom:-14mm}
.pp-s-quote blockquote{font-family:var(--marker);font-size:21pt;line-height:1.2}
.pp-s-quote cite{display:block;font-style:normal;font-family:var(--head);font-weight:700;font-size:9pt;letter-spacing:.14em;text-transform:uppercase;margin-top:3mm;color:var(--yellow)}

/* gallery */
.pp-gallery{background:var(--warm)}
.pp-g-intro{position:absolute;left:14mm;right:46mm;top:54mm;font-size:11.5pt}
.pp-g-grid{position:absolute;left:14mm;right:14mm;top:72mm;bottom:22mm;display:grid;grid-template-columns:repeat(6,1fr);grid-auto-rows:1fr;gap:7mm 5mm}
.pp-g-grid figure{background:#fff;padding:2.5mm 2.5mm 0;border-radius:3mm;display:flex;flex-direction:column;min-height:0;border-top:2mm solid var(--c);grid-column:span 2}
.pp-g-grid .ph{flex:1;min-height:0;border-radius:2mm}
.pp-g-grid figcaption{font-size:7.5pt;padding:1.6mm .5mm 2mm;color:var(--ink);flex:none}
.pp-g-grid figure:nth-child(odd){transform:rotate(-1.2deg)}.pp-g-grid figure:nth-child(even){transform:rotate(1.2deg)}
.pp-g-grid .g0{grid-column:span 4;grid-row:span 2}
.pp-g-grid.c2 .g0,.pp-g-grid.c2 .g1{grid-column:span 6;grid-row:span 1}
.pp-g-grid.c3 .g1,.pp-g-grid.c3 .g2{grid-column:span 2}
.pp-g-grid.c4 .g3{grid-column:span 6}
.pp-g-grid.c5 .g3,.pp-g-grid.c5 .g4{grid-column:span 3}
.pp-g-grid.c6 .g3,.pp-g-grid.c6 .g4,.pp-g-grid.c6 .g5{grid-column:span 2}

/* money */
.pp-m-gift{position:absolute;left:14mm;top:62mm;width:70mm;height:70mm;border-radius:50%;background:var(--yellow);color:var(--blue);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:6mm;box-shadow:0 0 0 2mm #fff,0 0 0 3.4mm var(--blue)}
.pp-m-gift span{font-family:var(--head);font-weight:700;font-size:8.5pt;letter-spacing:.16em;text-transform:uppercase;color:var(--purple)}
.pp-m-gift strong{font-family:var(--head);font-weight:900;font-size:25pt;line-height:1;margin:1.5mm 0}
.pp-m-gift em{font-style:normal;font-size:8.5pt}
.pp-m-gift.small{position:static;width:58mm;height:58mm;flex:none}
.pp-m-gift.small strong{font-size:19pt}
.pp-m-intro{position:absolute;left:94mm;right:14mm;top:72mm;font-size:12pt;line-height:1.45}
.pp-split{position:absolute;left:94mm;right:14mm;top:100mm;height:58mm}
.pp-split .bar{display:flex;height:9mm;border-radius:4.5mm;overflow:hidden;gap:1mm;margin-bottom:4mm}
.pp-split .legend div{display:grid;grid-template-columns:4mm 12mm 1fr auto;gap:2mm;align-items:center;font-size:9pt;padding:1.4mm 0;border-bottom:.2mm solid rgba(0,0,0,.1)}
.pp-split .legend i{width:3.4mm;height:3.4mm;border-radius:50%}
.pp-split .legend b{font-family:var(--head);font-size:11pt;color:var(--blue)}
.pp-split .legend em{font-style:normal;font-family:var(--head);font-weight:700}
.pp-m-photo{position:absolute;left:94mm;right:14mm;top:100mm;height:56mm;border-radius:30mm 4mm 4mm 30mm}
.pp-m-sup{position:absolute;left:0;right:0;top:170mm;bottom:0;background:var(--warm);padding:10mm 14mm 30mm}
.pp-m-sup h3{font-size:16pt;color:var(--blue);text-transform:uppercase;margin-bottom:5mm}
.pp-supports{display:grid;grid-template-columns:repeat(3,1fr);gap:5mm}
.pp-supports .su{background:#fff;border-radius:4mm;padding:6mm 5mm;border-bottom:2mm solid var(--c)}
.pp-supports .su-i{width:15mm;height:15mm;border-radius:50%;background:var(--c);color:#fff;padding:3.2mm;margin-bottom:3mm}
.pp-supports h4{font-family:var(--head);font-weight:800;font-size:13.5pt;text-transform:uppercase;color:var(--c);line-height:1.05;margin-bottom:1.5mm}
.pp-supports p{font-size:9.5pt;line-height:1.4;margin:0}
.pp-note{position:absolute;left:14mm;right:14mm;bottom:19mm;font-size:8.5pt;font-style:italic;color:var(--grey);z-index:3}
.pp-money .pf{z-index:4}

/* back */
.pp-b-top{position:absolute;left:0;right:0;top:0;height:120mm;background:var(--warm)}
.pp-b-ahead{position:absolute;left:14mm;top:20mm;width:104mm;height:92mm;display:flex;flex-direction:column}
.pp-b-ahead h3{font-size:24pt;color:var(--blue);text-transform:uppercase;margin:1.5mm 0 3mm}
.pp-b-ahead .fit{flex:1}
.pp-b-ahead ul{margin:2mm 0 0 4.5mm}
.pp-b-photo{position:absolute;right:14mm;top:58mm;width:64mm;height:64mm;border-radius:50%;border:2.4mm solid #fff;box-shadow:0 0 0 1.6mm var(--green);z-index:3}
.pp-b-main{position:absolute;left:0;right:0;bottom:0;top:120mm;color:#fff;padding:20mm 14mm 16mm;background-size:120px;border-radius:30mm 0 0 0}
.pp-b-hl{font-size:30pt;transform:rotate(-2deg)}
.pp-b-main h2{color:#fff;font-size:44pt;margin:4mm 0 3mm}
.pp-b-main p{font-size:12.5pt;line-height:1.4;max-width:160mm}
.pp-b-main .dua .ar{color:var(--yellow)}
.pp-b-foot{position:absolute;left:14mm;right:14mm;bottom:14mm;display:flex;justify-content:space-between;align-items:flex-end;gap:10mm;border-top:.4mm solid rgba(255,255,255,.5);padding-top:5mm}
.pp-b-foot .verse{max-width:95mm}
.pp-b-foot .verse blockquote{font-size:11.5pt}
.pp-b-foot .verse figcaption{color:var(--yellow)}
.pp-b-foot .contact{text-align:right}

/* impact + story */
.pp-is .pp-stats{top:52mm}
.pp-is .pp-stats .st{width:40mm;height:40mm}
.pp-is-band{position:absolute;left:0;right:0;top:110mm;height:62mm;background-size:120px;padding:8mm 12mm}
.pp-is-band.tall{top:58mm;height:114mm;padding:12mm}
.pp-pillars.row{grid-template-columns:repeat(3,1fr);gap:4mm}
.pp-pillars.row .pl{flex-direction:column;align-items:flex-start;gap:2mm;padding:4mm 5mm}
.pp-pillars.row .pl-i{width:13mm;height:13mm;padding:2.6mm}
.pp-pillars.row h3{font-size:12.5pt}
.pp-pillars.row p{font-size:8.5pt}
.pp-is-bottom{position:absolute;left:14mm;right:14mm;top:180mm;bottom:20mm;display:flex;gap:7mm}
.pp-is-heart{position:relative;width:74mm;height:68mm;flex:none}
.pp-is-text{flex:1;display:flex;flex-direction:column;min-width:0}
.pp-is-text h3{font-size:20pt;color:var(--blue);text-transform:uppercase;margin:1.5mm 0 3mm}
.pp-is-text .fit{flex:1}
.pp-is-text blockquote{font-family:var(--marker);font-size:14pt;color:var(--purple);line-height:1.2}
.pp-is-text cite{display:block;font-style:normal;font-family:var(--head);font-size:8pt;letter-spacing:.12em;text-transform:uppercase;color:var(--teal)}

/* closing */
.pp-c-row{position:absolute;left:14mm;right:14mm;top:62mm;display:flex;gap:8mm;align-items:center}
.pp-supports.col{grid-template-columns:1fr;gap:3mm;flex:1}
.pp-supports.col .su{display:flex;gap:4mm;align-items:center;padding:3mm 4mm;border-bottom:0;border-left:2mm solid var(--c);background:var(--warm)}
.pp-supports.col .su-i{flex:none;margin:0;width:11mm;height:11mm;padding:2.3mm}
.pp-supports.col h4{font-size:11.5pt}
.pp-c-main{top:140mm}
.pp-c-logo{height:22mm}
`;

export default {
  id: 'pop',
  name: 'Colour Pop',
  description: 'Warm, friendly and colourful: the full brand palette, marker headlines, heart and circle photo crops.',
  bestFor: 'Community donors, families, schools, mosques and seasonal appeals',
  get swatch() {
    return [C.yellow, C.teal, C.purple];
  },
  pages,
  css,
};
