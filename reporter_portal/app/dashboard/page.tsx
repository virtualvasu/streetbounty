'use client';

import { useEffect, useMemo, useState } from 'react';
import { FaChartBar, FaExclamationTriangle, FaMapMarkerAlt, FaSearch, FaSync } from 'react-icons/fa';
import ReporterHeader from '@/components/ReporterHeader';
import { reporterContract, type ReporterIncident } from '@/lib/reporter-contract';

const statusFilters: Array<'all' | 'pending' | 'verified' | 'rejected'> = ['all', 'pending', 'verified', 'rejected'];

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<ReporterIncident[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [loading, setLoading] = useState(false);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      setIncidents(await reporterContract.getAllIncidents());
    } catch (error) {
      console.error('Failed to load dashboard incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadIncidents();
  }, []);

  const filteredIncidents = useMemo(() => {
    const term = query.trim().toLowerCase();

    return incidents.filter((incident) => {
      const matchesTerm = !term || [incident.title, incident.description, incident.location].join(' ').toLowerCase().includes(term);
      const matchesStatus = status === 'all' || incident.status === status;
      return matchesTerm && matchesStatus;
    });
  }, [incidents, query, status]);

  const stats = {
    total: incidents.length,
    pending: incidents.filter((incident) => incident.status === 'pending').length,
    verified: incidents.filter((incident) => incident.status === 'verified').length,
    rejected: incidents.filter((incident) => incident.status === 'rejected').length,
  };
  const latest = incidents[0];

  return (
    <div className="sb-page">
      <ReporterHeader
        active="dashboard"
        title="Incident dashboard"
        description="Read every reported incident and keep the reporter view focused on data, not admin review actions."
      />

      <main className="sb-shell pb-20 pt-8 md:pt-10">
        <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-6">
            <div className="sb-glass rounded-[1.75rem] p-6 md:p-7">
              <span className="sb-kicker">
                <FaChartBar className="text-cyan-400" />
                Reporter summary
              </span>
              <h1 className="mt-4 text-3xl font-bold text-slate-950 dark:text-white md:text-4xl">All reported incidents.</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                This dashboard exposes the read-only incident functions available to reporters: get all incidents, inspect a single incident, and review the latest submission.
              </p>

              <div className="sb-grid-2 mt-6">
                <div className="sb-stat"><p className="text-sm text-slate-500 dark:text-slate-400">Total</p><p className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{stats.total}</p></div>
                <div className="sb-stat"><p className="text-sm text-slate-500 dark:text-slate-400">Latest</p><p className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{latest ? latest.id : '—'}</p></div>
              </div>

              {latest && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/60 p-4 dark:bg-white/5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Latest incident</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{latest.title}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{latest.location} | {latest.status} | {new Date(latest.createdAt).toLocaleString()}</p>
                </div>
              )}
            </div>

            <div className="sb-panel rounded-[1.75rem] p-6 md:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <FaExclamationTriangle />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Status breakdown</p>
                  <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Reported queue</h2>
                </div>
              </div>

              <div className="sb-grid-3 mt-5">
                <div className="sb-stat"><p className="text-sm text-slate-500 dark:text-slate-400">Pending</p><p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">{stats.pending}</p></div>
                <div className="sb-stat"><p className="text-sm text-slate-500 dark:text-slate-400">Verified</p><p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">{stats.verified}</p></div>
                <div className="sb-stat"><p className="text-sm text-slate-500 dark:text-slate-400">Rejected</p><p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">{stats.rejected}</p></div>
              </div>
            </div>
          </div>

          <div className="sb-glass rounded-[1.75rem] p-6 md:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="sb-kicker">
                  <FaMapMarkerAlt className="text-cyan-400" />
                  Incident lookup
                </span>
                <h2 className="mt-4 text-3xl font-bold text-slate-950 dark:text-white">Browse all reports.</h2>
              </div>
              <button
                onClick={() => void loadIncidents()}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300"
              >
                <FaSync className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto]">
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/75 px-4 py-3 dark:bg-white/5">
                <FaSearch className="text-slate-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, description, location..." className="w-full bg-transparent text-slate-950 outline-none placeholder:text-slate-400 dark:text-white" />
              </label>
              <select value={status} onChange={(event) => setStatus(event.target.value as 'all' | 'pending' | 'verified' | 'rejected')} className="rounded-2xl border border-white/10 bg-white/75 px-4 py-3 text-slate-950 outline-none dark:bg-white/5 dark:text-white">
                {statusFilters.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>

            <div className="mt-6 space-y-3">
              {filteredIncidents.map((incident) => (
                <article key={incident.id} className="rounded-2xl border border-white/10 bg-white/60 p-4 dark:bg-white/5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-slate-950 dark:text-white">{incident.title}</p>
                        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-200">{incident.status}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{incident.location}</p>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">#{incident.id}</div>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{incident.description}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>Reporter: {incident.reporter}</span>
                    <span>{new Date(incident.createdAt).toLocaleString()}</span>
                  </div>
                </article>
              ))}

              {filteredIncidents.length === 0 && (
                <p className="rounded-2xl border border-dashed border-white/10 bg-white/40 p-6 text-sm text-slate-500 dark:bg-white/5 dark:text-slate-400">
                  No incidents match the current filter.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
