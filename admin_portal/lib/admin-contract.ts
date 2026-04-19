'use client';

import {
  Account,
  Address,
  BASE_FEE,
  Contract,
  Networks,
  rpc,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
} from '@stellar/stellar-sdk';
import {
  StellarWalletsKit,
} from '@creit.tech/stellar-wallets-kit';
import { Networks as WalletKitNetworks } from '@creit.tech/stellar-wallets-kit/types';
import { defaultModules } from '@creit.tech/stellar-wallets-kit/modules/utils';

export type IncidentStatus = 'pending' | 'approved' | 'disapproved';

export interface AdminIncident {
  id: number;
  reporter: string;
  title: string;
  description: string;
  location: string;
  createdAt: string;
  status: IncidentStatus;
}

const RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;
const CONTRACT_ID = 'CDZSKVDS2VGECFXWLDRVXEHBVIYXKIJXJPJ6PTROG4E3NBDVLBZSYKDD';
const PLACEHOLDER_SOURCE = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';
const STROOPS_PER_XLM = BigInt(10_000_000);

const contract = new Contract(CONTRACT_ID);

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toAddress(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object' && 'toString' in value) {
    return String(value.toString());
  }

  return '';
}

function toBigInt(value: unknown): bigint {
  if (typeof value === 'bigint') {
    return value;
  }

  if (typeof value === 'number') {
    return BigInt(Math.trunc(value));
  }

  if (typeof value === 'string') {
    return BigInt(value);
  }

  return BigInt(0);
}

function toNumber(value: unknown): number {
  return Number(toBigInt(value));
}

function normalizeStatus(value: unknown): IncidentStatus {
  const raw = Array.isArray(value) ? value[0] : value instanceof Set ? Array.from(value)[0] : value;
  const text = String(raw ?? 'Pending').toLowerCase();

  if (text.includes('disapprove')) {
    return 'disapproved';
  }

  if (text.includes('approve')) {
    return 'approved';
  }

  return 'pending';
}

function parseAmountToStroops(value: string): bigint {
  const cleaned = value.trim();
  if (!cleaned) {
    return BigInt(0);
  }

  const [whole, fraction = ''] = cleaned.split('.');
  const wholeValue = BigInt(whole || '0');
  const fractionPadded = (fraction + '0000000').slice(0, 7);
  const fractionValue = BigInt(fractionPadded || '0');
  return wholeValue * STROOPS_PER_XLM + fractionValue;
}

function stroopsToXlm(stroops: bigint): string {
  const whole = stroops / STROOPS_PER_XLM;
  const fraction = (stroops % STROOPS_PER_XLM).toString().padStart(7, '0').replace(/0+$/, '');
  return fraction ? `${whole.toString()}.${fraction}` : whole.toString();
}

class AdminContractClient {
  private server = new rpc.Server(RPC_URL);

  private walletKitInitialized = false;

  private publicKey: string | null = null;

  private ensureWalletKit() {
    if (this.walletKitInitialized) {
      return;
    }

    StellarWalletsKit.init({
      network: WalletKitNetworks.TESTNET,
      selectedWalletId: 'freighter',
      modules: defaultModules(),
    });
    this.walletKitInitialized = true;
  }

  async connectWallet(): Promise<string> {
    this.ensureWalletKit();

    const { address } = await StellarWalletsKit.authModal();

    if (!address) {
      throw new Error('Wallet connection failed');
    }

    this.publicKey = address;
    return address;
  }

  disconnect() {
    this.ensureWalletKit();
    void StellarWalletsKit.disconnect();
    this.publicKey = null;
  }

  getExplorerLink(hash: string, type: 'tx' | 'account' = 'tx'): string {
    return `https://stellar.expert/explorer/testnet/${type}/${hash}`;
  }

  formatAddress(address: string, startChars: number = 4, endChars: number = 4): string {
    if (address.length <= startChars + endChars) {
      return address;
    }

    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  }

  async getAdminAddress() {
    return toAddress(await this.readContract('get_admin'));
  }

  async getRewardTokenAddress() {
    return toAddress(await this.readContract('get_reward_token'));
  }

  async getIncidentCount(): Promise<number> {
    return toNumber(await this.readContract('get_incident_count'));
  }

  async getAllIncidents(): Promise<AdminIncident[]> {
    const result = await this.readContract('get_all_incidents');
    if (!Array.isArray(result)) {
      return [];
    }

    return result.map((entry: any) => ({
      id: toNumber(entry.id),
      reporter: toAddress(entry.reporter),
      title: String(entry.title ?? ''),
      description: String(entry.description ?? ''),
      location: String(entry.location ?? ''),
      createdAt: new Date(toNumber(entry.created_at) * 1000).toISOString(),
      status: normalizeStatus(entry.status),
    }));
  }

  async getContractBalanceStroops(): Promise<bigint> {
    return toBigInt(await this.readContract('contract_balance'));
  }

  async getContractBalanceXlm(): Promise<string> {
    return stroopsToXlm(await this.getContractBalanceStroops());
  }

  async approveIncident(sourceAccount: string, incidentId: number) {
    return this.sendContractTx(sourceAccount, 'approve_incident', [nativeToScVal(BigInt(incidentId), { type: 'u64' })]);
  }

  async disapproveIncident(sourceAccount: string, incidentId: number) {
    return this.sendContractTx(sourceAccount, 'disapprove_incident', [nativeToScVal(BigInt(incidentId), { type: 'u64' })]);
  }

  async fundContract(sourceAccount: string, amountXlm: string) {
    const amount = parseAmountToStroops(amountXlm);
    if (amount <= BigInt(0)) {
      throw new Error('Fund amount must be greater than zero.');
    }

    return this.sendContractTx(sourceAccount, 'fund_contract', [
      new Address(sourceAccount).toScVal(),
      nativeToScVal(amount, { type: 'i128' }),
    ]);
  }

  async withdrawContractFunds(sourceAccount: string, toAccount: string, amountXlm: string) {
    const amount = parseAmountToStroops(amountXlm);
    if (amount <= BigInt(0)) {
      throw new Error('Withdraw amount must be greater than zero.');
    }

    return this.sendContractTx(sourceAccount, 'withdraw_contract_funds', [
      new Address(toAccount).toScVal(),
      nativeToScVal(amount, { type: 'i128' }),
    ]);
  }

  private async readContract(method: string): Promise<unknown> {
    const source = new Account(PLACEHOLDER_SOURCE, '0');
    const tx = new TransactionBuilder(source, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call(method))
      .setTimeout(30)
      .build();

    const simulation = await this.server.simulateTransaction(tx);
    if ('error' in simulation) {
      throw new Error(`Contract simulation failed: ${simulation.error}`);
    }

    return simulation.result?.retval ? scValToNative(simulation.result.retval) : null;
  }

  private async sendContractTx(sourceAccount: string, method: string, args: any[]) {
    const account = await this.server.getAccount(sourceAccount);
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build();

    const prepared = await this.server.prepareTransaction(tx);
    this.ensureWalletKit();
    const { signedTxXdr } = await StellarWalletsKit.signTransaction(prepared.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    const signedTx = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
    const submitted = await this.server.sendTransaction(signedTx);
    const final = await this.waitForTransaction(submitted.hash);

    if (final.status !== 'SUCCESS') {
      throw new Error(`Transaction failed with status: ${final.status}`);
    }

    return {
      hash: submitted.hash,
      status: final.status,
    };
  }

  private async waitForTransaction(hash: string) {
    for (let attempt = 0; attempt < 24; attempt += 1) {
      const tx = await this.server.getTransaction(hash);
      if (tx.status === 'SUCCESS' || tx.status === 'FAILED') {
        return tx;
      }

      await delay(1500);
    }

    throw new Error('Timed out while waiting for transaction confirmation.');
  }
}

export const adminContract = new AdminContractClient();