'use client';

import Link from 'next/link';
import { FaChartBar, FaGift, FaMapMarkerAlt, FaShieldAlt } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';

type ReporterRoute = 'report' | 'dashboard' | 'rewards';

interface ReporterHeaderProps {
  active: ReporterRoute;
  title: string;
  description: string;
}

const routes: Array<{ key: ReporterRoute; label: string; href: string; icon: typeof FaMapMarkerAlt }> = [
  { key: 'report', label: 'Report', href: '/report', icon: FaMapMarkerAlt },
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: FaChartBar },
  { key: 'rewards', label: 'Rewards', href: '/rewards', icon: FaGift },
];

export default function ReporterHeader({ active, title, description }: ReporterHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-white/55 backdrop-blur-xl dark:bg-slate-950/60">
      <div className="sb-shell py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-orange-500 text-2xl shadow-lg shadow-cyan-500/20">
              🛣️
            </div>
            <div>
              <Link href="/" className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                StreetBounty
              </Link>
              <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {routes.map((route) => {
              const Icon = route.icon;
              const isActive = route.key === active;

              return (
                <Link
                  key={route.key}
                  href={route.href}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'border-cyan-300 bg-cyan-400/15 text-cyan-700 dark:border-cyan-400/30 dark:text-cyan-200'
                      : 'border-white/10 bg-white/50 text-slate-600 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  <Icon className="text-xs" />
                  {route.label}
                </Link>
              );
            })}
            <span className="sb-chip hidden sm:inline-flex">
              <FaShieldAlt /> {title}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
