'use client';

import { useEffect, useMemo, useState } from 'react';
import { FaCoins, FaGift, FaReceipt } from 'react-icons/fa';
import ReporterHeader from '@/components/ReporterHeader';
import ReporterWalletCard from '@/components/ReporterWalletCard';
import { reporterContract, type ReporterIncident } from '@/lib/reporter-contract';

export default function RewardsPage() {
  const [publicKey, setPublicKey] = useState('');
  const [approvedRewards, setApprovedRewards] = useState(() => reporterContract.deriveRewards([]));

  const loadRewards = async () => {
    try {
      const allIncidents = await reporterContract.getAllIncidents();
      const approvedOnly = reporterContract
        .deriveRewards(allIncidents)
        .filter((reward) => reward.status === 'claimed' || reward.status === 'available');
      setApprovedRewards(approvedOnly);
    } catch (error) {
      console.error('Failed to load rewards from contract:', error);
    }
  };

  useEffect(() => {
    void loadRewards();
  }, []);

  const walletApprovedRewards = useMemo(
    () => approvedRewards.filter((reward) => publicKey && reward.reporter === publicKey),
    [approvedRewards, publicKey]
  );

  const approvedTotal = approvedRewards.reduce((sum, reward) => sum + reward.amount, 0);

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
                Approved reward tokens
              </span>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/60 p-5 dark:bg-white/5">
                <p className="text-sm text-slate-500 dark:text-slate-400">Approved total</p>
                <p className="mt-2 text-4xl font-bold text-slate-950 dark:text-white">{approvedTotal.toFixed(2)} XLM</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Only rewards from approved reports are shown here.
                </p>
              </div>

              {publicKey && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/60 p-4 dark:bg-white/5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Connected wallet</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Your address matches {walletApprovedRewards.length} approved reward{walletApprovedRewards.length === 1 ? '' : 's'}.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="sb-glass rounded-[1.75rem] p-6 md:p-7 lg:flex lg:h-[715px] lg:flex-col">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="sb-kicker">
                  <FaGift className="text-cyan-400" />
                  Approved entries
                </span>
                <h1 className="mt-4 text-3xl font-bold text-slate-950 dark:text-white md:text-4xl">Approved rewards only.</h1>
              </div>
              <div className="rounded-full border border-white/10 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">
                On-chain data
              </div>
            </div>

            <div className="mt-6 space-y-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
              {approvedRewards.map((reward) => (
                <article key={reward.id} className="rounded-2xl border border-white/10 bg-white/60 p-4 dark:bg-white/5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-950 dark:text-white">{reward.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="text-sm text-slate-600 dark:text-slate-300">Incident #{reward.incidentId}</p>
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-200">
                          approved
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-950 dark:text-white">{reward.amount.toFixed(2)} XLM</p>
                      <p className="text-xs uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-200">approved</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{reward.note}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>Reporter: {reward.reporter}</span>
                    <span>{new Date(reward.createdAt).toLocaleString()}</span>
                  </div>
                </article>
              ))}

              {approvedRewards.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/40 p-6 text-sm text-slate-500 dark:bg-white/5 dark:text-slate-400">
                  No approved rewards found yet.
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
