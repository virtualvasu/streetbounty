'use client';

import Link from 'next/link';
import {
  FaArrowRight,
  FaBolt,
  FaCheckCircle,
  FaCoins,
  FaGlobeAmericas,
  FaMapMarkedAlt,
  FaShieldAlt,
  FaWallet,
} from 'react-icons/fa';
import ThemeToggle from '@/components/ThemeToggle';

const howItWorks = [
  {
    step: '01',
    title: 'Connect Wallet',
    description: 'Open StreetBounty with a Stellar wallet and enter the civic reporting flow.',
  },
  {
    step: '02',
    title: 'Report Incident',
    description: 'Capture the road issue with location, details, and proof when the portal expands.',
  },
  {
    step: '03',
    title: 'Verify Community',
    description: 'The network validates the report so the signal stays trusted and useful.',
  },
  {
    step: '04',
    title: 'Earn XLM',
    description: 'Verified contributions are rewarded directly through the Stellar network.',
  },
];

const audienceCards = [
  {
    icon: FaWallet,
    title: 'For Citizens',
    points: ['Simple incident submissions', 'Reward-backed participation', 'Clear contribution history'],
  },
  {
    icon: FaMapMarkedAlt,
    title: 'For Authorities',
    points: ['Real-time incident visibility', 'Better prioritization', 'Actionable location data'],
  },
  {
    icon: FaGlobeAmericas,
    title: 'For Communities',
    points: ['Shared public trust', 'Safer roads', 'Transparent incentive loops'],
  },
];

const trustSignals = [
  'Built on Stellar',
  'Fast, low-fee XLM rewards',
  'Decentralized verification',
  'Testnet-ready for demos',
];

export default function Home() {
  return (
    <div className="sb-page">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-white/50 backdrop-blur-xl dark:bg-slate-950/55">
        <div className="sb-shell">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-orange-500 text-2xl shadow-lg shadow-cyan-500/20">
                🛣️
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                  StreetBounty
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Civic incident reporting, rewarded on Stellar
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="sb-chip hidden sm:inline-flex">
                <FaShieldAlt /> Stellar testnet
              </span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="sb-shell pb-20 pt-8 md:pt-12">
        <section className="sb-hero-grid items-center lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
          <div className="space-y-8">
            <span className="sb-kicker">
              <FaBolt className="text-cyan-400" />
              Civic-tech rewards network
            </span>

            <div className="space-y-6">
              <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white md:text-7xl">
                Make roads safer.
                <span className="block bg-gradient-to-r from-cyan-400 via-sky-300 to-orange-400 bg-clip-text text-transparent">
                  Get rewarded in XLM.
                </span>
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300 md:text-xl">
                StreetBounty turns road incident reporting into a trusted public utility. Citizens can flag hazards, support verification, and earn Stellar-powered rewards for contributing useful local data.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/portal" className="sb-btn-primary">
                Launch Portal <FaArrowRight />
              </Link>
              <a href="#how-it-works" className="sb-btn-secondary">
                See how it works
              </a>
            </div>

            <div className="sb-grid-3">
              <div className="sb-stat">
                <p className="text-3xl font-bold text-slate-950 dark:text-white">Fast</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Stellar settlement and low-fee rewards.</p>
              </div>
              <div className="sb-stat">
                <p className="text-3xl font-bold text-slate-950 dark:text-white">Trusted</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Community verification keeps reports useful.</p>
              </div>
              <div className="sb-stat">
                <p className="text-3xl font-bold text-slate-950 dark:text-white">Useful</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Built for citizens, authorities, and local response teams.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-cyan-400/20 via-transparent to-orange-400/15 blur-3xl" />
            <div className="sb-glass relative overflow-hidden rounded-[2rem] p-6 md:p-8">
              <div className="flex items-center justify-between">
                <span className="sb-chip">
                  <FaCoins /> Reward network
                </span>
                <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                  Live on testnet
                </span>
              </div>

              <div className="mt-8 space-y-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    StreetBounty mission
                  </p>
                  <h2 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
                    A public-safety dashboard for reporting, verifying, and rewarding road insights.
                  </h2>
                </div>

                <div className="sb-grid-2">
                  <div className="sb-panel rounded-2xl p-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Network</p>
                    <p className="mt-2 text-xl font-bold text-slate-950 dark:text-white">Stellar</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Fast, transparent, low-fee transactions.</p>
                  </div>
                  <div className="sb-panel rounded-2xl p-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Reward token</p>
                    <p className="mt-2 text-xl font-bold text-slate-950 dark:text-white">XLM</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Reward verified contributors directly.</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-r from-cyan-500/10 via-sky-500/5 to-orange-500/10 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                      <FaCheckCircle />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-white">Verified civic signal</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Reports are designed to become operational evidence, not noisy submissions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sb-section grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="sb-glass rounded-[1.75rem] p-7 md:p-8">
            <span className="sb-kicker mb-4 inline-flex">
              <FaShieldAlt className="text-cyan-400" />
              Problem and solution
            </span>
            <h2 className="text-3xl font-bold text-slate-950 dark:text-white md:text-4xl">
              Reporting road incidents should feel immediate, credible, and worth doing.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
              Most civic reporting tools are slow, disconnected, and forgettable. StreetBounty is designed as a reward-driven layer on top of public-safety reporting, where verified input can move faster and contributors are recognized with XLM.
            </p>
            <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p className="flex items-start gap-3"><FaCheckCircle className="mt-1 text-cyan-400" /> Citizens submit useful incident data instead of waiting for fragmented channels.</p>
              <p className="flex items-start gap-3"><FaCheckCircle className="mt-1 text-cyan-400" /> Authorities and communities get a clearer picture of what needs attention.</p>
              <p className="flex items-start gap-3"><FaCheckCircle className="mt-1 text-cyan-400" /> Incentives keep the network active, transparent, and accountable.</p>
            </div>
          </div>

          <div className="sb-grid-2">
            <div className="sb-panel rounded-[1.75rem] p-7 md:p-8">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Realtime utility</p>
              <h3 className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">Road data with a civic interface.</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">The portal is meant to feel like a mission control dashboard, not a generic form app.</p>
            </div>
            <div className="sb-panel rounded-[1.75rem] p-7 md:p-8">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Reward flow</p>
              <h3 className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">XLM payouts for verified reports.</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">A simple incentive loop that can scale with trust and verification.</p>
            </div>
            <div className="sb-panel rounded-[1.75rem] p-7 md:p-8">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Portal route</p>
              <h3 className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">Homepage CTA should take users into the dashboard.</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">The portal becomes the operational center for wallet, rewards, and history.</p>
            </div>
            <div className="sb-panel rounded-[1.75rem] p-7 md:p-8">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Trust layer</p>
              <h3 className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">Decentralized and testnet-ready.</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Designed for a production-feeling demo while keeping the Stellar testnet boundary visible.</p>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="sb-section">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="sb-kicker">
                <FaArrowRight className="text-cyan-400" />
                Flow
              </span>
              <h2 className="mt-4 text-3xl font-bold text-slate-950 dark:text-white md:text-4xl">
                How StreetBounty works
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
              The product story should be easy to scan: connect, report, verify, and reward. The design needs to make that sequence feel inevitable.
            </p>
          </div>

          <div className="sb-grid-4 mt-8">
            {howItWorks.map((item) => (
              <article key={item.step} className="sb-glass rounded-[1.5rem] p-6 transition-transform duration-200 hover:-translate-y-1">
                <p className="text-sm font-bold tracking-[0.25em] text-cyan-500 dark:text-cyan-300">{item.step}</p>
                <h3 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="sb-section">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="sb-kicker">
                <FaCoins className="text-orange-400" />
                Audience
              </span>
              <h2 className="mt-4 text-3xl font-bold text-slate-950 dark:text-white md:text-4xl">
                Built for citizens, authorities, and communities
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
              The interface should feel inclusive across user groups while keeping the platform focused on one shared goal: better road safety.
            </p>
          </div>

          <div className="sb-grid-3 mt-8">
            {audienceCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title} className="sb-panel rounded-[1.75rem] p-7 md:p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                    <Icon />
                  </div>
                  <h3 className="mt-5 text-2xl font-bold text-slate-950 dark:text-white">{card.title}</h3>
                  <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    {card.points.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <span className="mt-1 text-cyan-400">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>

        <section className="sb-section grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="sb-glass rounded-[1.75rem] p-7 md:p-8">
            <span className="sb-kicker">
              <FaShieldAlt className="text-cyan-400" />
              Trust and tech
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-950 dark:text-white md:text-4xl">
              Stellar, XLM, decentralization, and secure verification.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
              StreetBounty should communicate confidence through technical clarity. The trust layer is visible, the rewards are explicit, and the routes are direct.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {trustSignals.map((signal) => (
                <span key={signal} className="sb-chip">
                  {signal}
                </span>
              ))}
            </div>
          </div>

          <div className="sb-panel rounded-[1.75rem] p-7 md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-orange-500 text-white">
                <FaCoins />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Portal readiness</p>
                <h3 className="text-2xl font-bold text-slate-950 dark:text-white">Dashboard-first experience</h3>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              The portal is where wallet connection, balances, rewards, and history live. Keep the homepage focused on context, then let the final CTA carry users through.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="sb-chip">Wallet tools</span>
              <span className="sb-chip sb-chip-warm">Rewards flow</span>
              <span className="sb-chip">Incident preview</span>
            </div>
          </div>
        </section>

        <section className="sb-section sb-glass rounded-[1.75rem] p-7 md:p-8 text-center">
          <h2 className="text-3xl font-bold text-slate-950 dark:text-white md:text-4xl">
            StreetBounty turns reporting into a visible civic loop.
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
            The frontend should feel persuasive, informative, and reliable from the first hero section to the final CTA. It should be easy to understand what the app does, who it helps, and why the portal matters.
          </p>
          <Link href="/portal" className="sb-btn-primary mt-8">
            Open Portal <FaArrowRight />
          </Link>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-white/45 backdrop-blur-xl dark:bg-slate-950/55">
        <div className="sb-shell py-8">
          <div className="flex flex-col gap-3 text-sm text-slate-500 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
            <p>StreetBounty - road incident reporting with reward-backed participation.</p>
            <p>Stellar testnet demo only. XLM rewards shown for product demonstration.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
