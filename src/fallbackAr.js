// Arabic template writer: a complete Arabic report without the AI, from
// whatever staff provided plus warm, sector-appropriate general copy.
import { brand } from './brand.js';
import { getSettings, givingTypeAr } from './settings.js';
import { arDates } from './render/i18n.js';

const paras = (t) => String(t || '').split(/\n\s*\n|(?<=[.!?؟])\s{2,}/).map((p) => p.trim()).filter(Boolean);
const toNum = (v) => Number(String(v ?? '').replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^\d.]/g, '')) || 0;
const money = (n) => (toNum(n) ? `${brand.currency || 'R'} ${Math.round(toNum(n)).toLocaleString('en-ZA').replace(/[,\s ]/g, ' ')}` : '');
const isAr = (t) => /[؀-ۿ]/.test(String(t || ''));

const SECTOR_AR = {
  water: {
    context: 'الماء النظيف القريب من البيت يغيّر كل شيء: الصحة، والحضور المدرسي، والوقت المتاح للأسر لبناء مستقبل أفضل.',
    pillars: [['water', 'مياه نظيفة وآمنة', 'تشرب الأسر وتطهو بمياه نظيفة قريبة من البيت.'], ['health', 'أسر أكثر صحة', 'تراجع الأمراض المنقولة بالمياه يبقي الأطفال أصحاء وفي مدارسهم.'], ['clock', 'وقت مستعاد', 'الساعات التي كانت تضيع في جلب الماء صارت للتعلّم والعمل.']],
    supports: [['water', 'مصادر المياه', 'إنشاء مصادر موثوقة للمياه النظيفة وتجهيزها.'], ['hands', 'لجان محلية', 'تدريب المجتمعات على إدارة مصادر المياه وصيانتها.'], ['health', 'جلسات النظافة', 'تعليم التخزين الآمن للمياه وغسل اليدين في المدارس والبيوت.']],
  },
  food: {
    context: 'وجبة مغذية تحمل الكرامة والراحة، خاصة للأسر التي تواجه الغلاء والظروف الصعبة.',
    pillars: [['food', 'وجبات مغذية', 'حصلت الأسر على غذاء أساسي في أشد أوقات حاجتها.'], ['family', 'أسر مدعومة', 'استطاع الآباء إطعام أطفالهم دون خيارات مستحيلة.'], ['heart', 'كرامة وأمل', 'كل طرد حمل رسالة: لستم وحدكم.']],
    supports: [['food', 'طرود غذائية', 'مواد غذائية أساسية تُشترى محلياً وتُعبّأ بعناية.'], ['hands', 'توزيع عادل', 'الوصول إلى الأسر الأشد حاجة بشفافية واحترام.'], ['shield', 'المساءلة', 'متابعة كل عملية توزيع ليصل عطاؤكم إلى غايته.']],
  },
  orphans: {
    context: 'كل طفل يستحق الحب والأمان وفرصة الحلم. الكفالة تمنح الاستقرار للأطفال ومن يرعاهم.',
    pillars: [['education', 'التعلّم', 'يبقى الأطفال في المدرسة مع تغطية الزي والكتب والرسوم.'], ['health', 'الصحة والتغذية', 'رعاية صحية منتظمة وغذاء جيد لينموا أقوياء.'], ['heart', 'الحب والأمان', 'دعم مقدّمي الرعاية ليزدهر الأطفال في بيوتهم.']],
    supports: [['education', 'التعليم', 'الرسوم المدرسية والزي والمواد التعليمية.'], ['food', 'التغذية', 'غذاء صحي لأطفال في طور النمو.'], ['family', 'دعم الأسرة', 'مساعدة مقدّمي الرعاية على توفير بيت مستقر.']],
  },
  education: {
    context: 'التعليم يفتح أبواباً يغلقها الفقر، للأطفال وأسرهم ومجتمعاتهم.',
    pillars: [['education', 'العودة إلى التعلّم', 'لدى الأطفال الفصول والمواد التي يحتاجونها للتعلّم.'], ['star', 'الثقة بالنفس', 'يكبر الطلاب ثقةً وطموحاً لمستقبلهم.'], ['family', 'مجتمعات أقوى', 'الأطفال المتعلمون يرفعون أسرهم بأكملها.']],
    supports: [['education', 'مواد التعلّم', 'كتب وقرطاسية وحقائب مدرسية.'], ['home', 'فصول آمنة', 'تحسين الأماكن التي يتعلّم فيها الأطفال.'], ['hands', 'المعلمون', 'دعم المعلمين المتفانين وتدريبهم.']],
  },
  health: {
    context: 'الرعاية الصحية حق، لكن المسافة والتكلفة تبعدانها عن متناول كثير من الأسر.',
    pillars: [['health', 'رعاية تشفي', 'تلقّى المرضى علاجاً ما كانوا ليقدروا على تحمّل كلفته.'], ['family', 'أسر محمية', 'الآباء الأصحاء قادرون على رعاية أطفالهم وإعالتهم.'], ['shield', 'الوقاية', 'التثقيف الصحي يساعد المجتمعات على تجنّب المرض.']],
    supports: [['health', 'العلاج', 'أدوية ومعدات واستشارات.'], ['hands', 'العاملون الصحيون', 'دعم كوادر ماهرة ورحيمة.'], ['shield', 'الوقاية', 'جلسات توعية في المجتمع.']],
  },
  livelihoods: {
    context: 'الدخل الثابت يمكّن الأسر من الاعتماد على نفسها والتخطيط للمستقبل بثقة.',
    pillars: [['sprout', 'دخل متنامٍ', 'تكسب الأسر وتدّخر من عملها.'], ['hands', 'مهارات جديدة', 'التدريب يبني معرفة وثقة دائمتين.'], ['family', 'الاعتماد على الذات', 'تلبّي الأسر احتياجاتها بكرامة.']],
    supports: [['sprout', 'أدوات ومدخلات', 'بذور ومعدات ومواد للبدء.'], ['education', 'التدريب', 'مهارات عملية وإرشاد في إدارة المشاريع.'], ['hands', 'المرافقة', 'دعم مستمر مع نمو الأسر.']],
  },
  emergency: {
    context: 'في الساعات والأيام الأولى من أي أزمة، تصنع المساعدة السريعة المنقذة للحياة كل الفرق.',
    pillars: [['shield', 'مساعدة منقذة للحياة', 'تلقّت الأسر عوناً عاجلاً في أصعب لحظاتها.'], ['food', 'الاحتياجات الأساسية', 'غذاء وماء ومستلزمات لبّت الحاجات الفورية.'], ['heart', 'أمل يتجدد', 'يعلم المتضررون أن العالم لم ينسهم.']],
    supports: [['food', 'إمدادات الطوارئ', 'غذاء وماء ومستلزمات نظافة وأساسيات.'], ['home', 'المأوى', 'أماكن آمنة ودافئة للإقامة.'], ['health', 'العون الطبي', 'رعاية للمصابين والمرضى.']],
  },
  winter: {
    context: 'حين تنخفض درجات الحرارة يصبح الدفء مسألة نجاة للأسر قليلة الحماية.',
    pillars: [['home', 'دفء في البيت', 'بقيت الأسر دافئة في أبرد الأشهر.'], ['health', 'صحة محمية', 'الملابس والأغطية الدافئة تحمي من المرض.'], ['heart', 'راحة ورعاية', 'كل بطانية حملت دفئاً ولطفاً.']],
    supports: [['home', 'بطانيات ومدافئ', 'أساسيات تبقي البيوت دافئة.'], ['gift', 'ملابس شتوية', 'ملابس دافئة للأطفال والكبار.'], ['food', 'دعم غذائي', 'غذاء مغذٍّ لفصل الشتاء.']],
  },
  environment: {
    context: 'البيئة الصحية أساس المجتمعات الصحية، اليوم وللأجيال القادمة.',
    pillars: [['sprout', 'طبيعة تتعافى', 'الأرض والمياه والمساحات الخضراء تتعافى وتزدهر.'], ['family', 'مجتمعات أكثر صحة', 'محيط أنظف يعني أسراً أسعد وأكثر صحة.'], ['globe', 'إرث يدوم', 'تغيير ترثه الأجيال القادمة.']],
    supports: [['sprout', 'الزراعة والرعاية', 'أشجار وحدائق وأعمال إصلاح.'], ['education', 'التوعية', 'مساعدة المجتمعات على حماية ما يهمها.'], ['hands', 'روّاد محليون', 'متطوعون وفرق تواصل العمل.']],
  },
  community: {
    context: 'تُبنى المجتمعات القوية حين يجد الناس أماكن وفرصاً ودعماً لينموا معاً.',
    pillars: [['family', 'ناس متواصلون', 'جيران وأسر وأجيال يجتمعون معاً.'], ['star', 'فرص جديدة', 'أماكن وبرامج تساعد الناس على النمو.'], ['heart', 'الانتماء', 'لكل فرد مكان وصوت.']],
    supports: [['home', 'أماكن آمنة', 'أماكن يلتقي فيها المجتمع ويتعلّم.'], ['hands', 'البرامج', 'أنشطة وتدريب ودعم يغيّر الحياة.'], ['shield', 'المساءلة', 'متابعة دقيقة لكل مساهمة.']],
  },
  general: {
    context: () => `${getSettings().ar?.orgName || brand.orgName} تعمل جنباً إلى جنب مع المجتمعات لإحداث تغيير دائم.`,
    pillars: [['heart', 'حياة تغيّرت', 'وصل لطفكم إلى أناس يواجهون ظروفاً صعبة.'], ['hands', 'تغيير حقيقي', 'مساعدة عملية تجعل الحياة اليومية أفضل.'], ['star', 'أمل دائم', 'المجتمعات تبني مستقبلاً أكثر إشراقاً.']],
    supports: [['gift', 'دعم مباشر', 'مساعدة أساسية تصل حيث الحاجة أشد.'], ['hands', 'فرق محلية', 'موظفون ومتطوعون مخلصون في الميدان.'], ['shield', 'المساءلة', 'متابعة دقيقة لكل مساهمة.']],
  },
};

/** Arabic report copy, same shape as the English template writer's. */
export function fallbackCopyAr(brief, photos = [], sector = { key: 'general' }) {
  const d = brief.donor || {};
  const p = brief.project || {};
  const r = brief.report || {};
  const ar = getSettings().ar || {};
  const sc = SECTOR_AR[sector.key] || SECTOR_AR.general;
  const context = typeof sc.context === 'function' ? sc.context() : sc.context;
  const org = ar.orgName || brand.orgName;
  const year = String(new Date().getFullYear());
  const place = [p.location, p.country].filter(Boolean).join('، ');
  const amount = money(d.amount);
  const donor = d.name || 'داعمنا العزيز';
  const greet = isAr(d.salutation) ? d.salutation : donor;
  const giftWord = d.givingType ? givingTypeAr(d.givingType) : 'عطاء';
  const projectName = p.name || 'برنامجنا';
  const reached = p.beneficiaries ? `${p.beneficiaries} مستفيد` : 'أسر في أمسّ الحاجة';
  const period = arDates(r.reportPeriod || [p.startDate, p.endDate].filter(Boolean).join(' – ') || year);
  const stats = (p.outputs || []).filter((o) => o.value && o.label).map((o) => ({ value: String(o.value), label: o.label })).slice(0, 4);
  if (p.beneficiaries && !stats.some((s) => s.value === String(p.beneficiaries))) stats.unshift({ value: String(p.beneficiaries), label: 'مستفيد' });
  if (amount && stats.length < 4) stats.push({ value: amount.replace(/\s/, ''), label: 'عطاؤكم' });
  const story = paras(p.story);
  const points = getSettings().ceo.letterPoints?.trim();
  const letter = [
    `نيابةً عن كل فريق ${org}، نشكركم من القلب على عطائكم الكريم${giftWord !== 'عطاء' ? ` (${giftWord})` : ''}${amount ? ` بقيمة ${amount}` : ''} لصالح ${projectName}.`,
    `بفضلكم، تلقّى ${reached}${place ? ` في ${place}` : ''} دعماً يغيّر حياتهم. ${context}`,
    r.ceoMessage ? r.ceoMessage : d.relationship ? `نحن ممتنون لشراكتكم المستمرة (${d.relationship})، فثقتكم تلهم فريقنا بأكمله.` : 'ثقتكم بنا أمانة نرعاها بكل عناية، وهي تلهم فريقنا بأكمله.',
    ...(points ? [points] : []),
    'شكراً لأنكم جعلتم هذا ممكناً. يشرّفنا وجودكم معنا، ونتطلّع إلى مشاركتكم المزيد مما نحققه معاً.',
  ];
  const firstPeople = photos.findIndex((ph) => !ph.illustrative);
  return {
    cover: { kicker: `تقرير الأثر ${year}`, title: isAr(p.name) && p.name.length <= 40 ? p.name : 'عطاؤك في العمل', highlight: 'شكراً لكم', subtitle: `بكل امتنان إلى ${donor}` },
    ceoLetter: { salutation: `الأعزاء ${greet}،`, paragraphs: letter, closing: ar.closing || 'مع خالص الشكر والامتنان،' },
    project: {
      heading: 'أين ذهب عطاؤك',
      lead: isAr(p.objective) ? p.objective : context,
      paragraphs: [...paras(p.activities), ...paras(p.results)].filter(isAr).slice(0, 2).length
        ? [...paras(p.activities), ...paras(p.results)].filter(isAr).slice(0, 2)
        : [`ذهب دعمكم إلى ${projectName}${place ? ` في ${place}` : ''}، ووصل إلى ${reached}.`, `تعمل فرقنا في ${org} جنباً إلى جنب مع المجتمعات المحلية كي تصل المساعدة بسرعة واحترام وحيث تشتد الحاجة.`],
      keyFacts: [
        { label: 'البرنامج', value: projectName },
        { label: 'المكان', value: place || 'حيث تشتد الحاجة' },
        { label: 'الفترة', value: period },
        p.beneficiaries && { label: 'المستفيدون', value: String(p.beneficiaries) },
        amount && { label: 'عطاؤكم', value: amount },
      ].filter(Boolean),
    },
    impact: {
      heading: 'أثرك',
      intro: isAr(p.results) ? paras(p.results)[0].slice(0, 220) : `هذا ما جعله دعمكم ممكناً${place ? ` في ${place}` : ''}.`,
      stats,
      pillars: sc.pillars.map(([icon, title, text]) => ({ icon, title, text })),
    },
    story: {
      heading: story.length ? 'قصة تغيير' : 'ماذا يعني دعمكم',
      paragraphs: story.length ? story.slice(0, 3) : [`بالنسبة إلى ${reached}، عطاؤكم أكثر بكثير من مساعدة. ${context}`, 'وراء كل رقم أسرة لها آمال وخطط ومستقبل صار أكثر إشراقاً، لأنكم اخترتم أن تساعدوا.'],
      quote: p.quote || '',
      quoteAttribution: p.quote ? p.quoteBy || '' : '',
    },
    gallery: { heading: 'لحظات من الأمل', intro: 'لطفكم كما تراه الوجوه والأماكن التي وصل إليها.' },
    money: {
      heading: 'عطاؤك في العمل',
      intro: 'كل مساهمة تأتمنوننا عليها تُدار بعناية وشفافية ومساءلة.',
      supports: sc.supports.map(([icon, title, text]) => ({ icon, title, text })),
      note: 'تستند الأرقام إلى سجلات المشروع وقت إعداد التقرير.',
    },
    ahead: {
      heading: 'نظرة إلى المستقبل',
      paragraphs: isAr(p.nextSteps) ? paras(p.nextSteps).slice(0, 1) : ['سنواصل السير مع هذه المجتمعات، ونبني على ما بدأه كرمكم كي يدوم التغيير لسنوات قادمة.'],
      bullets: ['متابعة ودعم مستمران', 'إطلاعكم على التقدّم مع نمو العمل', 'فرص لتعميق أثركم'],
    },
    thankYou: { heading: 'شكراً لكم', message: `شكراً لكم يا ${greet} على وقوفكم مع من يواجهون ظروفاً صعبة. كرمكم أمانة نرعاها في كل ما نقوم به.`, duaArabic: '', duaEnglish: '' },
    images: {
      coverIndex: firstPeople >= 0 ? firstPeople : photos.length ? 0 : -1,
      storyIndex: photos.length > 1 ? 1 : photos.length ? 0 : -1,
      captions: photos.map((ph, i) => ({ index: i, caption: isAr(ph.caption) ? ph.caption : ph.illustrative ? ph.altAr || '' : '' })),
    },
    locale: { donorName: isAr(d.name) ? d.name : '', place: isAr(place) ? place : '', period, givingType: giftWord === 'عطاء' ? '' : giftWord, budgetLabels: [] },
  };
}
