# Lastre Architecture Flowcharts

These diagrams are the canonical flowcharts for the public repo, frontend handoff,
and demo narrative.

## 1. Full system overview

```mermaid
flowchart LR
  field["Fictional physical origin\nfield measurement"] --> sealer["Offline deterministic sealer\nSHA-256 canonical artifact"]
  sealer --> seal["Seal\n64-hex digest"]
  seal --> agent["OriginChain agent\nchooses action only"]
  agent --> gateway["Lastre Gateway\nRender Docker"]
  gateway --> contract["ProofOfOrigin\nCasper Testnet"]
  contract --> state["On-chain state\naccepted / rejected"]
  state --> gateway
  gateway --> frontend["Lastre frontend\nVercel · lastre.io"]
  frontend --> user["User verifies provenance"]

  contract -->|"Valid only"| mintgate["MintGate symbolic event"]
  mintgate --> credential["Non-transferable\nProvenanceCredential"]

  classDef chain fill:#0b1f3a,stroke:#d4af37,color:#ffffff;
  classDef ui fill:#181b0c,stroke:#fef16f,color:#e7e6d0;
  class contract,state,mintgate chain;
  class frontend,user ui;
```

## 2. Trust boundary

```mermaid
flowchart TB
  subgraph offline["Offline deterministic layer"]
    measurement["Canonical measurement\nfictional demo data"]
    hash["SHA-256 seal"]
    measurement --> hash
  end

  subgraph chain["Casper Testnet"]
    reference["reference seal"]
    attestation["attestation seal"]
    verdict["Valid or Invalid\nboth recorded"]
    reference --> verdict
    attestation --> verdict
  end

  subgraph presentation["Presentation layer"]
    gateway["Gateway API"]
    frontend["Vercel UI"]
    llm["LLM / agent action"]
    gateway --> frontend
    frontend --> llm
  end

  hash --> attestation
  verdict --> gateway

  note["Only the seal decides the verdict.\nThe frontend and LLM never overwrite it."]
  note -.-> verdict
```

## 3. Free read path

```mermaid
sequenceDiagram
  participant U as User
  participant F as Lastre frontend (Vercel)
  participant G as Gateway (Render)
  participant Q as Rust query binary
  participant C as Casper Testnet

  U->>F: Open lastre.io/proof
  F->>G: GET /proof
  G->>Q: query accepted/rejected
  Q->>C: RPC read only
  C-->>Q: counters + state
  Q-->>G: JSON
  G-->>F: ProofResponse
  F-->>U: Live counters + recent attestations
```

## 4. Verdict path

```mermaid
sequenceDiagram
  participant F as Frontend
  participant G as Gateway
  participant Q as Rust query
  participant C as ProofOfOrigin

  F->>G: GET /verdict/MINA-VALEDOURO-LOTE-001
  G->>Q: load package + query getters
  Q->>C: read attestation/reference
  C-->>Q: Invalid
  Q-->>G: VerdictResponse
  G-->>F: { verdict: "Invalid", packageHash, readAt }
```

## 5. Sandbox compute path

```mermaid
flowchart LR
  ui["Frontend sandbox form"] --> api["POST /sandbox/compute"]
  api --> sealer["Existing deterministic sealer"]
  sealer --> compare["Compare computed seal\nwith reference seal"]
  compare --> result["Valid or Invalid\nlocal only · no chain write"]
  result --> ui
```

## 6. Controlled sandbox anchor path

```mermaid
sequenceDiagram
  participant F as Frontend
  participant G as Gateway
  participant A as Rust attest binary
  participant CC as casper-client
  participant C as Casper Testnet

  F->>G: POST /sandbox/anchor { SANDBOX-* assetId, seal }
  G->>G: Check SANDBOX namespace, env flag, rate limit
  alt disabled or unsafe
    G-->>F: 4xx safety response
  else enabled controlled demo
    G->>A: attest via subprocess
    A->>CC: put-transaction package
    CC->>C: submit transaction
    A->>CC: poll get-transaction
    CC-->>A: execution_result
    A-->>G: txHash + verdict
    G-->>F: explorerUrl
  end
```

## 7. Spot-the-Fraud game

```mermaid
flowchart TD
  start["Start round"] --> challenge["GET /fraud-challenge"]
  challenge --> pair["Seal A + Seal B"]
  pair --> choice["User picks: This is the fraud"]
  choice --> guess["POST /fraud/guess"]
  guess --> reveal["Reveal full seals\nand exact changed field"]
  reveal --> score["Update streak and score"]
  reveal --> optional["Optional SANDBOX anchor\nfor tampered seal"]
  optional --> proof["/proof shows rejection\nif chain write is enabled"]
```

## 8. Deployment topology

```mermaid
flowchart LR
  repo["GitHub\nFelixRodrigues007/lastro"] --> vercel["Vercel project\nlastre.io"]
  repo --> render["Render Docker service\nlastro.onrender.com"]
  vercel -->|"fetch JSON"| render
  render --> casper["Casper Testnet RPC"]
  render --> query["/app/bin/query"]
  render --> sealer["agent/sealer/dist"]
  dns["DNS\nlastre.io"] --> vercel
  apiDns["Future DNS\napi.lastre.io"] -.-> render
```

## 9. Rebrand state

```mermaid
flowchart TD
  public["Public brand: Lastre"] --> domain["lastre.io"]
  public --> ui["Frontend copy and docs"]
  legacy["Legacy internal namespace: lastro"] --> contracts["contracts/lastro_origin"]
  legacy --> css["--lastro-* tokens"]
  legacy --> npm["@lastro/* packages"]
  ui --> bridge["Documented bridge\nno breaking rename during demo"]
  contracts --> bridge
```
