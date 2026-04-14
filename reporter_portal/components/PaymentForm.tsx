/**
 * PaymentForm Component
 * 
 * Allows users to send XLM payments
 * 
 * Features:
 * - Input for recipient address
 * - Input for amount
 * - Optional memo field
 * - Form validation
 * - Success message with transaction hash
 * - Error handling with user-friendly messages
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { FaPaperPlane, FaCheckCircle, FaBookmark, FaPlus } from 'react-icons/fa';
import { Card, Input, Button, Alert, Modal } from './example-components';

interface PaymentFormProps {
  publicKey: string;
  assets?: Array<{ code: string; issuer: string; balance: string }>;
  onSuccess?: () => void;
}

interface AddressBookEntry {
  name: string;
  address: string;
}

const ADDRESS_BOOK_STORAGE_KEY = 'streetbounty-address-book';

export default function PaymentForm({ publicKey, assets = [], onSuccess }: PaymentFormProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [assetCode, setAssetCode] = useState('XLM');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ recipient?: string; amount?: string; asset?: string }>({});
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [txHash, setTxHash] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [addressBook, setAddressBook] = useState<AddressBookEntry[]>([]);
  const [contactName, setContactName] = useState('');

  const supportedAssets = useMemo(
    () => ['XLM', ...assets.map((asset) => asset.code).filter(Boolean)],
    [assets]
  );

  useEffect(() => {
    const saved = localStorage.getItem(ADDRESS_BOOK_STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as AddressBookEntry[];
      if (Array.isArray(parsed)) {
        setAddressBook(parsed);
      }
    } catch {
      setAddressBook([]);
    }
  }, []);

  const persistAddressBook = (entries: AddressBookEntry[]) => {
    setAddressBook(entries);
    localStorage.setItem(ADDRESS_BOOK_STORAGE_KEY, JSON.stringify(entries));
  };

  const validateForm = (): boolean => {
    const newErrors: { recipient?: string; amount?: string; asset?: string } = {};

    // Validate recipient address
    if (!recipient.trim()) {
      newErrors.recipient = 'Recipient address is required';
    } else if (recipient.length !== 56 || !recipient.startsWith('G')) {
      newErrors.recipient = 'Invalid Stellar address (must start with G and be 56 characters)';
    }

    // Validate amount
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = 'Amount must be a positive number';
      } else if (numAmount < 0.0000001) {
        newErrors.amount = 'Amount is too small (minimum: 0.0000001 XLM)';
      }
    }

    if (assetCode !== 'XLM') {
      newErrors.asset = `${assetCode} payments are not enabled yet in this transaction flow. Please use XLM.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const executePayment = async () => {
    try {
      setLoading(true);
      setAlert(null);
      setTxHash('');

      const result = await stellar.sendPayment({
        from: publicKey,
        to: recipient,
        amount: amount,
        memo: memo || undefined,
      });

      if (result.success) {
        setTxHash(result.hash);
        setAlert({
          type: 'success',
          message: `Payment sent successfully! 🎉`,
        });

        setRecipient('');
        setAmount('');
        setMemo('');
        setErrors({});

        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      let errorMessage = 'Failed to send payment. ';

      if (error.message.includes('insufficient')) {
        errorMessage += 'Insufficient balance.';
      } else if (error.message.includes('destination')) {
        errorMessage += 'Invalid destination account.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }

      setAlert({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
      setIsConfirmOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleSaveAddress = () => {
    if (!contactName.trim() || !recipient.trim()) return;
    if (recipient.length !== 56 || !recipient.startsWith('G')) {
      setAlert({ type: 'error', message: 'Enter a valid Stellar address before saving to address book.' });
      return;
    }

    const alreadyExists = addressBook.some((entry) => entry.address === recipient);
    if (alreadyExists) {
      setAlert({ type: 'error', message: 'This address already exists in your address book.' });
      return;
    }

    const nextEntries = [...addressBook, { name: contactName.trim(), address: recipient.trim() }].slice(-20);
    persistAddressBook(nextEntries);
    setContactName('');
    setAlert({ type: 'success', message: 'Address saved to your address book.' });
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
        <FaPaperPlane className="text-blue-400" />
        Send Payment
      </h2>

      {alert && (
        <div className="mb-4">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      {txHash && (
        <div className="mb-4 p-4 bg-emerald-50/85 dark:bg-slate-800/85 border border-emerald-200/70 dark:border-slate-700 rounded-lg transition-colors duration-200 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <FaCheckCircle className="text-green-400 text-xl flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-green-700 font-semibold mb-2">Transaction Confirmed!</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">Transaction Hash:</p>
              <p className="text-slate-900 dark:text-slate-100 text-xs font-mono break-all mb-3">{txHash}</p>
              <a
                href={stellar.getExplorerLink(txHash, 'tx')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm underline"
              >
                View on Stellar Expert →
              </a>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">Asset</label>
          <select
            value={assetCode}
            onChange={(e) => setAssetCode(e.target.value)}
            className="w-full bg-white/85 dark:bg-slate-800/85 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-400/30 transition-all"
          >
            {supportedAssets.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
          {errors.asset && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.asset}</p>}
        </div>

        {addressBook.length > 0 && (
          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">Address Book</label>
            <select
              value=""
              onChange={(e) => {
                if (!e.target.value) return;
                setRecipient(e.target.value);
              }}
              className="w-full bg-white/85 dark:bg-slate-800/85 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-400/30 transition-all"
            >
              <option value="">Select a saved address</option>
              {addressBook.map((entry) => (
                <option key={entry.address} value={entry.address}>
                  {entry.name} ({stellar.formatAddress(entry.address, 6, 6)})
                </option>
              ))}
            </select>
          </div>
        )}

        <Input
          label="Recipient Address"
          placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
          value={recipient}
          onChange={setRecipient}
          error={errors.recipient}
        />

        <div className="grid sm:grid-cols-[1fr_auto] gap-2 items-end">
          <Input
            label="Save as Contact (Optional)"
            placeholder="e.g. Team Wallet"
            value={contactName}
            onChange={setContactName}
          />
          <Button onClick={handleSaveAddress} variant="secondary" disabled={!recipient || !contactName}>
            <span className="flex items-center gap-2">
              <FaPlus /> Save
            </span>
          </Button>
        </div>

        <Input
          label={`Amount (${assetCode})`}
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={setAmount}
          error={errors.amount}
        />

        <Input
          label="Memo (Optional)"
          placeholder="Payment for..."
          value={memo}
          onChange={setMemo}
        />

        <div className="pt-2">
          <Button
            onClick={() => {}}
            variant="primary"
            disabled={loading || assetCode !== 'XLM'}
            type="submit"
            fullWidth
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
                Sending...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <FaPaperPlane />
                Review & Confirm
              </span>
            )}
          </Button>
        </div>
      </form>

      <div className="mt-4 p-3 bg-sky-50/85 dark:bg-slate-800/85 border border-sky-200/70 dark:border-slate-700 rounded-lg transition-colors duration-200 backdrop-blur-sm">
        <p className="text-blue-800 dark:text-blue-300 text-xs">
          ⚠️ <strong>Double-check</strong> the recipient address before sending. Transactions on the blockchain are irreversible!
        </p>
      </div>

      <div className="mt-4 p-3 bg-white/75 dark:bg-slate-800/85 border border-slate-200/80 dark:border-slate-700 rounded-lg transition-colors duration-200 backdrop-blur-sm">
        <p className="text-slate-700 dark:text-slate-300 text-xs flex items-center gap-2">
          <FaBookmark />
          Multiple assets are displayed and selectable. Current payment flow executes XLM transfers only.
        </p>
      </div>

      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Confirm Transaction">
        <div className="space-y-3 text-sm">
          <p className="text-slate-700 dark:text-slate-300">Please confirm the transaction details before signing with your wallet.</p>
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-1">
            <p className="text-slate-900 dark:text-slate-100"><strong>Asset:</strong> {assetCode}</p>
            <p className="text-slate-900 dark:text-slate-100"><strong>Amount:</strong> {amount}</p>
            <p className="text-slate-900 dark:text-slate-100 break-all"><strong>To:</strong> {recipient}</p>
            {memo && <p className="text-slate-900 dark:text-slate-100"><strong>Memo:</strong> {memo}</p>}
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setIsConfirmOpen(false)} variant="secondary" fullWidth>
              Cancel
            </Button>
            <Button onClick={executePayment} variant="primary" disabled={loading || assetCode !== 'XLM'} fullWidth>
              {loading ? 'Sending...' : 'Confirm & Send'}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

