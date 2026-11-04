// Arabic (right-to-left) reports.
//
// Every style is designed left-to-right with absolute positions. For Arabic we
//  1. mirror all CSS and inline positions with rtlcss (left <-> right, margins,
//     borders, alignment, rotations, background positions),
//  2. switch to Arabic fonts and Arabic typography (no letter-spacing, no
//     capitals or italics, taller lines so dots and marks never clip),
//  3. translate the fixed labels printed by the designs ("Prepared for",
//     "Your gift"...). The report copy itself is written in Arabic by the AI
//     (or the Arabic template writer).
import rtlcss from 'rtlcss';

/** Fixed labels used inside the report designs. */
export const AR_LABELS = {
  'A message from our CEO': 'رسالة من الرئيس التنفيذي',
  'Thank you': 'شكراً لكم',
  'Thank': 'شكراً',
  you: 'لكم',
  'The project': 'المشروع',
  'Your impact': 'أثرك',
  Impact: 'الأثر',
  'Story of change': 'قصة تغيير',
  'A story of change': 'قصة تغيير',
  'Impact and story': 'الأثر والقصة',
  Gallery: 'معرض الصور',
  'In pictures': 'بالصور',
  'Your gift at work': 'عطاؤك في العمل',
  'What your gift supports': 'ما يدعمه عطاؤك',
  'How it was spent': 'كيف أُنفق المبلغ',
  'How your gift was spent': 'كيف أُنفق عطاؤك',
  Accountability: 'المساءلة والشفافية',
  'Prepared for': 'أُعدّ خصيصاً لـ',
  'Your gift': 'عطاؤك',
  'Project period': 'فترة المشروع',
  Place: 'المكان',
  Where: 'المكان',
  Period: 'الفترة',
  From: 'من',
  To: 'إلى',
  'At a glance': 'لمحة سريعة',
  'Area of spend': 'بند الإنفاق',
  Amount: 'المبلغ',
  Total: 'المجموع',
  'Per person reached': 'لكل مستفيد',
  'per person reached': 'لكل مستفيد',
  'Budget lines': 'بنود الميزانية',
  'What happens next': 'ما الخطوة التالية',
  'What comes next': 'ما الخطوة التالية',
  'Your impact in numbers': 'أثرك بالأرقام',
  Web: 'الموقع',
  Email: 'البريد الإلكتروني',
  Phone: 'الهاتف',
  Social: 'التواصل الاجتماعي',
  Registered: 'التسجيل',
  'Each tile is 5% of the total': 'كل مربع يمثل 5% من المجموع',
  'With thanks': 'مع الشكر',
  'Thank you for your support': 'شكراً لدعمكم',
  'Saving lives': 'إنقاذ الأرواح',
  'The need': 'الحاجة',
  'What we did': 'ما قمنا به',
  'The result': 'النتيجة',
  'What’s next': 'الخطوة التالية',
  "What's next": 'الخطوة التالية',
};
// Phrases that appear inside longer text (captions, footers).
const AR_PARTIAL = [
  [/\(illustrative\)/g, '(صورة توضيحية)'],
  [/\bper person reached\b/g, 'لكل مستفيد'],
  [/\bdivided by\b/g, 'مقسوماً على'],
  [/\bpeople\b/g, 'شخص'],
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
/** "February – September 2026" -> "فبراير – سبتمبر 2026" (dates the AI didn't localise). */
export const arDates = (t) =>
  String(t || '')
    .replace(new RegExp(`\\b(${MONTHS.join('|')})\\b`, 'g'), (m) => MONTHS_AR[MONTHS.indexOf(m)])
    .replace(/\b(Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\b\.?/g, (m) => MONTHS_AR[['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(m.replace(/\.$/, '').replace('Sept', 'Sep'))] || m)
    .replace(/\bOngoing\b/gi, 'مستمر');

/** Arabic web fonts (all open licence, from @fontsource). */
export function arabicFontCss(fontUrl) {
  const face = (family, file, weight) => `@font-face{font-family:'${family}';src:url('${fontUrl(file)}') format('woff2');font-weight:${weight};font-display:block}`;
  const out = [];
  for (const w of [400, 600, 700, 800, 900]) out.push(face('Cairo', `cairo/files/cairo-arabic-${w}-normal.woff2`, w));
  for (const w of [400, 500, 700, 800]) out.push(face('Tajawal', `tajawal/files/tajawal-arabic-${w}-normal.woff2`, w));
  for (const w of [400, 700]) out.push(face('Aref Ruqaa', `aref-ruqaa/files/aref-ruqaa-arabic-${w}-normal.woff2`, w));
  return out.join('\n');
}

/** Typography for Arabic, added after the mirrored style CSS. */
export const AR_CSS = `
:root{--head:'Cairo','Barlow Semi Condensed',sans-serif;--body:'Tajawal','Lato',sans-serif;--marker:'Aref Ruqaa','Caveat Brush',cursive;--sig:'Mrs Saint Delafield','Aref Ruqaa',cursive;--arabic:'Amiri','Cairo',serif}
html{direction:rtl}
body .page,body .page *{letter-spacing:0 !important;text-transform:none !important;font-style:normal !important}
body .page{line-height:1.75}
body .page h1,body .page h2,body .page h3,body .page .h,body .page .stack,body .page [class*=title],body .page [class*=heading]{line-height:1.35 !important}
body .page .hl,body .page [class*=thanks],body .page [class*=highlight]{line-height:1.5 !important;padding-bottom:.12em}
body .page .sig-script,body .page .letter-signature{line-height:1.6 !important}
.j .footer-page::before{content:"محطة " !important}
`;

/** Mirror one block of CSS. */
export const flipCss = (css) => rtlcss.process(css);

/** Mirror every inline style="" in the generated pages. */
export function flipInline(html) {
  return html.replace(/style="([^"]*)"/g, (m, decl) => {
    if (!/(left|right|margin|padding|border|text-align|transform|background-position|float)/.test(decl)) return m;
    try {
      const out = rtlcss.process(`x{${decl.replace(/&quot;/g, '"')}}`);
      return `style="${out.slice(2, -1).replace(/"/g, '&quot;')}"`;
    } catch {
      return m;
    }
  });
}

/** Translate the fixed English labels in text nodes (not in <style>/<script>). */
const NUM_GROUPS = /(?:[A-Z$£€₦]{1,3}[\s\u00a0]?)?\d{1,3}(?:[\s\u00a0]\d{3})+(?:[.,]\d+)?%?/g;
export function translateLabels(html) {
  return html.replace(/>([^<>]+)</g, (m, text) => {
    const t = text.trim();
    if (!t) return m;
    let out = text;
    if (/[A-Za-z]/.test(t)) {
      if (AR_LABELS[t]) out = text.replace(t, AR_LABELS[t]);
      else for (const [re, rep] of AR_PARTIAL) out = out.replace(re, rep);
    }
    // Right-to-left text would reverse "1 800" into "800 1": keep number groups left-to-right.
    out = out.replace(NUM_GROUPS, (n) => `<span dir="ltr" style="unicode-bidi:isolate">${n}</span>`);
    return `>${out}<`;
  });
}
