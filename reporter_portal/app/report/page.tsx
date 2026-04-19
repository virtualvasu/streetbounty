'use client';

import { useEffect, useMemo, useState } from 'react';
import { FaCheckCircle, FaClock, FaPaperPlane, FaRegFileAlt, FaShieldAlt } from 'react-icons/fa';
import ReporterHeader from '@/components/ReporterHeader';
import ReporterWalletCard from '@/components/ReporterWalletCard';
import { reporterContract, type ReporterIncident } from '@/lib/reporter-contract';

export default function ReportPage() {
  const [publicKey, setPublicKey] = useState('');
  const [incidents, setIncidents] = useState<ReporterIncident[]>([]);
  const [incidentCount, setIncidentCount] = useState(0);
  const [latestIncident, setLatestIncident] = useState<ReporterIncident | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const [allIncidents, count, latest] = await Promise.all([
        reporterContract.getAllIncidents(),
        reporterContract.getIncidentCount(),
        reporterContract.getLatestIncident(),
      ]);

      setIncidents(allIncidents);
      setIncidentCount(count);
      setLatestIncident(latest);
    } catch (error: any) {
      console.error('Failed to load contract incidents:', error);
      setNotice(error?.message || 'Failed to load incidents from contract.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadIncidents();
  }, []);

  const myIncidents = useMemo(
    () => incidents.filter((incident) => !publicKey || incident.reporter === publicKey),
    [incidents, publicKey]
  );

  const stats = {
    total: incidentCount,
    pending: incidents.filter((incident) => incident.status === 'pending').length,
    verified: incidents.filter((incident) => incident.status === 'verified').length,
    rejected: incidents.filter((incident) => incident.status === 'rejected').length,
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!publicKey) {
      setNotice('Connect your wallet before reporting an incident.');
      return;
    }

    if (!title.trim() || !description.trim() || !location.trim()) {
      setNotice('Title, description, and location are required.');
      return;
    }

    void (async () => {
      try {
        setLoading(true);
        const result = await reporterContract.submitIncident({
          reporter: publicKey,
          title,
          description,
          location,
        });

        setTitle('');
        setDescription('');
        setLocation('');
        setNotice(`Incident submitted on-chain: ${result.hash}`);
        await loadIncidents();
      } catch (error: any) {
        console.error('Report submission failed:', error);
        setNotice(error?.message || 'Failed to submit incident to the contract.');
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <div className="sb-page">
      <ReporterHeader
        active="report"
        title="Reporter workspace"
        description="Submit a road incident and keep the reporter flow separate from admin review actions."
      />

      <main className="sb-shell pb-20 pt-8 md:pt-10">
        <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-6">
            <ReporterWalletCard
              title="Wallet connection"
              description="Connect a Stellar wallet to submit incidents and keep your reports tied to a public address."
              onChange={(key) => setPublicKey(key ?? '')}
            />

            <div className="sb-glass rounded-[1.75rem] p-6 md:p-7">
              <span className="sb-kicker">
                <FaShieldAlt className="text-cyan-400" />
                Reporter rules
              </span>
              <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                <p className="flex items-start gap-3"><FaCheckCircle className="mt-1 text-cyan-400" /> Report an incident with title, description, and location.</p>
                <p className="flex items-start gap-3"><FaCheckCircle className="mt-1 text-cyan-400" /> Read all submitted incidents and the latest record from the dashboard.</p>
                <p className="flex items-start gap-3"><FaCheckCircle className="mt-1 text-cyan-400" /> Keep admin actions like approve and revoke out of the reporter view.</p>
              </div>
            </div>

            <div className="sb-panel rounded-[1.75rem] p-6 md:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <FaClock />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Current queue</p>
                  <h2 className="text-2xl font-bold text-slate-950 dark:text-white">{stats.total} reported incidents</h2>
                </div>
              </div>

              <div className="sb-grid-3 mt-5">
                <div className="sb-stat"><p className="text-sm text-slate-500 dark:text-slate-400">Pending</p><p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">{stats.pending}</p></div>
                <div className="sb-stat"><p className="text-sm text-slate-500 dark:text-slate-400">Verified</p><p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">{stats.verified}</p></div>
                <div className="sb-stat"><p className="text-sm text-slate-500 dark:text-slate-400">Rejected</p><p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">{stats.rejected}</p></div>
              </div>

              {latestIncident && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/60 p-4 dark:bg-white/5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Latest incident</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{latestIncident.title}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{latestIncident.location} | {latestIncident.status}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <section className="sb-glass rounded-[1.75rem] p-6 md:p-7">
              <span className="sb-kicker">
                <FaPaperPlane className="text-cyan-400" />
                Report incident
              </span>
              <h1 className="mt-4 text-3xl font-bold text-slate-950 dark:text-white md:text-4xl">Submit a road incident.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                Use this form to submit the incident directly to the Soroban contract. The dashboard and rewards pages read the same on-chain data.
              </p>

              {notice && (
                <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-900 dark:text-cyan-100">
                  {notice}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
                <label className="grid gap-2 text-sm text-slate-700 dark:text-slate-300">
                  Title
                  <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Pothole near crossing" className="sb-focus-ring rounded-2xl border border-white/10 bg-white/75 px-4 py-3 text-slate-950 outline-none transition-colors placeholder:text-slate-400 dark:bg-white/5 dark:text-white" />
                </label>

                <label className="grid gap-2 text-sm text-slate-700 dark:text-slate-300">
                  Description
                  <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={5} placeholder="Explain what happened and why it matters." className="sb-focus-ring rounded-2xl border border-white/10 bg-white/75 px-4 py-3 text-slate-950 outline-none transition-colors placeholder:text-slate-400 dark:bg-white/5 dark:text-white" />
                </label>

                <label className="grid gap-2 text-sm text-slate-700 dark:text-slate-300">
                  Location
                  <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Main Street and 8th Avenue" className="sb-focus-ring rounded-2xl border border-white/10 bg-white/75 px-4 py-3 text-slate-950 outline-none transition-colors placeholder:text-slate-400 dark:bg-white/5 dark:text-white" />
                </label>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 px-5 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-transform hover:-translate-y-0.5">
                    <FaPaperPlane />
                    {loading ? 'Submitting...' : 'Submit incident'}
                  </button>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Reporters can submit and read incidents. Admin approvals are not exposed here.</p>
                </div>
              </form>
            </section>

            <section className="sb-panel rounded-[1.75rem] p-6 md:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <FaRegFileAlt />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">My reported incidents</p>
                  <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Latest submissions</h2>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {myIncidents.slice(0, 3).map((incident) => (
                  <article key={incident.id} className="rounded-2xl border border-white/10 bg-white/60 p-4 dark:bg-white/5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-slate-950 dark:text-white">{incident.title}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{incident.location}</p>
                      </div>
                      <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-200">{incident.status}</span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{incident.description}</p>
                  </article>
                ))}

                {myIncidents.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-white/10 bg-white/40 p-6 text-sm text-slate-500 dark:bg-white/5 dark:text-slate-400">
                    No personal reports yet. Connect your wallet and submit the first incident.
                  </p>
                )}
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
