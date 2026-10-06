// Frequently asked questions, in the order they appear on the FAQ page.
// Answers are plain text. Wording is taken from the original site.
// The rates answer is built from the prices in site.ts, so it always matches the rest of the site.
import { hourlyRate, packages, packagePrice, payments, gbp } from './site';

const packOffers = new Intl.ListFormat('en-GB', { type: 'disjunction' }).format(
  packages
    .filter((p) => p.hours > 1)
    .map((p) => `${p.hours} hours for ${gbp(packagePrice(p).total, { pence: true })} (${Math.round(p.discount * 100)}% off)`),
);
const payLater = payments.payLater
  ? ' Buy now, pay later options are available at checkout and may vary based on your location.'
  : '';

export const faq = [
  {
    q: 'What services do you offer?',
    a: 'Bass music production education: customised learning plans, one-to-one online classes and live online workshops. Lessons cover mixing, mastering, music theory, sound design and arranging, from the basics to advanced techniques.',
  },
  {
    q: 'How do I book?',
    a: 'Hit Book, then pick a service and a time and date that suits you. Not sure where to start? Book the free 30-minute consultation first.',
  },
  {
    q: 'What are your rates?',
    a: `Lessons are ${gbp(hourlyRate)} per hour. You can save by buying a package: ${packOffers}.${payLater}`,
  },
  {
    q: 'How do I get a consultation?',
    a: 'Hit Book and choose the free 30-minute consultation to set up a call with Silkie. You can talk about your music production goals, get your skill level assessed and explore how classes can be tailored to you.',
  },
  {
    q: 'Which DAWs are covered?',
    a: 'Solomon Rose aka Silkie specialises in Bitwig, FL Studio and Studio One, but teaches fundamentals of music theory, sound design, arranging, mixing and mastering that apply to other DAWs such as Ableton Live, Logic, Reason and Cubase.',
  },
];
