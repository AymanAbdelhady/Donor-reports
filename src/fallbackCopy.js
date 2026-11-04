// Template-based agent + writer, used when no Claude API key is configured.
// It only uses what staff provided, plus warm sector-appropriate general copy,
// so every report is still complete.
import { brand } from './brand.js';
import { enabledTopics, getSettings, givingTypes } from './settings.js';
import { fallbackCopyAr } from './fallbackAr.js';

const paras = (t) => String(t || '').split(/\n\s*\n|(?<=[.!?])\s{2,}/).map((p) => p.trim()).filter(Boolean);
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
export const toNum = (v) => Number(String(v ?? '').replace(/[^\d.]/g, '')) || 0;
export const formatRand = (n) => (toNum(n) ? `${brand.currency || 'R'} ` + Math.round(toNum(n)).toLocaleString('en-ZA').replace(/[,\s ]/g, ' ') : '');

// ---------------- sector knowledge ----------------
const SECTOR_COPY = {
  water: {
    match: /water|borehole|well|wash|sanitation|tap/i,
    sector: 'Water & sanitation',
    context: 'Safe water close to home changes everything: health, school attendance and time for families to build a better future.',
    pillars: [['water', 'Safe, clean water', 'Families now drink and cook with clean water, close to home.'], ['health', 'Healthier families', 'Fewer waterborne illnesses mean children stay healthy and in school.'], ['clock', 'Time restored', 'Hours once spent walking for water are now spent learning and working.']],
    supports: [['water', 'Water points', 'Building and equipping reliable sources of clean water.'], ['hands', 'Local committees', 'Training communities to run and maintain their water points.'], ['health', 'Hygiene sessions', 'Teaching safe water storage and handwashing in schools and homes.']],
  },
  food: {
    match: /food|parcel|hunger|meal|nutrition|feeding|soup kitchen/i,
    sector: 'Food security',
    context: 'A nourishing meal brings dignity and relief, especially for families facing rising prices and hardship.',
    pillars: [['food', 'Nourishing meals', 'Families received essential, nutritious food when they needed it most.'], ['family', 'Families supported', 'Parents could feed their children without impossible choices.'], ['heart', 'Dignity and hope', 'Every parcel carried a message: you are not alone.']],
    supports: [['food', 'Food parcels', 'Staple foods sourced locally and packed with care.'], ['hands', 'Fair distribution', 'Reaching the families most in need, transparently and respectfully.'], ['shield', 'Accountability', 'Monitoring every distribution so your gift reaches its purpose.']],
  },
  orphans: {
    match: /orphan|child|youth|sponsor|kid|teen/i,
    sector: 'Children & youth',
    context: 'Every child deserves love, security and the chance to dream. Sponsorship brings stability to children and their caregivers.',
    pillars: [['education', 'Learning', 'Children stay in school with uniforms, books and fees covered.'], ['health', 'Health and nutrition', 'Regular healthcare and good food help children grow strong.'], ['heart', 'Love and security', 'Caregivers are supported so children can thrive at home.']],
    supports: [['education', 'Education', 'School fees, uniforms and learning materials.'], ['food', 'Nutrition', 'Healthy food for growing children.'], ['family', 'Family support', 'Help for caregivers to provide a stable home.']],
  },
  education: {
    match: /school|educat|learn|classroom|teacher|student/i,
    sector: 'Education',
    context: 'Education opens doors that poverty keeps shut, for children, their families and their communities.',
    pillars: [['education', 'Back to learning', 'Children have the classrooms and materials they need to learn.'], ['star', 'Confidence', 'Pupils grow in confidence and ambition for their futures.'], ['family', 'Stronger communities', 'Educated children lift their whole families.']],
    supports: [['education', 'Learning materials', 'Books, stationery and school bags.'], ['home', 'Safe classrooms', 'Improving the spaces where children learn.'], ['hands', 'Teachers', 'Supporting and training dedicated educators.']],
  },
  health: {
    match: /health|clinic|medical|hospital|surgery|nutrition|eye/i,
    sector: 'Health',
    context: 'Access to healthcare is a right, yet distance and cost keep it out of reach for too many families.',
    pillars: [['health', 'Care that heals', 'Patients received treatment they could not otherwise afford.'], ['family', 'Families protected', 'Healthy parents can care and provide for their children.'], ['shield', 'Prevention', 'Health education helps communities avoid illness.']],
    supports: [['health', 'Treatment', 'Medicines, equipment and consultations.'], ['hands', 'Health workers', 'Supporting skilled, compassionate staff.'], ['shield', 'Prevention', 'Awareness sessions in the community.']],
  },
  livelihoods: {
    match: /livelihood|farm|business|income|skills|empower|crop|livestock|sewing/i,
    sector: 'Livelihoods',
    context: 'A steady income lets families stand on their own feet and plan for the future with confidence.',
    pillars: [['sprout', 'Growing incomes', 'Families are earning and saving through their own work.'], ['hands', 'New skills', 'Training builds lasting knowledge and confidence.'], ['family', 'Self-reliance', 'Households can now meet their own needs with dignity.']],
    supports: [['sprout', 'Tools and inputs', 'Seeds, equipment and start-up materials.'], ['education', 'Training', 'Practical skills and business coaching.'], ['hands', 'Mentoring', 'Ongoing support as families grow.']],
  },
  emergency: {
    match: /emergenc|flood|earthquake|conflict|crisis|disaster|fire|drought|refugee|displac/i,
    sector: 'Emergency relief',
    context: 'In the first hours and days of a crisis, fast, life-saving aid makes all the difference.',
    pillars: [['shield', 'Life-saving aid', 'Families received urgent help in their darkest moments.'], ['food', 'Essentials', 'Food, water and supplies met immediate needs.'], ['heart', 'Hope restored', 'People affected know the world has not forgotten them.']],
    supports: [['food', 'Emergency supplies', 'Food, water, hygiene kits and essentials.'], ['home', 'Shelter', 'Safe, warm places to stay.'], ['health', 'Medical help', 'Care for those injured or unwell.']],
  },
  winter: {
    match: /winter|blanket|warm|shelter|cold/i,
    sector: 'Shelter & winter',
    context: 'When temperatures drop, warmth becomes a matter of survival for families with little protection.',
    pillars: [['home', 'Warmth at home', 'Families stayed warm through the coldest months.'], ['health', 'Protected health', 'Warm clothing and bedding protect against illness.'], ['heart', 'Comfort and care', 'Every blanket carried warmth and kindness.']],
    supports: [['home', 'Blankets and heaters', 'Essentials to keep homes warm.'], ['gift', 'Winter clothing', 'Warm clothes for children and adults.'], ['food', 'Food support', 'Nutritious food for the season.']],
  },
  environment: {
    match: /environment|climate|tree|forest|conservation|recycl|clean-?up|ocean|wildlife|green/i,
    sector: 'Environment',
    context: 'A healthy environment is the foundation of healthy communities, today and for the generations to come.',
    pillars: [['sprout', 'Nature restored', 'Land, water and green spaces are recovering and thriving.'], ['family', 'Healthier communities', 'Cleaner surroundings mean healthier, happier families.'], ['globe', 'A lasting legacy', 'Change that future generations will inherit.']],
    supports: [['sprout', 'Planting and care', 'Trees, gardens and restoration work.'], ['education', 'Awareness', 'Helping communities protect what matters.'], ['hands', 'Local champions', 'Volunteers and teams who keep the work going.']],
  },
  community: {
    match: /communit|neighbourhood|elderly|older people|women|sport|centre|center|\barts?\b|culture|music/i,
    sector: 'Community development',
    context: 'Strong communities are built when people have places, opportunities and support to grow together.',
    pillars: [['family', 'Connected people', 'Neighbours, families and generations brought together.'], ['star', 'New opportunities', 'Spaces and programmes that help people grow.'], ['heart', 'Belonging', 'Everyone has a place and a voice.']],
    supports: [['home', 'Safe spaces', 'Places where the community can meet and learn.'], ['hands', 'Programmes', 'Activities, training and support that change lives.'], ['shield', 'Accountability', 'Careful monitoring of every contribution.']],
  },
  general: {
    match: /./,
    sector: 'Other',
    context: `${brand.orgName} works alongside communities to create lasting change.`,
    pillars: [['heart', 'Lives touched', 'Your kindness reached people facing real hardship.'], ['hands', 'Real change', 'Practical help that makes everyday life better.'], ['star', 'Lasting hope', 'Communities are building a brighter future.']],
    supports: [['gift', 'Direct support', 'Essential help delivered where it is needed most.'], ['hands', 'Local teams', 'Dedicated staff and volunteers on the ground.'], ['shield', 'Accountability', 'Careful monitoring of every contribution.']],
  },
};
export function sectorCopy(brief) {
  const hay = [brief.project?.sector, brief.project?.name, brief.project?.objective, brief.project?.activities, brief.donor?.givingType, brief.narrative].filter(Boolean).join(' ');
  for (const [k, v] of Object.entries(SECTOR_COPY)) if (k !== 'general' && v.match.test(hay)) return { key: k, ...v };
  return { key: 'general', ...SECTOR_COPY.general };
}

// ---------------- scripted chat (no AI) ----------------
// Questions come from the admin dashboard (Assistant & questions).
const COUNTRIES = ['South Africa', 'Namibia', 'Botswana', 'Lesotho', 'Eswatini', 'Zambia', 'Tanzania', 'Uganda', 'Rwanda', 'Ghana', 'Egypt', 'Morocco', 'India', 'United Kingdom', 'United States', 'Malawi', 'Mozambique', 'Zimbabwe', 'Kenya', 'Somalia', 'Sudan', 'South Sudan', 'Ethiopia', 'Niger', 'Mali', 'Chad', 'Nigeria', 'Gaza', 'Palestine', 'Syria', 'Yemen', 'Lebanon', 'Jordan', 'Iraq', 'Afghanistan', 'Pakistan', 'Bangladesh', 'Indonesia', 'Türkiye', 'Turkey', 'Myanmar', 'Sri Lanka', 'Bosnia'];
const skip = (m) => /^(skip|no|none|nothing|not now|n\/a|no photos?)\b/i.test(m.trim()) || /^(تخط|تخطّ|تجاوز|لا|لا شيء|ليس الآن|لا صور)/.test(m.trim());
// Arabic-Indic digits -> Western digits, so amounts and counts are understood.
const westernDigits = (t) => String(t || '').replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
const arabicDonorName = (m) => m.replace(/^(مرحب[اًا]*|أهلاً?|السلام عليكم[^،.]*)[،,.!\s]*/, '').replace(/^.*?تقرير(اً)?\s*(لـ\s*|ل|عن\s*|إلى\s*)/, '').split(/[،,.\n؟!]|\s+(?:قدّم|قدم|قدّمت|قدمت|تبرّع|تبرع|تبرعت|أعطى|أعطت|دعم|دعمت|موّل|مول)\b/)[0].trim().slice(0, 80);

/** The donor's name from a free-text answer such as "Hello, I need a report for
 * the Naidoo family" or "The Naidoo family gave R 50 000 for the school library…". */
export function donorName(text) {
  let t = String(text || '').replace(/^\s*(assalamu?\s*alaikum[^,.!]*|salaa?m|sawubona|molo|hi|hello|hey|good (morning|afternoon|day))[\s,.!]*/i, '').trim();
  const lead = t.match(/\b(?:report|letter)\s+(?:is\s+)?for\s+(.+)$/i) || t.match(/\b(?:the donor is|donor:|it'?s from|from)\s+(.+)$/i);
  if (lead) t = lead[1];
  t = t.replace(/^(it'?s|this is|for|the donor is)\s+/i, '');
  t = t.split(/[.\n;!?]|,\s|\s+(?:who|which|that|gave|donated|sponsored|sponsors|has|have|had|sent|contributed|supported|funded|is|are|was|were|for|with|in)\b/i)[0];
  t = t.trim().replace(/\s+(please|thanks|thank you)$/i, '').replace(/[\s,:-]+$/, '');
  if (t.split(/\s+/).length > 8) t = t.split(/\s+/).slice(0, 8).join(' ');
  return t.replace(/^the\s+/i, 'The ').replace(/\b(family|trust|foundation)\b/gi, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).slice(0, 80);
}

export function fallbackChatTurn({ brief, message = '', newPhotos = [], lang = 'en' }) {
  const updates = [];
  const add_results = [];
  const add_budget = [];
  const done = new Set(brief._done || []);
  const set = (field, value) => value && updates.push({ field, value: String(value).trim() });
  const m = westernDigits(message).trim();
  const isAr = lang === 'ar' || /[\u0600-\u06FF]/.test(m);
  const last = brief._lastAsk || (brief.donor?.name ? null : 'donor');
  if (m && !skip(m)) {
    // Things we can spot in any message.
    const cur = (brand.currency || 'R').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const amt = m.match(new RegExp(`(?:${cur}|\\bR|\\bZAR|\\bUSD|\\bGBP|\\bEUR|\\bKES|\\bKSh|\\bNGN|[$£€₦])\\s?(\\d[\\d\\s,.]*\\d|\\d)(\\s?(k|thousand|million|m)\\b)?`)) || m.match(/(\d[\d\s,.]*\d)\s?(rand|zar|dollars?|pounds?|euros?)\b/i) || m.match(new RegExp(`(\\d[\\d\\s,.]*\\d|\\d)\\s?(?:${cur}|R|ZAR|USD|\\$|راند|ريال|دولار|درهم|جنيه|دينار)(?![A-Za-z])`));
    if (amt) {
      let v = toNum(amt[1]);
      if (/k|thousand/i.test(amt[3] || '')) v *= 1000;
      if (/million|^m$/i.test(amt[3] || '')) v *= 1e6;
      set('donor.amount', String(v));
    }
    // Arabic giving types map onto the organisation's (English) list by position.
    const arTypes = getSettings().ar?.givingTypes || [];
    const arIdx = arTypes.findIndex((g) => g && m.replace(/[ًٌٍَُِّْ]/g, '').includes(g.replace(/[ًٌٍَُِّْ]/g, '')));
    const gt = arIdx >= 0 && givingTypes()[arIdx] ? givingTypes()[arIdx] : givingTypes().find((g) => new RegExp(`\\b${g.split(/[\s/]/)[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i').test(m));
    if (gt && (!brief.donor?.givingType || last === 'gift')) set('donor.givingType', gt);
    const country = COUNTRIES.find((c) => new RegExp(`\\b${c}\\b`, 'i').test(m));
    if (country) set('project.country', country === 'Turkey' ? 'Türkiye' : country);
    for (const r of m.matchAll(/(\d[\d\s,]*\d|\d+)\s+(people|families|children|students|pupils|orphans|households|patients|boreholes|wells|parcels|meals|schools|villages|women|men|farmers)\b/gi))
      add_results.push({ value: r[1].trim(), label: r[2].toLowerCase() });
    for (const r of m.matchAll(/(\d[\d\s,]*\d|\d+)\s+(شخص|أشخاص|طالب|طالبة|طلاب|طفل|أطفال|أسرة|أسر|عائلة|عائلات|مستفيد|مستفيدين|مريض|مرضى|بئر|آبار|مدرسة|مدارس|قرية|قرى|وجبة|وجبات|طرد|طرود|امرأة|نساء|مزارع|مزارعين)/g))
      add_results.push({ value: r[1].trim(), label: r[2] });
    // The answer to the question we last asked.
    if (last === 'donor') {
      set('donor.name', /[\u0600-\u06FF]/.test(m) ? arabicDonorName(m) : donorName(m));
      // "… gave R 50 000 for a reading programme in Soweto, South Africa."
      const pr = m.match(/\b(?:for|towards|to fund|to support)\s+(.+?)(?:\s+in\s+([^.,\n]+))?(?:[.,\n]|$)/i);
      if (pr && !/^(the|a|an)?\s*(report|donor)\b/i.test(pr[1]) && pr[1].split(/\s+/).length <= 10 && (amt || gt)) {
        set('project.name', cap(pr[1].replace(/^(the|a|an)\s+/i, '')));
        if (pr[2] && !COUNTRIES.some((c) => new RegExp(`^${c}$`, 'i').test(pr[2].trim()))) set('project.location', pr[2].trim());
      }
    }
    if (last === 'project') {
      set('project.name', cap(m.split(/[.\n]/)[0].slice(0, 90)));
      set('project.activities', m);
    }
    if (last === 'results') set('project.results', m);
    if (last === 'story') set('project.story', m);
    if (last === 'ceo') set('report.ceoMessage', m);
    if (last === 'gift' && !amt && !gt) set('donor.notes', m);
    if (last === 'money') {
      for (const line of m.split(/\n|;|،|,(?=\s*[A-Za-z\u0600-\u06FF])/)) {
        const mm = line.match(/^\s*(.+?)[\s:–-]+(?:[A-Z]{1,3}|[$£€₦])\s?(\d[\d\s,.]*\d|\d)/);
        if (mm) add_budget.push({ label: cap(mm[1].trim()).slice(0, 60), amount: String(toNum(mm[2])) });
      }
    }
    const custom = enabledTopics(lang).find((t) => t.id === last && !t.builtin);
    if (custom) set('report.extraInstructions', `${custom.label}: ${m}`);
  }
  // Decide what to ask next.
  const next = { ...brief, _photoCount: (brief._photoCount || 0) + newPhotos.length };
  const filled = (ask) =>
    ({
      donor: () => next.donor?.name || updates.some((u) => u.field === 'donor.name'),
      gift: () => next.donor?.amount || next.donor?.givingType || updates.some((u) => u.field.startsWith('donor.amount') || u.field === 'donor.givingType') || last === 'gift',
      project: () => next.project?.name || updates.some((u) => u.field === 'project.name') || last === 'project',
      results: () => next.project?.results || add_results.length || last === 'results',
      story: () => next.project?.story || last === 'story',
      photos: () => next._photoCount > 0 || last === 'photos',
      ceo: () => next.report?.ceoMessage || last === 'ceo',
      money: () => next.project?.budget?.length || add_budget.length || last === 'money',
    })[ask]?.() ?? (done.has(ask) || last === ask);
  const step = enabledTopics(isAr ? 'ar' : 'en').map((t) => ({ ask: t.id, q: t.question })).find((s) => !filled(s.ask));
  const ack = isAr
    ? newPhotos.length ? `شكراً على ${newPhotos.length === 1 ? 'الصورة' : `الصور (${newPhotos.length})`}. ` : m ? 'تمام. ' : ''
    : newPhotos.length ? `Thank you for the ${newPhotos.length === 1 ? 'photo' : `${newPhotos.length} photos`}. ` : m ? 'Got it. ' : '';
  const reply = step ? ack + step.q : isAr ? `${ack}رائع، لديّ كل ما أحتاجه. اختر التصميم واضغط «أنشئ تقريري». يمكنك إضافة تفاصيل أخرى في أي وقت.` : `${ack}Wonderful, I have everything I need. Choose a style and press “Create my report”. You can still add more details at any time.`;
  return {
    reply,
    updates,
    add_results,
    add_budget,
    photo_captions: [],
    suggestions: isAr ? (step ? ({ donor: [], gift: (getSettings().ar?.givingTypes || []).slice(0, 3), photos: ['لا صور بعد'], ceo: ['لا، هذا كل شيء'] })[step.ask] || ['تخطَّ'] : ['أنشئ تقريري']) : step ? ({ donor: [], gift: givingTypes().slice(0, 3), project: [], results: ['Skip this'], story: ['Skip this'], money: ['Skip this'], photos: ['No photos yet'], ceo: ['No, that’s all'] })[step.ask] || ['Skip this'] : ['Create my report'],
    ready: Boolean(next.donor?.name || updates.some((u) => u.field === 'donor.name')),
    _ask: step?.ask || null,
    _answered: last && m ? last : null,
  };
}

// ---------------- complete report copy (no AI) ----------------
export function fallbackCopy(brief, photos = []) {
  if (brief.report?.language === 'ar') return fallbackCopyAr(brief, photos, sectorCopy(brief));
  const d = brief.donor || {};
  const p = brief.project || {};
  const r = brief.report || {};
  const sc = sectorCopy(brief);
  const year = String(new Date().getFullYear());
  const place = [p.location, p.country].filter(Boolean).join(', ');
  const amount = formatRand(d.amount);
  const greetName = d.salutation || (d.type === 'Company' || /\b(pty|ltd|holdings|group|trust|foundation|inc|bank)\b/i.test(d.name || '') ? `friends at ${d.name}` : (d.contactName || d.name || 'friend').split(' ')[0]);
  const giftWord = d.givingType && !/donation|gift|general/i.test(d.givingType) ? d.givingType.toLowerCase().replace(/^corporate \/ csi$/, 'partnership') : 'gift';
  const projectName = p.name || `${sc.sector === 'Other' ? 'Our work' : sc.sector}${place ? ` in ${place}` : ''}`;
  const reached = p.beneficiaries ? `${p.beneficiaries} people${p.beneficiaryDesc ? `, ${p.beneficiaryDesc},` : ''}` : p.beneficiaryDesc || 'families in need';

  const stats = (p.outputs || []).filter((o) => o.value && o.label).map((o) => ({ value: String(o.value), label: o.label })).slice(0, 4);
  if (p.beneficiaries && !stats.some((s) => s.value === String(p.beneficiaries))) stats.unshift({ value: String(p.beneficiaries), label: 'people reached' });
  if (amount && stats.length < 4) stats.push({ value: amount.replace(/\s/, ''), label: `your ${giftWord}` });

  const storyParas = paras(p.story);
  const letter = [
    `On behalf of everyone at ${brand.orgName}, thank you for your generous ${giftWord}${amount ? ` of ${amount}` : ''} to ${projectName}.`,
    `Because of you, ${reached}${place ? ` in ${place}` : ''} have received support that is changing their lives. ${sc.context}`,
    r.ceoMessage ? cap(r.ceoMessage.replace(/\.?$/, '.')) : d.relationship ? `We are deeply grateful for your continued partnership (${d.relationship}). Your trust inspires our whole team.` : 'Your trust in us is something we honour with great care, and it inspires our whole team.',
    'Thank you for making this possible. We are honoured to have you alongside us, and we look forward to sharing more of what we achieve together.',
  ];
  const captions = photos.map((ph, i) => ({ index: i, caption: ph.caption || (ph.illustrative ? ph.alt || `${brand.shortName || brand.orgName} programmes bring hope to families` : `${projectName}${place ? `, ${place}` : ''}`) }));
  const firstPeople = photos.findIndex((ph) => !ph.illustrative);

  return {
    cover: { kicker: `Impact report ${year}`, title: p.name ? (p.name.length > 48 ? 'Your gift at work' : p.name) : 'Your gift at work', highlight: 'Thank you', subtitle: `With heartfelt gratitude to ${d.name || 'our valued supporter'}` },
    ceoLetter: { salutation: `Dear ${greetName},`, paragraphs: getSettings().ceo.letterPoints?.trim() ? [...letter.slice(0, -1), cap(getSettings().ceo.letterPoints.trim().replace(/\.?$/, '.')), letter.at(-1)] : letter, closing: getSettings().ceo.closing || 'With heartfelt gratitude,' },
    project: {
      heading: 'Where your gift went',
      lead: p.objective ? cap(p.objective) : sc.context,
      paragraphs: [...paras(p.activities), ...paras(p.results)].slice(0, 2).length
        ? [...paras(p.activities), ...paras(p.results)].slice(0, 2)
        : [`Your support went to ${projectName}${place ? ` in ${place}` : ''}, reaching ${reached}.`, `Our teams at ${brand.shortName || brand.orgName} work alongside local communities so that help arrives quickly, respectfully and where it is needed most.`],
      keyFacts: [
        { label: 'Programme', value: projectName },
        { label: 'Location', value: place || 'Where the need is greatest' },
        { label: 'Period', value: r.reportPeriod || [p.startDate, p.endDate].filter(Boolean).join(' – ') || year },
        p.beneficiaries && { label: 'People reached', value: String(p.beneficiaries) },
        amount && { label: `Your ${giftWord}`, value: amount },
      ].filter(Boolean),
    },
    impact: {
      heading: 'Your impact',
      intro: p.results ? paras(p.results)[0].slice(0, 220) : `Here is what your support made possible${place ? ` in ${place}` : ''}.`,
      stats,
      pillars: sc.pillars.map(([icon, title, text]) => ({ icon, title, text })),
    },
    story: {
      heading: storyParas.length ? 'A story of change' : 'What your support means',
      paragraphs: storyParas.length ? storyParas.slice(0, 3) : [`For ${reached}, your gift is far more than aid. ${sc.context}`, 'Behind every number is a family with hopes, plans and a future that now looks brighter, because you chose to help.'],
      quote: p.quote || '',
      quoteAttribution: p.quote ? p.quoteBy || '' : '',
    },
    gallery: { heading: 'Moments of hope', intro: 'Your kindness, seen through the faces and places it reached.' },
    money: {
      heading: 'Your gift at work',
      intro: 'Every contribution you entrust to us is handled with care, transparency and accountability.',
      supports: sc.supports.map(([icon, title, text]) => ({ icon, title, text })),
      note: 'Figures are based on project records at the time of reporting.',
    },
    ahead: {
      heading: 'Looking ahead',
      paragraphs: paras(p.nextSteps).slice(0, 1).length ? paras(p.nextSteps).slice(0, 1) : ['We will keep walking alongside these communities, building on what your generosity has started so the change lasts for years to come.'],
      bullets: ['Continued monitoring and support', 'Updates on progress as the work grows', 'Opportunities to deepen your impact'],
    },
    thankYou: {
      heading: 'Thank you',
      message: `Thank you, ${greetName.replace(/^friends at /, '')}, for standing with people facing hardship. Your generosity is a trust we honour in everything we do.`,
      duaArabic: '',
      duaEnglish: '',
    },
    images: { coverIndex: firstPeople >= 0 ? firstPeople : photos.length ? 0 : -1, storyIndex: photos.length > 1 ? 1 : photos.length ? 0 : -1, captions },
  };
}
