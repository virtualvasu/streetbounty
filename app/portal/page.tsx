/**
 * StreetBounty - Incident Reporting Portal
 * 
 * User Dashboard with wallet details, balance, and transaction functionality
 * All blockchain logic is in lib/stellar-helper.ts (DO NOT MODIFY)
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import WalletConnection from '@/components/WalletConnection';
import BalanceDisplay from '@/components/BalanceDisplay';
import PaymentForm from '@/components/PaymentForm';
import TransactionHistory from '@/components/TransactionHistory';
import { FaArrowLeft, FaMapMarkerAlt, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import ThemeToggle from '@/components/ThemeToggle';
import BalanceChart from '@/components/BalanceChart';

export default function IncidentPortal() {
  const [publicKey, setPublicKey] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [assets, setAssets] = useState<Array<{ code: string; issuer: string; balance: string }>>([]);
  const [balanceHistory, setBalanceHistory] = useState<Array<{ timestamp: number; balance: number }>>([]);

  const handleConnect = (key: string) => {
    setPublicKey(key);
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setPublicKey('');
    setIsConnected(false);
    setAssets([]);
    setBalanceHistory([]);
  };

  const handleHistoryPoint = (point: { timestamp: number; balance: number }) => {
    setBalanceHistory((prev) => [...prev, point].slice(-12));
  };

  const handlePaymentSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-slate-200/80 dark:border-slate-800 backdrop-blur-sm bg-white/70 dark:bg-slate-950/70 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <FaArrowLeft className="text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-2xl">
                  🛣️
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">StreetBounty Portal</h1>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">Incident Reporting & Rewards Dashboard</p>
                </div>
              </div>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Banner for Disconnected */}
        {!isConnected && (
          <div className="mb-8 bg-gradient-to-r from-orange-100/80 via-rose-50/80 to-indigo-100/50 dark:from-slate-900 dark:to-slate-800 border border-orange-200/70 dark:border-slate-700 rounded-2xl p-6 md:p-8 text-center shadow-lg transition-colors duration-300 animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Welcome to StreetBounty Incident Portal 👋
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-6">
              Connect your Stellar wallet to access your dashboard, view your balance, manage rewards, and track your contributions.
            </p>
            <div className="sb-glass rounded-lg p-6 max-w-2xl mx-auto transition-colors duration-300">
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-2xl mb-2">1️⃣</div>
                  <h3 className="text-slate-900 dark:text-slate-100 font-semibold mb-1">Install Freighter</h3>
                  <p className="text-slate-600 dark:text-slate-300">Download the Freighter wallet extension</p>
                </div>
                <div>
                  <div className="text-2xl mb-2">2️⃣</div>
                  <h3 className="text-slate-900 dark:text-slate-100 font-semibold mb-1">Create Account</h3>
                  <p className="text-slate-600 dark:text-slate-300">Set up your Stellar testnet account</p>
                </div>
                <div>
                  <div className="text-2xl mb-2">3️⃣</div>
                  <h3 className="text-slate-900 dark:text-slate-100 font-semibold mb-1">Fund via Friendbot</h3>
                  <p className="text-slate-600 dark:text-slate-300">Get free testnet XLM to get started</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Connection */}
        <div className="mb-8">
          <WalletConnection onConnect={handleConnect} onDisconnect={handleDisconnect} />
        </div>

        {/* Dashboard Content - Only show when connected */}
        {isConnected && publicKey && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="sb-glass rounded-xl p-6 hover:border-orange-200 transition-all shadow-sm animate-fade-in hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-600 dark:text-slate-300 text-sm font-semibold">WALLET STATUS</h3>
                  <span className="text-2xl">✅</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs break-all font-mono">{publicKey.slice(0, 20)}...</p>
              </div>

              <div className="sb-glass rounded-xl p-6 hover:border-orange-200 transition-all shadow-sm animate-fade-in hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-600 dark:text-slate-300 text-sm font-semibold">NETWORK</h3>
                  <span className="text-2xl">🌐</span>
                </div>
                <p className="text-slate-900 dark:text-slate-100 font-semibold">Stellar Testnet</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Running on testnet only</p>
              </div>

              <div className="sb-glass rounded-xl p-6 hover:border-orange-200 transition-all shadow-sm animate-fade-in hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-600 dark:text-slate-300 text-sm font-semibold">STATUS</h3>
                  <span className="text-2xl">🔐</span>
                </div>
                <p className="text-slate-900 dark:text-slate-100 font-semibold">Connected</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Ready to transact</p>
              </div>
            </div>

            {/* Balance Section */}
            <div key={`balance-${refreshKey}`}>
              <BalanceDisplay
                publicKey={publicKey}
                onAssetsUpdate={setAssets}
                onHistoryUpdate={handleHistoryPoint}
              />
            </div>

            {/* Main Actions Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Send Rewards / Transfers */}
              <div>
                <PaymentForm publicKey={publicKey} assets={assets} onSuccess={handlePaymentSuccess} />
              </div>

              {/* Transaction History */}
              <div key={`history-${refreshKey}`}>
                <TransactionHistory publicKey={publicKey} />
              </div>
            </div>

            {/* Balance History Graph */}
            <div className="sb-glass rounded-2xl p-6 transition-colors duration-300 animate-fade-in">
              <BalanceChart points={balanceHistory} />
            </div>

            {/* Incident Portal Preview */}
            <div className="sb-glass rounded-2xl p-8 shadow-lg transition-colors duration-300 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <FaMapMarkerAlt className="text-orange-600 text-2xl" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Incident Portal (Coming Soon)</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                The full incident reporting system is currently in development. In the final version, you'll be able to:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/75 dark:bg-slate-800/80 rounded-lg p-4 border border-orange-200/70 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FaExclamationTriangle className="text-orange-600" />
                    <span className="text-slate-900 dark:text-slate-100 font-semibold">Report Incidents</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">Submit road incidents with location, photos, and details</p>
                </div>
                <div className="bg-white/75 dark:bg-slate-800/80 rounded-lg p-4 border border-green-200/70 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCheckCircle className="text-green-500" />
                    <span className="text-slate-900 dark:text-slate-100 font-semibold">Verify Reports</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">Vote on incident validity and help build trust</p>
                </div>
                <div className="bg-white/75 dark:bg-slate-800/80 rounded-lg p-4 border border-amber-200/70 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🏆</span>
                    <span className="text-slate-900 dark:text-slate-100 font-semibold">Earn Rewards</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">Get XLM tokens for verified incidents and community votes</p>
                </div>
                <div className="bg-white/75 dark:bg-slate-800/80 rounded-lg p-4 border border-blue-200/70 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📊</span>
                    <span className="text-slate-900 dark:text-slate-100 font-semibold">Track Impact</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">View statistics on your contributions and road improvements</p>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="sb-glass rounded-xl p-6 transition-colors duration-300 hover:-translate-y-1">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="text-slate-900 dark:text-slate-100 font-semibold mb-2">Lightning Fast</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Transactions settle in 3-5 seconds on Stellar network
                </p>
              </div>

              <div className="sb-glass rounded-xl p-6 transition-colors duration-300 hover:-translate-y-1">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="text-slate-900 dark:text-slate-100 font-semibold mb-2">Minimal Fees</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Transaction fees are just 0.00001 XLM (~$0.000001)
                </p>
              </div>

              <div className="sb-glass rounded-xl p-6 transition-colors duration-300 hover:-translate-y-1">
                <div className="text-3xl mb-3">🔒</div>
                <h3 className="text-slate-900 dark:text-slate-100 font-semibold mb-2">Secure & Verified</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  All transactions verified on blockchain with immutable records
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-16 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-slate-500 dark:text-slate-400 text-sm">
            <p className="mb-2">StreetBounty Incident Portal | Powered by Stellar</p>
            <p className="text-xs">⚠️ Running on Stellar Testnet | XLM is for testing only</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
