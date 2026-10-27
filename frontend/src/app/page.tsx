import Link from 'next/link';
import Ledger from '@/components/landing/Ledger';
import Reveal from '@/components/landing/Reveal';

const CHAPTERS = [
  {
    title: 'The question',
    body: 'It started with a question I couldn’t shake: when a bank stops a payment in under a second, what is it actually looking at? Every answer I found was a sales page. So I decided to build one myself and find out.',
  },
  {
    title: 'The ugly first version',
    body: 'The first Sentinel was one page and a pile of if-statements. It flagged everything — including my own test transfers. But it taught me the real problem: one strange payment means little. The pattern across many accounts means everything.',
  },
  {
    title: 'Thinking in networks',
    body: 'So I stopped reading transactions as rows and started drawing them as a map — accounts as points, money as lines. Rings of mule accounts and cash looping back to where it began suddenly had a shape. That shift is the heart of Sentinel-X.',
  },
  {
    title: 'Breaking it on purpose',
    body: 'I spent late nights attacking my own system: stolen passwords tried at speed, hijacked sessions, quiet devices phoning home. Every time something slipped through, it became a new check and a new test. Passkey login and the network kill-switch were born in those nights.',
  },
  {
    title: 'Where it stands',
    body: 'Today it’s a full console — a live feed, risk scores, a network map, admin controls and an audit trail that remembers every click. It isn’t finished. Neither am I. That’s the fun part.',
  },
];

const WORK = [
  { n: '01', title: 'Follow the money', body: 'Every transfer is drawn onto a map of accounts, so loops, fan-outs and mule rings stand out instead of hiding in a spreadsheet.', href: '/network' },
  { n: '02', title: 'Score every move', body: 'Velocity, geography, device and history roll into one number per payment — with the reasons written next to it, in plain words.', href: '/analysis' },
  { n: '03', title: 'Lock the door', body: 'Passkey sign-in with no passwords to steal, session watching, and a single switch that freezes a suspicious corner of the network.', href: '/security' },
  { n: '04', title: 'Keep the receipts', body: 'Who did what, when, and why — every action lands in an audit log you can filter, read and export.', href: '/audit' },
];

const STACK = ['Next.js', 'TypeScript', 'Python', 'MongoDB', 'WebAuthn passkeys', 'Tailwind'];
const TICKER = ['Follows the money', 'Scores the risk', 'Locks the door', 'Keeps the receipts'];

export default function Home() {
  return (
    <main className="relative">
      {/* Nav */}
      <header className="fixed inset-x-0 top-0 z-50 mix-blend-difference">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 text-paper">
          <Link href="/" className="font-display text-2xl tracking-tight">
            Sentinel<span className="italic text-accent">—</span>X
          </Link>
          <div className="hidden items-center gap-8 text-sm md:flex">
            <a href="#story" className="draw">Story</a>
            <a href="#work" className="draw">What it does</a>
            <a href="#build" className="draw">The build</a>
          </div>
          <Link href="/dashboard" className="rounded-full border border-paper/60 px-5 py-2 text-sm transition-colors hover:bg-paper hover:text-ink">
            Open console
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative mx-auto grid min-h-[100svh] max-w-7xl items-center gap-16 px-6 pt-32 pb-20 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <p className="mb-8 font-mono text-xs uppercase tracking-[0.3em] text-sand">
            A fraud console · built by Sayan
          </p>
          <h1 className="font-display text-[clamp(3rem,7vw,6.5rem)] font-light leading-[0.92] tracking-[-0.03em]">
            Every payment tells a story.{' '}
            <em className="font-normal text-accent">Some of them lie.</em>
          </h1>
          <p className="mt-10 max-w-xl text-lg leading-relaxed text-paper/70">
            Sentinel-X watches money move between accounts, notices when the story stops adding up,
            and leaves a paper trail a human can actually read.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-6">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 font-medium text-ink transition-transform hover:-translate-y-0.5"
            >
              Step inside
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <a href="#story" className="draw text-paper/80">or read how it started ↓</a>
          </div>
        </div>
        <div className="mx-auto w-full max-w-md">
          <Ledger />
        </div>
      </section>

      {/* Ticker */}
      <div className="overflow-hidden border-y border-[var(--line)] bg-accent py-5 text-ink">
        <div className="marquee flex w-max gap-12 whitespace-nowrap font-display text-3xl italic md:text-5xl">
          {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-12">
              {t} <span className="not-italic">✺</span>
            </span>
          ))}
        </div>
      </div>

      {/* Story */}
      <section id="story" className="mx-auto max-w-7xl px-6 py-32">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.4fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-sand">The story so far</p>
            <h2 className="font-display text-5xl font-light leading-[1] tracking-tight md:text-6xl">
              Hi, I’m <em className="text-accent">Sayan.</em>
              <br />I build things to understand them.
            </h2>
            <div className="mt-10 flex items-center gap-5">
              <div className="grid h-20 w-20 place-items-center rounded-full border border-accent font-display text-3xl italic text-accent">
                SB
              </div>
              <div className="text-sm leading-relaxed text-paper/60">
                Sayan Bhattacharya
                <br />
                Developer · tinkerer · professional skeptic
              </div>
            </div>
          </div>

          <ol className="relative border-l border-[var(--line)]">
            {CHAPTERS.map((c, i) => (
              <li key={c.title} className="relative pb-16 pl-10 last:pb-0">
                <span className="absolute -left-[5px] top-3 h-2.5 w-2.5 rounded-full bg-accent" />
                <Reveal>
                  <p className="font-mono text-xs text-sand">Chapter {String(i + 1).padStart(2, '0')}</p>
                  <h3 className="mt-2 font-display text-3xl md:text-4xl">{c.title}</h3>
                  <p className="mt-4 max-w-xl text-lg leading-relaxed text-paper/70">{c.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>

        <Reveal className="mx-auto mt-32 max-w-4xl text-center">
          <blockquote className="font-display text-4xl font-light italic leading-tight md:text-6xl">
            “I don’t trust systems I can’t explain — so I build the ones{' '}
            <span className="text-accent">I’d want to trust.</span>”
          </blockquote>
        </Reveal>
      </section>

      {/* What it does */}
      <section id="work" className="border-t border-[var(--line)] bg-ink-2">
        <div className="mx-auto max-w-7xl px-6 py-32">
          <div className="mb-20 flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-display text-5xl tracking-tight md:text-7xl">
              What it <em className="text-accent">does</em>
            </h2>
            <p className="max-w-sm text-paper/60">Four jobs, done properly. Click any of them to see it running.</p>
          </div>
          <ul>
            {WORK.map(w => (
              <li key={w.n} className="border-t border-[var(--line)] last:border-b">
                <Link
                  href={w.href}
                  className="group grid items-baseline gap-4 py-10 transition-colors md:grid-cols-[6rem_1fr_1.3fr_3rem]"
                >
                  <span className="font-mono text-sm text-sand">{w.n}</span>
                  <h3 className="font-display text-3xl transition-colors group-hover:text-accent md:text-5xl">{w.title}</h3>
                  <p className="text-paper/60 md:text-lg">{w.body}</p>
                  <span className="hidden text-3xl text-sand transition-transform group-hover:translate-x-2 group-hover:text-accent md:block">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The build */}
      <section id="build" className="mx-auto max-w-7xl px-6 py-32">
        <div className="grid gap-12 md:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-5xl leading-[1] tracking-tight md:text-6xl">
              Made by hand, <em className="text-accent">line by line.</em>
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="text-lg leading-relaxed text-paper/70">
              No templates, no shortcuts. A Next.js console in front, Python detectors behind it, MongoDB
              keeping the records, and passkeys standing at the door. Every detector has a test, because a
              fraud tool you can’t verify is just another way to be fooled.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {STACK.map(s => (
                <span key={s} className="rounded-full border border-[var(--line)] px-4 py-1.5 font-mono text-xs text-paper/70">
                  {s}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-[var(--line)]">
        <div className="mx-auto max-w-7xl px-6 py-40 text-center">
          <h2 className="font-display text-[clamp(3rem,9vw,8.5rem)] font-light leading-[0.9] tracking-[-0.03em]">
            Come watch
            <br />
            the <em className="text-accent">money move.</em>
          </h2>
          <Link
            href="/dashboard"
            className="group mt-14 inline-flex items-center gap-3 rounded-full border border-paper px-10 py-5 text-lg transition-colors hover:bg-paper hover:text-ink"
          >
            Open the console <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--line)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-paper/50 md:flex-row">
          <span className="font-display text-lg text-paper">
            Sentinel<span className="italic text-accent">—</span>X
          </span>
          <span>Designed &amp; built by Sayan Bhattacharya · {new Date().getFullYear()}</span>
          <a href="https://github.com/SayAn1-dls/sentinel-x" className="draw" target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
        </div>
      </footer>
    </main>
  );
}
