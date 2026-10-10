// Strings of the Home landing page (Plan 0091, prototype D: docs/design/prototypes/landing-v2-d-for-the-day.html).
// English for now, keyed so it can be translated later. Counts are passed in from their source.
// The people in the stories are fictional; the photographs are of models (public/images/home/CREDITS.md).

export const homeMessages = {
  hero: {
    kicker: 'For the people who build public services, and everyone who uses them.',
    titleFirst: 'Accessibility is hard.',
    titleSecond: 'Navigating the web without it is harder.',
    promise:
      "Somewhere tonight, someone is applying for a school place, a permit, a pension. Tired, in a hurry, in their second language. With a reading difficulty, colours they can't tell apart, reading glasses left in the other room, a screen reader, or one free hand. KvirnUI is the part of your service that makes sure they all get through.",
    start: 'Start building',
    who: "Who it's for",
    honest:
      'Pre-alpha. The API will change. Testing with assistive technology is pending, and we say so everywhere.',
  },
  moments: [
    {
      id: 'maja',
      image: '/images/home/maja-kitchen-night-pexels-7128768.jpg',
      width: 1600,
      height: 2400,
      alt: 'A woman at her kitchen table at night, papers spread in front of her, hands over her face.',
      heading: 'Maja applies at 23:40, after the kids are asleep.',
      body: 'The preschool application closes at midnight. She is tired, she has dyslexia, and the words start to swim. The form has to say what it means and forgive a slip.',
      so: 'So every KvirnUI field keeps its label, its help and its error together, in plain words, one thing at a time. When something is wrong, it says what to do next and takes her straight there. Nothing is lost when she goes back.',
    },
    {
      id: 'bertil',
      image: '/images/home/bertil-granddaughter-unsplash-x2qzLL3vdBs.jpg',
      width: 1600,
      height: 1067,
      alt: 'An old man in glasses and a grey cardigan holds a red phone and looks up at his young granddaughter, who leans in to help.',
      heading: "Bertil's eyes gave up on small print years ago.",
      body: "He's 86. His granddaughter is nine. When she visits, they renew his bus pass together: she reads, he decides. He loves that she helps. But she isn't always there, and he would like to manage on his own.",
      so: "So KvirnUI's text grows when he asks it to, up to four times, with nothing cut off or hidden. The contrast meets the floors in every theme and goes higher with one setting. Every button is big enough to find. Next time, he can do it on a Tuesday afternoon, by himself, and tell her about it on Sunday.",
    },
    {
      id: 'amal',
      image: '/images/home/amal-nurse-phone-pexels-6097955.jpg',
      width: 1600,
      height: 1067,
      alt: 'A nurse in scrubs and a winter jacket on a short break, phone in one hand, coffee in the other, mask pulled down.',
      heading: 'Amal has forty seconds and one free hand.',
      body: "A night shift, a cracked phone, a thumb, and a queue of things that can't wait. The thing she needs is at the top, and the button is big enough to hit.",
      so: 'So KvirnUI reflows to 320 pixels without sideways scrolling, keeps every target 44 pixels, and follows the text size, contrast and motion she set on her own phone. Her settings win.',
    },
    {
      id: 'jonas',
      image: '/images/home/jonas-sunlit-desk-pexels-9222424.jpg',
      width: 1600,
      height: 1067,
      alt: 'A man at a wooden desk by a large window, low sun across the room and the laptop screen, forest outside.',
      heading: "Jonas can't tell the red from the green.",
      body: "One in twelve men can't. Add low sun on the screen and a hurry, and a coloured dot means nothing at all.",
      so: 'So in KvirnUI, status is never colour alone: a word and an icon always come with it. Every colour pair is measured against WCAG floors in all four themes, and the high-contrast ones are a setting away.',
    },
  ],
  edges: {
    titleFirst: 'Built for the edges.',
    titleSecond: 'Better for everyone.',
    body: 'Plain words help the person reading in a second language. A big target helps the thumb on the bus. Good contrast helps everyone over forty-five, and anyone in the sun. A clear error helps the civil servant at the end of a long shift. The keyboard helps the power user who never touches a mouse.',
    closeFirst: "Accessibility isn't a side door for a few. It's the front door, built properly.",
    closeSecond: 'And everybody walks through it.',
  },
  why: {
    kicker: 'Why we build it',
    titleFirst: 'Public services are the websites',
    titleSecond: 'nobody chooses.',
    big: "You can't take your pension application to a competitor. So it has to work for everyone who turns up, on whatever they turn up with, on the day it matters to them.",
    ours: 'Most libraries make that your problem. We made it ours. The invisible parts, the keyboard, the focus, the words a screen reader needs, the plain structure a tired mind needs, the contrast, the target sizes, the five languages, are built in, written down and tested, so your team can spend its time on the service itself.',
    honest:
      "We are small, and early. The API will change. We haven't yet put the components in front of people who use assistive technology every day, and until we have, every page here says so. That honesty is the product too.",
    links: { evidence: 'How we prove it', start: 'How to get started', contact: 'Talk to us' },
  },
  evidence: {
    heading: "We don't ask you to believe it. We show you.",
    body: 'Every component has a written contract: every role, every key, every announcement. Every key is pressed by a test in a real browser. Every story is checked in four themes. And where nobody has tested with real assistive technology yet, it says pending, in the open, until someone has.',
    countsLabel: 'KvirnUI in numbers',
    counts: {
      components: 'components',
      languages: 'languages',
      themes: 'themes',
      dependencies: 'dependencies',
      trackers: 'trackers',
    },
    themes: 4,
    trackers: 0,
    links: {
      components: 'Every component and its keyboard contract',
      contract: "Read Button's contract",
      pending: 'What is still pending',
    },
  },
  start: {
    heading: 'How to get started',
    lead: 'For the developer who will build it. A hook when you want control, a component when you want speed.',
    hookHeading: 'A hook when you want control',
    hookCode: `const disclosure = useDisclosure()

<button {...disclosure.triggerProps}>Show the answer</button>
<div {...disclosure.panelProps}>…</div>`,
    componentHeading: 'A component when you want speed',
    componentCode: `<Disclosure.Root>
  <Disclosure.Trigger>Show the answer</Disclosure.Trigger>
  <Disclosure.Panel>…</Disclosure.Panel>
</Disclosure.Root>`,
    body: 'Headless: zero CSS in the packages, state as data attributes, your markup. One opt-in theme you can remove, override or copy. Three runtime dependencies, all from TanStack. Typed by inference.',
    install: 'pnpm add @kvirn-ui/react @kvirn-ui/i18n',
    links: {
      getStarted: 'Get started',
      components: 'Every component',
      theming: 'Theming',
      contact: 'Questions? Talk to us',
    },
  },
  contact: {
    heading: 'Talk to us',
    email: 'magnus@vike.se',
    decide: {
      heading: 'You decide what your organisation builds with',
      body: "Tell us about the service and the deadline. We'll tell you plainly what KvirnUI does today, what is still pending, and what a licence covers. No forms, no mailing list: one email, answered by the person who builds it.",
      link: 'Email about a licence or a pilot',
      subject: 'KvirnUI for our organisation',
    },
    build: {
      heading: 'You build it',
      body: "Found a gap, a bug, a key that doesn't do what the contract says? That's the most useful email we get.",
      link: 'Email a question',
      subject: 'KvirnUI question',
    },
    licence: {
      heading: 'The licence in plain words',
      body: 'Free for personal use. Any other use needs a commercial licence, which also covers support. The code is published under the AGPL-3.0, so it stays readable by any auditor and available whatever happens to us.',
      link: 'Ask about the licence',
      subject: 'KvirnUI licence',
    },
  },
} as const
