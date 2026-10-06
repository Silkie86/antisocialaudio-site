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

export const nav = [
  { label: 'Lessons', href: '/#lessons' },
  { label: 'Workshops', href: '/workshops/' },
  { label: 'DJ Bookings', href: '/dj-bookings/' },
  { label: 'Prices', href: '/#prices' },
  { label: 'FAQ', href: '/faq/' },
];

export const footerNav = [
  { label: 'FAQ', href: '/faq/' },
  { label: 'Terms', href: '/terms/' },
  { label: 'Privacy', href: '/privacy/' },
  { label: 'YouTube', href: site.youtube },
];

// Booking links. Set each to its Cal.com (or Stripe Payment Link) URL once those accounts exist.
// While a value is null, buttons go to the /book/ page, which explains what to do in the meantime.
export const booking: Record<'consult' | 'lesson' | 'pack5' | 'pack10' | 'workshop', string | null> = {
  consult: null,
  lesson: null,
  pack5: null,
  pack10: null,
  workshop: null,
};

// Where people can book until the new booking pages are live (the current Amelia page).
export const legacyBookingUrl = 'https://antisocialaudio.co.uk/music-productibook-now/';

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
