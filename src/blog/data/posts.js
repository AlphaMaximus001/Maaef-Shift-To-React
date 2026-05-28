// Dynamic posts manager for the Maaef Journal.
// Hydrates dynamically from the local Markdown filesystem client-side.
// Falls back to static mock data during SSR and compile time.

export const CATEGORIES = [
  'ALL',
  'DISPATCH',
  'STUDIO',
  'FIELD',
  'SIGNAL',
  'NOTES',
  'INTERVIEW',
];

const POSTS_STATIC = [
  {
    n: '07',
    slug: 'we-made-the-broadcast-louder',
    date: '26.05.26',
    cat: 'DISPATCH',
    title: 'We made the broadcast louder. Then we made it slower.',
    dek: 'When everyone is shouting, the room belongs to whoever whispers last. A short note on signal-to-noise in 2026.',
    read: '07m',
    author: 'M. RIZVI',
    body: [
      { type: 'p', text: 'There is a particular sound a city makes when every brand is trying to be louder than the last one. We have been listening to it for three years now, and the volume is not the problem. The volume is the symptom.' },
      { type: 'p', text: 'The problem is that nobody is editing. Every campaign is a first draft of a first draft, shipped because the calendar said so. The work bleeds together. The audience tunes the whole frequency out, not just the bad parts.' },
      { type: 'h', text: 'A short note on cadence' },
      { type: 'p', text: 'When we started Maaef, we made a rule: every dispatch has to be defensible against a single question — "would I miss this if it never went out?" Most things fail. That is fine. Most things should fail. The ones that survive get our full attention.' },
      { type: 'q', text: 'When everyone is shouting, the room belongs to whoever whispers last.' },
      { type: 'p', text: 'We are not against volume. We are against volume without a reason. A loud campaign that earns its volume is a different animal from a loud campaign that is just afraid of silence. The audience can tell. They have always been able to tell.' },
      { type: 'h', text: 'What we are doing about it' },
      { type: 'p', text: 'Three things, starting this quarter. First, we are publishing this journal — a slower frequency, on purpose. Second, we are turning down briefs that ask us to be loud without saying why. Third, we are hiring two more editors. Not designers, not strategists. Editors.' },
      { type: 'p', text: 'If any of that resonates, the studio is open. If it does not, the studio is also open — we like an argument.' },
    ],
  },
  {
    n: '06',
    slug: 'six-briefs-we-said-no-to',
    date: '18.05.26',
    cat: 'STUDIO',
    title: 'The six briefs we said no to this month.',
    dek: 'A working list of clients we turned down, and what each rejection bought us.',
    read: '05m',
    author: 'STUDIO',
    body: [],
  },
  {
    n: '05',
    slug: 'field-notes-lucknow-week-04',
    date: '09.05.26',
    cat: 'FIELD',
    title: 'Field notes from Lucknow — week 04.',
    dek: 'Three rooms, one signal, and a lot of tea. A diary from the studio floor.',
    read: '09m',
    author: 'F. KHAN',
    body: [],
  },
];

// Hydrate POSTS array dynamically in browser
export const POSTS = typeof window !== 'undefined' && window.__MAAEF_POSTS__ 
  ? window.__MAAEF_POSTS__ 
  : POSTS_STATIC;

export function getPostBySlug(slug) {
  const posts = typeof window !== 'undefined' && window.__MAAEF_POSTS__
    ? window.__MAAEF_POSTS__
    : POSTS_STATIC;
  return posts.find((p) => p.slug === slug);
}

export function getNextPost(slug) {
  const posts = typeof window !== 'undefined' && window.__MAAEF_POSTS__
    ? window.__MAAEF_POSTS__
    : POSTS_STATIC;
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) return null;
  return posts[(idx + 1) % posts.length];
}
