'use client';

import Link from 'next/link';
import { FaCogs, FaShieldAlt } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';

interface AdminHeaderProps {
  title: string;
  description: string;
}

export default function AdminHeader({ title, description }: AdminHeaderProps) {
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
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300 bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-700 dark:border-cyan-400/30 dark:text-cyan-200">
              <FaCogs className="text-xs" /> Admin Console
            </span>
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
