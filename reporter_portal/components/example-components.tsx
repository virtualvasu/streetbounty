/**
 * Example Components
 * 
 * These are example components you can use as inspiration for your UI.
 * Feel free to modify, delete, or create your own components!
 */

'use client';

import { useState } from 'react';

// Example: Loading Spinner
export function LoadingSpinner() {
  return (
    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
}

// Example: Balance Card
export function BalanceCard({ 
  balance, 
  label 
}: { 
  balance: string; 
  label: string; 
}) {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 shadow-lg">
      <p className="text-white/80 text-sm mb-2">{label}</p>
      <p className="text-4xl font-bold text-white">{balance}</p>
    </div>
  );
}

// Example: Transaction Item
export function TransactionItem({
  type,
  amount,
  asset,
  date,
  hash,
  explorerLink,
}: {
  type: string;
  amount?: string;
  asset?: string;
  date: string;
  hash: string;
  explorerLink: string;
}) {
  return (
    <div className="bg-slate-50 hover:bg-slate-100 rounded-lg p-4 transition-colors border border-slate-200">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-slate-900 font-semibold">
            {type === 'payment' ? '💸' : '📝'} {type}
          </p>
          {amount && (
            <p className="text-slate-600">
              {amount} {asset || 'XLM'}
            </p>
          )}
        </div>
        
        <a
          href={explorerLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          View →
        </a>
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>{new Date(date).toLocaleString()}</span>
        <span className="font-mono">{hash.slice(0, 8)}...</span>
      </div>
    </div>
  );
}

// Example: Copy to Clipboard Button
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-blue-400 hover:text-blue-300 text-sm"
    >
      {copied ? '✓ Copied!' : '📋 Copy'}
    </button>
  );
}

// Example: Alert/Toast Component
export function Alert({
  type,
  message,
  onClose,
}: {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}) {
  const colors = {
    success: 'bg-emerald-500/90 border border-emerald-300/30',
    error: 'bg-rose-500/90 border border-rose-300/30',
    info: 'bg-sky-500/90 border border-sky-300/30',
  };

  return (
    <div
      className={`${colors[type]} text-white px-6 py-4 rounded-xl shadow-lg flex justify-between items-center backdrop-blur-sm`}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-white/80 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}

// Example: Card Component
export function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="sb-glass rounded-2xl p-6 transition-all duration-300 animate-fade-in hover:shadow-xl hover:shadow-sky-100/30 dark:hover:shadow-sky-950/20">
      {title && (
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">{title}</h2>
      )}
      {children}
    </div>
  );
}

// Example: Input Component
export function Input({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/85 dark:bg-slate-800/85 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-400/30 transition-all"
      />
      {error && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}

// Example: Button Component
export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  type = 'button',
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500',
    secondary: 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600',
    danger: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${
        fullWidth ? 'w-full' : ''
      } text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-[1.01] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
    >
      {children}
    </button>
  );
}

// Example: Empty State Component
export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-slate-900 dark:text-slate-100 text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  );
}

// Example: Modal Component
export function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="sb-glass rounded-2xl shadow-2xl max-w-md w-full animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-2xl transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}