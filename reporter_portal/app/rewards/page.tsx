'use client';

import { useEffect, useMemo, useState } from 'react';
import { FaCoins, FaGift, FaReceipt } from 'react-icons/fa';
import ReporterHeader from '@/components/ReporterHeader';
import ReporterWalletCard from '@/components/ReporterWalletCard';
import { reporterContract, type ReporterIncident, type ReporterReward } from '@/lib/reporter-contract';

export default function RewardsPage() {
  const [publicKey, setPublicKey] = useState('');
  const [incidents, setIncidents] = useState<ReporterIncident[]>([]);
  const [rewards, setRewards] = useState<ReporterReward[]>([]);

  const loadRewards = async () => {
    try {
      const allIncidents = await reporterContract.getAllIncidents();
      setIncidents(allIncidents);
      setRewards(reporterContract.deriveRewards(allIncidents));
    } catch (error) {
      console.error('Failed to load rewards from contract:', error);
    }
  };

  useEffect(() => {
    void loadRewards();
  }, []);

  const walletRewards = useMemo(
    () => rewards.filter((reward) => publicKey && reward.reporter === publicKey),
    [rewards, publicKey]
  );

  const stats = {
    total: rewards.reduce((sum, reward) => sum + reward.amount, 0),
    available: rewards.filter((reward) => reward.status === 'available').reduce((sum, reward) => sum + reward.amount, 0),
    claimed: rewards.filter((reward) => reward.status === 'claimed').reduce((sum, reward) => sum + reward.amount, 0),
    estimated: rewards.filter((reward) => reward.status === 'estimated').reduce((sum, reward) => sum + reward.amount, 0),
  };

  return (
    <div className="sb-page">
      <ReporterHeader
        active="rewards"
        title="Rewards ledger"
        description="Connect a wallet to inspect the reward trail for your reported incidents."
      />

      <main className="sb-shell pb-20 pt-8 md:pt-10">
        <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-6">
            <ReporterWalletCard
              title="Wallet connection"
              description="Use the same wallet that reported incidents so the rewards list can filter to your address."
              onChange={(key) => setPublicKey(key ?? '')}
            />

            <div className="sb-panel rounded-[1.75rem] p-6 md:p-7">
              <span className="sb-kicker">
                <FaCoins className="text-cyan-400" />
                Reward summary
              </span>
              <div className="sb-grid-2 mt-6">
                <div className="sb-stat"><p className="text-sm text-slate-500 dark:text-slate-400">Total</p><p className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{stats.total.toFixed(2)} XLM</p></div>
                <div className="sb-stat"><p className="text-sm text-slate-500 dark:text-slate-400">Available</p><p className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{stats.available.toFixed(2)} XLM</p></div>
                <div className="sb-stat"><p className="text-sm text-slate-500 dark:text-slate-400">Estimated</p><p className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{stats.estimated.toFixed(2)} XLM</p></div>
                <div className="sb-stat"><p className="text-sm text-slate-500 dark:text-slate-400">Claimed</p><p className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{stats.claimed.toFixed(2)} XLM</p></div>
              </div>

              {publicKey && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/60 p-4 dark:bg-white/5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Connected wallet</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Your address matches {walletRewards.length} reward{walletRewards.length === 1 ? '' : 's'} in the ledger.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="sb-glass rounded-[1.75rem] p-6 md:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="sb-kicker">
                  <FaGift className="text-cyan-400" />
                  Reward entries
                </span>
                <h1 className="mt-4 text-3xl font-bold text-slate-950 dark:text-white md:text-4xl">All rewards in one place.</h1>
              </div>
              <div className="rounded-full border border-white/10 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">
                On-chain data
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {rewards.map((reward) => (
                <article key={reward.id} className="rounded-2xl border border-white/10 bg-white/60 p-4 dark:bg-white/5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-950 dark:text-white">{reward.title}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Incident #{reward.incidentId} • {reward.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-950 dark:text-white">{reward.amount.toFixed(2)} XLM</p>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{reward.status}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{reward.note}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>Reporter: {reward.reporter}</span>
                    <span>{new Date(reward.createdAt).toLocaleString()}</span>
                  </div>
                </article>
              ))}

              {rewards.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/40 p-6 text-sm text-slate-500 dark:bg-white/5 dark:text-slate-400">
                  No rewards recorded yet on-chain.
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/60 p-4 dark:bg-white/5">
              <div className="flex items-start gap-3">
                <FaReceipt className="mt-1 text-cyan-400" />
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Rewards here are a reporter-side ledger for submitted incidents. Approve and revoke actions stay hidden in the admin portal.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
