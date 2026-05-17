import { NextResponse } from 'next/server';
import {
  Asset,
  BASE_FEE,
  Keypair,
  Memo,
  Networks,
  Operation,
  TransactionBuilder,
} from '@stellar/stellar-sdk';

type Body = {
  measurementId: string;
  projectId: string;
  receiver: string;
  co2Kg: number;
  approved?: boolean;
};

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function formatAmount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0.0000001';
  const fixed = value.toFixed(7);
  return fixed.replace(/\.?0+$/, '');
}

async function horizonGet(path: string) {
  const horizonUrl =
    process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';
  const url = `${horizonUrl.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Horizon error: ${res.status} ${text}`);
  }
  return (await res.json()) as any;
}

async function submitTxXdr(signedTxXdr: string) {
  const horizonUrl =
    process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';
  const url = `${horizonUrl.replace(/\/$/, '')}/transactions`;
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
  return (await res.json()) as any;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    if (!body.measurementId || !body.projectId || !body.receiver) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }

    const registrySecret = requiredEnv('STELLAR_REGISTRY_SECRET');
    const distributorSecret = requiredEnv('STELLAR_DISTRIBUTOR_SECRET');
    const issuerPublic = requiredEnv('NEXT_PUBLIC_STELLAR_ISSUER_PUBLIC');

    const assetCode = process.env.NEXT_PUBLIC_STELLAR_ASSET_CODE || 'ALGCO2';
    const networkPassphrase =
      process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET;

    const registryKeypair = Keypair.fromSecret(registrySecret);
    const distributorKeypair = Keypair.fromSecret(distributorSecret);

    const registryAccount = await horizonGet(`/accounts/${registryKeypair.publicKey()}`);
    const { Account } = await import('@stellar/stellar-sdk');
    const source = new Account(registryKeypair.publicKey(), registryAccount.sequence);

    const approved = body.approved !== false;
    const verifiedValue = `${approved ? '1' : '0'}|${body.projectId.slice(0, 12)}|${body.co2Kg}`;
    const verifyPrefix = 'verified:';
    const verifyName = `${verifyPrefix}${String(body.measurementId).slice(0, 64 - verifyPrefix.length)}`;

    const tx = new TransactionBuilder(source, {
      fee: BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        Operation.manageData({
          name: verifyName,
          value: verifiedValue.slice(0, 64),
          source: registryKeypair.publicKey(),
        })
      )
      .addOperation(
        Operation.payment({
          source: distributorKeypair.publicKey(),
          destination: body.receiver,
          asset: new Asset(assetCode, issuerPublic),
          amount: formatAmount(body.co2Kg),
        })
      )
      .addMemo(Memo.text('MRV|ISSUE'))
      .setTimeout(60)
      .build();

    tx.sign(registryKeypair, distributorKeypair);
    const result = await submitTxXdr(tx.toXDR());

    return NextResponse.json({ hash: result.hash });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
