#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

const CHAIN_ROOT_RE = /^[0-9a-f]{64}$/;
function arg(name, fallback) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return process.env[`LASTRE_${name.toUpperCase().replaceAll('-', '_')}`] || fallback;
}
function transferIdFromChainRoot(root) {
  if (!CHAIN_ROOT_RE.test(root)) throw new Error('chainRoot must be 64 lowercase hex');
  return BigInt(`0x${createHash('sha256').update(`lastre-composition-anchor:${root}`).digest('hex').slice(0, 16)}`).toString(10);
}
function parseTx(output) {
  const m = output.match(/\b([0-9a-fA-F]{64})\b/);
  return m ? m[1].toLowerCase() : null;
}
const chainRoot = (process.argv[2] || process.env.LASTRE_COMPOSITION_CHAIN_ROOT || '').trim().toLowerCase();
if (!CHAIN_ROOT_RE.test(chainRoot)) {
  console.error('usage: scripts/anchor-composition-root.mjs <64hex-chainRoot> [--secret-key path] [--target-account pubkey/account-hash]');
  process.exit(2);
}
const secretKey = arg('secret-key', `${process.env.HOME}/.casper-keys/lastro-deploy/secret_key.pem`);
const targetAccount = arg('target-account', (() => {
  try { return execFileSync('bash', ['-lc', `cat "$HOME/.casper-keys/lastro-payto/public_key_hex"`], { encoding: 'utf8' }).trim(); }
  catch { return ''; }
})());
const nodeAddress = arg('node-address', 'https://node.testnet.casper.network/rpc');
const chainName = arg('chain-name', 'casper-test');
const casperClient = arg('casper-client', process.env.CASPER_CLIENT_BIN || 'casper-client');
const amount = arg('amount', '2500000000');
const paymentAmount = arg('payment-amount', '2500000000');
const out = arg('output', 'output/composition-anchor.json');
if (!existsSync(secretKey)) throw new Error(`secret key not found: ${secretKey}`);
if (!targetAccount) throw new Error('target account required');
const transferId = transferIdFromChainRoot(chainRoot);
const args = [
  'transfer',
  '--node-address', nodeAddress,
  '--chain-name', chainName,
  '--secret-key', secretKey,
  '--amount', amount,
  '--target-account', targetAccount,
  '--transfer-id', transferId,
  '--payment-amount', paymentAmount,
];
console.error(`anchoring chainRoot ${chainRoot}`);
console.error(`transfer-id ${transferId}`);
const output = execFileSync(casperClient, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const txHash = parseTx(output);
if (!txHash) throw new Error(`could not parse tx hash from casper-client output:\n${output}`);
const artifact = {
  chainRoot,
  transferId,
  txHash,
  explorerUrl: `https://testnet.cspr.live/transaction/${txHash}`,
  amountMotes: amount,
  targetAccount,
  anchoredAt: new Date().toISOString(),
  note: 'Native transfer anchors Lastre 2-hop composition chainRoot via transfer-id; no synthetic hash.'
};
mkdirSync(out.split('/').slice(0, -1).join('/') || '.', { recursive: true });
writeFileSync(out, JSON.stringify(artifact, null, 2) + '\n');
console.log(JSON.stringify(artifact, null, 2));
