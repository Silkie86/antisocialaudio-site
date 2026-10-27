// One place for the facts the whole site uses. Change a price or link here and every page updates.

export const site = {
  name: 'Antisocial Audio',
  url: 'https://antisocialaudio.co.uk',
  tagline: 'Expression through bass.',
  description:
    'One-to-one online bass music production lessons with Solomon Rose aka Silkie, UK dubstep producer and Bitwig Certified Trainer. Mixing, mastering, music theory, sound design and arranging.',
  tutor: { name: 'Solomon Rose', alias: 'Silkie', years: '20+' },
  labels: ['Antisocial Records', 'Deep Medi', 'Disfigured Dubz', 'Soul Jazz'],
  youtube: 'https://www.youtube.com/channel/UCebmVVxiFO3hf2Za5AT8RkQ',
  // The address the old site's footer, forms and terms used. Shown in the footer, the FAQ and the privacy notice.
  email: 'hello@antisocialaudio.co.uk',
};

// Silkie's biography, artist links and DJ booking address, from the old DJ Bookings page (his own words).
export const dj = {
  bookingEmail: 'bookings@bedroomrat.co.uk',
  bio: [
    'Born and raised in Hammersmith, West London, British DJ and producer Solomon Rose, better known as Silkie, stands out as a luminary in the global bass music scene. A pioneer of dubstep, he has been instrumental in shaping and expanding the genre since his emergence in the early 2000s. Renowned for his distinctive blend of soulful melodies and powerful basslines infused with elements of jazz, Silkie has garnered acclaim both in the UK and internationally.',
    'This unique style has led him to collaborate with artists such as Quest, Mala, Skream, Joker and Jay 5ive. To date he has released 4 albums, various EPs and singles on prominent labels such as Antisocial Records, Deep Medi, Skream’s Disfigured Dubz and Soul Jazz. He has remixed tracks for artists such as Sean Paul, DJ Shadow, Scissor Sisters, Azealia Banks and Above & Beyond, and MCs such as P-Money, Nolay, Remtrex, Tinchy Stryder and Jammer have used his beats, showing his versatility and influence across diverse musical realms.',
    'Silkie has toured the world sharing his music at prestigious events and festivals such as Outlook, Fabriclive, Eastern Electrics, Lowlands Festival and Subdub, across Europe, Latin America, the US, Japan and New Zealand.',
    'Silkie recently re-launched the dubstep label Antisocial Records (previously Antisocial Entertainment), a cornerstone of the scene for nearly two decades, with releases and a monthly Rinse FM show that put bass and harmony at the centre. In the last few years he has delved into his early inspirations with a nostalgic exploration of soulful UK garage on his new label, Bedroom Rat Records. With support from respected people and press in the industry such as Mary Anne Hobbs, Resident Advisor and DJ Mag, and a new monthly radio show on SWU, Silkie’s unique imprint is carving its own niche in the ever-growing garage landscape.',
    'As a testament to a lifetime of dedication to bass music, in 2023 Silkie launched Antisocial Audio, an education platform focused on bass music production, where he shares his wealth of experience with aspiring producers.',
  ],
  links: [
    { label: 'SoundCloud', href: 'https://soundcloud.com/silkie' },
    { label: 'Bandcamp', href: 'https://silkie.bandcamp.com/' },
    { label: 'Spotify', href: 'https://open.spotify.com/artist/2Mn5YxJ8YfFCU6h2Ypr8NI' },
    { label: 'Instagram', href: 'https://www.instagram.com/silkie.rose/' },
    { label: 'X', href: 'https://x.com/silkierose' },
  ],
};

// DJ Bookings comes last on purpose: lessons and workshops lead, DJ bookings are not front and centre.
export const nav = [
  { label: 'Lessons', href: '/#lessons' },
  { label: 'Workshops', href: '/workshops/' },
  { label: 'Prices', href: '/#prices' },
  { label: 'FAQ', href: '/faq/' },
  { label: 'DJ Bookings', href: '/dj-bookings/' },
];

// The header does not stick, so the footer repeats the main links for anyone at the bottom of a long page.
// DJ Bookings is left out here, so it keeps just the nav link and the one line in the tutor section.
export const footerNav = [
  { label: 'Lessons', href: '/#lessons' },
  { label: 'Workshops', href: '/workshops/' },
  { label: 'Prices', href: '/#prices' },
  { label: 'Book', href: '/book/' },
  { label: 'FAQ', href: '/faq/' },
  { label: 'Terms', href: '/terms/' },
  { label: 'Privacy', href: '/privacy/' },
  { label: 'YouTube', href: site.youtube },
];

// Booking links. Set each to its Cal.com (or Stripe Payment Link) URL once those accounts exist.
// While a value is null, buttons go to the /book/ page, which explains what to do in the meantime.
// Set them all before antisocialaudio.co.uk is pointed at this site: until then the option cannot be booked online.
export const booking: Record<'consult' | 'lesson' | 'pack5' | 'pack10' | 'workshop', string | null> = {
  consult: null,
  lesson: null,
  pack5: null,
  pack10: null,
  workshop: null,
};

// Where people can book an option whose link above is still null: the old WordPress booking page (Amelia).
// Leave it null unless the old site is kept running at a different address, e.g.
// 'https://old.antisocialaudio.co.uk/music-productibook-now/'. The old address on antisocialaudio.co.uk
// (/music-productibook-now/) redirects to /book/ once the domain points at this site, so /book/ ignores
// any link on this site's own domain rather than send people round in a circle.
export const legacyBookingUrl: string | null = null;

/** legacyBookingUrl if it can be used: null when it is not set or is on this site's own domain (that would redirect back to /book/). */
export function legacyBooking(): string | null {
  if (!legacyBookingUrl) return null;
  const bareHost = (href: string) => new URL(href, site.url).hostname.replace(/^www\./, '');
  return bareHost(legacyBookingUrl) === bareHost(site.url) ? null : legacyBookingUrl;
}

/** The option's booking link, or its place on /book/ while the link is not set (null or ''), as BookAction and /book/ treat it. */
export function bookingHref(key: keyof typeof booking): string {
  return booking[key] || `/book/#${key}`;
}

export const services = ['Mixing', 'Mastering', 'Music Theory', 'Sound Design', 'Arranging'];

export const daws = {
  specialist: ['Bitwig', 'FL Studio', 'Studio One'],
  fundamentals: ['Ableton Live', 'Logic', 'Reason', 'Cubase'],
};

// Lesson pricing. Package totals are worked out from the hourly rate and discount,
// so they always match: 5 hours = £118.75, 10 hours = £225.00.
// Each package's name ("5 hours") and label ("5-hour pack · 5% off") are worked out from its hours and discount
// too, in src/data/pricing.ts, which also has the other price helpers the pages use.
export const hourlyRate = 25;

export const packages = [
  { key: 'lesson', hours: 1, discount: 0 },
  { key: 'pack5', hours: 5, discount: 0.05 },
  { key: 'pack10', hours: 10, discount: 0.1, best: true },
] as const;

export function packagePrice(p: { hours: number; discount: number }) {
  const full = p.hours * hourlyRate;
  // Rounded to whole pence once, here, so the pages and the structured data always show the same figure.
  const total = Math.round(full * (1 - p.discount) * 100) / 100;
  return { total, perHour: total / p.hours, saving: full - total };
}

export function gbp(n: number, opts: { pence?: boolean } = {}) {
  const pence = opts.pence ?? !Number.isInteger(n);
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: pence ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(n);
}

export const workshop = {
  title: 'Dubstep Bass Masterclass with Silkie',
  price: 15,
  where: 'Live on Zoom',
  points: ['Any DAW, all levels welcome', 'Q&A with Silkie after the session', 'Limited spaces'],
  // Set to an ISO date (e.g. '2026-11-16') when the next masterclass is scheduled.
  // Anything that is not a real date in that form stops the build with a message saying so.
  nextDate: null as string | null,
};

/**
 * The next workshop date, ready to show, or null when none is set or it has already passed.
 * The site is built ahead of time, so "already passed" means at the last build: after a workshop,
 * set the next date (or null) and the site rebuilds.
 */
export function nextWorkshop(): { iso: string; long: string; short: string } | null {
  const iso = workshop.nextDate;
  if (!iso) return null;
  // A mistyped date stops the build, rather than quietly hiding the date and the booking button on every page.
  // The pattern and NaN checks come first: toISOString() throws on an invalid date.
  const date = new Date(`${iso}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso) {
    throw new Error(`workshop.nextDate "${iso}" in src/data/site.ts is not a real date in YYYY-MM-DD form, e.g. '2026-11-16'.`);
  }
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (date < today) return null;
  const format = (weekday: 'long' | 'short') =>
    new Intl.DateTimeFormat('en-GB', { weekday, day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
  return { iso, long: format('long'), short: format('short') };
}

// How people can pay at checkout. Each mention on the site (the FAQ, the home page, /book/, the privacy notice) follows these,
// so if one isn't offered when Cal.com, Stripe and PayPal are set up, set it to false here.
// All three were offered on the old site (its FAQ: credit and debit cards, PayPal, buy now pay later at checkout).
export const payments = {
  card: true,
  paypal: true,
  payLater: true,
};

// Reviews from the old site's masterclass page, as written there. `pull` is an exact sentence from the review,
// for places with room for one line (the home page shows the first review's).
export const reviews: { quote: string; pull?: string; rating: number; name: string; note?: string }[] = [
  {
    quote: 'Attended two masterclasses with Silkie that were absolutely superb. Learnt a lot in a little amount of time from one of the most knowledgeable in the scene. Would definitely recommend.',
    pull: 'Learnt a lot in a little amount of time from one of the most knowledgeable in the scene.',
    rating: 5,
    name: 'Rakjay',
    note: 'masterclass attendee',
  },
  { quote: 'Silkie’s classes are the best! Very complete and fluid, I would defff recommend them', rating: 5, name: 'Rixa' },
  { quote: 'If you wanna do dubstep on the right way, better call Silkie. A unique and historic opportunity.', rating: 5, name: 'Asat' },
];

export const video = {
  title: 'Antisocial Audio Workshop with Silkie x Bitwig x Africa Rising Music Conference 2023',
  // The video on the old site's home page. Set to null to make the poster link to the channel instead.
  youtubeId: 'CFkXEpFHgEc' as string | null,
};
