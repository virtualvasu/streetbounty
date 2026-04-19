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
  WalletNetwork,
  allowAllModules,
} from '@creit.tech/stellar-wallets-kit';

export type ContractIncidentStatus = 'pending' | 'approved' | 'disapproved';
export type ReporterIncidentStatus = 'pending' | 'verified' | 'rejected';
export type ReporterRewardStatus = 'estimated' | 'available' | 'claimed' | 'rejected';

export interface ContractIncident {
  id: number;
  reporter: string;
  title: string;
  description: string;
  location: string;
  createdAt: number;
  status: ContractIncidentStatus;
}

export interface ReporterIncident {
  id: number;
  reporter: string;
  title: string;
  description: string;
  location: string;
  createdAt: string;
  status: ReporterIncidentStatus;
}

export interface ReporterReward {
  id: number;
  incidentId: number;
  reporter: string;
  title: string;
  amount: number;
  status: ReporterRewardStatus;
  note: string;
  createdAt: string;
}

export interface SubmitIncidentInput {
  reporter: string;
  title: string;
  description: string;
  location: string;
}

export interface SubmitIncidentResult {
  hash: string;
  status: string;
}

type RpcTransactionStatus = 'NOT_FOUND' | 'SUCCESS' | 'FAILED';

const RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;
const CONTRACT_ID = 'CDZSKVDS2VGECFXWLDRVXEHBVIYXKIJXJPJ6PTROG4E3NBDVLBZSYKDD';
const PLACEHOLDER_SOURCE = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';

const CONTRACT = new Contract(CONTRACT_ID);

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

function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'bigint') {
    return Number(value);
  }

  if (typeof value === 'string') {
    return Number(value);
  }

  return 0;
}

function normalizeContractStatus(value: unknown): ContractIncidentStatus {
  const raw = Array.isArray(value) ? value[0] : value instanceof Set ? Array.from(value)[0] : value;
  const text = typeof raw === 'string' ? raw : String(raw ?? 'Pending');

  if (text.toLowerCase().includes('approve')) {
    return 'approved';
  }

  if (text.toLowerCase().includes('disapprove')) {
    return 'disapproved';
  }

  return 'pending';
}

function contractStatusToReporterStatus(status: ContractIncidentStatus): ReporterIncidentStatus {
  if (status === 'approved') {
    return 'verified';
  }

  if (status === 'disapproved') {
    return 'rejected';
  }

  return 'pending';
}

function incidentCreatedAtToIso(createdAt: unknown): string {
  const seconds = toNumber(createdAt);
  if (!seconds) {
    return new Date(0).toISOString();
  }

  return new Date(seconds * 1000).toISOString();
}

function normalizeIncident(raw: any): ReporterIncident {
  const status = normalizeContractStatus(raw.status);

  return {
    id: toNumber(raw.id),
    reporter: toAddress(raw.reporter),
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    location: String(raw.location ?? ''),
    createdAt: incidentCreatedAtToIso(raw.created_at),
    status: contractStatusToReporterStatus(status),
  };
}

class ReporterContractClient {
  private server = new rpc.Server(RPC_URL);

  private kit: StellarWalletsKit | null = null;

  private publicKey: string | null = null;

  private getKit(): StellarWalletsKit {
    if (this.kit) {
      return this.kit;
    }

    if (typeof window === 'undefined') {
      throw new Error('Wallet access is only available in the browser.');
    }

    this.kit = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      selectedWalletId: 'freighter',
      modules: allowAllModules(),
    });
    return this.kit;
  }

  async connectWallet(): Promise<string> {
    const kit = this.getKit();

    await kit.openModal({
      onWalletSelected: async (option) => {
        kit.setWallet(option.id);
      },
    });

    const { address } = await kit.getAddress();

    if (!address) {
      throw new Error('Wallet connection failed');
    }

    this.publicKey = address;
    return address;
  }

  disconnect() {
    this.publicKey = null;
  }

  getConnectedWallet() {
    return this.publicKey;
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

  async getIncidentCount(): Promise<number> {
    const count = await this.readContract('get_incident_count');
    return toNumber(count);
  }

  async getAllIncidents(): Promise<ReporterIncident[]> {
    const incidents = await this.readContract('get_all_incidents');
    if (!Array.isArray(incidents)) {
      return [];
    }

    return incidents.map(normalizeIncident);
  }

  async getLatestIncident(): Promise<ReporterIncident | null> {
    try {
      const incident = await this.readContract('get_latest_incident');
      return normalizeIncident(incident);
    } catch {
      return null;
    }
  }

  deriveRewards(incidents: ReporterIncident[]): ReporterReward[] {
    return incidents.map((incident) => {
      const rewardStatus =
        incident.status === 'verified'
          ? 'claimed'
          : incident.status === 'rejected'
            ? 'rejected'
            : 'estimated';

      return {
        id: incident.id,
        incidentId: incident.id,
        reporter: incident.reporter,
        title: incident.title,
        amount: incident.status === 'rejected' ? 0 : 1,
        status: rewardStatus,
        note:
          incident.status === 'verified'
            ? 'Approval on-chain releases the fixed 1 XLM reward.'
            : incident.status === 'rejected'
              ? 'Rejected reports do not receive a payout.'
              : 'Reward remains pending until the contract approves the report.',
        createdAt: incident.createdAt,
      };
    });
  }

  async submitIncident(input: SubmitIncidentInput): Promise<SubmitIncidentResult> {
    const reporter = input.reporter;
    const account = await this.server.getAccount(reporter);

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        CONTRACT.call(
          'report_incident',
          new Address(reporter).toScVal(),
          nativeToScVal(input.title),
          nativeToScVal(input.description),
          nativeToScVal(input.location)
        )
      )
      .setTimeout(30)
      .build();

    const prepared = await this.server.prepareTransaction(tx);
    const { signedTxXdr } = await this.getKit().signTransaction(prepared.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    const signedTx = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
    const submission = await this.server.sendTransaction(signedTx);
    const finalStatus = await this.waitForTransaction(submission.hash);

    if (finalStatus.status !== 'SUCCESS') {
      throw new Error(`Contract submission failed: ${finalStatus.status}`);
    }

    return {
      hash: submission.hash,
      status: finalStatus.status,
    };
  }

  private async readContract(method: string): Promise<unknown> {
    const account = new Account(PLACEHOLDER_SOURCE, '0');
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(CONTRACT.call(method))
      .setTimeout(30)
      .build();

    const response = await this.server.simulateTransaction(tx);
    if ('error' in response) {
      throw new Error(`Contract simulation failed: ${response.error}`);
    }

    if (!response.result?.retval) {
      return null;
    }

    return scValToNative(response.result.retval);
  }

  private async waitForTransaction(hash: string) {
    for (let attempt = 0; attempt < 24; attempt += 1) {
      const status = await this.getTransactionStatus(hash);

      if (status === 'SUCCESS' || status === 'FAILED') {
        return { status };
      }

      await delay(1500);
    }

    throw new Error('Timed out waiting for the contract transaction to settle');
  }

  private async getTransactionStatus(hash: string): Promise<RpcTransactionStatus> {
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: hash,
        method: 'getTransaction',
        params: {
          hash,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Transaction lookup failed with HTTP ${response.status}`);
    }

    const data = (await response.json()) as {
      result?: { status?: string };
      error?: { message?: string } | string;
    };

    if (data.error) {
      const message = typeof data.error === 'string' ? data.error : data.error.message;
      throw new Error(message || 'Transaction lookup failed at RPC layer');
    }

    const status = data.result?.status;
    if (status === 'SUCCESS' || status === 'FAILED' || status === 'NOT_FOUND') {
      return status;
    }

    throw new Error(`Unexpected transaction status: ${String(status)}`);
  }
}

export const reporterContract = new ReporterContractClient();
