// Fictional sample donor + project used to preview styles and build thumbnails.
// All names and figures are made up for demonstration only.
export const sampleBrief = {
  donor: { name: 'The Naidoo Family', type: 'Family', salutation: 'Priya, Dev and family', amount: '120000', givingType: 'Donation', relationship: 'Monthly supporters since 2019' },
  project: {
    name: 'Reading for Life',
    sector: 'Education',
    country: 'South Africa',
    location: 'Soweto, Johannesburg',
    startDate: 'February 2026',
    endDate: 'September 2026',
    beneficiaries: '1 800',
    beneficiaryDesc: 'learners in four primary schools',
    objective: 'Give every child in four Soweto primary schools a library corner, a reading mentor and books they can take home.',
    outputs: [
      { label: 'learners reading more', value: '1 800' },
      { label: 'library corners', value: '4' },
      { label: 'books donated', value: '6 500' },
      { label: 'reading mentors trained', value: '48' },
    ],
    budget: [
      { label: 'Books & library furniture', amount: '64000' },
      { label: 'Mentor training', amount: '28000' },
      { label: 'Reading clubs & events', amount: '17000' },
      { label: 'Monitoring & support', amount: '11000' },
    ],
    story: 'Ten-year-old Lerato used to hide at the back of the class when it was her turn to read.',
    quote: 'Now I read to my little brother every night. He says I am the best storyteller in our house.',
    quoteBy: 'Lerato, 10, Soweto',
  },
  report: { pages: 8, style: 'signature', reportPeriod: 'February – September 2026' },
};

export const sampleCopy = {
  cover: { kicker: 'Impact report 2026', title: 'A library in every classroom', highlight: 'Thank you', subtitle: 'With heartfelt gratitude to the Naidoo family for opening the world of books in Soweto' },
  ceoLetter: {
    salutation: 'Dear Priya, Dev and family,',
    paragraphs: [
      'It is my privilege to thank you personally for your gift to Reading for Life. Since 2019 your family has stood with children in our community, and this year your generosity reached four primary schools in Soweto.',
      'Because of you, 1 800 learners now have a library corner in their classroom, a trained reading mentor and books they can take home. Teachers tell us reading time has become the most popular part of the school day.',
      'A child who reads with confidence can learn anything. Your gift will keep turning pages for years to come, cared for by the schools and families it serves.',
      'Thank you for believing in these children. We are honoured to walk this journey with you.',
    ],
    closing: 'With heartfelt gratitude,',
  },
  project: {
    heading: 'Where your gift went',
    lead: 'Many children in Soweto’s primary schools reach Grade 4 without being able to read for meaning.',
    paragraphs: [
      'Classrooms had few books, and most homes had none. Children who fall behind in reading often lose confidence and fall further behind in every subject.',
      'Your gift built four classroom libraries, trained 48 volunteer reading mentors and started weekly reading clubs, so that reading is not only taught but loved.',
    ],
    keyFacts: [
      { label: 'Location', value: 'Soweto, Johannesburg' },
      { label: 'Period', value: 'February – September 2026' },
      { label: 'Programme', value: 'Education' },
      { label: 'Learners reached', value: '1 800' },
      { label: 'Your gift', value: 'R 120 000' },
    ],
  },
  impact: {
    heading: 'Your impact',
    intro: 'In just eight months, your gift turned four schools into places where children love to read.',
    stats: [
      { value: '1 800', label: 'learners reading more' },
      { value: '4', label: 'library corners' },
      { value: '6 500', label: 'books donated' },
      { value: '48', label: 'mentors trained' },
    ],
    pillars: [
      { icon: 'education', title: 'Books for every child', text: 'Every classroom now has a library corner full of books in English and isiZulu.' },
      { icon: 'star', title: 'Confident readers', text: 'Learners read aloud with pride and choose books for themselves.' },
      { icon: 'family', title: 'Reading at home', text: 'Take-home books mean parents and siblings now read together.' },
    ],
  },
  story: {
    heading: 'Lerato’s new chapter',
    paragraphs: [
      'Ten-year-old Lerato used to hide at the back of the class when it was her turn to read. The words felt too hard, and she was afraid the others would laugh.',
      'Then she joined the Tuesday reading club. Her mentor, Mrs Dlamini, let her choose her own books and read with her a page at a time.',
      'Today Lerato is the first to put up her hand. She borrows two books a week and has started writing her own stories.',
    ],
    quote: 'Now I read to my little brother every night. He says I am the best storyteller in our house.',
    quoteAttribution: 'Lerato, 10, Soweto',
  },
  gallery: { heading: 'Moments of joy', intro: 'From the first box of books to the first reading club: your gift, seen through the places it reached.' },
  money: {
    heading: 'Your gift at work',
    intro: 'Every contribution you entrusted to us was used for the programme, with every rand accounted for.',
    supports: [
      { icon: 'education', title: 'Books and shelves', text: 'Hundreds of new and donated books, plus shelves and reading mats.' },
      { icon: 'hands', title: 'Reading mentors', text: 'Training volunteers to read with children every week.' },
      { icon: 'star', title: 'Reading clubs', text: 'Clubs, competitions and a book festival to make reading fun.' },
    ],
    note: 'Figures are based on project records at the time of reporting.',
  },
  ahead: {
    heading: 'Looking ahead',
    paragraphs: ['Each school now runs its own library with a parent volunteer, and our team will visit every term to add new books and support the mentors.'],
    bullets: ['New books every term', 'Refresher training for mentors', 'Two more schools joining in 2027'],
  },
  thankYou: { heading: 'Thank you', message: 'Thank you, Priya, Dev and family. Every page turned in Soweto carries your kindness forward.', duaArabic: '', duaEnglish: '' },
  images: { coverIndex: 0, storyIndex: 1, captions: [] },
};

// The same fictional report, written in Arabic (for Arabic previews and tests).
export const sampleCopyAr = {
  cover: { kicker: 'تقرير الأثر 2026', title: 'مكتبة في كل فصل دراسي', highlight: 'شكراً لكم', subtitle: 'بكل امتنان لعائلة نايدو التي فتحت عالم الكتب أمام أطفال سويتو' },
  ceoLetter: {
    salutation: 'الأعزاء بريا وديف والعائلة الكريمة،',
    paragraphs: [
      'يسعدني أن أشكركم شخصياً على عطائكم لبرنامج «القراءة من أجل الحياة». منذ عام 2019 وأنتم تقفون إلى جانب أطفال مجتمعنا، وقد وصل كرمكم هذا العام إلى أربع مدارس ابتدائية في سويتو.',
      'بفضلكم، أصبح لدى 1 800 طالب ركن مكتبة في فصولهم، ومرشد قراءة مدرَّب، وكتب يأخذونها إلى بيوتهم. ويخبرنا المعلمون أن وقت القراءة صار أحبّ أوقات اليوم الدراسي.',
      'الطفل الذي يقرأ بثقة يستطيع أن يتعلم أي شيء. وسيبقى عطاؤكم يقلّب الصفحات لسنوات قادمة، ترعاه المدارس والأسر التي يخدمها.',
      'شكراً لإيمانكم بهؤلاء الأطفال. يشرّفنا أن نسير معكم في هذه الرحلة.',
    ],
    closing: 'مع خالص الشكر والامتنان،',
  },
  project: {
    heading: 'أين ذهب عطاؤك',
    lead: 'كثير من أطفال المدارس الابتدائية في سويتو يصلون إلى الصف الرابع دون أن يتمكنوا من القراءة بفهم.',
    paragraphs: [
      'كانت الفصول تفتقر إلى الكتب، ومعظم البيوت بلا كتب على الإطلاق. والطفل الذي يتأخر في القراءة يفقد ثقته غالباً ويتأخر في كل المواد.',
      'موّل عطاؤكم أربعة أركان مكتبات في الفصول، ودرّب 48 مرشداً متطوعاً للقراءة، وأطلق نوادي قراءة أسبوعية، كي لا تُدرَّس القراءة فحسب بل تُحَبّ.',
    ],
    keyFacts: [
      { label: 'المكان', value: 'سويتو، جوهانسبرغ' },
      { label: 'الفترة', value: 'فبراير – سبتمبر 2026' },
      { label: 'البرنامج', value: 'التعليم' },
      { label: 'الطلاب المستفيدون', value: '1 800' },
      { label: 'عطاؤك', value: 'R 120 000' },
    ],
  },
  impact: {
    heading: 'أثرك',
    intro: 'في ثمانية أشهر فقط، حوّل عطاؤكم أربع مدارس إلى أماكن يحب فيها الأطفال القراءة.',
    stats: [
      { value: '1 800', label: 'طالب يقرؤون أكثر' },
      { value: '4', label: 'أركان مكتبات' },
      { value: '6 500', label: 'كتاب متبرَّع به' },
      { value: '48', label: 'مرشداً مدرَّباً' },
    ],
    pillars: [
      { icon: 'education', title: 'كتب لكل طفل', text: 'في كل فصل اليوم ركن مكتبة مليء بالكتب بالإنجليزية والزولو.' },
      { icon: 'star', title: 'قرّاء واثقون', text: 'يقرأ الطلاب بصوت عالٍ بفخر ويختارون كتبهم بأنفسهم.' },
      { icon: 'family', title: 'القراءة في البيت', text: 'الكتب المنزلية جعلت الآباء والإخوة يقرؤون معاً.' },
    ],
  },
  story: {
    heading: 'فصل جديد في حياة ليراتو',
    paragraphs: [
      'كانت ليراتو ذات العشرة أعوام تختبئ في آخر الفصل عندما يحين دورها في القراءة. كانت الكلمات صعبة، وكانت تخشى أن يضحك منها الآخرون.',
      'ثم انضمت إلى نادي القراءة يوم الثلاثاء. تركتها مرشدتها السيدة دلاميني تختار كتبها بنفسها، وقرأت معها صفحة صفحة.',
      'اليوم ليراتو أول من يرفع يده. تستعير كتابين كل أسبوع، وبدأت تكتب قصصها الخاصة.',
    ],
    quote: 'الآن أقرأ لأخي الصغير كل ليلة. يقول إنني أفضل حكّاءة في بيتنا.',
    quoteAttribution: 'ليراتو، 10 أعوام، سويتو',
  },
  gallery: { heading: 'لحظات من الفرح', intro: 'من أول صندوق كتب إلى أول نادي قراءة: عطاؤكم كما تراه الأماكن التي وصل إليها.' },
  money: {
    heading: 'عطاؤك في العمل',
    intro: 'استُخدم كل ما ائتمنتمونا عليه في البرنامج، مع حساب دقيق لكل مبلغ.',
    supports: [
      { icon: 'education', title: 'كتب ورفوف', text: 'مئات الكتب الجديدة والمتبرَّع بها، مع رفوف وحُصر للقراءة.' },
      { icon: 'hands', title: 'مرشدو القراءة', text: 'تدريب متطوعين يقرؤون مع الأطفال كل أسبوع.' },
      { icon: 'star', title: 'نوادي القراءة', text: 'نوادٍ ومسابقات ومهرجان للكتاب يجعل القراءة متعة.' },
    ],
    note: 'تستند الأرقام إلى سجلات المشروع وقت إعداد التقرير.',
  },
  ahead: {
    heading: 'نظرة إلى المستقبل',
    paragraphs: ['تدير كل مدرسة الآن مكتبتها بمساعدة أحد أولياء الأمور المتطوعين، وسيزور فريقنا كل مدرسة في كل فصل دراسي لإضافة كتب جديدة ودعم المرشدين.'],
    bullets: ['كتب جديدة كل فصل دراسي', 'تدريب تنشيطي للمرشدين', 'انضمام مدرستين جديدتين في 2027'],
  },
  thankYou: { heading: 'شكراً لكم', message: 'شكراً لكم يا بريا وديف والعائلة الكريمة. كل صفحة تُقلَّب في سويتو تحمل لطفكم إلى الأمام.', duaArabic: '', duaEnglish: '' },
  locale: { donorName: 'عائلة نايدو', place: 'سويتو، جوهانسبرغ، جنوب أفريقيا', period: 'فبراير – سبتمبر 2026', givingType: 'تبرّع', budgetLabels: ['الكتب وأثاث المكتبة', 'تدريب المرشدين', 'نوادي القراءة والفعاليات', 'المتابعة والدعم'] },
  images: { coverIndex: 0, storyIndex: 1, captions: [{ index: 0, caption: 'طلاب في ركن المكتبة الجديد' }, { index: 1, caption: 'نادي القراءة في أوج نشاطه' }, { index: 2, caption: 'كتب جاهزة للفصول' }, { index: 3, caption: 'معاً نبني مجتمعاً أقوى' }, { index: 4, caption: 'بيوت آمنة للأسر' }, { index: 5, caption: 'تعلّم يفتح الأبواب' }] },
};
