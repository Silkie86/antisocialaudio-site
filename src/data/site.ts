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

export function bookingHref(key: keyof typeof booking): string {
  return booking[key] ?? `/book/#${key}`;
}

export const services = ['Mixing', 'Mastering', 'Music Theory', 'Sound Design', 'Arranging'];

export const daws = {
  specialist: ['Bitwig', 'FL Studio', 'Studio One'],
  fundamentals: ['Ableton Live', 'Logic', 'Reason', 'Cubase'],
};

// Lesson pricing. Package totals are worked out from the hourly rate and discount,
// so they always match: 5 hours = £118.75, 10 hours = £225.00.
export const hourlyRate = 25;

export const packages = [
  { key: 'lesson', hours: 1, discount: 0, name: '1 hour', sub: 'Single lesson' },
  { key: 'pack5', hours: 5, discount: 0.05, name: '5 hours', sub: '5-hour pack · 5% off' },
  { key: 'pack10', hours: 10, discount: 0.1, name: '10 hours', sub: '10-hour pack · 10% off', best: true },
] as const;

export function packagePrice(p: { hours: number; discount: number }) {
  const full = p.hours * hourlyRate;
  const total = full * (1 - p.discount);
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
  nextDate: null as string | null,
};

/**
 * The next workshop date, ready to show, or null when none is set or it has already passed.
 * The site is built ahead of time, so "already passed" means at the last build: after a workshop,
 * set the next date (or null) and the site rebuilds.
 */
export function nextWorkshop(): { iso: string; long: string; short: string } | null {
  const iso = workshop.nextDate;
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const date = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso) return null;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (date < today) return null;
  const format = (weekday: 'long' | 'short') =>
    new Intl.DateTimeFormat('en-GB', { weekday, day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
  return { iso, long: format('long'), short: format('short') };
}

// How people can pay at checkout. Each mention on the site (the FAQ, the home page, /book/) follows these,
// so if one isn't offered when Cal.com, Stripe and PayPal are set up, set it to false here.
// TODO: confirm all three once checkout is live; buy now, pay later was offered on the old WordPress shop.
export const payments = {
  card: true,
  paypal: true,
  payLater: true,
};

export const review = {
  quote: 'Learnt a lot in a little amount of time from one of the most knowledgeable in the scene.',
  rating: 5,
  source: 'Dubstep Bass Masterclass attendee',
};

export const video = {
  title: 'Antisocial Audio Workshop with Silkie x Bitwig x Africa Rising Music Conference 2023',
  // Add the YouTube video ID (the part after watch?v=) to play it in-page. Until then the poster links to the channel.
  youtubeId: null as string | null,
};
