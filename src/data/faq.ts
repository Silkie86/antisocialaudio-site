// Frequently asked questions, in the order they appear on the FAQ page.
// Answers are plain text. Wording is taken from the original site's FAQ, Terms and home page.
// The services, rates, payment, DAW and contact answers are built from src/data/site.ts (services, prices, payments, daws, email),
// so they always match the rest of the site: change those facts there, not here.
import { site, hourlyRate, payments, gbp, services, daws } from './site';
import { packageRows } from './pricing';

/** "a, b and c" */
const list = (items: readonly string[]) => new Intl.ListFormat('en-GB', { type: 'conjunction' }).format(items);

const packOffers = new Intl.ListFormat('en-GB', { type: 'disjunction' }).format(
  packageRows.filter((p) => p.hours > 1).map((p) => `${p.name} for ${gbp(p.total, { pence: true })} (${p.off}% off)`),
);
const payWith = [payments.card && 'credit and debit cards', payments.paypal && 'PayPal'].filter((m): m is string => Boolean(m));
const payLater = payments.payLater
  ? ' Buy now, pay later options are available at checkout and may vary based on your location.'
  : '';

export const faq = [
  {
    q: 'What services do you offer?',
    a: `Bass music production education: customised learning plans, one-to-one online classes and live online workshops. Lessons cover ${list(services.map((s) => s.toLowerCase()))}, from the basics to advanced techniques.`,
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
    q: 'What payment methods do you accept?',
    a: `${payWith.length ? `You can pay by ${list(payWith)}.` : 'Payment options are shown at checkout.'}${payLater}`,
  },
  {
    q: 'Are lessons suitable for complete beginners?',
    a: 'Yes. Classes cater to all skill levels, from beginners with no experience at all to advanced music producers.',
  },
  {
    q: 'How are the personalised learning plans created?',
    a: 'Learning plans are based on your goals, skill level and interests, and they change with you as your goals and interests change.',
  },
  {
    q: 'Which DAWs are covered?',
    a: `${site.tutor.name} aka ${site.tutor.alias} specialises in ${list(daws.specialist)}, but teaches fundamentals of music theory, sound design, arranging, mixing and mastering that apply to other DAWs such as ${list(daws.fundamentals)}.`,
  },
  {
    q: 'Can you help me set up my home studio?',
    a: 'Yes. Your tutor can guide you on setting up your home studio and choosing the right equipment and software for your needs and budget.',
  },
  {
    q: 'What if I need to cancel or move a lesson?',
    a: 'The cancellation and rescheduling policy is on our Terms page. Please read it before you book.',
  },
  {
    q: 'Do you run group workshops?',
    a: `Yes, from time to time: live masterclasses on Zoom with Q&A afterwards. The next date goes on the Workshops page when it is set.`,
  },
  {
    q: 'Is there a minimum age?',
    a: 'Lessons are open to anyone aged 13 or over. If you are under 18, you need a parent or guardian’s consent.',
  },
  {
    q: 'Do you teach in languages other than English?',
    a: 'Not at the moment: lessons are in English only.',
  },
  {
    q: 'How do I get in touch?',
    a: `Email ${site.email} with any question about lessons, workshops or your booking.`,
  },
];
