'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiActivity,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiRefreshCw,
  FiShield,
  FiUser,
  FiXCircle,
} from 'react-icons/fi';
import { adminContract, AdminIncident } from '../lib/admin-contract';

type ToastKind = 'success' | 'error';

interface Toast {
  kind: ToastKind;
  message: string;
}

const pendingOnly = (incident: AdminIncident) => incident.status === 'pending';

const statusClass: Record<AdminIncident['status'], string> = {
  pending: 'chip chip-warning',
  approved: 'chip chip-success',
  disapproved: 'chip chip-danger',
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
    } catch (error: any) {
      showToast('error', error?.message ?? 'Unable to load admin data from contract.');
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
    } catch (error: any) {
      showToast('error', error?.message ?? 'Could not connect wallet.');
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
    } catch (error: any) {
      showToast('error', error?.message ?? 'Transaction failed.');
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
        withdrawAmount,
      );
      showToast('success', `Withdrawal confirmed. ${result.hash.slice(0, 10)}...`);
    });
  };

  return (
    <div className="page-shell">
      <div className="orb orb-one" />
      <div className="orb orb-two" />

      <div className="container">
        <header className="hero-card">
          <p className="eyebrow">StreetBounty Control Room</p>
          <h1>Admin Operations Console</h1>
          <p>
            Moderate incident reports, manage treasury liquidity, and keep protocol rewards flowing.
          </p>

          <div className="hero-actions">
            {!connectedAddress ? (
              <button className="btn btn-primary" onClick={onConnectWallet} type="button">
                <FiShield />
                Connect Admin Wallet
              </button>
            ) : (
              <>
                <button className="btn btn-ghost" type="button" onClick={onDisconnectWallet}>
                  Disconnect Wallet
                </button>
                <a
                  className="btn btn-ghost"
                  href={adminContract.getExplorerLink(connectedAddress, 'account')}
                  rel="noreferrer"
                  target="_blank"
                >
                  <FiUser />
                  {adminContract.formatAddress(connectedAddress, 6, 6)}
                </a>
              </>
            )}
            <button className="btn btn-ghost" disabled={loading} onClick={loadData} type="button">
              <FiRefreshCw />
              Refresh
            </button>
          </div>
        </header>

        {toast ? (
          <div className={toast.kind === 'success' ? 'alert alert-success' : 'alert alert-error'}>
            {toast.kind === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
            <span>{toast.message}</span>
          </div>
        ) : null}

        <section className="stats-grid">
          <article className="stat-card">
            <p>On-chain Admin</p>
            <h3>{adminAddress ? adminContract.formatAddress(adminAddress, 8, 6) : 'Loading...'}</h3>
            <small>{adminAddress}</small>
          </article>

          <article className="stat-card">
            <p>Reward Token</p>
            <h3>{rewardToken ? adminContract.formatAddress(rewardToken, 8, 6) : 'Loading...'}</h3>
            <small>{rewardToken}</small>
          </article>

          <article className="stat-card">
            <p>Contract Balance</p>
            <h3>{balanceXlm} XLM</h3>
            <small>Treasury ready for incident rewards</small>
          </article>

          <article className="stat-card">
            <p>Pending Incidents</p>
            <h3>{pendingIncidents.length}</h3>
            <small>{incidents.length} total reports</small>
          </article>
        </section>

        <section className="panel-grid">
          <article className="panel panel-wide">
            <div className="panel-head">
              <h2>
                <FiActivity /> Moderation Queue
              </h2>
              <span className="chip chip-info">{pendingIncidents.length} pending</span>
            </div>

            {loading ? (
              <div className="empty-state">Loading incidents from contract...</div>
            ) : incidents.length === 0 ? (
              <div className="empty-state">No incidents have been reported yet.</div>
            ) : (
              <div className="incident-list">
                {incidents.map((incident) => (
                  <div className="incident-card" key={incident.id}>
                    <div className="incident-head">
                      <h3>
                        #{incident.id} {incident.title}
                      </h3>
                      <span className={statusClass[incident.status]}>{incident.status}</span>
                    </div>

                    <p>{incident.description}</p>

                    <div className="incident-meta">
                      <span>
                        <FiUser /> {adminContract.formatAddress(incident.reporter, 6, 6)}
                      </span>
                      <span>
                        <FiClock /> {new Date(incident.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="incident-meta">
                      <span>{incident.location}</span>
                    </div>

                    <div className="incident-actions">
                      <button
                        className="btn btn-success"
                        disabled={!isAdmin || incident.status !== 'pending' || actionLoading === `approve-${incident.id}`}
                        onClick={() => onApprove(incident.id)}
                        type="button"
                      >
                        <FiCheckCircle />
                        {actionLoading === `approve-${incident.id}` ? 'Approving...' : 'Approve'}
                      </button>

                      <button
                        className="btn btn-danger"
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
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>
                <FiDollarSign /> Treasury Controls
              </h2>
              <span className={isAdmin ? 'chip chip-success' : 'chip chip-danger'}>
                {isAdmin ? 'admin verified' : 'admin required'}
              </span>
            </div>

            <form className="form-grid" onSubmit={onFund}>
              <label htmlFor="fundAmount">Fund Contract (XLM)</label>
              <input
                id="fundAmount"
                min="0.0000001"
                onChange={(event) => setFundAmount(event.target.value)}
                required
                step="0.0000001"
                type="number"
                value={fundAmount}
              />
              <button className="btn btn-primary" disabled={!isAdmin || actionLoading === 'fund'} type="submit">
                {actionLoading === 'fund' ? 'Funding...' : 'Fund Treasury'}
              </button>
            </form>

            <form className="form-grid" onSubmit={onWithdraw}>
              <label htmlFor="withdrawTo">Withdraw To Address</label>
              <input
                id="withdrawTo"
                onChange={(event) => setWithdrawTo(event.target.value)}
                placeholder="G..."
                required
                type="text"
                value={withdrawTo}
              />

              <label htmlFor="withdrawAmount">Withdraw Amount (XLM)</label>
              <input
                id="withdrawAmount"
                min="0.0000001"
                onChange={(event) => setWithdrawAmount(event.target.value)}
                required
                step="0.0000001"
                type="number"
                value={withdrawAmount}
              />

              <button
                className="btn btn-warning"
                disabled={!isAdmin || actionLoading === 'withdraw'}
                type="submit"
              >
                {actionLoading === 'withdraw' ? 'Withdrawing...' : 'Withdraw Funds'}
              </button>
            </form>
          </article>
        </section>
      </div>
    </div>
  );
}
