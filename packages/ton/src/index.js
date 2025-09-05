"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeTonClient = makeTonClient;
exports.declareDeath = declareDeath;
exports.hashSeed = hashSeed;
const ton_1 = require("@ton/ton");
const crypto_1 = require("@ton/crypto");
const core_1 = require("@ton/core");
async function makeTonClient(env) {
    const client = new ton_1.TonClient({ endpoint: env.rpc });
    const keyPair = await (0, crypto_1.mnemonicToPrivateKey)(env.mnemonic.split(' '));
    const wallet = ton_1.WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
    const contract = client.open(wallet);
    return { client, wallet: contract, keyPair };
}
function buildDeclareDeathPayload(unixTime) {
    throw new Error('declareDeath payload not wired to compiled contract');
}
async function declareDeath(params) {
    const { client, wallet, keyPair } = await makeTonClient({ rpc: params.rpc, mnemonic: params.mnemonic });
    const seqno = await wallet.getSeqno();
    const to = core_1.Address.parse(params.nftAddr);
    const body = buildDeclareDeathPayload(params.deathTime);
    await wallet.sendTransfer({
        secretKey: keyPair.secretKey,
        seqno,
        messages: [(0, ton_1.internal)({ to, value: (0, ton_1.toNano)(params.amount ?? '0.05'), body })],
        sendMode: ton_1.SendMode.PAY_GAS_SEPARATELY,
    });
    return { ok: true };
}
function hashSeed(seed) {
    const { createHash } = require('crypto');
    return createHash('sha256').update(seed).digest('hex');
}
//# sourceMappingURL=index.js.map