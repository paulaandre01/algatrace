import {
  Asset,
  BASE_FEE,
  Keypair,
  Memo,
  Networks,
  Operation,
  TransactionBuilder,
} from '@stellar/stellar-sdk';

export type StellarConfig = {
  horizonUrl: string;
  networkPassphrase: string;
  assetCode: string;
  issuerPublicKey: string;
  registryPublicKey: string;
  distributorPublicKey: string;
};

export const STELLAR_CONFIG: StellarConfig = {
  horizonUrl: process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
  networkPassphrase:
    process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET,
  assetCode: process.env.NEXT_PUBLIC_STELLAR_ASSET_CODE || 'ALGCO2',
  issuerPublicKey: process.env.NEXT_PUBLIC_STELLAR_ISSUER_PUBLIC || '',
  registryPublicKey: process.env.NEXT_PUBLIC_STELLAR_REGISTRY_PUBLIC || '',
  distributorPublicKey: process.env.NEXT_PUBLIC_STELLAR_DISTRIBUTOR_PUBLIC || '',
};

export type AnchoredEvent =
  | { type: 'PROJECT_REGISTERED'; projectId: string; dataHash: string; txHash: string; createdAt: string }
  | {
      type: 'MEASUREMENT_ADDED';
      projectId: string;
      measurementId: string;
      biomassKg: number;
      co2Kg: number;
      dataHash: string;
      txHash: string;
      createdAt: string;
    }
  | {
      type: 'MEASUREMENT_VERIFIED';
      projectId: string;
      measurementId: string;
      approved: boolean;
      receiver: string;
      co2Kg: number;
      txHash: string;
      createdAt: string;
    }
  | {
      type: 'CREDITS_ISSUED';
      projectId: string;
      measurementId: string;
      receiver: string;
      amount: string;
      txHash: string;
      createdAt: string;
    }
  | { type: 'CREDITS_RETIRED'; owner: string; amount: string; reason: string; txHash: string; createdAt: string };

const PROJECT_PREFIX = 'algae_project:';
const MEASUREMENT_PREFIX = 'mrv:';
const VERIFICATION_PREFIX = 'verified:';

export type LocalProjectMetadata = {
  id: string;
  name: string;
  description: string;
  location: string;
  algaeType: string;
  estimatedCapacity: string;
  imageDataUrl?: string;
  createdAt: string;
  anchoredDataHash?: string;
};

export type LocalMeasurement = {
  measurementId: string;
  projectId: string;
  timestamp: number;
  biomassKg: number;
  co2Kg: number;
  rawDataHash: string;
  createdAt: string;
};

const STORAGE_KEYS = {
  projects: 'mrv_algae_projects_v1',
  measurements: 'mrv_algae_measurements_v1',
};

export function getAlgCO2Asset(): Asset {
  if (!STELLAR_CONFIG.issuerPublicKey) {
    return new Asset(STELLAR_CONFIG.assetCode, Keypair.random().publicKey());
  }
  return new Asset(STELLAR_CONFIG.assetCode, STELLAR_CONFIG.issuerPublicKey);
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function base64Encode(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64');
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export async function sha256Base64Url(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest);
  return base64Encode(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function listLocalProjects(): LocalProjectMetadata[] {
  return readJson<LocalProjectMetadata[]>(STORAGE_KEYS.projects, []);
}

export function upsertLocalProject(project: LocalProjectMetadata): void {
  const projects = listLocalProjects();
  const next = [project, ...projects.filter((p) => p.id !== project.id)];
  writeJson(STORAGE_KEYS.projects, next);
}

export function getLocalProject(projectId: string): LocalProjectMetadata | undefined {
  return listLocalProjects().find((p) => p.id === projectId);
}

export function listLocalMeasurements(projectId?: string): LocalMeasurement[] {
  const all = readJson<LocalMeasurement[]>(STORAGE_KEYS.measurements, []);
  return projectId ? all.filter((m) => m.projectId === projectId) : all;
}

export function addLocalMeasurement(measurement: LocalMeasurement): void {
  const measurements = listLocalMeasurements();
  writeJson(STORAGE_KEYS.measurements, [measurement, ...measurements]);
}

export async function friendbotFund(publicKey: string): Promise<void> {
  const url = `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Friendbot failed: ${res.status} ${text}`);
  }
}

export async function horizonGet<T>(path: string): Promise<T> {
  const url = `${STELLAR_CONFIG.horizonUrl.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Horizon error: ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}

export async function submitSignedTransactionXdr(signedTxXdr: string): Promise<{ hash: string }> {
  const url = `${STELLAR_CONFIG.horizonUrl.replace(/\/$/, '')}/transactions`;
  const body = new URLSearchParams({ tx: signedTxXdr });
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Submit failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as any;
  return { hash: String(json.hash || '') };
}

export async function getAlgCO2Balance(accountId: string): Promise<string> {
  const account = await horizonGet<any>(`/accounts/${accountId}`);
  const assetCode = STELLAR_CONFIG.assetCode;
  const issuer = STELLAR_CONFIG.issuerPublicKey;
  const balance = (account.balances || []).find(
    (b: any) => b.asset_code === assetCode && b.asset_issuer === issuer
  );
  return balance?.balance || '0';
}

export async function getAlgCO2Trustline(accountId: string): Promise<{ hasTrustline: boolean; balance: string }> {
  const account = await horizonGet<any>(`/accounts/${accountId}`);
  const assetCode = STELLAR_CONFIG.assetCode;
  const issuer = STELLAR_CONFIG.issuerPublicKey;
  const line = (account.balances || []).find(
    (b: any) => b.asset_code === assetCode && b.asset_issuer === issuer
  );
  if (!line) return { hasTrustline: false, balance: '0' };
  return { hasTrustline: true, balance: String(line.balance || '0') };
}

export async function accountExists(accountId: string): Promise<boolean> {
  try {
    await horizonGet<any>(`/accounts/${accountId}`);
    return true;
  } catch {
    return false;
  }
}

export type BuildXdrParams = {
  publicKey: string;
  memo?: Memo;
  operations: any[];
};

export async function buildTransactionXdr({ publicKey, operations, memo }: BuildXdrParams): Promise<string> {
  const { Account } = await import('@stellar/stellar-sdk');
  const accountData = await horizonGet<any>(`/accounts/${publicKey}`);
  const account = new Account(publicKey, accountData.sequence);

  const builder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_CONFIG.networkPassphrase,
  });

  for (const op of operations) {
    builder.addOperation(op);
  }

  if (memo) builder.addMemo(memo);

  const tx = builder.setTimeout(60).build();
  return tx.toXDR();
}

export function buildChangeTrustOp(): any {
  return Operation.changeTrust({ asset: getAlgCO2Asset() });
}

export async function buildChangeTrustXdr(params: { publicKey: string }): Promise<string> {
  return buildTransactionXdr({
    publicKey: params.publicKey,
    memo: Memo.text('MRV|TRUST'),
    operations: [buildChangeTrustOp()],
  });
}

export async function buildRegisterProjectXdr(params: {
  publicKey: string;
  projectId: string;
  dataHash: string;
}): Promise<string> {
  const key = `${PROJECT_PREFIX}${params.projectId}`;
  const value = params.dataHash.slice(0, 64);
  return buildTransactionXdr({
    publicKey: params.publicKey,
    memo: Memo.text('MRV|PROJECT'),
    operations: [Operation.manageData({ name: key, value })],
  });
}

export async function buildAddMeasurementXdr(params: {
  publicKey: string;
  projectId: string;
  measurementId: string;
  biomassKg: number;
  co2Kg: number;
  dataHash: string;
}): Promise<string> {
  const projectKey = params.projectId.replace(/-/g, '').slice(0, 12);
  const maxMeasurementChars = 64 - MEASUREMENT_PREFIX.length - projectKey.length - 1;
  const measurementKey = params.measurementId.slice(0, Math.max(0, maxMeasurementChars));
  const key = `${MEASUREMENT_PREFIX}${projectKey}:${measurementKey}`;
  const compact = `b=${params.biomassKg};c=${params.co2Kg};h=${params.dataHash.slice(0, 24)}`;
  const value = compact.length > 64 ? compact.slice(0, 64) : compact;

  return buildTransactionXdr({
    publicKey: params.publicKey,
    memo: Memo.text('MRV|MEASURE'),
    operations: [Operation.manageData({ name: key, value })],
  });
}

export async function buildRetireCreditsXdr(params: {
  publicKey: string;
  amount: string;
  reason: string;
}): Promise<string> {
  const destination = STELLAR_CONFIG.distributorPublicKey || STELLAR_CONFIG.issuerPublicKey;
  if (!destination) throw new Error('Destino de aposentadoria não configurado');

  const memoText = `RETIRE|${params.reason}`.slice(0, 28);
  return buildTransactionXdr({
    publicKey: params.publicKey,
    memo: Memo.text(memoText),
    operations: [
      Operation.payment({
        destination,
        asset: getAlgCO2Asset(),
        amount: params.amount,
      }),
    ],
  });
}

export async function listAnchorsForAccount(accountId: string, limit = 200): Promise<AnchoredEvent[]> {
  const ops = await horizonGet<any>(
    `/accounts/${accountId}/operations?limit=${encodeURIComponent(String(limit))}&order=desc`
  );

  const records = ops?._embedded?.records || [];
  const events: AnchoredEvent[] = [];

  for (const op of records) {
    if (op.type !== 'manage_data') continue;
    const name = String(op.name || '');
    const createdAt = String(op.created_at || '');
    const txHash = String(op.transaction_hash || '');
    const value = op.value ? String(op.value) : '';

    if (name.startsWith(PROJECT_PREFIX)) {
      const projectId = name.slice(PROJECT_PREFIX.length);
      events.push({
        type: 'PROJECT_REGISTERED',
        projectId,
        dataHash: value,
        txHash,
        createdAt,
      });
    } else if (name.startsWith(MEASUREMENT_PREFIX)) {
      const rest = name.slice(MEASUREMENT_PREFIX.length);
      const [projectId, measurementId] = rest.includes(':') ? rest.split(':') : ['', rest];
      const parts = String(value).split(';');
      const biom = Number((parts.find((p) => p.startsWith('b=')) || '').slice(2));
      const co2 = Number((parts.find((p) => p.startsWith('c=')) || '').slice(2));
      const h = (parts.find((p) => p.startsWith('h=')) || '').slice(2);
      events.push({
        type: 'MEASUREMENT_ADDED',
        projectId,
        measurementId,
        biomassKg: Number.isFinite(biom) ? biom : 0,
        co2Kg: Number.isFinite(co2) ? co2 : 0,
        dataHash: h,
        txHash,
        createdAt,
      });
    } else if (name.startsWith(VERIFICATION_PREFIX)) {
      const measurementId = name.slice(VERIFICATION_PREFIX.length);
      const decoded = value;
      const [approvedStr, projectId, co2Str] = decoded.split('|');
      const approved = approvedStr === '1';
      const co2 = Number(co2Str);
      events.push({
        type: 'MEASUREMENT_VERIFIED',
        projectId,
        measurementId,
        approved,
        receiver: '',
        co2Kg: Number.isFinite(co2) ? co2 : 0,
        txHash,
        createdAt,
      });
    }
  }

  return events;
}
