// Organisation settings, editable from the admin dashboard and stored in
// DATA_DIR/settings.json. Defaults come from src/brand.js. Saving applies the
// changes live to the shared `brand` object used by the Studio, the AI and the
// report engine, so nothing needs a restart.
import { brand } from './brand.js';
import { readJSON, writeJSON } from './store.js';
import { GIVING_TYPES, DEFAULT_QUOTES } from './schema.js';

const BRAND_DEFAULTS = structuredClone(brand);

export const STYLE_IDS = ['signature', 'frame', 'pop', 'editorial', 'seasons', 'numbers', 'poster', 'mosaic', 'journey'];

// Topics the assistant asks about, in priority order. Built-in topics map onto
// report fields; custom topics are free questions whose answers are passed to
// the writer.
export const DEFAULT_TOPICS = [
  { id: 'donor', label: 'Donor', question: 'Who is this report for? Tell me the donor’s name (a person, family, company, trust or group).', labelAr: 'المانح', questionAr: 'لمن هذا التقرير؟ أخبرني باسم المانح (فرد أو عائلة أو شركة أو مؤسسة أو جهة).', enabled: true, builtin: true, required: true },
  { id: 'gift', label: 'Gift', question: 'What did they give, and how much? For example "{currency} 50 000 donation".', labelAr: 'العطاء', questionAr: 'ماذا قدّم وكم قيمته؟ مثلاً: "{currency} 50 000 تبرّع".', enabled: true, builtin: true },
  { id: 'project', label: 'Project & place', question: 'Which project did it support, and where? Tell me in your own words.', labelAr: 'المشروع والمكان', questionAr: 'أي مشروع دعم هذا العطاء، وأين؟ أخبرني بكلماتك.', enabled: true, builtin: true },
  { id: 'results', label: 'Results', question: 'What has the project achieved so far? Any numbers help, like people reached or wells built.', labelAr: 'النتائج', questionAr: 'ماذا حقق المشروع حتى الآن؟ أي أرقام تساعد، مثل عدد المستفيدين أو الآبار المنجزة.', enabled: true, builtin: true },
  { id: 'story', label: 'Story or quote', question: 'Is there a person whose story we can share, or a quote? (First names only.) You can also say “skip”.', labelAr: 'قصة أو اقتباس', questionAr: 'هل هناك شخص يمكننا مشاركة قصته، أو اقتباس منه؟ (الاسم الأول فقط). يمكنك أيضاً قول "تخطَّ".', enabled: true, builtin: true },
  { id: 'money', label: 'Spending', question: 'How was the money spent? The main budget lines and amounts help, e.g. "Food parcels R 90 000".', labelAr: 'أوجه الإنفاق', questionAr: 'كيف أُنفق المبلغ؟ تساعد بنود الميزانية الرئيسية ومبالغها، مثل "طرود غذائية R 90 000".', enabled: true, builtin: true },
  { id: 'photos', label: 'Photos', question: 'Do you have photos? Tap the camera button to add them, or say “no photos” and I’ll use our library images.', labelAr: 'الصور', questionAr: 'هل لديك صور؟ اضغط زر الكاميرا لإضافتها، أو قل "لا صور" وسأستخدم صور مكتبتنا.', enabled: true, builtin: true },
  { id: 'ceo', label: 'Note for the CEO letter', question: 'Anything personal the CEO should mention in the thank-you letter? Otherwise say “no”.', labelAr: 'ملاحظة لرسالة الرئيس التنفيذي', questionAr: 'هل هناك أمر شخصي يذكره الرئيس التنفيذي في رسالة الشكر؟ وإلا فقل "لا".', enabled: true, builtin: true },
];

export function defaults() {
  const b = BRAND_DEFAULTS;
  return {
    org: { orgName: b.orgName, shortName: b.shortName, tagline: b.tagline, about: b.about, website: b.website, email: b.email, phone: b.phone, address: b.address, registration: b.registration, socials: b.socials, currency: b.currency },
    colors: { blue: b.colors.blue, purple: b.colors.purple, teal: b.colors.teal, green: b.colors.green, yellow: b.colors.yellow, warmGrey: b.colors.warmGrey, ink: b.colors.ink },
    logos: { ...b.logo },
    ceo: {
      name: b.ceo.name,
      title: b.ceo.title,
      photo: b.ceo.photo,
      signature: b.ceo.signature,
      letterPoints: '',
      closing: 'With heartfelt gratitude,',
    },
    studio: {
      title: 'Donor Report Studio',
      assistantName: 'Ava',
      greeting: 'Hello! I’m {name}, your donor-report assistant. Tell me about the donor and the project they supported. Just talk to me (tap the mic) or type. You can also paste notes, an email or a field report and I’ll pick out what I need.',
    },
    // Sign-in page: background photos (online links) and the words over them.
    signin: {
      // Bundled sample photos (brand/library/photos). Replace with links to your own.
      images: [
        'brand/library/photos/photo-serving-meals.jpg',
        'brand/library/photos/photo-volunteer-boxes.jpg',
        'brand/library/photos/photo-delivery-door.jpg',
        'brand/library/photos/photo-meal-handover.jpg',
        'brand/library/photos/photo-delivery-care.jpg',
      ],
      headline: 'Every donor deserves a beautiful thank-you',
    },
    agent: { topics: structuredClone(DEFAULT_TOPICS), extraRules: '', givingTypes: [...GIVING_TYPES] },
    voice: [...b.voice],
    // Languages: which report and interface languages are offered, and the Arabic copy.
    languages: { offered: ['en', 'ar'], defaultReport: 'en', defaultUi: 'en' },
    ar: {
      orgName: 'مؤسسة هورايزن المجتمعية',
      shortName: 'مؤسسة هورايزن',
      tagline: 'نبني معاً مستقبلاً أكثر إشراقاً',
      ceoName: 'أليكس مورغان',
      ceoTitle: 'الرئيس التنفيذي',
      closing: 'مع خالص الشكر والامتنان،',
      assistantName: '',
      greeting: 'مرحباً! أنا {name}، مساعدك في إعداد تقارير المانحين. أخبرني عن المانح والمشروع الذي دعمه. تحدّث معي (اضغط على الميكروفون) أو اكتب. يمكنك أيضاً لصق ملاحظات أو بريد إلكتروني أو تقرير ميداني وسأستخرج ما أحتاجه.',
      style: 'warm',
      voice: [
        'اكتب بالعربية الفصحى المعاصرة بأسلوب دافئ وصادق وشخصي، من إنسان إلى إنسان. مهني دون تكلّف أو مبالغة.',
        'الكرامة أولاً: أظهر الصمود والأمل والقدرة، دون شفقة أو تهويل. استخدم الأسماء الأولى فقط في القصص.',
        'كن محدداً وصادقاً: احتفِ بالنتائج الحقيقية، ولا تخترع أرقاماً أو أسماء أو اقتباسات.',
        'لغة واضحة وجمل قصيرة بصيغة المبني للمعلوم، دون مصطلحات أو اختصارات.',
        'استخدم الأرقام الغربية (1، 2، 3) واكتب المبالغ هكذا: R 250 000. لا تضع نقطة في نهاية العناوين أو التعليقات على الصور.',
      ],
      quotes: [
        { text: 'اليد الواحدة لا تصفّق', by: 'مثل عربي' },
        { text: 'من زرع حصد', by: 'مثل عربي' },
        { text: 'أنا موجود لأننا موجودون', by: 'فلسفة أوبونتو' },
        { text: 'إن أردت أن تسير سريعاً فسر وحدك، وإن أردت أن تسير بعيداً فسر مع الآخرين', by: 'مثل أفريقي' },
        { text: 'لم يفتقر أحدٌ قطّ من العطاء', by: 'آن فرانك' },
      ],
      givingTypes: ['تبرّع', 'عطاء شهري', 'منحة', 'مسؤولية اجتماعية للشركات', 'كفالة', 'هبة كبرى', 'نداء طوارئ', 'وصية', 'تبرّع عيني', 'فعالية لجمع التبرعات'],
    },
    report: {
      styles: Object.fromEntries(STYLE_IDS.map((id) => [id, true])),
      defaultStyle: 'signature',
      defaultPages: 6,
      pageOptions: [4, 5, 6, 7, 8],
      // Optional blessing line on the thank-you page (any language, e.g. a faith-based blessing)
      blessing: { enabled: false, text: '', translation: '' },
      quotes: structuredClone(DEFAULT_QUOTES),
      useLibraryPhotos: true,
      maxRewrites: 3,
    },
    ai: { enabled: true, apiKey: '', model: 'claude-opus-5-5' },
  };
}

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
function merge(base, over) {
  if (!isObj(base) || !isObj(over)) return over === undefined ? base : over;
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = isObj(v) && isObj(base[k]) ? merge(base[k], v) : v;
  return out;
}

let current = merge(defaults(), readJSON('settings.json', {}));
// Older saved greetings had the name typed in ("I’m Amal"). Turn the old
// default name into the {name} placeholder so renaming the assistant always
// updates the greeting too.
if (current.studio.assistantName !== 'Ava' && /\bAva\b/.test(current.studio.greeting)) current.studio.greeting = current.studio.greeting.replace(/\bAva\b/g, '{name}');
let version = Date.now();

// Mix a colour with white (for the blue tints the brand book defines).
const tint = (hex, pct) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.round(c + (255 - c) * (1 - pct)));
  return '#' + ch.map((c) => c.toString(16).padStart(2, '0')).join('').toUpperCase();
};

function apply() {
  const s = current;
  Object.assign(brand, s.org);
  brand.currency = (s.org.currency || 'R').trim() || 'R';
  Object.assign(brand.colors, s.colors);
  brand.colors.blue80 = tint(s.colors.blue, 0.8);
  brand.colors.blue60 = tint(s.colors.blue, 0.6);
  brand.colors.blue40 = tint(s.colors.blue, 0.4);
  brand.colors.blue20 = tint(s.colors.blue, 0.2);
  Object.assign(brand.logo, s.logos);
  Object.assign(brand.ceo, { name: s.ceo.name, title: s.ceo.title, photo: s.ceo.photo, signature: s.ceo.signature || null });
  brand.voice = s.voice.filter((v) => v && v.trim());
}
apply();

export const getSettings = () => current;
export const settingsVersion = () => version;

/** Deep-merge a partial update, validate the basics, save and apply live. */
export function updateSettings(patch) {
  const next = merge(current, patch);
  // Renaming the assistant: replace the old name in the greeting with {name}.
  const oldName = current.studio.assistantName;
  next.studio.assistantName = String(next.studio.assistantName || '').trim() || 'Ava';
  if (oldName && oldName !== next.studio.assistantName && next.studio.greeting.includes(oldName)) {
    next.studio.greeting = next.studio.greeting.split(oldName).join('{name}');
  }
  for (const k of Object.keys(next.colors)) if (!/^#[0-9a-fA-F]{6}$/.test(next.colors[k])) throw Object.assign(new Error(`Colour "${k}" must be a hex value like #0778D4`), { status: 400 });
  if (!next.org.orgName?.trim()) throw Object.assign(new Error('Organisation name is required'), { status: 400 });
  if (!next.ceo.name?.trim()) throw Object.assign(new Error('CEO name is required'), { status: 400 });
  next.report.pageOptions = [...new Set((next.report.pageOptions || []).map(Number).filter((n) => n >= 4 && n <= 8))].sort();
  if (!next.report.pageOptions.length) next.report.pageOptions = [6];
  if (!next.report.pageOptions.includes(Number(next.report.defaultPages))) next.report.defaultPages = next.report.pageOptions.includes(6) ? 6 : next.report.pageOptions[0];
  if (!STYLE_IDS.some((id) => next.report.styles[id])) throw Object.assign(new Error('At least one report style must stay switched on'), { status: 400 });
  next.report.maxRewrites = Math.min(10, Math.max(0, Math.round(Number(next.report.maxRewrites ?? 3)) || 0));
  if (!next.report.styles[next.report.defaultStyle]) next.report.defaultStyle = STYLE_IDS.find((id) => next.report.styles[id]);
  next.agent.topics = (next.agent.topics || []).filter((t) => t && t.id && t.question?.trim());
  if (next.ar) {
    for (const k of ['voice', 'givingTypes']) if (Array.isArray(next.ar[k])) next.ar[k] = next.ar[k].map((x) => String(x).trim()).filter(Boolean).slice(0, 30);
    if (Array.isArray(next.ar.quotes)) next.ar.quotes = next.ar.quotes.filter((q) => q && String(q.text || '').trim()).map((q) => ({ text: String(q.text).trim().slice(0, 240), by: String(q.by || '').trim().slice(0, 80) })).slice(0, 12);
  }
  if (next.languages) {
    next.languages.offered = (next.languages.offered || []).filter((x) => ['en', 'ar'].includes(x));
    if (!next.languages.offered.length) throw Object.assign(new Error('Offer at least one language'), { status: 400 });
  }
  if (next.signin) {
    next.signin.images = (Array.isArray(next.signin.images) ? next.signin.images : []).map((u) => String(u).trim()).filter((u) => /^https:\/\/\S+$/i.test(u) || /^brand\/[\w./-]+\.(jpe?g|png|webp)$/i.test(u)).slice(0, 8);
    next.signin.headline = String(next.signin.headline || '').trim().slice(0, 120);
  }
  next.agent.givingTypes = [...new Set((next.agent.givingTypes || []).map((g) => String(g).trim()).filter(Boolean))].slice(0, 30);
  if (!next.agent.givingTypes.length) next.agent.givingTypes = [...GIVING_TYPES];
  if (Array.isArray(next.report.quotes)) next.report.quotes = next.report.quotes.filter((q) => q && String(q.text || '').trim()).map((q) => ({ text: String(q.text).trim().slice(0, 240), by: String(q.by || '').trim().slice(0, 80) })).slice(0, 12);
  const donor = next.agent.topics.find((t) => t.id === 'donor');
  if (donor) donor.enabled = true;
  else next.agent.topics.unshift(structuredClone(DEFAULT_TOPICS[0]));
  current = next;
  writeJSON('settings.json', current, { private: true });
  version = Date.now();
  apply();
  return current;
}

/** Reset one section (e.g. "colors") or everything to the defaults. */
export function resetSettings(section) {
  const d = defaults();
  if (section && d[section] !== undefined) {
    const keep = section === 'ai' ? { apiKey: current.ai.apiKey } : {};
    return updateSettings({ [section]: { ...d[section], ...keep } });
  }
  current = d;
  writeJSON('settings.json', current, { private: true });
  version = Date.now();
  apply();
  return current;
}

/** Settings safe to show to every signed-in user (no API key). */
export function publicSettings() {
  const s = current;
  return {
    org: s.org,
    colors: { ...brand.colors },
    logos: s.logos,
    ceo: { name: s.ceo.name, title: s.ceo.title, photo: s.ceo.photo },
    signin: s.signin,
    studio: { ...s.studio, greeting: greetingText(), greetingAr: greetingText('ar'), assistantNameAr: assistantName('ar') },
    languages: languages(),
    ar: { orgName: s.ar?.orgName, shortName: s.ar?.shortName, ceoName: s.ar?.ceoName, ceoTitle: s.ar?.ceoTitle, givingTypes: s.ar?.givingTypes || [] },
    report: { defaultStyle: s.report.defaultStyle, defaultPages: s.report.defaultPages, pageOptions: s.report.pageOptions },
    givingTypes: givingTypes(),
    demo: process.env.DEMO_MODE === '1' || process.env.DEMO_MODE === 'true',
    topics: enabledTopics('en').map(({ id, label }) => ({ id, label, labelAr: enabledTopics('ar').find((x) => x.id === id)?.label })),
    version,
  };
}

const DEFAULT_AR = Object.fromEntries(DEFAULT_TOPICS.map((t) => [t.id, t]));
export const enabledTopics = (lang = 'en') =>
  current.agent.topics.filter((t) => t.enabled).map((t) => {
    const q = lang === 'ar' ? t.questionAr || DEFAULT_AR[t.id]?.questionAr || t.question : t.question;
    return { ...t, label: lang === 'ar' ? t.labelAr || DEFAULT_AR[t.id]?.labelAr || t.label : t.label, question: q.split('{currency}').join(brand.currency || 'R') };
  });
/** Interface/report languages on offer ("en", "ar"). */
export const languages = () => {
  const l = current.languages || {};
  const offered = (l.offered || ['en']).filter((x) => ['en', 'ar'].includes(x));
  return { offered: offered.length ? offered : ['en'], defaultReport: offered.includes(l.defaultReport) ? l.defaultReport : offered[0] || 'en', defaultUi: offered.includes(l.defaultUi) ? l.defaultUi : offered[0] || 'en' };
};
/** The Arabic name of an (English) giving type, by position in the two lists. */
export const givingTypeAr = (g) => {
  const i = givingTypes().findIndex((x) => x.toLowerCase() === String(g || '').toLowerCase());
  return (i >= 0 && current.ar?.givingTypes?.[i]) || g;
};
export const givingTypes = () => (current.agent.givingTypes?.length ? current.agent.givingTypes : GIVING_TYPES);

/** The assistant's opening line with its current name filled in. */
export const assistantName = (lang = 'en') => (lang === 'ar' && current.ar?.assistantName?.trim()) || current.studio.assistantName || 'Ava';
export const greetingText = (lang = 'en') => ((lang === 'ar' ? current.ar?.greeting : '') || current.studio.greeting || '').split('{name}').join(assistantName(lang));
