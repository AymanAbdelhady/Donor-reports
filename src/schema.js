// Shared data model: the brief the chat agent fills in, and the report copy.

export const ICONS = ['water', 'food', 'education', 'health', 'home', 'heart', 'hands', 'sprout', 'family', 'star', 'moon', 'shield', 'clock', 'sun', 'globe', 'gift'];

export const SECTORS = ['Education', 'Health', 'Food security', 'Water & sanitation', 'Children & youth', 'Livelihoods & skills', 'Shelter & housing', 'Emergency relief', 'Environment', 'Community development', 'Arts & culture', 'Animal welfare', 'Other'];

// Default giving types; organisations edit their own list in the dashboard.
export const GIVING_TYPES = ['Donation', 'Monthly giving', 'Grant', 'Corporate / CSI', 'Sponsorship', 'Major gift', 'Emergency appeal', 'Bequest', 'In-kind gift', 'Event fundraising'];

// Fields the chat agent may set (dot paths into the brief).
export const BRIEF_FIELDS = {
  'donor.name': 'Donor name (person, family, company, trust, faith or community group…)',
  'donor.type': 'Individual, Family, Company, Trust/Foundation, Faith/Community group, School, Government, Other',
  'donor.contactName': 'Contact person at an organisation',
  'donor.salutation': 'How to greet them in the CEO letter, e.g. "Thandi and family" or "friends at Acme"',
  'donor.amount': 'Donation amount, digits only',
  'donor.givingType': 'Type of gift (one of the organisation’s giving types)',
  'donor.donationDate': 'When they gave',
  'donor.relationship': 'History with the organisation, e.g. "monthly donor since 2019"',
  'donor.notes': 'Anything personal about the donor',
  'project.name': 'Project or programme name',
  'project.sector': `One of: ${SECTORS.join(', ')}`,
  'project.country': 'Country',
  'project.location': 'Region / community',
  'project.startDate': 'Start (month year)',
  'project.endDate': 'End or "Ongoing"',
  'project.beneficiaries': 'Number of people reached (digits)',
  'project.beneficiaryDesc': 'Who they are, e.g. "families in six villages"',
  'project.objective': 'Problem being solved / goal',
  'project.activities': 'What was done',
  'project.results': 'Results and changes, in words',
  'project.story': 'Beneficiary story (first names only)',
  'project.quote': 'Direct quote from a beneficiary/staff member',
  'project.quoteBy': 'Who said the quote',
  'project.challenges': 'Challenges or lessons',
  'project.nextSteps': 'What happens next',
  'report.ceoMessage': 'Personal points the CEO should include in the thank-you letter',
  'report.tone': 'Tone requested',
  'report.extraInstructions': 'Any other instruction for the report',
  'report.reportPeriod': 'Reporting period',
};

export const emptyBrief = () => ({
  donor: {},
  project: { outputs: [], budget: [] },
  report: { pages: 6, style: 'signature' },
});

// Things that make a report strong; used for the live progress meter in the UI.
export const CHECKLIST = [
  { id: 'donor', label: 'Donor', test: (b) => !!b.donor?.name },
  { id: 'gift', label: 'Gift', test: (b) => !!(b.donor?.amount || b.donor?.givingType) },
  { id: 'project', label: 'Project', test: (b) => !!(b.project?.name || b.project?.objective) },
  { id: 'place', label: 'Place', test: (b) => !!(b.project?.country || b.project?.location) },
  { id: 'results', label: 'Results', test: (b) => !!(b.project?.outputs?.length || b.project?.results || b.project?.beneficiaries) },
  { id: 'story', label: 'Story', test: (b) => !!(b.project?.story || b.project?.quote) },
  { id: 'money', label: 'Spending', test: (b) => !!b.project?.budget?.length },
  { id: 'photos', label: 'Photos', test: (b, photos) => (photos || 0) > 0 },
];

// Closing quotes (editable in the dashboard). Proverbs and well-attributed lines only.
export const DEFAULT_QUOTES = [
  { text: 'I am because we are', by: 'Ubuntu philosophy' },
  { text: 'If you want to go fast, go alone. If you want to go far, go together', by: 'African proverb' },
  { text: 'No one has ever become poor by giving', by: 'Anne Frank' },
  { text: 'Alone we can do so little; together we can do so much', by: 'Helen Keller' },
  { text: 'A society grows great when people plant trees whose shade they know they shall never sit in', by: 'Greek proverb' },
];

/** The closing quote for a report: one of the organisation's quotes, steady per donor. */
export function pickVerse(brief, quotes = DEFAULT_QUOTES) {
  const list = (quotes || []).filter((q) => q && q.text && q.text.trim());
  if (!list.length) return { text: '', ref: '' };
  const seed = [...String(brief.donor?.name || '')].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  const q = list[seed % list.length];
  return { text: q.text.trim().replace(/[.\s]+$/, ''), ref: (q.by || '').trim() };
}
