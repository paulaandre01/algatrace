import { NextResponse } from 'next/server';

type X402Quote = {
  destination: string;
  amount: string;
  asset_type: 'native';
  memo: string;
  network: 'testnet';
  payment_uri: string;
};

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function horizonBase(): string {
  return (process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org').replace(/\/$/, '');
}

async function horizonGet(path: string) {
  const url = `${horizonBase()}${path}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Horizon error: ${res.status} ${text}`);
  }
  return (await res.json()) as any;
}

function buildSep7PaymentUri(params: { destination: string; amount: string; memo: string }): string {
  const qs = new URLSearchParams({
    destination: params.destination,
    amount: params.amount,
    memo: params.memo,
    network_passphrase: process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
  });
  return `web+stellar:pay?${qs.toString()}`;
}

function buildQuote(nonce: string): X402Quote {
  const destination = requiredEnv('NEXT_PUBLIC_STELLAR_DISTRIBUTOR_PUBLIC');
  const amount = '0.1';
  const memo = `X402:${nonce}`.slice(0, 28);

  return {
    destination,
    amount,
    asset_type: 'native',
    memo,
    network: 'testnet',
    payment_uri: buildSep7PaymentUri({ destination, amount, memo }),
  };
}

async function verifyPayment(params: { txHash: string; expectedDestination: string; expectedMemo: string; minAmount: number }) {
  const tx = await horizonGet(`/transactions/${params.txHash}`);
  const memo = String(tx.memo || '');
  if (memo !== params.expectedMemo) return false;

  const ops = await horizonGet(`/transactions/${params.txHash}/operations?limit=200`);
  const records = ops?._embedded?.records || [];

  for (const op of records) {
    if (op.type !== 'payment') continue;
    if (op.asset_type !== 'native') continue;
    if (String(op.to || '') !== params.expectedDestination) continue;
    const amount = Number(op.amount);
    if (!Number.isFinite(amount)) continue;
    if (amount < params.minAmount) continue;
    return true;
  }

  return false;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tx = searchParams.get('tx');
    const nonce = searchParams.get('nonce') || crypto.randomUUID().slice(0, 8);

    const quote = buildQuote(nonce);

    if (!tx) {
      return NextResponse.json(
        { x402: true, required: true, quote },
        { status: 402, headers: { 'X-Payment-Required': 'true' } }
      );
    }

    const ok = await verifyPayment({
      txHash: tx,
      expectedDestination: quote.destination,
      expectedMemo: quote.memo,
      minAmount: Number(quote.amount),
    });

    if (!ok) {
      return NextResponse.json(
        { x402: true, required: true, quote, error: 'payment_not_verified' },
        { status: 402, headers: { 'X-Payment-Required': 'true' } }
      );
    }

    return NextResponse.json({
      ok: true,
      report: {
        title: 'Relatório ESG (Beta)',
        note: 'Entrega via x402: pagamento em XLM na Testnet para destravar conteúdo.',
        unlocked_by: tx,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}

