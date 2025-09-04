import { TonClient, WalletContractV4, internal, toNano, SendMode } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { beginCell, Address } from '@ton/core';

export interface TonEnv {
  rpc: string;
  mnemonic: string;
}

export async function makeTonClient(env: TonEnv) {
  const client = new TonClient({ endpoint: env.rpc });
  const keyPair = await mnemonicToPrivateKey(env.mnemonic.split(' '));
  const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
  const contract = client.open(wallet);
  return { client, wallet: contract, keyPair };
}

function buildDeclareDeathPayload(unixTime: number): any {
  throw new Error('declareDeath payload not wired to compiled contract');
}

export async function declareDeath(params: { rpc: string; mnemonic: string; nftAddr: string; deathTime: number; amount?: string }) {
  const { client, wallet, keyPair } = await makeTonClient({ rpc: params.rpc, mnemonic: params.mnemonic });
  const seqno = await wallet.getSeqno();
  const to = Address.parse(params.nftAddr);
  const body = buildDeclareDeathPayload(params.deathTime);
  await wallet.sendTransfer({
    secretKey: keyPair.secretKey,
    seqno,
    messages: [internal({ to, value: toNano(params.amount ?? '0.05'), body })],
    sendMode: SendMode.PAY_GAS_SEPARATELY,
  });
  return { ok: true };
}

export function hashSeed(seed: string): string {
  const { createHash } = require('crypto');
  return createHash('sha256').update(seed).digest('hex');
}
