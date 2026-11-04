/**
 * Default brand for the generic Donor Report Studio demo.
 *
 * "Horizon Community Foundation" is a fictional demo organisation. Everything
 * here can be changed from the admin dashboard (Branding, CEO & letter,
 * Assistant & questions), and the changes apply live to the Studio, the AI and
 * every report. Colour keys keep their engine names (blue = primary colour,
 * yellow = highlight colour, etc.); the dashboard shows friendly labels.
 *
 * Only open-licence fonts are used (Barlow Semi Condensed, Lato, Caveat Brush,
 * Cairo, Mrs Saint Delafield), so the demo can be shared with any organisation.
 */
export const brand = {
  orgName: 'Horizon Community Foundation',
  shortName: 'Horizon Foundation',
  tagline: 'Building brighter futures together',
  website: 'www.horizonfoundation.example',
  email: 'hello@horizonfoundation.example',
  phone: '',
  address: 'Johannesburg, South Africa',
  registration: '',
  socials: '@horizonfoundation',
  about: 'A non-profit organisation working alongside communities on education, health, food security and livelihoods.',
  currency: 'R',

  ceo: {
    name: 'Alex Morgan',
    title: 'Chief Executive Officer',
    photo: 'ceo-photo.jpg', // generated placeholder portrait until a real photo is uploaded
    signature: null,
  },

  logo: {
    box: 'logo-box.png', // logo on a solid panel: works on photos and white
    colour: 'logo.png', // logo for white / light backgrounds
    white: 'logo-white.png', // all-white logo for dark / coloured backgrounds
  },

  colors: {
    blue: '#1B5FAA', // primary
    blue80: '#497FBB',
    blue60: '#769FCC',
    blue40: '#A4BFDD',
    blue20: '#D1DFEE',
    purple: '#6A4C93', // secondary
    teal: '#2A9D8F', // accent 1
    green: '#7CB342', // accent 2
    yellow: '#FFC93C', // highlight
    warmGrey: '#ECE8E2', // neutral background
    black: '#000000',
    ink: '#1F2328',
    grey: '#62666D',
    white: '#FFFFFF',
  },

  fonts: {
    heading: "'Barlow Semi Condensed', 'Arial Narrow', sans-serif",
    body: "'Lato', Arial, sans-serif",
    marker: "'Caveat Brush', cursive",
    arabic: "'Cairo', 'Lato', sans-serif", // used for the optional blessing line (any language)
    signature: "'Mrs Saint Delafield', cursive",
  },

  // Tone of voice for the AI writer (editable in the dashboard).
  voice: [
    'Warm, sincere and personal: written by a person, for a person. Professional, never academic, flippant or exaggerated.',
    'Dignity first: show resilience, hope and agency. Never pity, never sensationalise. Use first names only for people in stories. Say "people living in poverty", not "the poor"; "older people", not "the elderly".',
    'Specific and honest: celebrate real results, never invent numbers, names or quotes.',
    'Plain language: short sentences, active voice, no jargon or acronyms in donor-facing text.',
    'British/South African spelling (organisation, programme, colour). Numbers one to nine in words, 10 and above as numerals. Dates as 30 August 2026. No full stops in headings or captions.',
  ],
};
