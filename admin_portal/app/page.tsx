'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiExternalLink,
  FiMapPin,
  FiRefreshCw,
  FiShield,
  FiTrendingUp,
  FiUser,
  FiXCircle,
} from 'react-icons/fi';
import AdminHeader from '@/components/AdminHeader';
import { adminContract, type AdminIncident } from '@/lib/admin-contract';

type ToastKind = 'success' | 'error';

interface Toast {
  kind: ToastKind;
  message: string;
}

const pendingOnly = (incident: AdminIncident) => incident.status === 'pending';

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error && error.message ? error.message : fallback;
};

export default function AdminPortalPage() {
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [adminAddress, setAdminAddress] = useState<string>('');
  const [rewardToken, setRewardToken] = useState<string>('');
  const [incidents, setIncidents] = useState<AdminIncident[]>([]);
  const [balanceXlm, setBalanceXlm] = useState('0');
  const [fundAmount, setFundAmount] = useState('10');
  const [withdrawAmount, setWithdrawAmount] = useState('5');
  const [withdrawTo, setWithdrawTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const isAdmin = useMemo(() => {
    return Boolean(connectedAddress && adminAddress && connectedAddress === adminAddress);
  }, [connectedAddress, adminAddress]);

  const pendingIncidents = useMemo(() => incidents.filter(pendingOnly), [incidents]);
  const statusStats = useMemo(
    () => ({
      pending: incidents.filter((incident) => incident.status === 'pending').length,
      approved: incidents.filter((incident) => incident.status === 'approved').length,
      disapproved: incidents.filter((incident) => incident.status === 'disapproved').length,
    }),
    [incidents]
  );

  const showToast = useCallback((kind: ToastKind, message: string) => {
    setToast({ kind, message });
    window.setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 4500);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [admin, token, allIncidents, balance] = await Promise.all([
        adminContract.getAdminAddress(),
        adminContract.getRewardTokenAddress(),
        adminContract.getAllIncidents(),
        adminContract.getContractBalanceXlm(),
      ]);

      setAdminAddress(admin);
      setRewardToken(token);
      setIncidents(allIncidents.sort((a, b) => b.id - a.id));
      setBalanceXlm(balance);
      if (!withdrawTo) {
        setWithdrawTo(admin);
      }
    } catch (error: unknown) {
      showToast('error', getErrorMessage(error, 'Unable to load admin data from contract.'));
    } finally {
      setLoading(false);
    }
  }, [showToast, withdrawTo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onConnectWallet = async () => {
    try {
      const wallet = await adminContract.connectWallet();
      setConnectedAddress(wallet);
      showToast('success', 'Wallet connected successfully.');
    } catch (error: unknown) {
      showToast('error', getErrorMessage(error, 'Could not connect wallet.'));
    }
  };

  const onDisconnectWallet = () => {
    adminContract.disconnect();
    setConnectedAddress(null);
  };

  const guardAdmin = () => {
    if (!connectedAddress) {
      throw new Error('Connect your admin wallet first.');
    }
    if (!isAdmin) {
      throw new Error('Connected wallet is not the on-chain admin account.');
    }
  };

  const withAction = async (key: string, action: () => Promise<void>) => {
    setActionLoading(key);
    try {
      guardAdmin();
      await action();
      await loadData();
    } catch (error: unknown) {
      showToast('error', getErrorMessage(error, 'Transaction failed.'));
    } finally {
      setActionLoading(null);
    }
  };

  const onApprove = (incidentId: number) => {
    void withAction(`approve-${incidentId}`, async () => {
      const result = await adminContract.approveIncident(connectedAddress as string, incidentId);
      showToast('success', `Approved incident #${incidentId}. ${result.hash.slice(0, 10)}...`);
    });
  };

  const onDisapprove = (incidentId: number) => {
    void withAction(`disapprove-${incidentId}`, async () => {
      const result = await adminContract.disapproveIncident(connectedAddress as string, incidentId);
      showToast('success', `Disapproved incident #${incidentId}. ${result.hash.slice(0, 10)}...`);
    });
  };

  const onFund = (event: FormEvent) => {
    event.preventDefault();
    void withAction('fund', async () => {
      const result = await adminContract.fundContract(connectedAddress as string, fundAmount);
      showToast('success', `Funding confirmed. ${result.hash.slice(0, 10)}...`);
    });
  };

  const onWithdraw = (event: FormEvent) => {
    event.preventDefault();
    void withAction('withdraw', async () => {
      const result = await adminContract.withdrawContractFunds(
        connectedAddress as string,
        withdrawTo,
        withdrawAmount
      );
      showToast('success', `Withdrawal confirmed. ${result.hash.slice(0, 10)}...`);
    });
  };

  return (
    <div className="sb-page">
      <AdminHeader
        title="Admin command center"
        description="Moderate incidents and manage treasury operations on the same Stellar contract data layer."
      />

      <main className="sb-shell pb-20 pt-8 md:pt-10">
        <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-6">
            <div className="sb-glass rounded-[1.75rem] p-6 md:p-7">
              <span className="sb-kicker">
                <FiShield className="text-cyan-400" />
                Admin controls
              </span>
              <h1 className="mt-4 text-3xl font-bold text-slate-950 dark:text-white md:text-4xl">
                Admin operations console.
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Moderate reported incidents, authorize decisions, and manage contract treasury liquidity
                without leaving the admin workspace.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {!connectedAddress ? (
                  <button className="sb-btn-primary" onClick={onConnectWallet} type="button">
                    <FiShield />
                    Connect admin wallet
                  </button>
                ) : (
                  <>
                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-white dark:bg-white/5 dark:text-slate-200"
                      type="button"
                      onClick={onDisconnectWallet}
                    >
                      Disconnect wallet
                    </button>
                    <a
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-white dark:bg-white/5 dark:text-slate-200"
                      href={adminContract.getExplorerLink(connectedAddress, 'account')}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <FiUser />
                      {adminContract.formatAddress(connectedAddress, 6, 6)}
                      <FiExternalLink className="text-xs" />
                    </a>
                  </>
                )}

                <button
                  onClick={loadData}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/5 dark:text-slate-200"
                  type="button"
                >
                  <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>

              {toast && (
                <div
                  className={`mt-5 inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                    toast.kind === 'success'
                      ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-100'
                      : 'border-rose-400/30 bg-rose-500/10 text-rose-800 dark:text-rose-100'
                  }`}
                >
                  {toast.kind === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
                  <span>{toast.message}</span>
                </div>
              )}
            </div>

            <div className="sb-panel rounded-[1.75rem] p-6 md:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <FiTrendingUp />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    Admin snapshot
                  </p>
                  <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Contract and queue status</h2>
                </div>
              </div>

              <div className="sb-grid-2 mt-5">
                <div className="sb-stat"><p className="text-sm text-slate-500 dark:text-slate-400">Contract balance</p><p className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{balanceXlm} XLM</p></div>
                <div className="sb-stat"><p className="text-sm text-slate-500 dark:text-slate-400">Pending</p><p className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{pendingIncidents.length}</p></div>
              </div>

              <div className="sb-grid-3 mt-4">
                <div className="sb-stat"><p className="text-sm text-slate-500 dark:text-slate-400">Approved</p><p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">{statusStats.approved}</p></div>
                <div className="sb-stat"><p className="text-sm text-slate-500 dark:text-slate-400">Disapproved</p><p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">{statusStats.disapproved}</p></div>
                <div className="sb-stat"><p className="text-sm text-slate-500 dark:text-slate-400">Total reports</p><p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">{incidents.length}</p></div>
              </div>

              <div className="mt-5 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
                <p className="rounded-2xl border border-white/10 bg-white/50 px-4 py-3 dark:bg-white/5">
                  <span className="mr-2 font-semibold text-slate-900 dark:text-white">On-chain admin:</span>
                  {adminAddress || 'Loading...'}
                </p>
                <p className="rounded-2xl border border-white/10 bg-white/50 px-4 py-3 dark:bg-white/5">
                  <span className="mr-2 font-semibold text-slate-900 dark:text-white">Reward token:</span>
                  {rewardToken || 'Loading...'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <section className="sb-glass rounded-[1.75rem] p-6 md:p-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="sb-kicker">
                    <FiClock className="text-cyan-400" />
                    Moderation queue
                  </span>
                  <h2 className="mt-4 text-3xl font-bold text-slate-950 dark:text-white">Review all incidents.</h2>
                </div>
                <span className="rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                  {pendingIncidents.length} pending
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {loading ? (
                  <p className="rounded-2xl border border-dashed border-white/10 bg-white/40 p-6 text-sm text-slate-500 dark:bg-white/5 dark:text-slate-400">
                    Loading incidents from contract...
                  </p>
                ) : incidents.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-white/10 bg-white/40 p-6 text-sm text-slate-500 dark:bg-white/5 dark:text-slate-400">
                    No incidents have been reported yet.
                  </p>
                ) : (
                  incidents.map((incident) => {
                    const badgeClass =
                      incident.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-200'
                        : incident.status === 'disapproved'
                          ? 'bg-rose-500/10 text-rose-700 dark:text-rose-200'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-200';

                    return (
                      <article key={incident.id} className="rounded-2xl border border-white/10 bg-white/60 p-4 dark:bg-white/5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-lg font-semibold text-slate-950 dark:text-white">
                                #{incident.id} {incident.title}
                              </p>
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                                {incident.status}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{incident.description}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1"><FiUser /> {adminContract.formatAddress(incident.reporter, 6, 6)}</span>
                          <span className="inline-flex items-center gap-1"><FiClock /> {new Date(incident.createdAt).toLocaleString()}</span>
                        </div>

                        <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                          <span className="inline-flex items-center gap-1"><FiMapPin /> {incident.location}</span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:text-emerald-200"
                            disabled={!isAdmin || incident.status !== 'pending' || actionLoading === `approve-${incident.id}`}
                            onClick={() => onApprove(incident.id)}
                            type="button"
                          >
                            <FiCheckCircle />
                            {actionLoading === `approve-${incident.id}` ? 'Approving...' : 'Approve'}
                          </button>

                          <button
                            className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-800 transition-colors hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:text-rose-200"
                            disabled={
                              !isAdmin ||
                              incident.status !== 'pending' ||
                              actionLoading === `disapprove-${incident.id}`
                            }
                            onClick={() => onDisapprove(incident.id)}
                            type="button"
                          >
                            <FiXCircle />
                            {actionLoading === `disapprove-${incident.id}` ? 'Rejecting...' : 'Disapprove'}
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>

            <section className="sb-panel rounded-[1.75rem] p-6 md:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Treasury controls</p>
                  <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Fund and withdraw contract balance</h2>
                </div>
                <span className={`rounded-full px-4 py-2 text-sm font-semibold ${isAdmin ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-200' : 'bg-rose-500/10 text-rose-700 dark:text-rose-200'}`}>
                  {isAdmin ? 'Admin verified' : 'Admin required'}
                </span>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <form className="grid gap-2" onSubmit={onFund}>
                  <label htmlFor="fundAmount" className="text-sm text-slate-700 dark:text-slate-300">Fund contract (XLM)</label>
                  <input
                    id="fundAmount"
                    min="0.0000001"
                    onChange={(event) => setFundAmount(event.target.value)}
                    required
                    step="0.0000001"
                    type="number"
                    value={fundAmount}
                    className="rounded-2xl border border-white/10 bg-white/75 px-4 py-3 text-slate-950 outline-none transition-colors placeholder:text-slate-400 dark:bg-white/5 dark:text-white"
                  />
                  <button className="sb-btn-primary mt-2 disabled:cursor-not-allowed disabled:opacity-60" disabled={!isAdmin || actionLoading === 'fund'} type="submit">
                    <FiDollarSign />
                    {actionLoading === 'fund' ? 'Funding...' : 'Fund treasury'}
                  </button>
                </form>

                <form className="grid gap-2" onSubmit={onWithdraw}>
                  <label htmlFor="withdrawTo" className="text-sm text-slate-700 dark:text-slate-300">Withdraw to address</label>
                  <input
                    id="withdrawTo"
                    onChange={(event) => setWithdrawTo(event.target.value)}
                    placeholder="G..."
                    required
                    type="text"
                    value={withdrawTo}
                    className="rounded-2xl border border-white/10 bg-white/75 px-4 py-3 text-slate-950 outline-none transition-colors placeholder:text-slate-400 dark:bg-white/5 dark:text-white"
                  />

                  <label htmlFor="withdrawAmount" className="text-sm text-slate-700 dark:text-slate-300">Withdraw amount (XLM)</label>
                  <input
                    id="withdrawAmount"
                    min="0.0000001"
                    onChange={(event) => setWithdrawAmount(event.target.value)}
                    required
                    step="0.0000001"
                    type="number"
                    value={withdrawAmount}
                    className="rounded-2xl border border-white/10 bg-white/75 px-4 py-3 text-slate-950 outline-none transition-colors placeholder:text-slate-400 dark:bg-white/5 dark:text-white"
                  />

                  <button
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-3 font-semibold text-amber-800 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:text-amber-200"
                    disabled={!isAdmin || actionLoading === 'withdraw'}
                    type="submit"
                  >
                    <FiDollarSign />
                    {actionLoading === 'withdraw' ? 'Withdrawing...' : 'Withdraw funds'}
                  </button>
                </form>
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
