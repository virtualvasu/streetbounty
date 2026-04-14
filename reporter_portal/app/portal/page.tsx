'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaCoins,
  FaGlobeAmericas,
  FaHistory,
  FaMapMarkerAlt,
  FaQrcode,
  FaShieldAlt,
  FaWallet,
} from 'react-icons/fa';
import ThemeToggle from '@/components/ThemeToggle';
import WalletConnection from '@/components/WalletConnection';
import BalanceDisplay from '@/components/BalanceDisplay';
import PaymentForm from '@/components/PaymentForm';
import TransactionHistory from '@/components/TransactionHistory';
import BalanceChart from '@/components/BalanceChart';

const portalHighlights = [
  {
    icon: FaWallet,
    title: 'Wallet ready',
    description: 'Connect a Stellar wallet to unlock the full dashboard flow.',
  },
  {
    icon: FaCoins,
    title: 'Reward flow',
    description: 'Balances, payments, and XLM rewards remain visible at all times.',
  },
  {
    icon: FaHistory,
    title: 'Activity trail',
    description: 'Searchable transaction history keeps the financial trail transparent.',
  },
];

const incidentPreview = [
  {
    icon: FaMapMarkerAlt,
    title: 'Report incidents',
    description: 'Capture road hazards with location, notes, and supporting evidence.',
  },
  {
    icon: FaCheckCircle,
    title: 'Verify reports',
    description: 'Community verification and trust signals keep submissions credible.',
  },
  {
    icon: FaCoins,
    title: 'Earn rewards',
    description: 'Verified contributors receive XLM incentives through Stellar.',
  },
  {
    icon: FaGlobeAmericas,
    title: 'Track impact',
    description: 'Visualize how civic reporting improves road awareness over time.',
  },
];

export default function IncidentPortal() {
  const [publicKey, setPublicKey] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [assets, setAssets] = useState<Array<{ code: string; issuer: string; balance: string }>>([]);
  const [balanceHistory, setBalanceHistory] = useState<Array<{ timestamp: number; balance: number }>>([]);

  const handleConnect = (key: string) => {
    setPublicKey(key);
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setPublicKey('');
    setIsConnected(false);
    setAssets([]);
    setBalanceHistory([]);
  };

  const handleHistoryPoint = (point: { timestamp: number; balance: number }) => {
    setBalanceHistory((prev) => [...prev, point].slice(-12));
  };

  const handlePaymentSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="sb-page">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-white/50 backdrop-blur-xl dark:bg-slate-950/55">
        <div className="sb-shell">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-3">
              <FaArrowLeft className="text-slate-500 transition-colors group-hover:text-slate-950 dark:text-slate-400 dark:group-hover:text-white" />
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-orange-500 text-2xl shadow-lg shadow-cyan-500/20">
                  🛣️
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                    StreetBounty Portal
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Incident reporting, verification, and rewards dashboard
                  </p>
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <span className="sb-chip hidden sm:inline-flex">
                <FaShieldAlt /> Stellar testnet
              </span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="sb-shell pb-20 pt-8 md:pt-10">
        {!isConnected && (
          <section className="sb-hero-grid items-stretch lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
            <div className="sb-glass rounded-[2rem] p-7 md:p-8">
              <span className="sb-kicker">
                <FaWallet className="text-cyan-400" />
                Dashboard center
              </span>
              <h1 className="mt-5 max-w-2xl text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white md:text-6xl">
                A control room for wallet actions, balances, and civic rewards.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">
                The portal is the operational surface for StreetBounty. Connect your wallet, view balances, send XLM, track activity, and preview the incident workflow that will power the reporting network.
              </p>

              <div className="sb-grid-3 mt-8">
                {portalHighlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="sb-stat">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                        <Icon />
                      </div>
                      <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">{item.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="sb-panel rounded-[2rem] p-7 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Portal status</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                    Connect to begin
                  </h2>
                </div>
                <div className="rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-700 dark:text-cyan-300">
                  Testnet only
                </div>
              </div>

              <div className="sb-grid-3 mt-8">
                <div className="sb-stat">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Network</p>
                  <p className="mt-2 text-xl font-bold text-slate-950 dark:text-white">Stellar Testnet</p>
                </div>
                <div className="sb-stat">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Mode</p>
                  <p className="mt-2 text-xl font-bold text-slate-950 dark:text-white">Dashboard</p>
                </div>
                <div className="sb-stat">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Route</p>
                  <p className="mt-2 text-xl font-bold text-slate-950 dark:text-white">/portal</p>
                </div>
              </div>

              <div className="mt-8 rounded-[1.5rem] bg-gradient-to-br from-cyan-500/10 via-sky-500/5 to-orange-500/10 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Before you start</p>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Install or open a compatible Stellar wallet, then connect it through the wallet card below to unlock the dashboard.
                </p>
              </div>
            </div>
          </section>
        )}

        {!isConnected && (
          <section className="sb-section grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="sb-glass rounded-[1.75rem] p-7 md:p-8">
              <span className="sb-kicker">
                <FaWallet className="text-cyan-400" />
                Connect flow
              </span>
              <h2 className="mt-4 text-3xl font-bold text-slate-950 dark:text-white">
                Start with wallet connection, then move into the dashboard.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
                The portal should guide users through a simple first step so the rest of the interface can focus on balances, payments, and incident operations.
              </p>
              <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p className="flex items-start gap-3"><FaCheckCircle className="mt-1 text-cyan-400" /> Connect a compatible Stellar wallet.</p>
                <p className="flex items-start gap-3"><FaCheckCircle className="mt-1 text-cyan-400" /> Review your account status and balance.</p>
                <p className="flex items-start gap-3"><FaCheckCircle className="mt-1 text-cyan-400" /> Send rewards or explore the transaction trail.</p>
              </div>
            </div>
            <div>
              <WalletConnection onConnect={handleConnect} onDisconnect={handleDisconnect} />
            </div>
          </section>
        )}

        {isConnected && publicKey && (
          <div className="sb-section space-y-8">
            <section className="sb-grid-3">
              <div className="sb-stat">
                <p className="text-sm text-slate-500 dark:text-slate-400">Wallet</p>
                <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">Connected</p>
                <p className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">
                  {publicKey.slice(0, 18)}...
                </p>
              </div>
              <div className="sb-stat">
                <p className="text-sm text-slate-500 dark:text-slate-400">Network</p>
                <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">Stellar Testnet</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Ready for secure demo activity</p>
              </div>
              <div className="sb-stat">
                <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">Operational</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Balances and history are live</p>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="space-y-6">
                <WalletConnection onConnect={handleConnect} onDisconnect={handleDisconnect} />

                <div key={`balance-${refreshKey}`}>
                  <BalanceDisplay
                    publicKey={publicKey}
                    onAssetsUpdate={setAssets}
                    onHistoryUpdate={handleHistoryPoint}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="sb-glass rounded-[1.75rem] p-7 md:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="sb-kicker">
                        <FaQrcode className="text-cyan-400" />
                        Account tools
                      </span>
                      <h2 className="mt-4 text-3xl font-bold text-slate-950 dark:text-white">Manage wallet activity.</h2>
                    </div>
                    <div className="rounded-full bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-700 dark:text-orange-300">
                      XLM ready
                    </div>
                  </div>
                  <div className="mt-6 rounded-[1.5rem] bg-slate-950/5 p-5 dark:bg-white/5">
                    <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                      Use the form below to send rewards, the history panel to inspect recent transfers, and the chart to watch balance trends as you interact with the wallet.
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <PaymentForm publicKey={publicKey} assets={assets} onSuccess={handlePaymentSuccess} />
                  <div key={`history-${refreshKey}`}>
                    <TransactionHistory publicKey={publicKey} />
                  </div>
                </div>
              </div>
            </section>

            <section className="sb-glass rounded-[1.75rem] p-7 md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <span className="sb-kicker">
                    <FaHistory className="text-cyan-400" />
                    Trend view
                  </span>
                  <h2 className="mt-4 text-3xl font-bold text-slate-950 dark:text-white">Balance movement over refresh points.</h2>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
                  The chart gives the dashboard a clearer operational feel by showing how the wallet balance changes across refreshes.
                </p>
              </div>
              <div className="mt-6">
                <BalanceChart points={balanceHistory} />
              </div>
            </section>

            <section className="sb-section sb-panel rounded-[1.75rem] p-7 md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <span className="sb-kicker">
                    <FaMapMarkerAlt className="text-cyan-400" />
                    Incident workflow
                  </span>
                  <h2 className="mt-4 text-3xl font-bold text-slate-950 dark:text-white">
                    Preview the future incident reporting experience.
                  </h2>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
                  This section explains the path the product is heading toward: report incidents, verify them, reward contributors, and measure impact.
                </p>
              </div>

              <div className="sb-grid-2 mt-8 xl:grid-cols-4">
                {incidentPreview.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.title} className="rounded-[1.5rem] bg-white/55 p-5 dark:bg-white/5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                        <Icon />
                      </div>
                      <h3 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">{item.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.description}</p>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="sb-grid-3">
              <div className="sb-stat">
                <p className="text-sm text-slate-500 dark:text-slate-400">Security posture</p>
                <p className="mt-2 text-xl font-bold text-slate-950 dark:text-white">Immutable records</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Transactions remain transparent on chain.</p>
              </div>
              <div className="sb-stat">
                <p className="text-sm text-slate-500 dark:text-slate-400">Reward focus</p>
                <p className="mt-2 text-xl font-bold text-slate-950 dark:text-white">XLM incentives</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Built to recognize useful civic contributions.</p>
              </div>
              <div className="sb-stat">
                <p className="text-sm text-slate-500 dark:text-slate-400">UI behavior</p>
                <p className="mt-2 text-xl font-bold text-slate-950 dark:text-white">Polished and calm</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Responsive cards, alerts, loading states, and confirmations.</p>
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 bg-white/45 backdrop-blur-xl dark:bg-slate-950/55">
        <div className="sb-shell py-8">
          <div className="flex flex-col gap-3 text-sm text-slate-500 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
            <p>StreetBounty Incident Portal | Powered by Stellar</p>
            <p>Stellar testnet demo only. XLM is used for product demonstration.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
