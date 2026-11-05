// Showcase report: a fictional food-relief programme illustrated with the bundled
// sample photos in brand/library/photos. Used for the showcase samples and the
// style thumbnails, so people can see what a report with real photography looks like.
// All names and figures are made up for demonstration only.
export const showcaseImages = [
  'photo-serving-meals.jpg',
  'photo-volunteer-boxes.jpg',
  'photo-delivery-door.jpg',
  'photo-meal-handover.jpg',
  'photo-delivery-care.jpg',
].map((f) => ({ file: `library/photos/${f}`, caption: '' }));

export const showcaseBrief = {
  donor: { name: 'Sunrise Holdings', type: 'Corporate', salutation: 'the Sunrise Holdings team', amount: '250000', givingType: 'Corporate / CSI', relationship: 'CSI partner since 2023' },
  project: {
    name: 'Warm Plates',
    sector: 'Food security',
    country: 'South Africa',
    location: 'Alexandra, Johannesburg',
    startDate: 'March 2026',
    endDate: 'August 2026',
    beneficiaries: '420',
    beneficiaryDesc: 'families and 300 children',
    objective: 'Make sure no family in Alexandra goes to bed hungry this winter, with hot meals every weekday and monthly food parcels delivered to the door.',
    outputs: [
      { label: 'hot meals served', value: '9 600' },
      { label: 'families receiving parcels', value: '420' },
      { label: 'children fed every weekday', value: '300' },
      { label: 'volunteers', value: '64' },
    ],
    budget: [
      { label: 'Food and ingredients', amount: '150000' },
      { label: 'Parcel packing & delivery', amount: '52000' },
      { label: 'Kitchen equipment & gas', amount: '30000' },
      { label: 'Volunteer support', amount: '18000' },
    ],
    story: 'Thandi, a grandmother raising four grandchildren, had been skipping meals so the children could eat.',
    quote: 'For the first time this winter, I sat down and ate with my grandchildren. Nobody had to go without.',
    quoteBy: 'Thandi, 64, Alexandra',
  },
  report: { pages: 8, style: 'signature', reportPeriod: 'March – August 2026' },
};

export const showcaseCopy = {
  cover: { kicker: 'Impact report 2026', title: 'No empty plates this winter', highlight: 'Thank you', subtitle: 'With heartfelt gratitude to Sunrise Holdings for keeping families in Alexandra fed and warm' },
  ceoLetter: {
    salutation: 'Dear Sunrise Holdings team,',
    paragraphs: [
      'On behalf of everyone at our foundation, thank you for your generous support of Warm Plates. Your partnership arrived just as winter began and the need in Alexandra was at its greatest.',
      'Because of you, our kitchen served 9 600 hot meals, 300 children ate every school day, and 420 families received a food parcel at their door each month.',
      'Behind every number is a family that could stop worrying about the next meal and start thinking about tomorrow again. Your staff volunteers carried that care in person, box by box.',
      'Thank you for choosing to stand with your neighbours. We are proud to call you our partners.',
    ],
    closing: 'With heartfelt gratitude,',
  },
  project: {
    heading: 'Where your gift went',
    lead: 'Winter is the hardest season for families in Alexandra: jobs dry up, prices rise and children feel it first.',
    paragraphs: [
      'Many households were down to one meal a day, and parents were skipping meals so their children could eat.',
      'Your gift kept our community kitchen running every weekday and paid for monthly parcels of staple food, packed by volunteers and delivered to the families who need them most.',
    ],
    keyFacts: [
      { label: 'Location', value: 'Alexandra, Johannesburg' },
      { label: 'Period', value: 'March – August 2026' },
      { label: 'Programme', value: 'Food security' },
      { label: 'Families reached', value: '420' },
      { label: 'Your gift', value: 'R 250 000' },
    ],
  },
  impact: {
    heading: 'Your impact',
    intro: 'In six winter months, your gift put warm food on hundreds of tables.',
    stats: [
      { value: '9 600', label: 'hot meals served' },
      { value: '420', label: 'families with parcels' },
      { value: '300', label: 'children fed daily' },
      { value: '64', label: 'volunteers' },
    ],
    pillars: [
      { icon: 'food', title: 'A hot meal every day', text: 'Nutritious meals served every weekday from our community kitchen.' },
      { icon: 'family', title: 'Parcels at the door', text: 'Monthly staple food delivered to families who cannot travel.' },
      { icon: 'hands', title: 'Neighbours helping neighbours', text: 'Local and staff volunteers packing, cooking and delivering together.' },
    ],
  },
  story: {
    heading: 'Thandi’s table',
    paragraphs: [
      'Thandi is 64 and raising four grandchildren on her pension. Last winter she often went without dinner so the children would have enough.',
      'This year a volunteer knocked on her door with a food parcel, and the children started eating lunch at the kitchen every school day.',
      'Now Thandi cooks one warm family meal every evening, and the children come home with full stomachs and their homework done.',
    ],
    quote: 'For the first time this winter, I sat down and ate with my grandchildren. Nobody had to go without.',
    quoteAttribution: 'Thandi, 64, Alexandra',
  },
  gallery: { heading: 'Moments of care', intro: 'From the kitchen to the front door: your gift, seen through the people it reached.' },
  money: {
    heading: 'Your gift at work',
    intro: 'Every rand you entrusted to us went to the programme and is accounted for.',
    supports: [
      { icon: 'food', title: 'Food and ingredients', text: 'Fresh produce, staples and protein for meals and parcels.' },
      { icon: 'home', title: 'Delivery to the door', text: 'Packing and transport so parcels reach every family.' },
      { icon: 'hands', title: 'Kitchen and volunteers', text: 'Equipment, gas and support for the people who cook and serve.' },
    ],
    note: 'Figures are based on project records at the time of reporting.',
  },
  ahead: {
    heading: 'Looking ahead',
    paragraphs: ['With the kitchen now fully equipped, we will keep serving meals all year and start a food garden with the families so they can grow their own vegetables.'],
    bullets: ['Year-round school-day meals', 'A community food garden', 'Cooking and nutrition classes for parents'],
  },
  thankYou: { heading: 'Thank you', message: 'Thank you, Sunrise Holdings. Every warm plate in Alexandra this winter carried your kindness.', duaArabic: '', duaEnglish: '' },
  images: {
    coverIndex: 0,
    storyIndex: 3,
    captions: [
      { index: 0, caption: 'Volunteers serving lunch at the community kitchen' },
      { index: 1, caption: 'Packing the monthly food parcels' },
      { index: 2, caption: 'A parcel delivered to a family’s door' },
      { index: 3, caption: 'A warm meal, handed over with care' },
      { index: 4, caption: 'Health workers checking a care package' },
    ],
  },
};

export const showcaseCopyAr = {
  cover: { kicker: 'تقرير الأثر 2026', title: 'لا أطباق فارغة هذا الشتاء', highlight: 'شكراً لكم', subtitle: 'بكل امتنان لشركة صن رايز القابضة التي أبقت أسر ألكسندرا في دفء وشبع' },
  ceoLetter: {
    salutation: 'فريق شركة صن رايز القابضة الكريم،',
    paragraphs: [
      'باسم كل العاملين في مؤسستنا، أشكركم على دعمكم السخي لبرنامج «أطباق دافئة». جاءت شراكتكم مع بداية الشتاء، حين كانت الحاجة في ألكسندرا في أشدّها.',
      'بفضلكم، قدّم مطبخنا 9 600 وجبة ساخنة، وتناول 300 طفل الطعام في كل يوم دراسي، وتسلّمت 420 أسرة طرداً غذائياً عند بابها كل شهر.',
      'خلف كل رقم أسرة استطاعت أن تتوقف عن القلق بشأن الوجبة التالية وأن تفكر في الغد من جديد. وقد حمل موظفوكم المتطوعون هذه الرعاية بأيديهم، صندوقاً بعد صندوق.',
      'شكراً لأنكم اخترتم الوقوف إلى جانب جيرانكم. نفخر بأن نسمّيكم شركاءنا.',
    ],
    closing: 'مع خالص الشكر والامتنان،',
  },
  project: {
    heading: 'أين ذهب عطاؤك',
    lead: 'الشتاء أصعب المواسم على أسر ألكسندرا: تقلّ فرص العمل وترتفع الأسعار، والأطفال أول من يشعر بذلك.',
    paragraphs: [
      'كانت أسر كثيرة تكتفي بوجبة واحدة في اليوم، وكان الآباء يتخلّون عن وجباتهم كي يأكل أطفالهم.',
      'أبقى عطاؤكم مطبخنا المجتمعي يعمل كل يوم من أيام الأسبوع، وموّل طروداً شهرية من المواد الغذائية الأساسية يجهّزها المتطوعون ويوصلونها إلى الأسر الأشد حاجة.',
    ],
    keyFacts: [
      { label: 'المكان', value: 'ألكسندرا، جوهانسبرغ' },
      { label: 'الفترة', value: 'مارس – أغسطس 2026' },
      { label: 'البرنامج', value: 'الأمن الغذائي' },
      { label: 'الأسر المستفيدة', value: '420' },
      { label: 'عطاؤك', value: 'R 250 000' },
    ],
  },
  impact: {
    heading: 'أثرك',
    intro: 'في ستة أشهر من الشتاء، وضع عطاؤكم طعاماً دافئاً على مئات الموائد.',
    stats: [
      { value: '9 600', label: 'وجبة ساخنة' },
      { value: '420', label: 'أسرة تسلّمت طروداً' },
      { value: '300', label: 'طفل يأكلون يومياً' },
      { value: '64', label: 'متطوعاً' },
    ],
    pillars: [
      { icon: 'food', title: 'وجبة ساخنة كل يوم', text: 'وجبات مغذية تُقدَّم كل يوم من أيام الأسبوع في مطبخنا المجتمعي.' },
      { icon: 'family', title: 'طرود حتى الباب', text: 'مواد غذائية أساسية شهرية تصل إلى الأسر التي لا تستطيع التنقل.' },
      { icon: 'hands', title: 'جيران يساعدون جيرانهم', text: 'متطوعون من الحي ومن الشركة يجهّزون ويطبخون ويوصلون معاً.' },
    ],
  },
  story: {
    heading: 'مائدة ثاندي',
    paragraphs: [
      'ثاندي جدّة في الرابعة والستين، تربّي أربعة أحفاد من معاشها. في الشتاء الماضي كانت كثيراً ما تبيت بلا عشاء كي يكفي الطعام الأطفال.',
      'هذا العام طرق متطوع بابها حاملاً طرداً غذائياً، وصار الأطفال يتناولون الغداء في المطبخ كل يوم دراسي.',
      'اليوم تطبخ ثاندي وجبة عائلية دافئة كل مساء، ويعود الأطفال إلى البيت شبعى وقد أنجزوا واجباتهم.',
    ],
    quote: 'لأول مرة هذا الشتاء جلست وأكلت مع أحفادي. لم يضطر أحد إلى الاستغناء عن طعامه.',
    quoteAttribution: 'ثاندي، 64 عاماً، ألكسندرا',
  },
  gallery: { heading: 'لحظات من الرعاية', intro: 'من المطبخ إلى عتبة البيت: عطاؤكم كما يراه الناس الذين وصل إليهم.' },
  money: {
    heading: 'عطاؤك في العمل',
    intro: 'ذهب كل ما ائتمنتمونا عليه إلى البرنامج، مع حساب دقيق لكل مبلغ.',
    supports: [
      { icon: 'food', title: 'الطعام والمكوّنات', text: 'خضار طازجة ومواد أساسية وبروتين للوجبات والطرود.' },
      { icon: 'home', title: 'التوصيل حتى الباب', text: 'التعبئة والنقل كي يصل الطرد إلى كل أسرة.' },
      { icon: 'hands', title: 'المطبخ والمتطوعون', text: 'المعدات والغاز ودعم من يطبخون ويقدّمون الطعام.' },
    ],
    note: 'تستند الأرقام إلى سجلات المشروع وقت إعداد التقرير.',
  },
  ahead: {
    heading: 'نظرة إلى المستقبل',
    paragraphs: ['بعد أن اكتمل تجهيز المطبخ، سنواصل تقديم الوجبات طوال العام، وسنبدأ حديقة غذائية مع الأسر كي تزرع خضارها بنفسها.'],
    bullets: ['وجبات طوال العام الدراسي', 'حديقة غذائية مجتمعية', 'دروس في الطبخ والتغذية للآباء'],
  },
  thankYou: { heading: 'شكراً لكم', message: 'شكراً لكم يا صن رايز القابضة. كل طبق دافئ في ألكسندرا هذا الشتاء حمل لطفكم.', duaArabic: '', duaEnglish: '' },
  locale: { donorName: 'شركة صن رايز القابضة', place: 'ألكسندرا، جوهانسبرغ، جنوب أفريقيا', period: 'مارس – أغسطس 2026', givingType: 'مسؤولية اجتماعية للشركات', budgetLabels: ['الطعام والمكوّنات', 'تعبئة الطرود وتوصيلها', 'معدات المطبخ والغاز', 'دعم المتطوعين'] },
  images: {
    coverIndex: 0,
    storyIndex: 3,
    captions: [
      { index: 0, caption: 'متطوعون يقدّمون الغداء في المطبخ المجتمعي' },
      { index: 1, caption: 'تجهيز الطرود الغذائية الشهرية' },
      { index: 2, caption: 'طرد يصل إلى باب إحدى الأسر' },
      { index: 3, caption: 'وجبة دافئة تُقدَّم بعناية' },
      { index: 4, caption: 'عاملون صحيون يفحصون طرداً للرعاية' },
    ],
  },
};
