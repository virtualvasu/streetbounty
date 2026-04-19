'use client';

import { useEffect, useState } from 'react';
import { FaCheck, FaCopy, FaWallet } from 'react-icons/fa';
import { reporterContract } from '@/lib/reporter-contract';

interface ReporterWalletCardProps {
  title?: string;
  description?: string;
  onChange?: (publicKey: string | null) => void;
}

const WALLET_KEY = 'streetbounty-reporter-wallet';

export default function ReporterWalletCard({
  title = 'Wallet connection',
  description = 'Connect a Stellar wallet to submit incidents and view your rewards.',
  onChange,
}: ReporterWalletCardProps) {
  const [publicKey, setPublicKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(WALLET_KEY);
    if (saved) {
      setPublicKey(saved);
      onChange?.(saved);
    }
  }, [onChange]);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const key = await reporterContract.connectWallet();
      setPublicKey(key);
      window.localStorage.setItem(WALLET_KEY, key);
      onChange?.(key);
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      alert(`Failed to connect wallet: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    reporterContract.disconnect();
    window.localStorage.removeItem(WALLET_KEY);
    setPublicKey('');
    onChange?.(null);
  };

  const handleCopy = async () => {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="sb-glass rounded-[1.75rem] p-6 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="sb-kicker">
            <FaWallet className="text-cyan-400" />
            {title}
          </span>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{description}</p>
        </div>
        {publicKey && (
          <button
            onClick={handleDisconnect}
            className="rounded-full border border-white/10 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
          >
            Disconnect
          </button>
        )}
      </div>

      {!publicKey ? (
        <button
          onClick={handleConnect}
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 px-5 py-4 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FaWallet />
          {loading ? 'Connecting...' : 'Connect wallet'}
        </button>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/60 p-4 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Connected wallet</p>
            <p className="mt-2 break-all text-sm font-semibold text-slate-950 dark:text-white">{publicKey}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-950 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
            >
              {copied ? <FaCheck /> : <FaCopy />}
              {copied ? 'Copied' : 'Copy address'}
            </button>
            <a
              href={reporterContract.getExplorerLink(publicKey, 'account')}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            >
              View on Explorer
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
