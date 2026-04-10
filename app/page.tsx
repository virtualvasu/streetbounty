/**
 * StreetBounty - Road Incident Reporting DApp
 * Landing Page / Homepage
 */

'use client';

import Link from 'next/link';
import { FaRoad, FaCoins, FaCheckCircle, FaGlobeAmericas, FaArrowRight } from 'react-icons/fa';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-slate-200/80 dark:border-slate-800 backdrop-blur-sm bg-white/70 dark:bg-slate-950/70 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-2xl">
                🛣️
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">StreetBounty</h1>
                <p className="text-slate-600 dark:text-slate-300 text-sm">Smart Incident Reporting Network</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <span className="inline-flex items-center rounded-full border border-sky-200/80 dark:border-sky-900/60 bg-white/80 dark:bg-slate-900/80 px-4 py-1 text-xs uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300 mb-6">
            Decentralized Road Safety Network
          </span>
          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight tracking-tight">
            Make Roads Safer,<br />Earn Rewards
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10">
            Help improve road safety by reporting incidents in real-time. Get rewarded with XLM cryptocurrency for every verified report. Together, we can build smarter, safer roads.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/portal">
              <button className="bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-300/40">
                Enter Incident Portal <FaArrowRight />
              </button>
            </Link>
          </div>
        </div>

        {/* Ideology Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
          <div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">Our Vision</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              StreetBounty is a decentralized platform that leverages blockchain technology to create a community-driven road safety network. By combining crowdsourced incident reporting with cryptocurrency incentives, we're building a system where:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-orange-600 mt-1">✓</span>
                <span className="text-slate-600 dark:text-slate-300">Citizens are rewarded for maintaining road safety awareness</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-600 mt-1">✓</span>
                <span className="text-slate-600 dark:text-slate-300">Road authorities get real-time incident data for better planning</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-600 mt-1">✓</span>
                <span className="text-slate-600 dark:text-slate-300">All transactions are transparent and immutable on the blockchain</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-600 mt-1">✓</span>
                <span className="text-slate-600 dark:text-slate-300">No central authority - truly decentralized infrastructure</span>
              </li>
            </ul>
          </div>
          <div className="sb-glass rounded-2xl p-8 transition-colors duration-300">
            <div className="space-y-6">
              {[
                { icon: '📍', title: 'Real-Time Reporting', desc: 'Report incidents instantly from any location' },
                { icon: '💰', title: 'Earn XLM', desc: 'Get rewarded for each verified incident report' },
                { icon: '🔗', title: 'Blockchain Verified', desc: 'All data stored on Stellar blockchain' },
                { icon: '📊', title: 'Transparency', desc: 'Complete transaction history and verification' },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <h4 className="text-slate-900 dark:text-slate-100 font-semibold mb-1">{item.title}</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-12 text-center">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Setup Wallet', desc: 'Connect your Freighter wallet to StreetBounty' },
              { step: '2', title: 'Report Incident', desc: 'Spot a road issue and submit a report' },
              { step: '3', title: 'Get Verified', desc: 'Community verifies your incident with voting' },
              { step: '4', title: 'Earn XLM', desc: 'Receive XLM rewards directly to your wallet' },
            ].map((item, idx) => (
              <div key={idx} className="sb-glass rounded-xl p-6 hover:border-orange-200 transition-all shadow-sm hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center text-2xl font-bold text-white mb-4">
                  {item.step}
                </div>
                <h4 className="text-slate-900 dark:text-slate-100 font-semibold mb-2">{item.title}</h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="sb-glass rounded-xl p-8 transition-colors duration-300 hover:-translate-y-1">
            <div className="text-4xl mb-4">🚗</div>
            <h4 className="text-slate-900 dark:text-slate-100 font-bold text-lg mb-3">For Drivers</h4>
            <ul className="text-slate-600 dark:text-slate-300 space-y-2 text-sm">
              <li>• Safer route planning</li>
              <li>• Real-time hazard alerts</li>
              <li>• Community support</li>
            </ul>
          </div>
          <div className="sb-glass rounded-xl p-8 transition-colors duration-300 hover:-translate-y-1">
            <div className="text-4xl mb-4">🏛️</div>
            <h4 className="text-slate-900 dark:text-slate-100 font-bold text-lg mb-3">For Authorities</h4>
            <ul className="text-slate-600 dark:text-slate-300 space-y-2 text-sm">
              <li>• Real-time incident data</li>
              <li>• Better resource allocation</li>
              <li>• Predictive maintenance</li>
            </ul>
          </div>
          <div className="sb-glass rounded-xl p-8 transition-colors duration-300 hover:-translate-y-1">
            <div className="text-4xl mb-4">🌍</div>
            <h4 className="text-slate-900 dark:text-slate-100 font-bold text-lg mb-3">For Communities</h4>
            <ul className="text-slate-600 dark:text-slate-300 space-y-2 text-sm">
              <li>• Collective safety</li>
              <li>• Economic incentives</li>
              <li>• Decentralized trust</li>
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-100/80 via-rose-50/80 to-indigo-100/50 dark:from-slate-900 dark:to-slate-800 border border-orange-200/70 dark:border-slate-700 rounded-2xl p-8 md:p-12 text-center shadow-lg transition-colors duration-300">
          <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Ready to Make a Difference?</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            Start by setting up your wallet, connecting to the Stellar Testnet, and then head to the incident portal to begin reporting and earning rewards.
          </p>
          <Link href="/portal">
            <button className="bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white font-bold py-4 px-10 rounded-xl transition-all transform hover:scale-105 inline-flex items-center gap-2 shadow-lg hover:shadow-orange-300/40">
              Go to Incident Portal <FaArrowRight />
            </button>
          </Link>
        </div>

        {/* Tech Stack */}
        <div className="mt-20 mb-12">
          <h3 className="text-center text-slate-600 dark:text-slate-300 mb-8">Built with cutting-edge technology</h3>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="sb-glass px-6 py-3 rounded-full text-slate-700 dark:text-slate-300 text-sm transition-colors duration-300">
              ⭐ Stellar Blockchain
            </div>
            <div className="sb-glass px-6 py-3 rounded-full text-slate-700 dark:text-slate-300 text-sm transition-colors duration-300">
              🚀 XLM Payments
            </div>
            <div className="sb-glass px-6 py-3 rounded-full text-slate-700 dark:text-slate-300 text-sm transition-colors duration-300">
              🔗 Decentralized
            </div>
            <div className="sb-glass px-6 py-3 rounded-full text-slate-700 dark:text-slate-300 text-sm transition-colors duration-300">
              🛡️ Secure & Verified
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-16 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-slate-500 dark:text-slate-400 text-sm">
            <p className="mb-2">StreetBounty - Making Roads Safer, One Report at a Time</p>
            <p className="text-xs">⚠️ Running on Stellar Testnet | Only for testing purposes</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
