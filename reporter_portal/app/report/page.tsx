'use client';

import { useEffect, useState } from 'react';
import { FaCheckCircle, FaClock, FaExternalLinkAlt, FaPaperPlane, FaShieldAlt } from 'react-icons/fa';
import ReporterHeader from '@/components/ReporterHeader';
import ReporterWalletCard from '@/components/ReporterWalletCard';
import { reporterContract, type ReporterIncident } from '@/lib/reporter-contract';

const getIncidentStatusBadgeClass = (status: ReporterIncident['status']) => {
  if (status === 'verified') {
    return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-200';
  }

  if (status === 'rejected') {
    return 'bg-rose-500/10 text-rose-700 dark:text-rose-200';
  }

  return 'bg-amber-500/10 text-amber-700 dark:text-amber-200';
};

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
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [reportTxn, setReportTxn] = useState<{
    hash: string;
    status: string;
    submittedAt: string;
    title: string;
    location: string;
    reporter: string;
    error?: string;
  } | null>(null);

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
        setShowSuccessPopup(false);
        setReportTxn({
          hash: '',
          status: 'SUBMITTING',
          submittedAt: new Date().toISOString(),
          title: title.trim(),
          location: location.trim(),
          reporter: publicKey,
        });

        const result = await reporterContract.submitIncident({
          reporter: publicKey,
          title,
          description,
          location,
        });

        const submittedAt = new Date().toISOString();

        setTitle('');
        setDescription('');
        setLocation('');
        setNotice(`Incident submitted on-chain: ${result.hash}`);
        setReportTxn({
          hash: result.hash,
          status: result.status,
          submittedAt,
          title: title.trim(),
          location: location.trim(),
          reporter: publicKey,
        });
        setShowSuccessPopup(result.status === 'SUCCESS');
        await loadIncidents();
      } catch (error: any) {
        console.error('Report submission failed:', error);
        const message = error?.message || 'Failed to submit incident to the contract.';
        setNotice(message);
        setShowSuccessPopup(false);
        setReportTxn((current) => ({
          hash: current?.hash ?? '',
          status: 'FAILED',
          submittedAt: current?.submittedAt ?? new Date().toISOString(),
          title: current?.title ?? title.trim(),
          location: current?.location ?? location.trim(),
          reporter: current?.reporter ?? publicKey,
          error: message,
        }));
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      setNotice('Geolocation is not supported in this browser.');
      return;
    }

    setDetectingLocation(true);
    setNotice('Detecting your current location...');

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const latitude = coords.latitude.toFixed(6);
        const longitude = coords.longitude.toFixed(6);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );

          if (!response.ok) {
            throw new Error('Reverse geocoding failed');
          }

          const data = await response.json();
          const resolvedLocation = data.display_name || `${latitude}, ${longitude}`;

          setLocation(resolvedLocation);
          setNotice('Location detected successfully.');
        } catch {
          setLocation(`${latitude}, ${longitude}`);
          setNotice('Location coordinates detected. You can refine the address if needed.');
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        const messageByCode: Record<number, string> = {
          1: 'Location access was denied. Please allow permission and try again.',
          2: 'Location is currently unavailable. Try again in a few seconds.',
          3: 'Location request timed out. Please retry.',
        };

        setNotice(messageByCode[error.code] || 'Unable to detect location right now.');
        setDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
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
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span>{latestIncident.location}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getIncidentStatusBadgeClass(latestIncident.status)}`}>
                      {latestIncident.status}
                    </span>
                  </div>
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

              {reportTxn && (
                <div className="mt-5 rounded-2xl border border-white/15 bg-white/75 p-4 dark:bg-white/5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Incident transaction</p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        reportTxn.status === 'SUCCESS'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : reportTxn.status === 'FAILED'
                            ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {reportTxn.status}
                    </span>
                  </div>

                  <dl className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <div className="grid gap-1 sm:grid-cols-[11rem_1fr] sm:items-start">
                      <dt className="font-semibold text-slate-700 dark:text-slate-200">Incident title</dt>
                      <dd>{reportTxn.title || 'Pending title'}</dd>
                    </div>
                    <div className="grid gap-1 sm:grid-cols-[11rem_1fr] sm:items-start">
                      <dt className="font-semibold text-slate-700 dark:text-slate-200">Incident location</dt>
                      <dd>{reportTxn.location || 'Pending location'}</dd>
                    </div>
                    <div className="grid gap-1 sm:grid-cols-[11rem_1fr] sm:items-start">
                      <dt className="font-semibold text-slate-700 dark:text-slate-200">Reporter</dt>
                      <dd className="break-all">{reportTxn.reporter}</dd>
                    </div>
                    <div className="grid gap-1 sm:grid-cols-[11rem_1fr] sm:items-start">
                      <dt className="font-semibold text-slate-700 dark:text-slate-200">Submitted at</dt>
                      <dd>{new Date(reportTxn.submittedAt).toLocaleString()}</dd>
                    </div>
                    <div className="grid gap-1 sm:grid-cols-[11rem_1fr] sm:items-start">
                      <dt className="font-semibold text-slate-700 dark:text-slate-200">Transaction hash</dt>
                      <dd className="break-all font-mono text-xs text-slate-700 dark:text-slate-200">
                        {reportTxn.hash || 'Waiting for network confirmation...'}
                      </dd>
                    </div>
                  </dl>

                  {reportTxn.hash && (
                    <a
                      href={reporterContract.getExplorerLink(reportTxn.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-600 dark:text-cyan-300 dark:hover:text-cyan-200"
                    >
                      View transaction on explorer
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                  )}

                  {reportTxn.error && (
                    <p className="mt-3 text-sm text-rose-700 dark:text-rose-300">Error: {reportTxn.error}</p>
                  )}
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
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Main Street and 8th Avenue" className="sb-focus-ring rounded-2xl border border-white/10 bg-white/75 px-4 py-3 text-slate-950 outline-none transition-colors placeholder:text-slate-400 dark:bg-white/5 dark:text-white" />
                    <button
                      type="button"
                      onClick={handleAutoDetectLocation}
                      disabled={detectingLocation}
                      className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-800 transition-colors hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:text-cyan-200"
                    >
                      {detectingLocation ? 'Detecting...' : 'Use current location'}
                    </button>
                  </div>
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

          </div>
        </section>
      </main>

      {showSuccessPopup && reportTxn?.status === 'SUCCESS' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="incident-success-title"
            className="w-full max-w-lg rounded-3xl border border-emerald-300/30 bg-white p-6 shadow-2xl dark:border-emerald-500/25 dark:bg-slate-900"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                <FaCheckCircle className="text-2xl" />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.22em] text-emerald-700/80 dark:text-emerald-300/90">Incident submitted</p>
                <h2 id="incident-success-title" className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                  Report sent successfully
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Your incident has been recorded on-chain and is now visible for review.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-50 px-4 py-3 text-sm dark:bg-emerald-500/10">
              <p className="font-semibold text-slate-800 dark:text-emerald-100">Transaction status: {reportTxn.status}</p>
              <p className="mt-2 break-all font-mono text-xs text-slate-600 dark:text-emerald-200/90">{reportTxn.hash}</p>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSuccessPopup(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <a
                href={reporterContract.getExplorerLink(reportTxn.hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                View transaction
                <FaExternalLinkAlt className="text-xs" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
