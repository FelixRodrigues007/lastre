import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const files = [
  "src/site-links.ts",
  "src/components/proof/seal-data.ts",
  "src/components/demonstration/Demonstration.tsx",
];

const source = files.map((file) => readFileSync(resolve(root, file), "utf8")).join("\n");

const canonicalPackagePath =
  "contract-package/b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561";
const wrongPackagePath =
  "contract-package/hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561";
const requiredTxs = [
  "c2cd1d7fd301d54dd82ed5d25f0e76cde88f39008d92504c5a08922d78e4db10",
  "23d265beb8bd2e6d292975ded281bd9a63148d93870dd9ac262baf73154caede",
  "5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd",
  "bd6d476ee1fddcb1b0deae0185eefc6fecfcbefe616d2b80ebb75fc736fb9101",
  "43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4",
  "8c619f508443ded0ecd732050b976cb49e44a98501589e386516971351b4e32f",
];

if (source.includes(wrongPackagePath)) {
  throw new Error(`Landing still uses CSPR.live package URL with hash- prefix: ${wrongPackagePath}`);
}

if (!source.includes(canonicalPackagePath)) {
  throw new Error(`Landing does not include canonical CSPR.live package URL path: ${canonicalPackagePath}`);
}

for (const tx of requiredTxs) {
  if (!source.includes(tx)) {
    throw new Error(`Landing Casper evidence is missing Testnet tx: ${tx}`);
  }
}

console.log("Casper landing evidence links are canonical and non-empty.");
