// STYLE 6: "Impact Numbers": an infographic, data-first report. Big figures,
// tiles, a project timeline, a spending donut and a cost-per-person metric.
// Clean blue grid paper with yellow and green accents.
import { C, esc, paras, bg, icon, donut, contactBlock, duaBlock, verseBlock, signature, footer, logo, statsOrNothing, rand, perPerson } from '../helpers.js';

const grid = (base, ink = '#fff', op = 0.1) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="${base}"/><path d="M40 0H0V40" fill="none" stroke="${ink}" stroke-opacity="${op}" stroke-width="1"/></svg>`;
  return `url('data:image/svg+xml,${encodeURIComponent(svg)}')`;
};
const BLUE_ = () => grid(C.blue);
const PAPER_ = () => grid('#ffffff', C.blue, 0.07);
const sec = (cls, inner, style = '') => `<section class="page nm ${cls}"${style ? ` style="${style}"` : ''}>${inner}</section>`;
const COLS = ['var(--blue)', 'var(--green)', 'var(--teal)', 'var(--purple)'];
const ICONS_FOR = (ctx) => (ctx.copy.impact.pillars || []).map((p) => p.icon).concat(['star', 'heart', 'hands', 'globe']);
const tiles = (ctx, st, cls = '') => {
  const ic = ICONS_FOR(ctx);
  return `<div class="nm-tiles n${st.length} ${cls}">${st.map((s, i) => `<div class="t" style="--c:${COLS[i % 4]}"><div class="t-i">${icon(ic[i])}</div><div class="v">${esc(s.value)}</div><div class="l">${esc(s.label)}</div></div>`).join('')}</div>`;
};
const pillars = (ctx, cls = '') => `<div class="nm-pillars ${cls}">${(ctx.copy.impact.pillars || []).slice(0, 3).map((p, i) => `<div class="pl" style="--c:${COLS[(i + 1) % 4]}"><div class="pl-i">${icon(p.icon)}</div><div><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div></div>`).join('')}</div>`;
const kpi = (label, value, cls = '') => (value ? `<div class="nm-kpi ${cls}"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>` : '');
const heroFigure = (ctx) => {
  const s = statsOrNothing(ctx, 1)[0];
  return s ? { v: s.value, l: s.label } : ctx.amount ? { v: ctx.amount, l: `${ctx.givingType} given` } : { v: 'Thank you', l: '' };
};

const pages = {
  cover: (ctx) => {
    const h = heroFigure(ctx);
    return sec(
      'nm-cover',
      `<div class="nm-cv-top" style="background-image:${BLUE_()}">
        ${logo(ctx, 'white', 'logo-box')}
        <div class="kicker">${esc(ctx.copy.cover.kicker)}</div>
        <div class="nm-cv-big" style="font-size:${h.v.length > 8 ? 70 : h.v.length > 6 ? 90 : 118}pt">${esc(h.v)}</div>${h.l ? `<div class="nm-cv-lbl">${esc(h.l)}</div>` : ''}
        <h1>${esc(ctx.copy.cover.title)}</h1>
        <p>${esc(ctx.copy.cover.subtitle)}</p>
      </div>
      <div class="nm-cv-photo ph" ${bg(ctx.cover?.url)}></div>
      <div class="nm-cv-facts">
        ${kpi('Prepared for', ctx.donorName)}${kpi(ctx.givingType, ctx.amount)}${kpi('Where', ctx.place)}${kpi('Period', ctx.period)}
      </div>`
    );
  },

  letter: (ctx, n) => {
    const st = statsOrNothing(ctx, 2);
    return sec(
      'nm-letter',
      `<aside class="nm-l-side" style="background-image:${BLUE_()}">
        <div class="nm-l-photo ph" ${bg(ctx.ceo.photo, '58% 30%')}></div>
        <div class="nm-l-name">${esc(ctx.ceo.name)}</div><div class="nm-l-title">${esc(ctx.ceo.title)}</div>
        <div class="nm-glance"><h4>At a glance</h4>${kpi(ctx.givingType, ctx.amount)}${st.map((s) => kpi(s.label, s.value)).join('')}${kpi('Where', ctx.place)}</div>
      </aside>
      ${logo(ctx, 'colour', 'logo-sm')}
      <div class="nm-l-main"><div class="kicker">A message from our CEO</div><h2>Thank you</h2>
        <div class="nm-l-body fit" data-max="135"><p class="sal">${esc(ctx.copy.ceoLetter.salutation)}</p>${paras(ctx.copy.ceoLetter.paragraphs)}${signature(ctx)}</div></div>
      ${footer(ctx, n, 'nm-pf')}`
    );
  },

  project: (ctx, n) => {
    const p = ctx.copy.project;
    const steps = [
      ['The need', p.lead],
      ['What we did', p.paragraphs[0] || ''],
      ['The result', ctx.copy.impact.intro],
      ['What’s next', ctx.copy.ahead.bullets?.[0] || ctx.copy.ahead.paragraphs?.[0] || ''],
    ].filter((x) => x[1]);
    return sec(
      'nm-project',
      `${logo(ctx, 'colour', 'logo-sm')}
      <div class="nm-head"><div class="kicker">The project</div><h2>${esc(p.heading)}</h2></div>
      <div class="nm-p-photo ph" ${bg(ctx.projectImg?.url)}>${ctx.projectImg?.caption ? `<span>${esc(ctx.projectImg.caption)}${ctx.projectImg.illustrative ? ' (illustrative)' : ''}</span>` : ''}</div>
      <div class="nm-timeline n${steps.length}">${steps.map(([t, x], i) => `<div class="step" style="--c:${COLS[i % 4]}"><div class="dot">${i + 1}</div><h4>${esc(t)}</h4><div class="fit" data-max="115"><p>${esc(x)}</p></div></div>`).join('')}</div>
      <dl class="nm-facts">${p.keyFacts.slice(0, 5).map((f, i) => `<div style="--c:${COLS[i % 4]}"><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>
      ${footer(ctx, n, 'nm-pf')}`
    );
  },

  impact: (ctx, n) => {
    const st = statsOrNothing(ctx);
    const pp = perPerson(ctx);
    return sec(
      `nm-impact ${st.length >= 2 ? '' : 'no-stats'}`,
      `${logo(ctx, 'colour', 'logo-sm')}
      <div class="nm-head"><div class="kicker">Your impact</div><h2>${esc(ctx.copy.impact.heading)}</h2><p>${esc(ctx.copy.impact.intro)}</p></div>
      ${st.length >= 2 ? tiles(ctx, st) : ''}
      ${pp ? `<div class="nm-pp"><div class="nm-pp-v">${esc(pp)}</div><div><strong>per person reached</strong><span>Your ${esc(ctx.givingType.toLowerCase())} of ${esc(ctx.amount)} divided by ${esc(ctx.brief.project.beneficiaries)} people</span></div></div>` : ''}
      <div class="nm-i-band" style="background-image:${BLUE_()}">${pillars(ctx)}</div>
      ${footer(ctx, n, 'nm-pf light')}`,
      `background-image:${PAPER_()}`
    );
  },

  story: (ctx, n) => {
    const s = ctx.copy.story;
    const q = s.quote ? { t: s.quote, a: s.quoteAttribution } : { t: ctx.verse.text, a: ctx.verse.ref };
    return sec(
      'nm-story',
      `${logo(ctx, 'colour', 'logo-sm')}
      <div class="nm-head"><div class="kicker">A story of change</div><h2>${esc(s.heading)}</h2></div>
      <div class="nm-s-photo ph" ${bg(ctx.storyImg?.url)}></div>
      <div class="nm-s-q" style="background-image:${BLUE_()}"><span>“</span><blockquote>${esc(q.t)}</blockquote>${q.a ? `<cite>${esc(q.a)}</cite>` : ''}</div>
      <div class="nm-s-text fit" data-max="125">${paras(s.paragraphs)}</div>
      ${footer(ctx, n, 'nm-pf')}`,
      `background-image:${PAPER_()}`
    );
  },

  gallery: (ctx, n) =>
    sec(
      'nm-gallery',
      `${logo(ctx, 'colour', 'logo-sm')}
      <div class="nm-head"><div class="kicker">In pictures</div><h2>${esc(ctx.copy.gallery.heading)}</h2><p>${esc(ctx.copy.gallery.intro)}</p></div>
      <div class="nm-g c${ctx.gallery.length}">${ctx.gallery.map((g, i) => `<figure class="g${i}"><div class="ph" ${bg(g.url)}><b style="background:${COLS[i % 4]}">${i + 1}</b></div><figcaption>${esc(g.caption)}${g.illustrative ? ' (illustrative)' : ''}</figcaption></figure>`).join('')}</div>
      ${footer(ctx, n, 'nm-pf')}`,
      `background-image:${PAPER_()}`
    ),

  money: (ctx, n) => {
    const m = ctx.copy.money;
    const total = ctx.budgetTotal;
    const pp = perPerson(ctx);
    return sec(
      'nm-money',
      `${logo(ctx, 'colour', 'logo-sm')}
      <div class="nm-head"><div class="kicker">Accountability</div><h2>${esc(m.heading)}</h2><p>${esc(m.intro)}</p></div>
      <div class="nm-m-row">
        ${ctx.budget.length ? `<div class="nm-donut">${donut(ctx.budget, total, [C.blue, C.green, C.teal, C.purple, C.yellow, C.blue60], 200)}<div class="c"><span>Total</span><strong>${esc(rand(total))}</strong></div></div>
          <div class="nm-legend">${ctx.budget.map((b, i) => `<div><i class="sw${[0, 2, 1, 3, 4, 5][i % 6]}"></i><b>${Math.round((b.amount / total) * 100)}%</b><span>${esc(b.label)}</span><em>${rand(b.amount)}</em></div>`).join('')}</div>`
        : `<div class="nm-m-kpis">${kpi(ctx.givingType, ctx.amount, 'big')}${pp ? kpi('Per person reached', pp, 'big') : ''}</div><div class="nm-m-photo ph" ${bg(ctx.moneyImg?.url)}></div>`}
      </div>
      ${ctx.budget.length ? `<div class="nm-m-kpis row">${kpi(ctx.givingType, ctx.amount)}${pp ? kpi('Per person reached', pp) : ''}${kpi('Budget lines', String(ctx.budget.length))}</div>` : ''}
      <div class="nm-m-sup"><h3>What your gift supports</h3><div class="nm-sup">${m.supports.slice(0, 3).map((s, i) => `<div class="su" style="--c:${COLS[i % 4]}"><div class="su-i">${icon(s.icon)}</div><h4>${esc(s.title)}</h4><p>${esc(s.text)}</p></div>`).join('')}</div></div>
      <p class="nm-note">${esc(m.note)}</p>
      ${footer(ctx, n, 'nm-pf')}`,
      `background-image:${PAPER_()}`
    );
  },

  back: (ctx) => {
    const st = statsOrNothing(ctx, 4);
    const a = ctx.copy.ahead;
    return sec(
      'nm-back',
      `${logo(ctx, 'white', 'logo-box')}
      <div class="nm-b-ty"><div class="kicker">Thank you</div><h2>${esc(ctx.copy.thankYou.heading)}</h2><p>${esc(ctx.copy.thankYou.message)}</p>${duaBlock(ctx)}</div>
      ${st.length >= 2 ? `<div class="nm-recap"><h4>Your impact in numbers</h4><div>${st.map((s) => `<span><b>${esc(s.value)}</b>${esc(s.label)}</span>`).join('')}</div></div>` : ''}
      <div class="nm-b-ahead"><h3>${esc(a.heading)}</h3><div class="fit">${paras(a.paragraphs)}${a.bullets?.length ? `<ul>${a.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}</div></div>
      <div class="nm-b-foot">${verseBlock(ctx)}${contactBlock()}</div>`,
      `background-image:${BLUE_()}`
    );
  },

  impactStory: (ctx, n) => {
    const st = statsOrNothing(ctx, 3);
    const s = ctx.copy.story;
    return sec(
      'nm-is',
      `${logo(ctx, 'colour', 'logo-sm')}
      <div class="nm-head"><div class="kicker">Your impact</div><h2>${esc(ctx.copy.impact.heading)}</h2></div>
      ${st.length >= 2 ? tiles(ctx, st, 'compact') : pillars(ctx, 'loose')}
      <div class="nm-is-low">
        <div class="nm-is-photo ph" ${bg(ctx.storyImg?.url)}></div>
        <div class="nm-is-text"><div class="kicker">A story of change</div><h3>${esc(s.heading)}</h3>
          <div class="fit">${paras(s.paragraphs)}${s.quote ? `<blockquote>“${esc(s.quote)}”${s.quoteAttribution ? `<cite>${esc(s.quoteAttribution)}</cite>` : ''}</blockquote>` : ''}</div></div>
      </div>
      ${footer(ctx, n, 'nm-pf')}`,
      `background-image:${PAPER_()}`
    );
  },

  closing: (ctx) => {
    const m = ctx.copy.money;
    const pp = perPerson(ctx);
    return sec(
      'nm-closing',
      `${logo(ctx, 'colour', 'logo-sm')}
      <div class="nm-head"><div class="kicker">Your gift at work</div><h2>${esc(m.heading)}</h2></div>
      <div class="nm-m-kpis row top">${kpi(ctx.givingType, ctx.amount, 'big')}${pp ? kpi('Per person reached', pp, 'big') : ''}</div>
      <div class="nm-sup c">${m.supports.slice(0, 3).map((s, i) => `<div class="su" style="--c:${COLS[i % 4]}"><div class="su-i">${icon(s.icon)}</div><h4>${esc(s.title)}</h4><p>${esc(s.text)}</p></div>`).join('')}</div>
      <div class="nm-c-bottom" style="background-image:${BLUE_()}">
        <div class="kicker">Thank you</div><h2>${esc(ctx.copy.thankYou.heading)}</h2><p>${esc(ctx.copy.thankYou.message)}</p>${duaBlock(ctx)}
        <div class="nm-b-foot">${contactBlock()}<img src="${ctx.logos.white}" alt=""></div>
      </div>`,
      `background-image:${PAPER_()}`
    );
  },
};

const css = `
.nm{color:var(--ink);background-color:#fff}
.nm .kicker{color:var(--blue)}
.nm h2{font-size:32pt;text-transform:uppercase;color:var(--blue)}
.nm-pf{color:var(--grey)}.nm-pf b{color:var(--blue)}
.nm-pf.light,.nm-pf.light b{color:#fff}
.nm-head{position:absolute;left:14mm;right:44mm;top:20mm}
.nm-head h2{margin:2mm 0 3mm}
.nm-head p{font-size:11.5pt;line-height:1.4;max-width:150mm}
.nm-kpi{background:#fff;border-radius:3mm;padding:3.5mm 4mm;border-left:1.6mm solid var(--green);min-width:0}
.nm-kpi span{display:block;font-family:var(--head);font-weight:700;font-size:7.5pt;letter-spacing:.14em;text-transform:uppercase;color:var(--grey)}
.nm-kpi strong{display:block;font-family:var(--head);font-weight:700;font-size:13pt;line-height:1.1;color:var(--blue);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nm-kpi.big strong{font-size:26pt}
.nm .sig-script{color:var(--blue)}.nm .sig-name{color:var(--blue)}

/* cover */
.nm-cv-top{position:absolute;left:0;right:0;top:0;height:196mm;background-color:var(--blue);color:#fff;padding:24mm 14mm 0}
.nm-cv-top .kicker{color:var(--yellow);margin-bottom:6mm}
.nm-cv-big{font-family:var(--head);font-weight:700;font-size:118pt;line-height:.85;color:var(--yellow);letter-spacing:-.03em;white-space:nowrap}
.nm-cv-lbl{display:inline-block;margin-top:4mm;font-family:var(--head);font-weight:700;font-size:13pt;text-transform:uppercase;letter-spacing:.06em;background:var(--green);color:#fff;padding:1.5mm 4mm}
.nm-cover h1{font-size:30pt;line-height:.98;text-transform:uppercase;color:#fff;margin-top:9mm;max-width:110mm}
.nm-cv-top p{font-size:11.5pt;margin-top:3mm;max-width:105mm;line-height:1.35}
.nm-cv-photo{position:absolute;right:14mm;top:118mm;width:70mm;height:96mm;border-radius:4mm;border:2mm solid #fff;box-shadow:0 3mm 10mm rgba(0,0,0,.25);z-index:3}
.nm-cv-facts{position:absolute;left:14mm;right:14mm;bottom:16mm;top:226mm;display:grid;grid-template-columns:1fr 1fr;gap:4mm}
.nm-cv-facts .nm-kpi{background:var(--blue10,#E8F2FB);display:flex;flex-direction:column;justify-content:center}
.nm-cv-facts .nm-kpi:nth-child(2){border-color:var(--yellow)}.nm-cv-facts .nm-kpi:nth-child(3){border-color:var(--teal)}.nm-cv-facts .nm-kpi:nth-child(4){border-color:var(--purple)}

/* letter */
.nm-l-side{position:absolute;left:0;top:0;bottom:0;width:70mm;background-color:var(--blue);color:#fff;padding:22mm 8mm 16mm;display:flex;flex-direction:column;align-items:center;text-align:center}
.nm-l-photo{width:46mm;height:46mm;border-radius:50%;border:2mm solid #fff}
.nm-l-name{font-family:var(--head);font-weight:700;font-size:15pt;text-transform:uppercase;margin-top:5mm}
.nm-l-title{font-size:8.5pt;opacity:.9}
.nm-glance{margin-top:auto;width:100%;display:flex;flex-direction:column;gap:2.5mm;text-align:left}
.nm-glance h4{font-family:var(--head);font-size:10pt;letter-spacing:.16em;text-transform:uppercase;color:var(--yellow)}
.nm-l-main{position:absolute;left:80mm;right:14mm;top:30mm;bottom:20mm;display:flex;flex-direction:column}
.nm-l-main h2{font-size:38pt;margin:2mm 0 5mm}
.nm-l-body{flex:1}
.nm-l-body p{font-size:10.5pt;line-height:1.6}
.nm-l-body .sal{font-family:var(--head);font-weight:700;font-size:13.5pt;color:var(--blue)}
.nm-letter .pf{left:80mm}

/* project */
.nm-p-photo{position:absolute;left:14mm;right:14mm;top:56mm;height:84mm;border-radius:4mm;position:absolute}
.nm-p-photo span{position:absolute;right:3mm;bottom:2mm;font-size:7pt;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.7)}
.nm-timeline{position:absolute;left:14mm;right:14mm;top:150mm;bottom:56mm;display:grid;grid-template-columns:repeat(4,1fr);gap:4mm}
.nm-timeline.n3{grid-template-columns:repeat(3,1fr)}
.nm-timeline::before{content:"";position:absolute;left:4mm;right:4mm;top:5mm;border-top:.8mm dashed var(--blue40)}
.nm-timeline .step{position:relative;display:flex;flex-direction:column;min-height:0}
.nm-timeline .dot{width:10mm;height:10mm;border-radius:50%;background:var(--c);color:#fff;display:grid;place-items:center;font-family:var(--head);font-weight:700;font-size:12pt;box-shadow:0 0 0 1.4mm #fff;z-index:1}
.nm-timeline h4{font-family:var(--head);font-weight:700;font-size:12pt;text-transform:uppercase;color:var(--c);margin:3mm 0 1.5mm}
.nm-timeline .fit{flex:1;font-size:9.5pt;line-height:1.45}
.nm-facts{position:absolute;left:14mm;right:14mm;bottom:20mm;height:28mm;display:flex;gap:3mm}
.nm-facts div{flex:1;background:var(--blue10,#E8F2FB);border-top:1.6mm solid var(--c);border-radius:2mm;padding:3mm;display:flex;flex-direction:column;justify-content:center}
.nm-facts dt{font-family:var(--head);font-weight:700;font-size:7pt;letter-spacing:.12em;text-transform:uppercase;color:var(--grey)}
.nm-facts dd{font-family:var(--head);font-weight:700;font-size:10.5pt;line-height:1.1;color:var(--blue)}

/* impact */
.nm-tiles{position:absolute;left:14mm;right:14mm;top:72mm;display:grid;grid-template-columns:1fr 1fr;gap:4mm}
.nm-tiles.n3{grid-template-columns:repeat(3,1fr)}
.nm-tiles .t{background:#fff;border-radius:4mm;padding:5mm 6mm;border-top:2.4mm solid var(--c);box-shadow:0 1mm 4mm rgba(7,120,212,.12);position:relative}
.nm-tiles .t-i{position:absolute;right:5mm;top:5mm;width:11mm;height:11mm;color:var(--c);opacity:.85}
.nm-tiles .v{font-family:var(--head);font-weight:700;font-size:44pt;line-height:1;color:var(--c);letter-spacing:-.02em}
.nm-tiles .l{font-family:var(--head);font-weight:700;font-size:10pt;text-transform:uppercase;letter-spacing:.06em;margin-top:1.5mm}
.nm-pp{position:absolute;left:14mm;right:14mm;top:156mm;display:flex;gap:6mm;align-items:center;background:var(--yellow);border-radius:4mm;padding:4mm 6mm}
.nm-pp-v{font-family:var(--head);font-weight:700;font-size:28pt;color:var(--blue);white-space:nowrap}
.nm-pp strong{display:block;font-family:var(--head);font-size:13pt;text-transform:uppercase;color:var(--blue)}
.nm-pp span{font-size:8.5pt}
.nm-i-band{position:absolute;left:0;right:0;bottom:0;height:98mm;background-color:var(--blue);padding:12mm 14mm 20mm}
.nm-pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;height:100%}
.nm-pillars .pl{background:#fff;border-radius:4mm;padding:6mm 5mm;display:flex;flex-direction:column;gap:3mm;border-bottom:2mm solid var(--c)}
.nm-pillars .pl-i{width:14mm;height:14mm;border-radius:3mm;background:var(--c);color:#fff;padding:2.8mm}
.nm-pillars h3{font-size:13pt;text-transform:uppercase;color:var(--blue)}
.nm-pillars p{font-size:9.5pt;line-height:1.4;margin-top:1mm}
.nm-impact.no-stats .nm-i-band{height:180mm;padding-top:18mm}
.nm-impact.no-stats .nm-pillars{grid-template-columns:1fr;height:auto}
.nm-impact.no-stats .nm-pillars .pl{flex-direction:row;align-items:center;padding:8mm 7mm}
.nm-impact.no-stats .nm-pillars h3{font-size:18pt}
.nm-impact.no-stats .nm-pillars p{font-size:11pt}
.nm-impact.no-stats .nm-pp{top:92mm}

/* story */
.nm-s-photo{position:absolute;right:14mm;top:56mm;width:88mm;height:120mm;border-radius:4mm}
.nm-s-q{position:absolute;left:14mm;width:90mm;top:56mm;min-height:60mm;border-radius:4mm 4mm 4mm 0;background-color:var(--blue);color:#fff;padding:9mm 8mm 8mm}
.nm-s-q span{font-family:var(--head);font-weight:700;font-size:60pt;line-height:.5;color:var(--yellow);display:block;height:8mm}
.nm-s-q blockquote{font-family:var(--head);font-weight:500;font-size:15pt;line-height:1.25}
.nm-s-q cite{display:block;font-style:normal;font-family:var(--head);font-weight:700;font-size:8.5pt;letter-spacing:.14em;text-transform:uppercase;color:var(--yellow);margin-top:3mm}
.nm-s-text{position:absolute;left:14mm;right:14mm;top:186mm;bottom:22mm;columns:2;column-gap:8mm;column-fill:balance}

/* gallery */
.nm-g{position:absolute;left:14mm;right:14mm;top:64mm;bottom:22mm;display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:1fr;gap:5mm 4mm}
.nm-g figure{display:flex;flex-direction:column;min-height:0}
.nm-g .ph{flex:1;min-height:0;border-radius:3mm;position:relative}
.nm-g b{position:absolute;left:2.5mm;top:2.5mm;width:8mm;height:8mm;border-radius:50%;color:#fff;display:grid;place-items:center;font-family:var(--head);font-size:10pt}
.nm-g figcaption{font-size:7.5pt;margin-top:1.4mm;color:var(--grey)}
.nm-g .g0{grid-column:span 2;grid-row:span 2}
.nm-g.c2 .g0{grid-row:span 1;grid-column:span 3}.nm-g.c2 .g1{grid-column:span 3}
.nm-g.c4 .g3{grid-column:span 3}
.nm-g.c5 .g3{grid-column:span 2}

/* money */
.nm-m-row{position:absolute;left:14mm;right:14mm;top:66mm;height:86mm;display:flex;gap:8mm;align-items:center}
.nm-donut{position:relative;width:78mm;height:78mm;flex:none}
.nm-donut .donut{width:100%;height:100%}
.nm-donut .c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.nm-donut .c span{font-family:var(--head);font-weight:700;font-size:8pt;letter-spacing:.16em;text-transform:uppercase;color:var(--grey)}
.nm-donut .c strong{font-family:var(--head);font-weight:700;font-size:17pt;color:var(--blue)}
.nm-legend{flex:1;display:flex;flex-direction:column;gap:2.5mm}
.nm-legend div{display:grid;grid-template-columns:5mm 15mm 1fr auto;align-items:center;gap:2mm;background:#fff;border-radius:2.5mm;padding:2.6mm 3.5mm;box-shadow:0 .6mm 2mm rgba(7,120,212,.1)}
.nm-legend i{width:4mm;height:4mm;border-radius:1mm}
.nm-legend b{font-family:var(--head);font-size:13pt;color:var(--blue)}
.nm-legend span{font-size:9pt;line-height:1.2}
.nm-legend em{font-style:normal;font-family:var(--head);font-weight:700;font-size:9.5pt;white-space:nowrap}
.nm-m-kpis{display:flex;flex-direction:column;gap:4mm;width:80mm;flex:none}
.nm-m-kpis.row{position:absolute;left:14mm;right:14mm;top:158mm;flex-direction:row;width:auto}
.nm-m-kpis.row .nm-kpi{flex:1}
.nm-m-kpis.top{top:60mm}
.nm-m-photo{flex:1;height:100%;border-radius:4mm}
.nm-m-sup{position:absolute;left:14mm;right:14mm;top:184mm;bottom:30mm}
.nm-m-sup h3{font-size:13pt;text-transform:uppercase;color:var(--blue);margin-bottom:3mm}
.nm-sup{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}
.nm-sup .su{background:#fff;border-radius:3mm;padding:5mm;border-top:2mm solid var(--c);box-shadow:0 .6mm 2mm rgba(7,120,212,.1)}
.nm-sup .su-i{width:12mm;height:12mm;border-radius:3mm;background:var(--c);color:#fff;padding:2.4mm;margin-bottom:2.5mm}
.nm-sup h4{font-family:var(--head);font-weight:700;font-size:12pt;text-transform:uppercase;color:var(--blue);margin-bottom:1mm}
.nm-sup p{font-size:9pt;line-height:1.4;margin:0}
.nm-sup.c{position:absolute;left:14mm;right:14mm;top:92mm}
.nm-note{position:absolute;left:14mm;right:14mm;bottom:19mm;font-size:8.5pt;font-style:italic;color:var(--grey)}

/* back */
.nm-back{background-color:var(--blue);color:#fff}
.nm-back .kicker,.nm-c-bottom .kicker{color:var(--yellow)}
.nm-b-ty{position:absolute;left:14mm;right:14mm;top:58mm}
.nm-back h2,.nm-c-bottom h2{color:#fff;font-size:46pt;margin:3mm 0}
.nm-b-ty p{font-size:13.5pt;line-height:1.4;max-width:160mm}
.nm-back .dua .ar,.nm-c-bottom .dua .ar{color:var(--yellow)}
.nm-recap{position:absolute;left:14mm;right:14mm;top:150mm}
.nm-recap h4{font-family:var(--head);font-size:10pt;letter-spacing:.16em;text-transform:uppercase;color:var(--yellow);margin-bottom:3mm}
.nm-recap div{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm}
.nm-recap span{background:rgba(255,255,255,.12);border-radius:3mm;padding:4mm;font-size:8.5pt;text-transform:uppercase;font-family:var(--head);font-weight:500;letter-spacing:.04em}
.nm-recap b{display:block;font-size:22pt;color:#fff;font-weight:700;letter-spacing:-.01em}
.nm-b-ahead{position:absolute;left:14mm;right:14mm;top:192mm;height:44mm;display:flex;flex-direction:column}
.nm-b-ahead h3{font-size:14pt;text-transform:uppercase;margin-bottom:2mm}
.nm-b-ahead .fit{flex:1;font-size:9.5pt}
.nm-b-ahead ul{margin:1mm 0 0 4mm;columns:2}
.nm-b-foot{position:absolute;left:14mm;right:14mm;bottom:12mm;display:flex;justify-content:space-between;align-items:flex-end;gap:10mm;border-top:.35mm solid rgba(255,255,255,.5);padding-top:5mm}
.nm-b-foot .verse{max-width:95mm}
.nm-b-foot .verse blockquote{font-size:11pt}
.nm-b-foot .verse figcaption{color:var(--yellow)}
.nm-b-foot .contact{text-align:right}
.nm-b-foot img{height:24mm}

/* combos */
.nm-tiles.compact{top:56mm}
.nm-tiles.compact .v{font-size:32pt}
.nm-pillars.loose{position:absolute;left:14mm;right:14mm;top:58mm;height:90mm}
.nm-is-low{position:absolute;left:14mm;right:14mm;top:160mm;bottom:22mm;display:flex;gap:7mm}
.nm-is-photo{width:66mm;flex:none;border-radius:4mm}
.nm-is-text{flex:1;display:flex;flex-direction:column;min-width:0}
.nm-is-text h3{font-size:19pt;text-transform:uppercase;color:var(--blue);margin:1.5mm 0 3mm}
.nm-is-text .fit{flex:1}
.nm-is-text blockquote{background:var(--blue);color:#fff;border-radius:3mm;padding:3mm 4mm;font-family:var(--head);font-weight:500;font-size:11.5pt}
.nm-is-text cite{display:block;font-style:normal;font-size:7.5pt;letter-spacing:.12em;text-transform:uppercase;color:var(--yellow);margin-top:1mm}
.nm-c-bottom{position:absolute;left:0;right:0;bottom:0;height:150mm;background-color:var(--blue);color:#fff;padding:14mm}
.nm-c-bottom p{font-size:12pt;max-width:165mm}
.nm-closing .nm-m-kpis.top{top:60mm}
`;

export default {
  id: 'numbers',
  name: 'Impact Numbers',
  description: 'Infographic and data-first: huge figures, a project timeline, a spending donut and cost per person.',
  bestFor: 'Corporate CSI / ESG partners and results-focused donors',
  get swatch() {
    return [C.blue, C.green, C.yellow];
  },
  pages,
  css,
};
