import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  BookOpen,
  Terminal,
  Cpu,
  Trophy,
  Award,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Sparkles,
  Layers,
  Key,
  FileCode,
  Copy,
  Check,
  Search,
  RefreshCw,
  Trash2,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Zap,
  Activity,
  Send,
  AlertTriangle,
  Info,
  User,
  Home,
  Code2,
  Database,
  HelpCircle,
  Play,
  RotateCcw,
} from 'lucide-react';

// ============================================================================
// 1. CONSTANTS, STORAGE & EDUCATIONAL DATA MODULES
// ============================================================================

const STORAGE_KEY = 'zeclearn_lab_state_v1';

const DEFAULT_STATE = {
  profile: {
    name: 'Zcash Explorer',
    role: 'Privacy & Protocol Learner',
    bio: 'Exploring zero-knowledge proofs, shielded pools, and privacy-preserving applications on Zcash.',
  },
  completedLessons: [],
  quizResults: {}, // { [quizId]: { bestScore, total, passed, attempts } }
  simulatedTxs: [], // Array of locally simulated transaction receipts
  playgroundModesExplored: [], // ['transparent', 'shielding', 'shielded', 'auditor']
  extraXp: 0,
  unlockedAchievements: [],
};

const TRACKS = [
  {
    id: 'foundations',
    name: 'Foundations',
    tagline: 'Core Zcash concepts, pools, and Unified Addresses',
    color: 'emerald',
    description: 'Understand why financial privacy matters and how Zcash separates transparent and shielded value pools.',
  },
  {
    id: 'cryptography',
    name: 'Cryptography & Privacy',
    tagline: 'zk-SNARKs, Halo 2, Viewing Keys & Encrypted Memos',
    color: 'violet',
    description: 'Dive into zero-knowledge proofs without trusted setups, selective disclosure, and private metadata.',
  },
  {
    id: 'developer',
    name: 'Zcash Developer Track',
    tagline: 'Zebra, Lightwalletd, librustzcash & Wallet SDKs',
    color: 'sky',
    description: 'Learn the modern Rust-based Zcash node stack, light client sync architecture, and wallet crate ecosystem.',
  },
];

const LESSONS = [
  {
    id: 'why-privacy-matters',
    track: 'foundations',
    title: 'Why Financial Privacy Matters & Zcash Overview',
    duration: '6 min',
    xp: 100,
    summary: 'Explore why transparent ledgers leak sensitive commercial and personal data, and how Zcash introduces protocol-level privacy.',
    sections: [
      {
        heading: 'The Transparency Problem on Public Blockchains',
        paragraphs: [
          'Most public blockchains operate like a permanently archived, globally readable bank statement. While addresses are pseudonymous, chain analysis heuristics—clustering, exchange KYC links, and timing correlation—regularly map addresses back to real-world identities.',
          'Without financial privacy, paying a contractor reveals your treasury balance, donating to a cause exposes your political or personal beliefs, and merchants can inspect the spending history of every customer who pays them.',
        ],
      },
      {
        heading: 'Zcash: Privacy as a Normal, Selective Default',
        paragraphs: [
          'Launched in 2016 by cryptographers and engineers, Zcash (ZEC) is a decentralized, open-source cryptocurrency that brings strong cryptographic privacy to a Bitcoin-inspired monetary model (21 million ZEC supply cap).',
          'Using zero-knowledge proofs (zk-SNARKs), Zcash allows the network to verify that transactions are mathematically valid—no double-spending, no counterfeiting—without revealing the sender, recipient, or amount on the public ledger.',
        ],
        callout: {
          type: 'emerald',
          title: 'Key Principle: Selective Disclosure',
          body: 'Zcash privacy is not about hiding from accountability—it gives users control. Holders can share cryptographic Viewing Keys with auditors, accountants, or counterparties to prove specific transactions without exposing their entire financial life to the world.',
        },
      },
    ],
    quickCheck: {
      question: 'How does Zcash verify shielded transactions without exposing sender, receiver, and amount?',
      options: [
        'By trusting a centralized privacy coordinator to validate balances',
        'By using zero-knowledge proofs (zk-SNARKs) that prove validity mathematically',
        'By mixing coins through a rotating set of transparent addresses',
        'By storing transaction data off-chain in private databases',
      ],
      correctIndex: 1,
      explanation: 'Zcash uses zk-SNARKs so every node can independently verify that a shielded transaction follows all consensus rules without seeing the underlying private values.',
    },
  },
  {
    id: 'pools-explained',
    track: 'foundations',
    title: 'Transparent, Sapling & Orchard Pools',
    duration: '8 min',
    xp: 120,
    summary: 'Compare Zcash value pools, understand how funds move across pool boundaries, and learn why Orchard is the modern standard.',
    sections: [
      {
        heading: 'Understanding Zcash Value Pools',
        paragraphs: [
          'Zcash maintains distinct value pools at the protocol level. Each pool represents a generation of cryptographic design, allowing Zcash to upgrade its privacy technology smoothly while preserving backwards compatibility.',
        ],
        table: {
          headers: ['Pool', 'Address Prefix', 'Cryptography', 'Privacy Level'],
          rows: [
            ['Transparent', 't1... / t3...', 'ECDSA / Script (Bitcoin-like)', 'Public (sender, receiver, amount visible)'],
            ['Sapling (2018)', 'zs1...', 'Groth16 zk-SNARKs (Jubjub curve)', 'Shielded (trusted setup retired in favor of Halo 2)'],
            ['Orchard (2022)', 'u1... (via UA)', 'Halo 2 (Pasta curves, no trusted setup)', 'Shielded (modern default, highest efficiency)'],
          ],
        },
      },
      {
        heading: 'Crossing Pool Boundaries: Shielding & Deshielding',
        paragraphs: [
          'When funds move from a Transparent address (t-addr) to a Shielded pool (Orchard or Sapling), the action is called shielding. The amount entering the shielded pool is visible at the boundary, after which subsequent shielded-to-shielded transfers remain fully private.',
          'Moving funds back to a Transparent address is called deshielding. Because crossing pool boundaries exposes the amount at the turnstile, modern Zcash wallets encourage keeping funds inside the Orchard shielded pool whenever possible.',
        ],
        callout: {
          type: 'violet',
          title: 'The Turnstile Auditability Guarantee',
          body: 'Zcash enforces a strict consensus rule at pool boundaries: the network tracks total ZEC entering and leaving each shielded pool, preventing any hidden inflation bug from ever extracting more ZEC than was deposited into a pool.',
        },
      },
    ],
    quickCheck: {
      question: 'Which Zcash shielded pool uses Halo 2 and requires NO trusted setup ceremony?',
      options: ['Transparent Pool', 'Sprout Pool', 'Sapling Pool', 'Orchard Pool'],
      correctIndex: 3,
      explanation: 'Orchard, activated with Network Upgrade 5 (NU5) in 2022, introduced the Halo 2 proving system, eliminating the need for a trusted setup.',
    },
  },
  {
    id: 'unified-addresses',
    track: 'foundations',
    title: 'Unified Addresses (ZIP-316) Explained',
    duration: '7 min',
    xp: 120,
    summary: 'Learn how ZIP-316 Unified Addresses solve multi-pool complexity by bundling multiple receivers into a single future-proof address.',
    sections: [
      {
        heading: 'Why Unified Addresses Were Created',
        paragraphs: [
          'Historically, Zcash users had to juggle multiple address formats: t1 addresses for transparent exchanges, zs1 addresses for Sapling wallets, and newer formats for Orchard. Asking users to pick the right address created friction and accidental privacy downgrades.',
          'ZIP-316 introduced Unified Addresses (UAs), starting with the prefix u1. A single Unified Address can contain an Orchard receiver, a Sapling receiver, and optionally a Transparent receiver—all encoded together in Bech32m format.',
        ],
      },
      {
        heading: 'Automatic Privacy Upgrade Selection',
        paragraphs: [
          'When a sender pastes a Unified Address into a modern Zcash wallet, the wallet inspects the embedded receivers and automatically selects the most private pool that both wallets support (preferring Orchard > Sapling > Transparent).',
        ],
        codeExample: {
          label: 'Example Mock Unified Address Structure (Educational Sample)',
          code: `u1zlearn9x4k7m2p8q5r3v6w0y1a2b3c4d5e6f7g8h9j0k...
├── [Type 0x03] Orchard Receiver (43 bytes)   ← Preferred Default
├── [Type 0x02] Sapling Receiver (43 bytes)   ← Legacy Shielded Fallback
└── [Type 0x00] Transparent P2PKH (20 bytes)  ← Optional Compatibility`,
        },
      },
    ],
    quickCheck: {
      question: 'When sending to a Unified Address that contains both Orchard and Transparent receivers, which receiver should a modern wallet choose?',
      options: [
        'Transparent, because it has smaller transaction fees',
        'Orchard, because wallets prioritize the newest, most private mutually supported receiver',
        'Both receivers simultaneously in a 50/50 split',
        'Neither; Unified Addresses are only used for viewing keys',
      ],
      correctIndex: 1,
      explanation: 'ZIP-316 wallets automatically select the highest-privacy receiver they support—preferring Orchard first—providing seamless privacy upgrades.',
    },
  },
  {
    id: 'zk-snarks-halo2',
    track: 'cryptography',
    title: 'Zero-Knowledge Proofs, zk-SNARKs & Halo 2',
    duration: '10 min',
    xp: 150,
    summary: 'Understand notes, commitments, nullifiers, and how Halo 2 recursive proofs power trustless shielded transactions.',
    sections: [
      {
        heading: 'Notes, Commitments & Nullifiers',
        paragraphs: [
          'Unlike transparent UTXOs that list an owner and value in plaintext, shielded Zcash uses Notes. A note represents a specific amount of ZEC controlled by a spending key, along with random blinding factors.',
          'When a note is created, only its cryptographic hash—called a Note Commitment—is appended to a global Merkle tree on-chain. When you later spend that note, you publish a unique Nullifier derived from the note and your secret key. Nodes check that the nullifier has never been seen before (preventing double-spends) without learning which commitment in the tree is being spent.',
        ],
      },
      {
        heading: 'What the Halo 2 Proof Proves',
        paragraphs: [
          'Inside an Orchard Action, the sender generates a Halo 2 zero-knowledge proof attesting to several statements simultaneously:',
          '1. The input note exists in the global commitment Merkle tree at a recent anchor state.\n2. The sender holds the spending authority for that note and computed its nullifier honestly.\n3. The sum of input note values equals the sum of output note values plus the transaction fee (value balance conservation).',
        ],
        callout: {
          type: 'emerald',
          title: 'Why Halo 2 Is a Breakthrough',
          body: 'Earlier zk-SNARK systems like Groth16 required a multi-party "trusted setup" ceremony to generate public parameters. Halo 2 uses an inner-product argument over the Pasta curves (Pallas & Vesta), removing the trusted setup completely and enabling recursive proof composition.',
        },
      },
    ],
    quickCheck: {
      question: 'What prevents a user from spending the same shielded note twice without revealing which note commitment is being spent?',
      options: [
        'Publishing a unique cryptographic Nullifier derived from the note and spending key',
        'Revealing the sender address to miners only',
        'Locking the note in a multisig escrow',
        'Encrypting the Merkle tree root with the recipient public key',
      ],
      correctIndex: 0,
      explanation: 'Each note has a deterministic, unique nullifier. Publishing it prevents double-spends while remaining unlinkable to the original note commitment.',
    },
  },
  {
    id: 'viewing-keys',
    track: 'cryptography',
    title: 'Viewing Keys & Selective Disclosure',
    duration: '8 min',
    xp: 130,
    summary: 'Discover how Incoming Viewing Keys (IVKs) and Unified Full Viewing Keys (UFVKs) enable compliant auditing without risking funds.',
    sections: [
      {
        heading: 'Separating Spending Authority from Visibility',
        paragraphs: [
          'In Zcash, cryptographic keys follow a clean hierarchy. At the top is your Spending Key, which can authorize transactions. From it, you can derive Viewing Keys that grant read-only visibility without any ability to spend funds.',
        ],
        table: {
          headers: ['Key Type', 'Can Spend ZEC?', 'Sees Incoming Txs?', 'Sees Outgoing Txs?'],
          rows: [
            ['Spending Key', 'Yes', 'Yes', 'Yes'],
            ['Unified Full Viewing Key (UFVK)', 'No', 'Yes', 'Yes'],
            ['Incoming Viewing Key (IVK)', 'No', 'Yes', 'No'],
            ['Outgoing Viewing Key (OVK)', 'No', 'No', 'Yes'],
          ],
        },
      },
      {
        heading: 'Real-World Selective Disclosure',
        paragraphs: [
          'A nonprofit accepting shielded donations can publish its Incoming Viewing Key to demonstrate total funds received to donors. An enterprise can hand its Unified Full Viewing Key to a tax auditor or accounting tool so every inflow, outflow, and encrypted invoice memo is verifiable—while keeping trade secrets private from competitors.',
        ],
      },
    ],
    quickCheck: {
      question: 'If you share your Unified Full Viewing Key (UFVK) with an accountant, what can they do?',
      options: [
        'View your incoming and outgoing shielded transactions, but NOT spend your ZEC',
        'Move funds to a transparent address on your behalf',
        'Only see your transparent t-address balance',
        'Modify encrypted memos on past transactions',
      ],
      correctIndex: 0,
      explanation: 'A UFVK grants complete read-only visibility into both incoming and outgoing shielded transactions, while spending authority stays strictly with your Spending Key.',
    },
  },
  {
    id: 'encrypted-memos',
    track: 'cryptography',
    title: 'Encrypted Memos & Private Messaging',
    duration: '6 min',
    xp: 110,
    summary: 'See how Zcash shielded outputs include a 512-byte encrypted memo field for invoices, receipts, and censorship-resistant notes.',
    sections: [
      {
        heading: '512 Bytes of Private Context',
        paragraphs: [
          'Every shielded output note in Sapling and Orchard includes a 512-byte encrypted memo field. Unlike OP_RETURN data on transparent chains—which broadcasts plaintext to the entire world—a Zcash memo is encrypted end-to-end using the recipient’s shielded key.',
          'Only the recipient (and anyone holding the corresponding Viewing Key) can decrypt the memo. To public block explorers and network observers, the memo is indistinguishable from random ciphertext.',
        ],
      },
      {
        heading: 'Practical Uses for Encrypted Memos',
        paragraphs: [
          '• Private Invoice Numbers & Accounting Tags: Attach order IDs or tax categories directly to payments.\n• Reply-To Addresses: Because shielded transactions hide the sender address by default, senders can include their own Unified Address in the memo if they want a refund or reply.\n• Censorship-Resistant Communication: Developers build private messaging tools and shielded polls on top of Zcash memos.',
        ],
        callout: {
          type: 'violet',
          title: 'Transparent Outputs Do Not Have Encrypted Memos',
          body: 'Encrypted memos are exclusively a feature of shielded outputs (Sapling and Orchard). If you send a transparent t-to-t transaction, no encrypted memo field exists.',
        },
      },
    ],
    quickCheck: {
      question: 'How large is the encrypted memo field attached to each shielded Zcash output note?',
      options: ['64 bytes', '256 bytes', '512 bytes', '4,096 bytes'],
      correctIndex: 2,
      explanation: 'Each Sapling and Orchard output note carries a 512-byte encrypted memo field, padded to uniform size so observers cannot even infer message length.',
    },
  },
  {
    id: 'zebra-lightwalletd',
    track: 'developer',
    title: 'Zcash Architecture: Zebra & Lightwalletd',
    duration: '9 min',
    xp: 150,
    summary: 'Explore the modern Rust consensus node (Zebra) and how light clients scan shielded transactions privately via Lightwalletd.',
    sections: [
      {
        heading: 'Zebra: The Modern Rust Consensus Node',
        paragraphs: [
          'Developed by the Zcash Foundation, Zebra (zebrad) is an independent, memory-safe, async Rust implementation of the Zcash consensus protocol. It replaces legacy C++ bottlenecks with modular crates for networking, state validation, and zk-SNARK verification.',
        ],
      },
      {
        heading: 'How Light Clients Sync Shielded Notes',
        paragraphs: [
          'Mobile and browser wallets cannot download hundreds of gigabytes of full chain data. Instead, they connect to a Lightwalletd (or Zaino) gRPC server backed by a Zebra node.',
          'Lightwalletd strips full blocks down into "Compact Blocks" containing only note commitments, nullifiers, and ephemeral keys. The wallet downloads compact blocks and performs trial decryption locally on the user’s device—meaning the server never learns which transactions belong to the user.',
        ],
        codeExample: {
          label: 'High-Level Zcash Light Client Stack',
          code: `[Zcash Network P2P]
        │
        ▼
[Zebra (zebrad)]          ← Full Consensus Validation (Rust)
        │ (JSON-RPC)
        ▼
[Lightwalletd / Zaino]    ← Compact Block gRPC Indexer
        │ (CompactBlocks via gRPC)
        ▼
[Wallet SDK / App]        ← Local Trial Decryption & Halo 2 Proving`,
        },
      },
    ],
    quickCheck: {
      question: 'Why does a Zcash light wallet download Compact Blocks and perform trial decryption locally?',
      options: [
        'Because Lightwalletd servers cannot parse JSON',
        'So the server never learns which shielded notes belong to the user’s wallet',
        'To mine new ZEC blocks on mobile phones',
        'To convert shielded notes into transparent UTXOs',
      ],
      correctIndex: 1,
      explanation: 'Local trial decryption preserves receiver privacy: the light client never has to reveal its viewing key or addresses to the Lightwalletd server.',
    },
  },
  {
    id: 'librustzcash-sdks',
    track: 'developer',
    title: 'Building with librustzcash & Wallet SDKs',
    duration: '10 min',
    xp: 160,
    summary: 'Navigate the modular librustzcash workspace crates and official Swift/Kotlin SDKs for building privacy-first Zcash apps.',
    sections: [
      {
        heading: 'The librustzcash Ecosystem',
        paragraphs: [
          'Nearly all modern Zcash wallets and developer tools are powered by librustzcash—a collection of audited Rust crates maintained by Electric Coin Co. and ecosystem contributors:',
          '• zcash_primitives: Core transaction formats, consensus parameters, and builders.\n• orchard & sapling-crypto: Shielded pool circuits, note encryption, and Halo 2 / Groth16 logic.\n• zcash_address: Encoding and decoding Unified Addresses (ZIP-316), transparent, and Sapling addresses.\n• zcash_client_backend & zcash_client_sqlite: Ready-to-use light wallet sync engine, note selection, and SQLite persistence.',
        ],
      },
      {
        heading: 'Mobile & Cross-Platform Integration',
        paragraphs: [
          'For mobile developers, Zcash provides native iOS (zcash-swift-wallet-sdk) and Android (zcash-android-wallet-sdk) wrappers around librustzcash, allowing teams to integrate shielded Orchard payments, ZIP-321 payment URIs, and viewing key exports without hand-rolling cryptography.',
        ],
        callout: {
          type: 'emerald',
          title: 'Developer Best Practice',
          body: 'Always test integrations on Zcash Testnet (TAZ) first, use ZIP-316 Unified Addresses by default, and keep spending keys inside hardware-backed secure enclaves whenever possible.',
        },
      },
    ],
    quickCheck: {
      question: 'Which crate in the librustzcash workspace handles encoding and decoding ZIP-316 Unified Addresses?',
      options: ['zcash_address', 'zcash_miner', 'halo2_http', 'zebra_ui'],
      correctIndex: 0,
      explanation: 'The zcash_address crate provides standardized, spec-compliant parsing and serialization for Unified Addresses, Sapling, and Transparent addresses.',
    },
  },
];

const QUIZZES = [
  {
    id: 'quiz-fundamentals',
    title: 'Zcash Fundamentals',
    track: 'Foundations',
    xp: 150,
    description: 'Test your knowledge of financial privacy, Zcash monetary properties, and selective disclosure.',
    questions: [
      {
        question: 'What is the maximum supply cap of Zcash (ZEC)?',
        options: ['100 million ZEC', '21 million ZEC', 'Unlimited supply', '42 million ZEC'],
        correctIndex: 1,
        explanation: 'Like Bitcoin, Zcash has a fixed monetary cap of 21 million ZEC.',
      },
      {
        question: 'Which statement best describes Zcash’s approach to privacy?',
        options: [
          'Privacy is enforced via centralized mixers',
          'Transactions are private by default in shielded pools, with optional selective disclosure via Viewing Keys',
          'All transactions are permanently public with no encryption',
          'Only amounts are hidden while sender addresses stay public',
        ],
        correctIndex: 1,
        explanation: 'Shielded Zcash transactions hide sender, recipient, amount, and memo while allowing users to share Viewing Keys for selective disclosure.',
      },
      {
        question: 'What happens to transaction metadata when funds move purely inside the Orchard shielded pool?',
        options: [
          'Sender, recipient, amount, and memo are cryptographically shielded on-chain',
          'Only the memo is encrypted',
          'The sender is hidden, but the amount is broadcast in plaintext',
          'The transaction is stored off-chain by validators',
        ],
        correctIndex: 0,
        explanation: 'Fully shielded u-to-u (Orchard) transactions keep sender, recipient, value, and memo encrypted on-chain.',
      },
      {
        question: 'Why is pseudonymous transparency on public blockchains often insufficient for privacy?',
        options: [
          'Addresses expire after 24 hours',
          'Graph analysis, KYC exchange links, and timing heuristics frequently de-anonymize addresses',
          'Public blockchains require legal names in every block header',
          'Miners can edit transaction histories',
        ],
        correctIndex: 1,
        explanation: 'Chain analysis links pseudonymous addresses to real-world entities using clustering, deposit patterns, and exchange KYC data.',
      },
    ],
  },
  {
    id: 'quiz-pools',
    title: 'Shielded Pools & Addresses',
    track: 'Foundations',
    xp: 180,
    description: 'Master Transparent, Sapling, Orchard pools, turnstile rules, and ZIP-316 Unified Addresses.',
    questions: [
      {
        question: 'What prefix identifies a Zcash Mainnet Unified Address (ZIP-316)?',
        options: ['t1', 'zs1', 'u1', '0x'],
        correctIndex: 2,
        explanation: 'Mainnet Unified Addresses begin with u1 and bundle multiple pool receivers in Bech32m format.',
      },
      {
        question: 'Moving ZEC from a Transparent address (t1...) into a Shielded pool (u1...) is called:',
        options: ['Deshielding', 'Shielding', 'Staking', 'Bridging'],
        correctIndex: 1,
        explanation: 'Moving funds from Transparent to a Shielded pool is called shielding.',
      },
      {
        question: 'What is visible on the public ledger during a Deshielding (u1 -> t1) transaction?',
        options: [
          'Nothing at all',
          'The transparent recipient address and the amount exiting the shielded pool',
          'The sender’s original shielded address and full wallet balance',
          'The sender’s private spending key',
        ],
        correctIndex: 1,
        explanation: 'At the pool boundary, the transparent destination address and the amount entering the transparent pool are publicly visible.',
      },
      {
        question: 'Why does Zcash track total value entering and leaving each shielded pool?',
        options: [
          'To publish individual user net worth',
          'To enforce turnstile auditability and ensure no hidden inflation can exit a shielded pool',
          'To calculate staking rewards',
          'To limit transactions to 1 ZEC',
        ],
        correctIndex: 1,
        explanation: 'The turnstile rule guarantees that a shielded pool’s total balance can never drop below zero, preventing counterfeit ZEC from ever escaping a pool.',
      },
    ],
  },
  {
    id: 'quiz-zkp',
    title: 'Zero-Knowledge Proofs & Halo 2',
    track: 'Cryptography',
    xp: 200,
    description: 'Verify your understanding of note commitments, nullifiers, Halo 2, and viewing key hierarchies.',
    questions: [
      {
        question: 'What major cryptographic milestone did Halo 2 bring to Zcash’s Orchard pool?',
        options: [
          'Eliminating the trusted setup ceremony',
          'Replacing SHA-256 with MD5',
          'Removing transaction fees completely',
          'Switching Zcash to a permissioned database',
        ],
        correctIndex: 0,
        explanation: 'Halo 2 eliminated the trusted setup requirement while enabling recursive proof composition.',
      },
      {
        question: 'What is the primary role of a Nullifier in a shielded transaction?',
        options: [
          'To encrypt the 512-byte memo',
          'To prevent double-spending a note without revealing which commitment is being spent',
          'To identify the miner who confirmed the block',
          'To compress Unified Addresses',
        ],
        correctIndex: 1,
        explanation: 'Nullifiers are unique per note; once a nullifier appears in the nullifier set, consensus rejects any second attempt to spend that note.',
      },
      {
        question: 'Which key allows a third party to inspect ONLY incoming shielded funds to an address?',
        options: ['Spending Key', 'Incoming Viewing Key (IVK)', 'Outgoing Viewing Key (OVK)', 'Transparent Private Key'],
        correctIndex: 1,
        explanation: 'An Incoming Viewing Key (IVK) decrypts incoming notes and memos without exposing outgoing transactions or granting spend authority.',
      },
      {
        question: 'Why are all shielded memos padded to 512 bytes?',
        options: [
          'To increase block size artificially',
          'So observers cannot infer message contents or whether a memo was included from ciphertext length',
          'Because Rust strings must be 512 bytes',
          'To store JPEG avatars',
        ],
        correctIndex: 1,
        explanation: 'Uniform 512-byte padding prevents metadata leakage via ciphertext length analysis.',
      },
    ],
  },
  {
    id: 'quiz-dev',
    title: 'Zcash Developer Stack',
    track: 'Developer',
    xp: 200,
    description: 'Assess your readiness with Zebra, Lightwalletd, Compact Blocks, and librustzcash.',
    questions: [
      {
        question: 'What is Zebra (zebrad)?',
        options: [
          'A browser wallet extension',
          'An independent, async Rust full consensus node implementation for Zcash',
          'A hardware wallet manufacturer',
          'A transparent-only block explorer',
        ],
        correctIndex: 1,
        explanation: 'Zebra is the Zcash Foundation’s modern Rust consensus node implementation.',
      },
      {
        question: 'How does a Zcash light wallet preserve privacy when syncing via Lightwalletd?',
        options: [
          'By uploading its Spending Key over HTTPS',
          'By downloading Compact Blocks and running trial decryption locally on the user’s device',
          'By querying balances by transparent address only',
          'By disabling shielded transactions',
        ],
        correctIndex: 1,
        explanation: 'Compact Blocks allow local trial decryption so Lightwalletd never learns which notes belong to the user.',
      },
      {
        question: 'Which librustzcash crate provides light wallet syncing and SQLite storage support?',
        options: ['zcash_client_sqlite', 'zcash_css', 'orchard_sql_miner', 'halo2_rpc'],
        correctIndex: 0,
        explanation: 'zcash_client_sqlite (paired with zcash_client_backend) powers local SQLite wallet state and sync management.',
      },
      {
        question: 'Which network should developers use when testing new Zcash wallet integrations?',
        options: ['Zcash Testnet (TAZ)', 'Mainnet with real user funds', 'Bitcoin Regtest', 'Ethereum Sepolia'],
        correctIndex: 0,
        explanation: 'Zcash Testnet (TAZ) mirrors Mainnet protocol upgrades safely without risking real ZEC.',
      },
    ],
  },
];

const ACHIEVEMENTS_META = [
  {
    id: 'first-lesson',
    title: 'First Step into Privacy',
    description: 'Complete your first lesson in the Learning Academy.',
    xpBonus: 50,
    icon: BookOpen,
    accent: 'emerald',
  },
  {
    id: 'foundations-complete',
    title: 'Foundations Scholar',
    description: 'Complete all 3 lessons in the Foundations track.',
    xpBonus: 120,
    icon: ShieldCheck,
    accent: 'emerald',
  },
  {
    id: 'privacy-explorer',
    title: 'Privacy Explorer',
    description: 'Inspect at least 3 transaction modes in the Privacy Playground.',
    xpBonus: 80,
    icon: Eye,
    accent: 'violet',
  },
  {
    id: 'sandbox-pioneer',
    title: 'Sandbox Pioneer',
    description: 'Run your first local simulation in the Transaction Simulator.',
    xpBonus: 75,
    icon: Send,
    accent: 'emerald',
  },
  {
    id: 'shielded-master',
    title: 'Shielded Master',
    description: 'Simulate a Fully Shielded (u → u) transaction with an encrypted memo.',
    xpBonus: 100,
    icon: Lock,
    accent: 'violet',
  },
  {
    id: 'quiz-ace',
    title: 'Quiz Ace',
    description: 'Score 100% on any challenge in the Quiz Arena.',
    xpBonus: 150,
    icon: Trophy,
    accent: 'amber',
  },
  {
    id: 'dev-ready',
    title: 'Developer Ready',
    description: 'Complete all lessons in the Zcash Developer Track.',
    xpBonus: 150,
    icon: Code2,
    accent: 'sky',
  },
  {
    id: 'zec-graduate',
    title: 'ZecLearn Graduate',
    description: 'Complete all 8 lessons across every track.',
    xpBonus: 300,
    icon: Award,
    accent: 'emerald',
  },
];

const DEV_SNIPPETS = [
  {
    id: 'rust-ua',
    title: 'Parse a ZIP-316 Unified Address (Rust)',
    crate: 'zcash_address',
    language: 'rust',
    code: `use zcash_address::{ZcashAddress, TryFromAddress, Network};

pub fn inspect_address(encoded: &str) -> Result<(), String> {
    let addr = ZcashAddress::try_from_encoded(encoded)
        .map_err(|e| format!("Invalid Zcash address: {:?}", e))?;

    println!("Parsed valid Zcash address: {:?}", addr);
    // Downstream wallet builders inspect receivers in priority order:
    // 1. Orchard (preferred) -> 2. Sapling -> 3. Transparent
    Ok(())
}`,
  },
  {
    id: 'rust-ufvk',
    title: 'Derive Unified Full Viewing Key (Conceptual)',
    crate: 'zcash_keys',
    language: 'rust',
    code: `use zcash_keys::keys::UnifiedSpendingKey;
use zcash_protocol::consensus::TestNetwork;
use zip32::AccountId;

pub fn derive_auditor_ufvk(seed: &[u8]) -> String {
    let account = AccountId::try_from(0).expect("valid account index");
    let usk = UnifiedSpendingKey::from_seed(&TestNetwork, seed, account)
        .expect("valid seed length");

    // Shareable read-only key for accounting / selective disclosure
    let ufvk = usk.to_unified_full_viewing_key();
    ufvk.encode(&TestNetwork)
}`,
  },
  {
    id: 'grpc-sync',
    title: 'Lightwalletd Compact Block Sync Flow',
    crate: 'zcash_client_backend',
    language: 'rust',
    code: `// High-level light client privacy-preserving sync loop:
// 1. Fetch latest block height via Lightwalletd gRPC (GetLatestBlock)
// 2. Stream CompactBlocks in range [last_scanned + 1 .. chain_tip]
// 3. Locally run trial decryption with Incoming Viewing Key (IVK)
// 4. Persist discovered Orchard/Sapling notes & update witness Merkle tree

async fn sync_step(start_height: u64, end_height: u64) {
    // Server only sees block range requests — never your IVK or addresses!
    println!("Streaming compact blocks {}..{}", start_height, end_height);
}`,
  },
];

// Helper: deterministic-looking mock cryptographic strings for educational simulations
function generateMockHex(len = 64) {
  const chars = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function generateMockAddress(type = 'u') {
  const alpha = '023456789acdefghjklmnpqrstuvwxyz';
  const rand = (n) => Array.from({ length: n }, () => alpha[Math.floor(Math.random() * alpha.length)]).join('');
  if (type === 't') return `t1Sim${rand(29)}`;
  if (type === 'zs') return `zs1sim${rand(42)}`;
  return `u1sim${rand(54)}`;
}

// ============================================================================
// 2. STATE CONTEXT & PERSISTENCE (localStorage)
// ============================================================================

const LabContext = createContext(null);

function evaluateAchievements(state) {
  const unlocked = new Set(state.unlockedAchievements || []);
  const completed = state.completedLessons || [];
  const foundationsIds = LESSONS.filter((l) => l.track === 'foundations').map((l) => l.id);
  const devIds = LESSONS.filter((l) => l.track === 'developer').map((l) => l.id);

  if (completed.length >= 1) unlocked.add('first-lesson');
  if (foundationsIds.every((id) => completed.includes(id))) unlocked.add('foundations-complete');
  if ((state.playgroundModesExplored || []).length >= 3) unlocked.add('privacy-explorer');
  if ((state.simulatedTxs || []).length >= 1) unlocked.add('sandbox-pioneer');
  if (
    (state.simulatedTxs || []).some(
      (tx) => tx.type === 'shielded' && tx.memo && tx.memo.trim().length > 0
    )
  ) {
    unlocked.add('shielded-master');
  }
  if (
    Object.values(state.quizResults || {}).some(
      (q) => q.total > 0 && q.bestScore === q.total
    )
  ) {
    unlocked.add('quiz-ace');
  }
  if (devIds.every((id) => completed.includes(id))) unlocked.add('dev-ready');
  if (LESSONS.every((l) => completed.includes(l.id))) unlocked.add('zec-graduate');

  return Array.from(unlocked);
}

function LabProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_STATE,
          ...parsed,
          profile: { ...DEFAULT_STATE.profile, ...(parsed.profile || {}) },
        };
      }
    } catch (err) {
      console.error('Failed to read ZecLearn Lab state from localStorage:', err);
    }
    return DEFAULT_STATE;
  });

  const [toast, setToast] = useState(null);

  const showToast = (title, subtitle, tone = 'emerald') => {
    setToast({ id: Date.now(), title, subtitle, tone });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to persist ZecLearn Lab state:', err);
    }
  }, [state]);

  const updateWithAchievements = (updater) => {
    setState((prev) => {
      const next = updater(prev);
      const nextAchievements = evaluateAchievements(next);
      const newlyUnlocked = nextAchievements.filter(
        (id) => !(prev.unlockedAchievements || []).includes(id)
      );
      if (newlyUnlocked.length > 0) {
        const badge = ACHIEVEMENTS_META.find((a) => a.id === newlyUnlocked[0]);
        if (badge) {
          setTimeout(() => {
            showToast(
              `Achievement Unlocked: ${badge.title}`,
              `+${badge.xpBonus} Bonus XP earned`,
              'violet'
            );
          }, 150);
        }
      }
      return { ...next, unlockedAchievements: nextAchievements };
    });
  };

  const completeLesson = (lessonId) => {
    const lesson = LESSONS.find((l) => l.id === lessonId);
    if (!lesson) return;
    updateWithAchievements((prev) => {
      if (prev.completedLessons.includes(lessonId)) return prev;
      showToast(`Lesson Completed!`, `+${lesson.xp} XP added to your profile`, 'emerald');
      return {
        ...prev,
        completedLessons: [...prev.completedLessons, lessonId],
      };
    });
  };

  const recordQuizResult = (quizId, score, total, xpReward) => {
    updateWithAchievements((prev) => {
      const existing = prev.quizResults[quizId];
      const passed = score / total >= 0.75;
      const firstPass = passed && (!existing || !existing.passed);
      const bestScore = existing ? Math.max(existing.bestScore, score) : score;
      return {
        ...prev,
        extraXp: prev.extraXp + (firstPass ? xpReward : 25),
        quizResults: {
          ...prev.quizResults,
          [quizId]: {
            bestScore,
            total,
            passed: passed || Boolean(existing?.passed),
            attempts: (existing?.attempts || 0) + 1,
          },
        },
      };
    });
  };

  const addSimulatedTx = (tx) => {
    updateWithAchievements((prev) => ({
      ...prev,
      extraXp: prev.extraXp + 20,
      simulatedTxs: [tx, ...prev.simulatedTxs].slice(0, 20),
    }));
  };

  const clearSimulatedTxs = () => {
    setState((prev) => ({ ...prev, simulatedTxs: [] }));
    showToast('Sandbox History Cleared', 'All local simulated receipts were removed.', 'slate');
  };

  const markPlaygroundMode = (mode) => {
    updateWithAchievements((prev) => {
      if (prev.playgroundModesExplored.includes(mode)) return prev;
      return {
        ...prev,
        extraXp: prev.extraXp + 15,
        playgroundModesExplored: [...prev.playgroundModesExplored, mode],
      };
    });
  };

  const updateProfile = (profileData) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...profileData },
    }));
    showToast('Profile Saved', 'Your student profile has been updated locally.', 'emerald');
  };

  const resetProgress = () => {
    setState(DEFAULT_STATE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error(err);
    }
    showToast('Progress Reset', 'Your ZecLearn Lab progress has been reset.', 'slate');
  };

  // Compute XP and Level
  const stats = useMemo(() => {
    const lessonXp = state.completedLessons.reduce((acc, id) => {
      const l = LESSONS.find((item) => item.id === id);
      return acc + (l ? l.xp : 0);
    }, 0);
    const achievementXp = (state.unlockedAchievements || []).reduce((acc, id) => {
      const a = ACHIEVEMENTS_META.find((item) => item.id === id);
      return acc + (a ? a.xpBonus : 0);
    }, 0);
    const totalXp = lessonXp + achievementXp + (state.extraXp || 0);
    const level = Math.floor(totalXp / 300) + 1;
    const currentLevelXp = totalXp % 300;
    const levelProgress = Math.min(100, Math.round((currentLevelXp / 300) * 100));

    const quizEntries = Object.values(state.quizResults || {});
    const passedQuizzes = quizEntries.filter((q) => q.passed).length;
    const avgQuizScore =
      quizEntries.length > 0
        ? Math.round(
            (quizEntries.reduce((acc, q) => acc + q.bestScore / q.total, 0) /
              quizEntries.length) *
              100
          )
        : 0;

    return {
      totalXp,
      level,
      currentLevelXp,
      nextLevelXp: 300,
      levelProgress,
      lessonsCompletedCount: state.completedLessons.length,
      totalLessonsCount: LESSONS.length,
      passedQuizzes,
      totalQuizzes: QUIZZES.length,
      avgQuizScore,
      achievementsCount: (state.unlockedAchievements || []).length,
      totalAchievements: ACHIEVEMENTS_META.length,
    };
  }, [state]);

  return (
    <LabContext.Provider
      value={{
        state,
        stats,
        toast,
        setToast,
        showToast,
        completeLesson,
        recordQuizResult,
        addSimulatedTx,
        clearSimulatedTxs,
        markPlaygroundMode,
        updateProfile,
        resetProgress,
      }}
    >
      {children}
    </LabContext.Provider>
  );
}

function useLab() {
  return useContext(LabContext);
}

// ============================================================================
// 3. SHARED REUSABLE UI COMPONENTS
// ============================================================================

function BrandLogo({ compact = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 text-left group focus:outline-none"
    >
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-violet-500/20 border border-emerald-500/30 shadow-inner group-hover:border-emerald-400/60 transition-colors">
        <img
          src="/zcash-logo.png"
          alt=""
          className="h-7 w-7 rounded-full object-contain"
        />
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="font-semibold tracking-tight text-slate-100 text-base flex items-center gap-1.5">
            ZecLearn <span className="text-emerald-400">Lab</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium tracking-wide">
            Zcash Privacy Academy
          </div>
        </div>
      )}
    </button>
  );
}

function Badge({ children, tone = 'slate', className = '' }) {
  const tones = {
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    violet: 'bg-violet-500/10 text-violet-300 border-violet-500/25',
    sky: 'bg-sky-500/10 text-sky-300 border-sky-500/25',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700/80',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone] || tones.slate} ${className}`}
    >
      {children}
    </span>
  );
}

function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/90 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300 transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied!' : label}
    </button>
  );
}

function ToastBanner() {
  const { toast, setToast } = useLab();
  if (!toast) return null;

  const toneBorder =
    toast.tone === 'violet'
      ? 'border-violet-500/40 bg-[#0F172A]/95'
      : toast.tone === 'emerald'
      ? 'border-emerald-500/40 bg-[#0F172A]/95'
      : 'border-slate-700 bg-[#0F172A]/95';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100vw-2.5rem)] animate-fade-in">
      <div
        className={`flex items-start gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur-md ${toneBorder}`}
      >
        <div
          className={`mt-0.5 rounded-lg p-1.5 ${
            toast.tone === 'violet'
              ? 'bg-violet-500/15 text-violet-300'
              : toast.tone === 'emerald'
              ? 'bg-emerald-500/15 text-emerald-300'
              : 'bg-slate-800 text-slate-300'
          }`}
        >
          {toast.tone === 'violet' ? (
            <Award className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-100">{toast.title}</p>
          {toast.subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">{toast.subtitle}</p>
          )}
        </div>
        <button
          onClick={() => setToast(null)}
          className="text-slate-500 hover:text-slate-300 transition-colors"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 4. LANDING PAGE
// ============================================================================

function LandingPage({ navigate }) {
  const [previewMode, setPreviewMode] = useState('shielded');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Subtle Top Grid & Radial Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[920px] rounded-full bg-emerald-500/[0.07] blur-[120px]" />
        <div className="absolute top-60 right-0 h-[420px] w-[520px] rounded-full bg-violet-500/[0.06] blur-[120px]" />
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#050814]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          <BrandLogo onClick={() => navigate('landing')} />

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <button onClick={() => scrollToSection('intro')} className="hover:text-emerald-400 transition-colors">
              Why Zcash
            </button>
            <button onClick={() => scrollToSection('paths')} className="hover:text-emerald-400 transition-colors">
              Learning Paths
            </button>
            <button onClick={() => scrollToSection('playground-preview')} className="hover:text-emerald-400 transition-colors">
              Playground
            </button>
            <button onClick={() => scrollToSection('developers')} className="hover:text-emerald-400 transition-colors">
              Developers
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('overview')}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('academy')}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
            >
              Start Learning
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden rounded-lg p-2 text-slate-300 hover:bg-slate-800/70"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800/80 bg-[#0B1120] px-4 py-4 space-y-2">
            {['intro', 'paths', 'playground-preview', 'developers'].map((sec) => (
              <button
                key={sec}
                onClick={() => scrollToSection(sec)}
                className="block w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/70 capitalize"
              >
                {sec.replace('-', ' ')}
              </button>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => navigate('overview')}
                className="w-full rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200"
              >
                Open Dashboard
              </button>
              <button
                onClick={() => navigate('academy')}
                className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950"
              >
                Start Learning
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 sm:pt-28 sm:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-300 mb-7">
            <Sparkles className="h-3.5 w-3.5" />
            Interactive Zcash & Zero-Knowledge Developer Education
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1]">
            Learn Privacy.{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-violet-400 bg-clip-text text-transparent">
              Explore Zcash.
            </span>{' '}
            Build the Future.
          </h1>

          <p className="mt-6 mx-auto max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
            Master shielded pools, Halo 2 zero-knowledge proofs, Unified Addresses, and Rust wallet
            architecture through hands-on simulations, interactive sandboxes, and structured developer tracks.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('overview')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-7 py-3.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20"
            >
              Start Learning Free
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('playground')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-[#0B1120] px-7 py-3.5 text-sm font-semibold text-slate-200 hover:border-violet-500/50 hover:text-white transition-all"
            >
              <Eye className="h-4 w-4 text-violet-400" />
              Try Privacy Playground
            </button>
          </div>

          {/* Crisp Telemetry Strip */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: 'Original Lessons', value: '8 Modules' },
              { label: 'Interactive Labs', value: 'Playground + Sim' },
              { label: 'Knowledge Checks', value: '4 Quiz Arenas' },
              { label: 'Progress Saved', value: 'Local & Private' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-800/80 bg-[#0B1120]/70 px-4 py-3 text-left"
              >
                <div className="text-sm font-semibold text-slate-100">{item.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Introduction to Zcash */}
      <section id="intro" className="relative py-20 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <Badge tone="emerald">Protocol Foundations</Badge>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Privacy engineered at the consensus layer.
            </h2>
            <p className="mt-3 text-slate-400 leading-relaxed">
              Zcash combines battle-tested monetary soundness with cutting-edge zero-knowledge cryptography,
              giving individuals and organizations verifiable financial confidentiality.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Layers,
                accent: 'emerald',
                title: 'Transparent vs. Shielded Pools',
                body: 'Understand how Zcash separates legacy transparent UTXOs (t-addrs) from modern Orchard shielded notes (u-addrs), and why pool boundaries enforce turnstile auditability.',
              },
              {
                icon: Cpu,
                accent: 'violet',
                title: 'zk-SNARKs & Halo 2',
                body: 'Verify transactions mathematically without revealing sender, receiver, or amount. Halo 2 removes the trusted setup entirely using recursive proofs over Pasta curves.',
              },
              {
                icon: Key,
                accent: 'sky',
                title: 'Selective Disclosure via Viewing Keys',
                body: 'Privacy and compliance coexist. Share read-only Incoming or Unified Full Viewing Keys with auditors and counterparties without ever exposing spending authority.',
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="group rounded-2xl border border-slate-800/80 bg-[#0B1120]/80 p-6 hover:border-slate-700 transition-all"
                >
                  <div
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${
                      card.accent === 'emerald'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : card.accent === 'violet'
                        ? 'border-violet-500/30 bg-violet-500/10 text-violet-400'
                        : 'border-sky-500/30 bg-sky-500/10 text-sky-400'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">{card.title}</h3>
                  <p className="mt-2.5 text-sm text-slate-400 leading-relaxed">{card.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Playground Preview */}
      <section
        id="playground-preview"
        className="relative py-20 border-t border-slate-800/80 bg-[#0B1120]/40 px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Badge tone="violet">Interactive Preview • Educational Simulation</Badge>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-white">
                See what a public block explorer actually sees.
              </h2>
              <p className="mt-3 text-slate-400">
                Toggle between a Transparent and a Fully Shielded Orchard transfer to inspect on-chain
                metadata exposure in real time.
              </p>
            </div>

            <div className="inline-flex rounded-xl border border-slate-800 bg-[#050814] p-1 self-start">
              <button
                onClick={() => setPreviewMode('transparent')}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                  previewMode === 'transparent'
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Transparent (t → t)
              </button>
              <button
                onClick={() => setPreviewMode('shielded')}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                  previewMode === 'shielded'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Shielded Orchard (u → u)
              </button>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Public Observer Panel */}
            <div className="rounded-2xl border border-slate-800/90 bg-[#050814] p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <Eye className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-200">
                    Public Block Explorer View
                  </span>
                </div>
                <Badge tone={previewMode === 'shielded' ? 'emerald' : 'rose'}>
                  {previewMode === 'shielded' ? 'Zero Metadata Leaked' : 'Fully Exposed'}
                </Badge>
              </div>

              <div className="mt-5 space-y-3 font-mono text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-lg bg-[#0B1120] border border-slate-800/80 p-3">
                  <span className="text-slate-500">Sender</span>
                  <span className={previewMode === 'shielded' ? 'text-emerald-400' : 'text-rose-300'}>
                    {previewMode === 'shielded'
                      ? '[SHIELDED — Nullifier 0x9f3a...c81e]'
                      : 't1SimAlice8x9kP2mQ7rV4wZ1...'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-lg bg-[#0B1120] border border-slate-800/80 p-3">
                  <span className="text-slate-500">Recipient</span>
                  <span className={previewMode === 'shielded' ? 'text-emerald-400' : 'text-rose-300'}>
                    {previewMode === 'shielded'
                      ? '[SHIELDED — Commitment 0x4b1d...72fa]'
                      : 't1SimBob3n5yT8uK2pL9xM4...'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-lg bg-[#0B1120] border border-slate-800/80 p-3">
                  <span className="text-slate-500">Amount</span>
                  <span className={previewMode === 'shielded' ? 'text-emerald-400' : 'text-rose-300'}>
                    {previewMode === 'shielded' ? '[ENCRYPTED — Halo 2 Proof Valid]' : '14.50 ZEC'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-lg bg-[#0B1120] border border-slate-800/80 p-3">
                  <span className="text-slate-500">Memo</span>
                  <span className={previewMode === 'shielded' ? 'text-violet-300' : 'text-slate-500'}>
                    {previewMode === 'shielded'
                      ? '[512-byte Ciphertext Blob]'
                      : 'Not supported on transparent outputs'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recipient Panel */}
            <div className="rounded-2xl border border-emerald-500/20 bg-[#050814] p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <Key className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-slate-200">
                    Recipient / Viewing Key Holder
                  </span>
                </div>
                <Badge tone="emerald">Authorized Decryption</Badge>
              </div>

              <div className="mt-5 space-y-3 font-mono text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-lg bg-[#0B1120] border border-slate-800/80 p-3">
                  <span className="text-slate-500">Pool</span>
                  <span className="text-slate-200">
                    {previewMode === 'shielded' ? 'Orchard Shielded Pool' : 'Transparent UTXO Pool'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-lg bg-[#0B1120] border border-slate-800/80 p-3">
                  <span className="text-slate-500">Decrypted Amount</span>
                  <span className="text-emerald-300 font-semibold">14.50 ZEC</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-lg bg-[#0B1120] border border-slate-800/80 p-3">
                  <span className="text-slate-500">Decrypted Memo</span>
                  <span className="text-slate-200">
                    {previewMode === 'shielded'
                      ? '"Invoice #2049 — Security Audit Milestone 2"'
                      : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-sans text-xs text-slate-400">
                    Want to customize addresses, amounts & Auditor IVK views?
                  </span>
                  <button
                    onClick={() => navigate('playground')}
                    className="font-sans inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    Open Full Playground
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Paths Showcase */}
      <section id="paths" className="relative py-20 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Badge tone="emerald">Structured Curriculum</Badge>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Three tracks from privacy basics to Rust SDKs.
              </h2>
            </div>
            <button
              onClick={() => navigate('academy')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Browse All 8 Lessons
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRACKS.map((track) => {
              const trackLessons = LESSONS.filter((l) => l.track === track.id);
              const totalXp = trackLessons.reduce((sum, l) => sum + l.xp, 0);
              return (
                <div
                  key={track.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-[#0B1120]/80 p-6 hover:border-slate-700 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <Badge tone={track.color}>{track.name}</Badge>
                      <span className="text-xs font-mono text-slate-400">
                        {trackLessons.length} lessons • {totalXp} XP
                      </span>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-white">{track.tagline}</h3>
                    <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                      {track.description}
                    </p>
                    <ul className="mt-5 space-y-2 border-t border-slate-800/80 pt-4">
                      {trackLessons.map((lesson) => (
                        <li key={lesson.id} className="flex items-center gap-2 text-xs text-slate-300">
                          <ChevronRight className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{lesson.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => navigate('academy', { trackFilter: track.id })}
                    className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-[#050814] px-4 py-2.5 text-sm font-semibold text-slate-200 hover:border-emerald-500/40 hover:text-emerald-300 transition-colors"
                  >
                    Start {track.name}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Developer Learning Section */}
      <section
        id="developers"
        className="relative py-20 border-t border-slate-800/80 bg-[#0B1120]/40 px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <Badge tone="sky">Developer Hub</Badge>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Built for engineers shipping privacy-first apps.
            </h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              Explore the modern Rust-native Zcash stack—from Zebra consensus nodes and Lightwalletd
              gRPC indexers to modular `librustzcash` crates and ZIP-316 Unified Address tooling.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { name: 'Zebra (zebrad)', desc: 'Async Rust full node' },
                { name: 'librustzcash', desc: 'Core Rust crates' },
                { name: 'Lightwalletd', desc: 'Compact block gRPC' },
                { name: 'ZIP-316 UAs', desc: 'Unified Addresses' },
              ].map((tool) => (
                <div
                  key={tool.name}
                  className="rounded-xl border border-slate-800/80 bg-[#050814] p-3.5"
                >
                  <div className="text-sm font-semibold text-slate-100 font-mono">{tool.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{tool.desc}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('devhub')}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-white transition-colors"
            >
              <Terminal className="h-4 w-4" />
              Explore Developer Hub
            </button>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-800 bg-[#050814] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/90 bg-[#0B1120]">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                  <span className="ml-2 font-mono text-xs text-slate-400">
                    src/viewing_key.rs — librustzcash
                  </span>
                </div>
                <CopyButton text={DEV_SNIPPETS[1].code} />
              </div>
              <pre className="p-5 text-xs sm:text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed">
                <code>{DEV_SNIPPETS[1].code}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Community & GitHub Links */}
      <footer className="border-t border-slate-800/80 bg-[#050814] py-14 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <BrandLogo onClick={() => navigate('landing')} />
            <p className="mt-3 max-w-md text-xs text-slate-500 leading-relaxed">
              ZecLearn Lab is an educational sandbox and curriculum for learning Zcash privacy
              architecture. All playgrounds and simulators run locally in your browser without
              touching real funds or live networks.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-400">
            {[
              { label: 'Zcash Foundation', href: 'https://zfnd.org' },
              { label: 'Electric Coin Co.', href: 'https://electriccoin.co' },
              { label: 'Zcash GitHub', href: 'https://github.com/zcash' },
              { label: 'Zcash R&D Discord', href: 'https://discord.gg/zcash' },
              { label: 'ZIP Specifications', href: 'https://zips.z.cash' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors"
              >
                {link.label}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// 5. DASHBOARD LAYOUT & RESPONSIVE SIDEBAR
// ============================================================================

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'academy', label: 'Learn Zcash', icon: BookOpen },
  { id: 'playground', label: 'Privacy Playground', icon: Eye },
  { id: 'simulator', label: 'Transaction Simulator', icon: Send },
  { id: 'quiz', label: 'Quiz Arena', icon: Trophy },
  { id: 'devhub', label: 'Developer Hub', icon: Terminal },
  { id: 'profile', label: 'My Achievements', icon: Award },
];

function DashboardLayout({ currentPage, navigate, children }) {
  const { state, stats } = useLab();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeNavId = currentPage === 'lesson' ? 'academy' : currentPage;

  const SidebarContent = () => (
    <div className="flex h-full flex-col justify-between bg-[#0B1120] border-r border-slate-800/80">
      <div>
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800/80">
          <BrandLogo onClick={() => navigate('landing')} />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* XP / Level Widget */}
        <div className="p-4">
          <div className="rounded-xl border border-slate-800/90 bg-[#050814] p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/15 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                  L{stats.level}
                </span>
                <span className="text-xs font-semibold text-slate-200 truncate max-w-[110px]">
                  {state.profile.name}
                </span>
              </div>
              <span className="font-mono text-xs font-semibold text-emerald-400">
                {stats.totalXp} XP
              </span>
            </div>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-violet-500 transition-all duration-500"
                style={{ width: `${stats.levelProgress}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
              <span>{stats.currentLevelXp} / 300 XP</span>
              <span>Level {stats.level + 1}</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeNavId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSidebarOpen(false);
                  navigate(item.id);
                }}
                className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/12 text-emerald-300 border border-emerald-500/25 shadow-sm'
                    : 'text-slate-400 border border-transparent hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Back to Landing */}
      <div className="p-4 border-t border-slate-800/80">
        <button
          onClick={() => {
            setSidebarOpen(false);
            navigate('landing');
          }}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-[#050814] px-3.5 py-2.5 text-xs font-medium text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Landing Page
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b border-slate-800/80 bg-[#050814]/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-300 hover:bg-slate-800"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <BrandLogo compact onClick={() => navigate('overview')} />
            <span className="text-sm font-semibold text-slate-200">ZecLearn Lab</span>
          </div>
          <Badge tone="emerald">{stats.totalXp} XP</Badge>
        </header>

        <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// 6. STUDENT DASHBOARD (OVERVIEW)
// ============================================================================

function OverviewPage({ navigate }) {
  const { state, stats } = useLab();

  const nextLesson = LESSONS.find((l) => !state.completedLessons.includes(l.id));
  const recentAchievements = ACHIEVEMENTS_META.filter((a) =>
    state.unlockedAchievements.includes(a.id)
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-[#0B1120] via-[#0B1120] to-emerald-950/25 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Badge tone="emerald">Level {stats.level} Scholar</Badge>
              <span className="text-xs text-slate-400">{state.profile.role}</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, {state.profile.name}
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Continue mastering Zcash zero-knowledge privacy, shielded pools, and developer tooling.
            </p>
          </div>
          <button
            onClick={() => navigate('academy')}
            className="self-start sm:self-center inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-colors"
          >
            Go to Academy
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Course Completion Progress</span>
            <span className="font-mono text-emerald-400">
              {Math.round((stats.lessonsCompletedCount / stats.totalLessonsCount) * 100)}% (
              {stats.lessonsCompletedCount}/{stats.totalLessonsCount} lessons)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800/90 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-300 transition-all duration-500"
              style={{
                width: `${(stats.lessonsCompletedCount / stats.totalLessonsCount) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total XP Earned',
            value: `${stats.totalXp} XP`,
            sub: `Level ${stats.level} • ${300 - stats.currentLevelXp} XP to next`,
            icon: Zap,
            tone: 'emerald',
          },
          {
            label: 'Lessons Completed',
            value: `${stats.lessonsCompletedCount} / ${stats.totalLessonsCount}`,
            sub: `${stats.totalLessonsCount - stats.lessonsCompletedCount} remaining`,
            icon: BookOpen,
            tone: 'sky',
          },
          {
            label: 'Quiz Performance',
            value: stats.avgQuizScore > 0 ? `${stats.avgQuizScore}%` : '—',
            sub: `${stats.passedQuizzes} / ${stats.totalQuizzes} quizzes passed`,
            icon: Trophy,
            tone: 'violet',
          },
          {
            label: 'Achievements',
            value: `${stats.achievementsCount} / ${stats.totalAchievements}`,
            sub: 'Unlock badges as you learn',
            icon: Award,
            tone: 'amber',
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-800/80 bg-[#0B1120] p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                <Icon
                  className={`h-4 w-4 ${
                    stat.tone === 'emerald'
                      ? 'text-emerald-400'
                      : stat.tone === 'violet'
                      ? 'text-violet-400'
                      : stat.tone === 'sky'
                      ? 'text-sky-400'
                      : 'text-amber-400'
                  }`}
                />
              </div>
              <div className="mt-3 text-2xl font-bold text-white tracking-tight">{stat.value}</div>
              <div className="mt-1 text-xs text-slate-500">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Continue Learning + Interactive Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          {/* Continue Learning Card */}
          <div className="rounded-2xl border border-slate-800/80 bg-[#0B1120] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Continue Learning</h2>
              <Badge tone="emerald">Recommended Next</Badge>
            </div>

            {nextLesson ? (
              <div className="mt-4 rounded-xl border border-slate-800 bg-[#050814] p-5">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="capitalize text-emerald-400 font-medium">
                    {nextLesson.track}
                  </span>
                  <span>•</span>
                  <span>{nextLesson.duration}</span>
                  <span>•</span>
                  <span className="font-mono text-emerald-300">+{nextLesson.xp} XP</span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-white">{nextLesson.title}</h3>
                <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">
                  {nextLesson.summary}
                </p>
                <button
                  onClick={() => navigate('lesson', { lessonId: nextLesson.id })}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-colors"
                >
                  <Play className="h-4 w-4" />
                  Start Lesson
                </button>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                  <CheckCircle2 className="h-5 w-5" />
                  All Academy Lessons Completed!
                </div>
                <p className="mt-1.5 text-sm text-slate-300">
                  Outstanding work. Test your mastery in the Quiz Arena or explore the Developer Hub.
                </p>
                <button
                  onClick={() => navigate('quiz')}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950"
                >
                  Enter Quiz Arena
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Quick-Launch Interactive Labs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('playground')}
              className="text-left group rounded-2xl border border-slate-800/80 bg-[#0B1120] p-5 hover:border-violet-500/40 transition-all"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/25">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white group-hover:text-violet-300 transition-colors">
                Privacy Playground
              </h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Compare Transparent, Shielded, and Auditor IVK views side-by-side.
              </p>
            </button>

            <button
              onClick={() => navigate('simulator')}
              className="text-left group rounded-2xl border border-slate-800/80 bg-[#0B1120] p-5 hover:border-emerald-500/40 transition-all"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                <Send className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white group-hover:text-emerald-300 transition-colors">
                Transaction Simulator
              </h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Build local sandbox transactions with simulated Halo 2 proof steps.
              </p>
            </button>
          </div>
        </div>

        {/* Recent Achievements Panel */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800/80 bg-[#0B1120] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Recent Achievements</h2>
              <button
                onClick={() => navigate('profile')}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
              >
                View All
              </button>
            </div>

            {recentAchievements.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-800 bg-[#050814]/60 p-8 text-center">
                <Award className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="mt-3 text-sm font-medium text-slate-300">No achievements yet</p>
                <p className="mt-1 text-xs text-slate-500">
                  Complete your first lesson or run a sandbox transaction to unlock your first badge.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {recentAchievements.slice(0, 4).map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div
                      key={badge.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#050814] p-3.5"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-slate-100 truncate">
                          {badge.title}
                        </div>
                        <div className="text-xs text-slate-400 truncate">{badge.description}</div>
                      </div>
                      <span className="font-mono text-xs text-emerald-400">+{badge.xpBonus}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Local simulations run</span>
            <span className="font-mono text-slate-200">{state.simulatedTxs.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 7. LEARNING ACADEMY (LEARN ZCASH)
// ============================================================================

function LearningAcademyPage({ navigate, initialTrack = 'all' }) {
  const { state } = useLab();
  const [search, setSearch] = useState('');
  const [selectedTrack, setSelectedTrack] = useState(initialTrack);

  useEffect(() => {
    setSelectedTrack(initialTrack);
  }, [initialTrack]);

  const filteredLessons = useMemo(() => {
    return LESSONS.filter((lesson) => {
      const matchesTrack = selectedTrack === 'all' || lesson.track === selectedTrack;
      const q = search.trim().toLowerCase();
      const matchesQuery =
        !q ||
        lesson.title.toLowerCase().includes(q) ||
        lesson.summary.toLowerCase().includes(q);
      return matchesTrack && matchesQuery;
    });
  }, [search, selectedTrack]);

  return (
    <div className="space-y-8">
      <div>
        <Badge tone="emerald">Learning Academy</Badge>
        <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Master Zcash Protocol & Privacy Engineering
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">
          Work through 8 structured lessons spanning financial privacy fundamentals, Halo 2
          cryptography, and the modern Rust Zcash developer stack.
        </p>
      </div>

      {/* Search & Track Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lessons (e.g., Halo 2, Unified Addresses, Zebra)..."
            className="w-full rounded-xl border border-slate-800 bg-[#0B1120] pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Tracks' },
            { id: 'foundations', label: 'Foundations' },
            { id: 'cryptography', label: 'Cryptography' },
            { id: 'developer', label: 'Developer' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTrack(tab.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all border ${
                selectedTrack === tab.id
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                  : 'bg-[#0B1120] text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lesson Grid */}
      {filteredLessons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-[#0B1120]/50 p-12 text-center">
          <BookOpen className="h-8 w-8 text-slate-600 mx-auto" />
          <p className="mt-3 text-sm font-semibold text-slate-300">No matching lessons found</p>
          <p className="mt-1 text-xs text-slate-500">
            Try clearing your search query or switching to All Tracks.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedTrack('all');
            }}
            className="mt-4 rounded-lg border border-slate-700 px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:border-emerald-500/40"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredLessons.map((lesson, idx) => {
            const isCompleted = state.completedLessons.includes(lesson.id);
            const trackMeta = TRACKS.find((t) => t.id === lesson.track);
            return (
              <div
                key={lesson.id}
                className={`group flex flex-col justify-between rounded-2xl border p-6 transition-all ${
                  isCompleted
                    ? 'border-emerald-500/30 bg-[#0B1120]'
                    : 'border-slate-800/80 bg-[#0B1120] hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone={trackMeta?.color || 'slate'}>
                      {trackMeta?.name || lesson.track}
                    </Badge>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Circle className="h-3.5 w-3.5" />
                        Not Started
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-emerald-300 transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">{lesson.summary}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span>{lesson.duration}</span>
                    <span>•</span>
                    <span className="text-emerald-400">+{lesson.xp} XP</span>
                  </div>
                  <button
                    onClick={() => navigate('lesson', { lessonId: lesson.id })}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/90 px-3.5 py-2 text-xs font-semibold text-slate-100 hover:bg-emerald-500 hover:text-slate-950 transition-colors"
                  >
                    {isCompleted ? 'Review Lesson' : 'Open Lesson'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 8. INDIVIDUAL LESSON PAGE
// ============================================================================

function LessonViewPage({ lessonId, navigate }) {
  const { state, completeLesson } = useLab();
  const lessonIndex = LESSONS.findIndex((l) => l.id === lessonId);
  const lesson = LESSONS[lessonIndex] || LESSONS[0];

  const [selectedOption, setSelectedOption] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setSelectedOption(null);
    setChecked(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lessonId]);

  const isCompleted = state.completedLessons.includes(lesson.id);
  const prevLesson = lessonIndex > 0 ? LESSONS[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < LESSONS.length - 1 ? LESSONS[lessonIndex + 1] : null;
  const trackMeta = TRACKS.find((t) => t.id === lesson.track);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('academy')}
        className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Learning Academy
      </button>

      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge tone={trackMeta?.color || 'emerald'}>{trackMeta?.name}</Badge>
          <span className="text-xs text-slate-400">{lesson.duration} read</span>
          <span className="text-xs text-slate-600">•</span>
          <span className="font-mono text-xs text-emerald-400">+{lesson.xp} XP</span>
          {isCompleted && <Badge tone="emerald">Completed</Badge>}
        </div>
        <h1 className="mt-4 text-2xl sm:text-4xl font-bold tracking-tight text-white">
          {lesson.title}
        </h1>
        <p className="mt-3 text-base text-slate-400 leading-relaxed">{lesson.summary}</p>
      </div>

      {/* Rich Content Sections */}
      <div className="space-y-8">
        {lesson.sections.map((section, idx) => (
          <section key={idx} className="space-y-4">
            <h2 className="text-xl font-semibold text-white">{section.heading}</h2>

            {section.paragraphs?.map((p, pIdx) => (
              <p
                key={pIdx}
                className="text-sm sm:text-base text-slate-300 leading-7 whitespace-pre-line"
              >
                {p}
              </p>
            ))}

            {section.table && (
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0B1120]">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-slate-800 bg-[#050814] text-slate-400">
                    <tr>
                      {section.table.headers.map((h) => (
                        <th key={h} className="px-4 py-3 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {section.table.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-900/40">
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`px-4 py-3 ${
                              cIdx === 0 ? 'font-semibold text-slate-100' : 'text-slate-300'
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {section.codeExample && (
              <div className="rounded-xl border border-slate-800 bg-[#050814] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-[#0B1120]">
                  <span className="text-xs font-mono text-slate-400">
                    {section.codeExample.label}
                  </span>
                  <CopyButton text={section.codeExample.code} />
                </div>
                <pre className="p-4 text-xs sm:text-sm font-mono text-emerald-300/90 overflow-x-auto leading-relaxed">
                  <code>{section.codeExample.code}</code>
                </pre>
              </div>
            )}

            {section.callout && (
              <div
                className={`rounded-xl border p-4 sm:p-5 ${
                  section.callout.type === 'violet'
                    ? 'border-violet-500/30 bg-violet-500/[0.07]'
                    : 'border-emerald-500/30 bg-emerald-500/[0.07]'
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Info
                    className={`h-4 w-4 ${
                      section.callout.type === 'violet' ? 'text-violet-400' : 'text-emerald-400'
                    }`}
                  />
                  {section.callout.title}
                </div>
                <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">
                  {section.callout.body}
                </p>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Embedded Quick Check */}
      {lesson.quickCheck && (
        <div className="rounded-2xl border border-slate-800 bg-[#0B1120] p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-400">
            <HelpCircle className="h-4 w-4" />
            Quick Comprehension Check
          </div>
          <h3 className="mt-2.5 text-base font-semibold text-white">
            {lesson.quickCheck.question}
          </h3>

          <div className="mt-4 space-y-2.5">
            {lesson.quickCheck.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === lesson.quickCheck.correctIndex;
              let style = 'border-slate-800 bg-[#050814] text-slate-300 hover:border-slate-700';
              if (checked) {
                if (isCorrect) style = 'border-emerald-500/50 bg-emerald-500/15 text-emerald-200';
                else if (isSelected && !isCorrect)
                  style = 'border-rose-500/50 bg-rose-500/15 text-rose-200';
              } else if (isSelected) {
                style = 'border-violet-500/50 bg-violet-500/15 text-white';
              }

              return (
                <button
                  key={idx}
                  disabled={checked}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-all ${style}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            {!checked ? (
              <button
                disabled={selectedOption === null}
                onClick={() => setChecked(true)}
                className="rounded-xl bg-violet-500 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Check Answer
              </button>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-[#050814] p-3.5 text-xs text-slate-300 leading-relaxed flex-1">
                <span
                  className={`font-semibold ${
                    selectedOption === lesson.quickCheck.correctIndex
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  {selectedOption === lesson.quickCheck.correctIndex
                    ? 'Correct! '
                    : 'Good try — '}
                </span>
                {lesson.quickCheck.explanation}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completion & Navigation Footer */}
      <div className="rounded-2xl border border-slate-800 bg-[#0B1120] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">
            {isCompleted ? 'Lesson Completed' : 'Finished reading this lesson?'}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {isCompleted
              ? `You earned +${lesson.xp} XP for this module.`
              : `Mark complete to earn +${lesson.xp} XP and track your progress.`}
          </div>
        </div>

        <button
          onClick={() => completeLesson(lesson.id)}
          disabled={isCompleted}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
            isCompleted
              ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 cursor-default'
              : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {isCompleted ? 'Completed' : `Mark Complete (+${lesson.xp} XP)`}
        </button>
      </div>

      <div className="flex items-center justify-between pt-2">
        {prevLesson ? (
          <button
            onClick={() => navigate('lesson', { lessonId: prevLesson.id })}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0B1120] px-4 py-2.5 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous: {prevLesson.title.slice(0, 24)}...
          </button>
        ) : (
          <div />
        )}

        {nextLesson && (
          <button
            onClick={() => navigate('lesson', { lessonId: nextLesson.id })}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0B1120] px-4 py-2.5 text-xs font-semibold text-emerald-400 hover:border-emerald-500/40"
          >
            Next: {nextLesson.title.slice(0, 24)}...
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 9. PRIVACY PLAYGROUND
// ============================================================================

const PLAYGROUND_MODES = [
  {
    id: 'transparent',
    label: 'Transparent (t → t)',
    badge: 'Public Ledger',
    tone: 'rose',
    score: 10,
    summary: 'Behaves like a transparent UTXO chain. Sender, receiver, and amount are visible to everyone.',
  },
  {
    id: 'shielding',
    label: 'Shielding (t → u)',
    badge: 'Entering Shielded Pool',
    tone: 'amber',
    score: 60,
    summary: 'Sender t-address and deposit amount are visible at the turnstile; recipient & memo are shielded.',
  },
  {
    id: 'shielded',
    label: 'Fully Shielded (u → u)',
    badge: 'Orchard zk-SNARK',
    tone: 'emerald',
    score: 100,
    summary: 'Maximum privacy. Sender, recipient, amount, and 512-byte memo are all cryptographically hidden.',
  },
  {
    id: 'auditor',
    label: 'Auditor View (IVK)',
    badge: 'Selective Disclosure',
    tone: 'violet',
    score: 95,
    summary: 'Public observers still see zero metadata, while an authorized auditor with an IVK can verify incoming funds.',
  },
];

function PrivacyPlaygroundPage() {
  const { markPlaygroundMode } = useLab();
  const [mode, setMode] = useState('shielded');
  const [sender, setSender] = useState('Alice (Treasury)');
  const [receiver, setReceiver] = useState('Bob (Security Auditor)');
  const [amount, setAmount] = useState('25.00');
  const [memo, setMemo] = useState('Q4 Penetration Test Retainer — Ref #882');

  useEffect(() => {
    markPlaygroundMode(mode);
  }, [mode]);

  const activeMeta = PLAYGROUND_MODES.find((m) => m.id === mode);

  const isSenderPublic = mode === 'transparent' || mode === 'shielding';
  const isReceiverPublic = mode === 'transparent';
  const isAmountPublic = mode === 'transparent' || mode === 'shielding';
  const supportsMemo = mode !== 'transparent';

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Badge tone="violet">Interactive Educational Simulation</Badge>
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Zcash Privacy Playground
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Customize transaction inputs and switch pool modes to inspect exactly what public
            observers see versus authorized key holders.
          </p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PLAYGROUND_MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`text-left rounded-xl border p-4 transition-all ${
              mode === m.id
                ? 'border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/5'
                : 'border-slate-800/80 bg-[#0B1120] hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">{m.label}</span>
              <span className="font-mono text-xs text-slate-400">{m.score}/100</span>
            </div>
            <div className="mt-1.5 text-xs text-slate-400">{m.badge}</div>
          </button>
        ))}
      </div>

      {/* Live Input Controls */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#0B1120] p-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Live Simulation Parameters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Sender Label</label>
            <input
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-[#050814] px-3 py-2 text-sm text-slate-100 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Recipient Label
            </label>
            <input
              type="text"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-[#050814] px-3 py-2 text-sm text-slate-100 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Amount (ZEC)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-[#050814] px-3 py-2 text-sm font-mono text-slate-100 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Encrypted Memo {mode === 'transparent' && '(Disabled for t-addr)'}
            </label>
            <input
              type="text"
              disabled={!supportsMemo}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-[#050814] px-3 py-2 text-sm text-slate-100 disabled:opacity-40 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Public Ledger Panel */}
        <div className="rounded-2xl border border-slate-800 bg-[#0B1120] p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-white">
                What Public Observers See on the Ledger
              </h2>
            </div>
            <Badge tone={activeMeta.tone}>{activeMeta.badge}</Badge>
          </div>

          <div className="mt-5 space-y-3 font-mono text-xs">
            <div className="rounded-xl border border-slate-800 bg-[#050814] p-3.5">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span>SENDER INPUT</span>
                <span className={isSenderPublic ? 'text-rose-400' : 'text-emerald-400'}>
                  {isSenderPublic ? 'VISIBLE' : 'SHIELDED'}
                </span>
              </div>
              <div className={isSenderPublic ? 'text-rose-300' : 'text-emerald-400'}>
                {isSenderPublic
                  ? `t1Sim... (${sender || 'Sender'})`
                  : 'Nullifier: 0x7e4c19a8...f03b (Unlinkable)'}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#050814] p-3.5">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span>RECIPIENT OUTPUT</span>
                <span className={isReceiverPublic ? 'text-rose-400' : 'text-emerald-400'}>
                  {isReceiverPublic ? 'VISIBLE' : 'SHIELDED'}
                </span>
              </div>
              <div className={isReceiverPublic ? 'text-rose-300' : 'text-emerald-400'}>
                {isReceiverPublic
                  ? `t1Sim... (${receiver || 'Recipient'})`
                  : 'Note Commitment: 0x3b81d2c4...99ea (Orchard)'}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#050814] p-3.5">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span>TRANSACTION AMOUNT</span>
                <span className={isAmountPublic ? 'text-amber-400' : 'text-emerald-400'}>
                  {isAmountPublic ? 'VISIBLE AT BOUNDARY' : 'SHIELDED'}
                </span>
              </div>
              <div className={isAmountPublic ? 'text-amber-300' : 'text-emerald-400'}>
                {isAmountPublic
                  ? `${amount || '0.00'} ZEC`
                  : 'Value Commitment + Halo 2 zk-SNARK Proof ✓'}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#050814] p-3.5">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span>MEMO FIELD</span>
                <span className="text-violet-400">
                  {supportsMemo ? 'ENCRYPTED (512B)' : 'N/A'}
                </span>
              </div>
              <div className="text-slate-400 truncate">
                {supportsMemo
                  ? '0xa8f19c02d47e6b319c8e4a1102f9d8c7...'
                  : 'Transparent pool does not support encrypted memos'}
              </div>
            </div>
          </div>
        </div>

        {/* Authorized Party Panel */}
        <div className="rounded-2xl border border-emerald-500/25 bg-[#0B1120] p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">
                {mode === 'auditor'
                  ? 'What the Auditor Sees (with Incoming Viewing Key)'
                  : 'What Authorized Wallet Parties See'}
              </h2>
            </div>
            <Badge tone="emerald">
              {mode === 'auditor' ? 'Read-Only IVK' : 'Decrypted Locally'}
            </Badge>
          </div>

          <div className="mt-5 space-y-3 font-mono text-xs">
            <div className="rounded-xl border border-slate-800 bg-[#050814] p-3.5">
              <div className="text-slate-500 mb-1">RECIPIENT</div>
              <div className="text-slate-100">{receiver || 'Recipient'}</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#050814] p-3.5">
              <div className="text-slate-500 mb-1">VERIFIED AMOUNT</div>
              <div className="text-emerald-300 font-semibold text-sm">{amount || '0.00'} ZEC</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#050814] p-3.5">
              <div className="text-slate-500 mb-1">DECRYPTED MEMO</div>
              <div className="text-slate-200 font-sans text-xs">
                {supportsMemo ? memo || '(Empty memo)' : 'Not available in transparent mode'}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#050814] p-3.5">
              <div className="text-slate-500 mb-1">SPENDING CAPABILITY</div>
              <div className="text-slate-300 font-sans text-xs">
                {mode === 'auditor'
                  ? 'Read-Only: Auditor can verify incoming note & memo, but CANNOT spend funds or see outgoing transfers.'
                  : 'Only the holder of the Spending Key can authorize future spends of this note.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Score Breakdown */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#0B1120] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Privacy Score & Metadata Leakage Analysis
            </h3>
            <p className="mt-1 text-xs text-slate-400">{activeMeta.summary}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-36 h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  activeMeta.score >= 90
                    ? 'bg-emerald-400'
                    : activeMeta.score >= 50
                    ? 'bg-amber-400'
                    : 'bg-rose-400'
                }`}
                style={{ width: `${activeMeta.score}%` }}
              />
            </div>
            <span className="font-mono text-sm font-bold text-white">{activeMeta.score}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 10. TRANSACTION SIMULATOR
// ============================================================================

const SIM_TYPES = [
  { id: 'transparent', label: 'Transparent (t → t)', fromType: 't', toType: 't', memoAllowed: false },
  { id: 'shielding', label: 'Shielding (t → u)', fromType: 't', toType: 'u', memoAllowed: true },
  { id: 'deshielding', label: 'Deshielding (u → t)', fromType: 'u', toType: 't', memoAllowed: false },
  { id: 'shielded', label: 'Fully Shielded (u → u)', fromType: 'u', toType: 'u', memoAllowed: true },
];

const SIM_STEPS = [
  'Building Orchard / Note Commitments...',
  'Generating Simulated Halo 2 zk-SNARK Proof...',
  'Verifying Nullifier Uniqueness...',
  'Recorded in Local Educational Sandbox!',
];

function TransactionSimulatorPage() {
  const { state, addSimulatedTx, clearSimulatedTxs } = useLab();
  const [txType, setTxType] = useState('shielded');
  const [senderAddr, setSenderAddr] = useState(() => generateMockAddress('u'));
  const [recipientAddr, setRecipientAddr] = useState(() => generateMockAddress('u'));
  const [amount, setAmount] = useState('3.25');
  const [memo, setMemo] = useState('Shielded sandbox transfer test');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStepIdx, setSimStepIdx] = useState(0);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [receiptView, setReceiptView] = useState('public'); // 'public' | 'private'

  const typeMeta = SIM_TYPES.find((t) => t.id === txType);

  const handleTypeChange = (newType) => {
    setTxType(newType);
    const meta = SIM_TYPES.find((t) => t.id === newType);
    setSenderAddr(generateMockAddress(meta.fromType));
    setRecipientAddr(generateMockAddress(meta.toType));
  };

  const handleSimulate = (e) => {
    e.preventDefault();
    if (isSimulating) return;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    setIsSimulating(true);
    setSimStepIdx(0);
    setActiveReceipt(null);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step < SIM_STEPS.length) {
        setSimStepIdx(step);
      } else {
        clearInterval(interval);
        const receipt = {
          id: `sim_tx_${generateMockHex(12)}`,
          txHash: generateMockHex(64),
          nullifier: txType === 'transparent' ? null : `0x${generateMockHex(32)}`,
          commitment: txType === 'transparent' || txType === 'deshielding' ? null : `0x${generateMockHex(32)}`,
          type: txType,
          typeLabel: typeMeta.label,
          senderAddr,
          recipientAddr,
          amount: numericAmount.toFixed(4),
          fee: '0.0001',
          memo: typeMeta.memoAllowed ? memo.trim() : '',
          timestamp: new Date().toLocaleTimeString(),
        };
        addSimulatedTx(receipt);
        setActiveReceipt(receipt);
        setIsSimulating(false);
      }
    }, 550);
  };

  return (
    <div className="space-y-8">
      {/* Explicit Local Sandbox Disclaimer Banner */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.08] px-4 py-3 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200/90 leading-relaxed">
          <span className="font-semibold text-amber-300">Local Sandbox Simulation:</span> No real
          ZEC is moved, no real zk-SNARK is broadcast, and no live blockchain is queried. All
          addresses and hashes are locally generated educational mocks.
        </p>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Transaction Simulator
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Construct a simulated Zcash transaction, step through proof generation, and inspect the
          resulting ledger receipt.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Builder Form */}
        <form
          onSubmit={handleSimulate}
          className="lg:col-span-6 rounded-2xl border border-slate-800/80 bg-[#0B1120] p-6 space-y-5"
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              Transaction Pool Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SIM_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTypeChange(t.id)}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all text-left ${
                    txType === t.id
                      ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                      : 'border-slate-800 bg-[#050814] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-400">
                Simulated Sender ({typeMeta.fromType === 'u' ? 'Unified u1...' : 'Transparent t1...'})
              </label>
              <button
                type="button"
                onClick={() => setSenderAddr(generateMockAddress(typeMeta.fromType))}
                className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300"
              >
                <RefreshCw className="h-3 w-3" />
                Randomize
              </button>
            </div>
            <input
              type="text"
              value={senderAddr}
              onChange={(e) => setSenderAddr(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-[#050814] px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-400">
                Simulated Recipient ({typeMeta.toType === 'u' ? 'Unified u1...' : 'Transparent t1...'})
              </label>
              <button
                type="button"
                onClick={() => setRecipientAddr(generateMockAddress(typeMeta.toType))}
                className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300"
              >
                <RefreshCw className="h-3 w-3" />
                Randomize
              </button>
            </div>
            <input
              type="text"
              value={recipientAddr}
              onChange={(e) => setRecipientAddr(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-[#050814] px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Amount (Simulated ZEC)
              </label>
              <input
                type="number"
                step="0.0001"
                min="0.0001"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-[#050814] px-3.5 py-2.5 text-sm font-mono text-slate-100 focus:border-emerald-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                ZIP-317 Simulated Fee
              </label>
              <input
                type="text"
                readOnly
                value="0.0001 ZEC"
                className="w-full rounded-xl border border-slate-800 bg-[#050814]/60 px-3.5 py-2.5 text-sm font-mono text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Encrypted Memo {typeMeta.memoAllowed ? '(Up to 512 bytes)' : '(Requires Shielded Output)'}
            </label>
            <textarea
              rows={2}
              disabled={!typeMeta.memoAllowed}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder={
                typeMeta.memoAllowed
                  ? 'Optional encrypted note for the recipient...'
                  : 'Switch to Shielding or Fully Shielded to attach an encrypted memo'
              }
              className="w-full rounded-xl border border-slate-800 bg-[#050814] px-3.5 py-2.5 text-xs text-slate-100 disabled:opacity-40 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSimulating}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60 transition-all shadow-lg shadow-emerald-500/20"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Simulating Proof...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Simulate Proof & Broadcast
              </>
            )}
          </button>
        </form>

        {/* Live Proof Progress / Receipt Viewer */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800/80 bg-[#0B1120] p-6 flex flex-col">
          {isSimulating ? (
            <div className="my-auto py-8 space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <Cpu className="h-5 w-5 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    Running Local Sandbox Pipeline
                  </div>
                  <div className="text-xs text-slate-400">Educational simulation in progress</div>
                </div>
              </div>

              <div className="space-y-2.5">
                {SIM_STEPS.map((stepText, idx) => (
                  <div
                    key={stepText}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-xs transition-all ${
                      idx < simStepIdx
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        : idx === simStepIdx
                        ? 'border-violet-500/40 bg-violet-500/10 text-white'
                        : 'border-slate-800/60 bg-[#050814]/50 text-slate-600'
                    }`}
                  >
                    {idx < simStepIdx ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : idx === simStepIdx ? (
                      <RefreshCw className="h-4 w-4 text-violet-400 animate-spin shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0" />
                    )}
                    <span>{stepText}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : activeReceipt ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div>
                  <Badge tone="emerald">Simulated Receipt Ready</Badge>
                  <div className="mt-1.5 text-sm font-semibold text-white">
                    {activeReceipt.typeLabel}
                  </div>
                </div>

                <div className="inline-flex rounded-lg border border-slate-800 bg-[#050814] p-1">
                  <button
                    onClick={() => setReceiptView('public')}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                      receiptView === 'public'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Public Ledger
                  </button>
                  <button
                    onClick={() => setReceiptView('private')}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                      receiptView === 'private'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Private Decrypted
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="rounded-lg bg-[#050814] border border-slate-800 p-3">
                  <div className="text-slate-500 mb-1">SIMULATED TXID</div>
                  <div className="text-slate-300 break-all">{activeReceipt.txHash}</div>
                </div>

                <div className="rounded-lg bg-[#050814] border border-slate-800 p-3">
                  <div className="text-slate-500 mb-1">SENDER</div>
                  <div className="text-slate-200 break-all">
                    {receiptView === 'public' &&
                    (activeReceipt.type === 'shielded' || activeReceipt.type === 'deshielding')
                      ? `[SHIELDED — Nullifier ${activeReceipt.nullifier}]`
                      : activeReceipt.senderAddr}
                  </div>
                </div>

                <div className="rounded-lg bg-[#050814] border border-slate-800 p-3">
                  <div className="text-slate-500 mb-1">RECIPIENT</div>
                  <div className="text-slate-200 break-all">
                    {receiptView === 'public' &&
                    (activeReceipt.type === 'shielded' || activeReceipt.type === 'shielding')
                      ? `[SHIELDED — Commitment ${activeReceipt.commitment}]`
                      : activeReceipt.recipientAddr}
                  </div>
                </div>

                <div className="rounded-lg bg-[#050814] border border-slate-800 p-3 flex items-center justify-between">
                  <span className="text-slate-500">AMOUNT</span>
                  <span className="text-emerald-300 font-semibold">
                    {receiptView === 'public' && activeReceipt.type === 'shielded'
                      ? '[SHIELDED BY HALO 2 PROOF]'
                      : `${activeReceipt.amount} ZEC`}
                  </span>
                </div>

                {activeReceipt.memo && (
                  <div className="rounded-lg bg-[#050814] border border-slate-800 p-3">
                    <div className="text-slate-500 mb-1">MEMO</div>
                    <div className="text-violet-300">
                      {receiptView === 'public'
                        ? '[512-byte Encrypted Ciphertext]'
                        : activeReceipt.memo}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="my-auto py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#050814] text-slate-500">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-200">
                No Active Simulation Receipt
              </h3>
              <p className="mt-1.5 text-xs text-slate-500 max-w-xs mx-auto">
                Configure a transaction on the left and click &ldquo;Simulate Proof &amp; Broadcast&rdquo; to
                inspect how Zcash handles shielded and transparent receipts.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Persisted Local Sandbox History */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#0B1120] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Local Sandbox History</h2>
            <p className="text-xs text-slate-400">
              Persisted locally in your browser ({state.simulatedTxs.length} simulated receipts)
            </p>
          </div>
          {state.simulatedTxs.length > 0 && (
            <button
              onClick={clearSimulatedTxs}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400 hover:border-rose-500/40 hover:text-rose-300 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear History
            </button>
          )}
        </div>

        {state.simulatedTxs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 bg-[#050814]/60 p-8 text-center text-xs text-slate-500">
            No simulated transactions yet. Run your first simulation above to earn +20 XP and unlock
            the Sandbox Pioneer badge.
          </div>
        ) : (
          <div className="space-y-2.5">
            {state.simulatedTxs.map((tx) => (
              <button
                key={tx.id}
                onClick={() => setActiveReceipt(tx)}
                className="w-full text-left flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-800 bg-[#050814] px-4 py-3 hover:border-emerald-500/35 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Badge tone={tx.type === 'shielded' ? 'emerald' : tx.type === 'transparent' ? 'rose' : 'amber'}>
                    {tx.typeLabel}
                  </Badge>
                  <span className="font-mono text-xs text-slate-400 truncate">
                    {tx.txHash.slice(0, 18)}...
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                  <span className="text-emerald-300 font-semibold">{tx.amount} ZEC</span>
                  <span className="text-slate-500">{tx.timestamp}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 11. QUIZ ARENA
// ============================================================================

function QuizArenaPage() {
  const { state, recordQuizResult } = useLab();
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [submittedAnswer, setSubmittedAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const activeQuiz = QUIZZES.find((q) => q.id === activeQuizId);

  const startQuiz = (id) => {
    setActiveQuizId(id);
    setQIndex(0);
    setSelectedOpt(null);
    setSubmittedAnswer(false);
    setScore(0);
    setFinished(false);
  };

  const handleSubmitAnswer = () => {
    if (selectedOpt === null || submittedAnswer) return;
    const isCorrect = selectedOpt === activeQuiz.questions[qIndex].correctIndex;
    if (isCorrect) setScore((s) => s + 1);
    setSubmittedAnswer(true);
  };

  const handleNext = () => {
    if (qIndex + 1 < activeQuiz.questions.length) {
      setQIndex((i) => i + 1);
      setSelectedOpt(null);
      setSubmittedAnswer(false);
    } else {
      const finalScore = score;
      recordQuizResult(activeQuiz.id, finalScore, activeQuiz.questions.length, activeQuiz.xp);
      setFinished(true);
    }
  };

  // Active Quiz View
  if (activeQuiz) {
    if (finished) {
      const pct = Math.round((score / activeQuiz.questions.length) * 100);
      const passed = pct >= 75;
      return (
        <div className="max-w-2xl mx-auto rounded-2xl border border-slate-800 bg-[#0B1120] p-8 text-center space-y-5">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border ${
              passed
                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                : 'border-amber-500/40 bg-amber-500/15 text-amber-400'
            }`}
          >
            <Trophy className="h-8 w-8" />
          </div>
          <div>
            <Badge tone={passed ? 'emerald' : 'amber'}>
              {passed ? 'Quiz Passed!' : 'Keep Practicing'}
            </Badge>
            <h2 className="mt-3 text-2xl font-bold text-white">{activeQuiz.title}</h2>
            <p className="mt-2 text-sm text-slate-400">
              You scored{' '}
              <span className="font-mono font-bold text-white">
                {score} / {activeQuiz.questions.length} ({pct}%)
              </span>
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#050814] p-4 text-xs text-slate-300">
            {passed
              ? `Great job! Your score has been saved and XP has been awarded to your profile.`
              : `Score at least 75% to pass this quiz and earn the full +${activeQuiz.xp} XP bonus.`}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => startQuiz(activeQuiz.id)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#050814] px-5 py-2.5 text-sm font-semibold text-slate-200 hover:border-emerald-500/40"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </button>
            <button
              onClick={() => setActiveQuizId(null)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Back to Quiz Arena
            </button>
          </div>
        </div>
      );
    }

    const currentQ = activeQuiz.questions[qIndex];
    const progressPct = Math.round(((qIndex + 1) / activeQuiz.questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveQuizId(null)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Exit Quiz
          </button>
          <span className="font-mono text-xs text-slate-400">
            Question {qIndex + 1} of {activeQuiz.questions.length}
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-violet-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0B1120] p-6 sm:p-8 space-y-6">
          <div>
            <Badge tone="violet">{activeQuiz.title}</Badge>
            <h2 className="mt-3 text-lg sm:text-xl font-semibold text-white leading-snug">
              {currentQ.question}
            </h2>
          </div>

          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOpt === idx;
              const isCorrect = idx === currentQ.correctIndex;
              let cls = 'border-slate-800 bg-[#050814] text-slate-300 hover:border-slate-700';
              if (submittedAnswer) {
                if (isCorrect) cls = 'border-emerald-500/50 bg-emerald-500/15 text-emerald-200';
                else if (isSelected && !isCorrect)
                  cls = 'border-rose-500/50 bg-rose-500/15 text-rose-200';
              } else if (isSelected) {
                cls = 'border-emerald-500/50 bg-emerald-500/10 text-white';
              }

              return (
                <button
                  key={idx}
                  disabled={submittedAnswer}
                  onClick={() => setSelectedOpt(idx)}
                  className={`w-full text-left rounded-xl border px-4 py-3.5 text-sm transition-all ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {submittedAnswer && (
            <div className="rounded-xl border border-slate-800 bg-[#050814] p-4 text-xs text-slate-300 leading-relaxed">
              <span
                className={`font-semibold ${
                  selectedOpt === currentQ.correctIndex ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {selectedOpt === currentQ.correctIndex ? 'Correct! ' : 'Not quite. '}
              </span>
              {currentQ.explanation}
            </div>
          )}

          <div className="flex justify-end">
            {!submittedAnswer ? (
              <button
                disabled={selectedOpt === null}
                onClick={handleSubmitAnswer}
                className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-40 transition-colors"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-colors"
              >
                {qIndex + 1 < activeQuiz.questions.length ? 'Next Question' : 'View Final Score'}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Quiz Selection Grid
  return (
    <div className="space-y-8">
      <div>
        <Badge tone="violet">Quiz Arena</Badge>
        <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Test Your Zcash Knowledge
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">
          Pass themed quizzes (75%+ score) to earn XP, track your mastery, and unlock the Quiz Ace
          badge with a 100% score.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {QUIZZES.map((quiz) => {
          const result = state.quizResults[quiz.id];
          const bestPct = result ? Math.round((result.bestScore / result.total) * 100) : null;
          return (
            <div
              key={quiz.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-[#0B1120] p-6"
            >
              <div>
                <div className="flex items-center justify-between">
                  <Badge tone="slate">{quiz.track}</Badge>
                  {result?.passed ? (
                    <Badge tone="emerald">Passed • {bestPct}%</Badge>
                  ) : result ? (
                    <Badge tone="amber">Best: {bestPct}%</Badge>
                  ) : (
                    <span className="font-mono text-xs text-emerald-400">+{quiz.xp} XP</span>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{quiz.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{quiz.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">
                  {quiz.questions.length} questions
                </span>
                <button
                  onClick={() => startQuiz(quiz.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors"
                >
                  {result ? 'Retake Quiz' : 'Start Quiz'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// 12. DEVELOPER HUB
// ============================================================================

const UA_SEGMENTS = [
  {
    id: 'hrp',
    label: 'u1',
    name: 'Human-Readable Prefix',
    bytes: 'Bech32m HRP',
    tone: 'slate',
    desc: 'Identifies a Mainnet Unified Address (Testnet uses utest1). Bech32m checksums prevent typos.',
  },
  {
    id: 'orchard',
    label: '0x03 • Orchard Receiver',
    name: 'Orchard Shielded Receiver (43 bytes)',
    bytes: 'Typecode 0x03',
    tone: 'emerald',
    desc: 'Preferred modern shielded pool powered by Halo 2. Contains diversifier + diversified transmission key.',
  },
  {
    id: 'sapling',
    label: '0x02 • Sapling Receiver',
    name: 'Sapling Shielded Receiver (43 bytes)',
    bytes: 'Typecode 0x02',
    tone: 'violet',
    desc: 'Backwards-compatible shielded receiver for wallets that have not yet upgraded to Orchard.',
  },
  {
    id: 'transparent',
    label: '0x00 • Transparent (Optional)',
    name: 'Transparent P2PKH Receiver (20 bytes)',
    bytes: 'Typecode 0x00',
    tone: 'amber',
    desc: 'Optional legacy receiver for exchanges that only withdraw to transparent addresses. Modern privacy wallets omit it when not needed.',
  },
];

function DeveloperHubPage() {
  const [activeTab, setActiveTab] = useState('architecture');
  const [selectedUaPart, setSelectedUaPart] = useState('orchard');

  const activeUa = UA_SEGMENTS.find((s) => s.id === selectedUaPart);

  return (
    <div className="space-y-8">
      <div>
        <Badge tone="sky">Developer Hub</Badge>
        <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Zcash Engineering Reference
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">
          Inspect the Zcash Rust stack, dissect ZIP-316 Unified Addresses, and copy starter code
          patterns for privacy-preserving wallets.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'architecture', label: 'Ecosystem Architecture', icon: Database },
          { id: 'ua-anatomy', label: 'Unified Address Anatomy', icon: Layers },
          { id: 'snippets', label: 'Code Snippets', icon: FileCode },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all border ${
                activeTab === tab.id
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                  : 'border-slate-800 bg-[#0B1120] text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Architecture */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                name: 'Zebra (zebrad)',
                tag: 'Consensus Node',
                tone: 'emerald',
                desc: 'Memory-safe, async Rust full node maintained by the Zcash Foundation. Validates blocks, Halo 2 proofs, and serves JSON-RPC for indexers.',
                link: 'https://github.com/ZcashFoundation/zebra',
              },
              {
                name: 'Lightwalletd / Zaino',
                tag: 'gRPC Indexer',
                tone: 'sky',
                desc: 'Transforms full blocks into Compact Blocks so light wallets can sync shielded notes privately via local trial decryption.',
                link: 'https://github.com/zcash/lightwalletd',
              },
              {
                name: 'librustzcash',
                tag: 'Core Rust Crates',
                tone: 'violet',
                desc: 'Workspace containing zcash_primitives, zcash_address, zcash_keys, and zcash_client_backend for building custom wallets and tools.',
                link: 'https://github.com/zcash/librustzcash',
              },
              {
                name: 'Mobile Wallet SDKs',
                tag: 'iOS & Android',
                tone: 'amber',
                desc: 'Official Swift and Kotlin SDKs wrapping librustzcash with FFI bindings, secure key storage hooks, and Orchard sync pipelines.',
                link: 'https://zcash.readthedocs.io',
              },
            ].map((item) => (
              <div
                key={item.name}
                className="rounded-2xl border border-slate-800/80 bg-[#0B1120] p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white font-mono">{item.name}</h3>
                    <Badge tone={item.tone}>{item.tag}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  Open Official Repository / Docs
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Interactive ZIP-316 Unified Address Anatomy */}
      {activeTab === 'ua-anatomy' && (
        <div className="rounded-2xl border border-slate-800/80 bg-[#0B1120] p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Interactive Unified Address (ZIP-316) Inspector
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Click any receiver segment below to inspect how ZIP-316 encodes multiple value pools
              into a single address.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-[#050814] p-4 font-mono text-xs">
            {UA_SEGMENTS.map((seg) => (
              <button
                key={seg.id}
                onClick={() => setSelectedUaPart(seg.id)}
                className={`rounded-lg border px-3 py-2 transition-all ${
                  selectedUaPart === seg.id
                    ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-md'
                    : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {seg.label}
              </button>
            ))}
          </div>

          {activeUa && (
            <div className="rounded-xl border border-slate-800 bg-[#050814] p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">{activeUa.name}</h3>
                <Badge tone={activeUa.tone}>{activeUa.bytes}</Badge>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{activeUa.desc}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Copyable Code Snippets */}
      {activeTab === 'snippets' && (
        <div className="space-y-5">
          {DEV_SNIPPETS.map((snippet) => (
            <div
              key={snippet.id}
              className="rounded-2xl border border-slate-800 bg-[#050814] overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 border-b border-slate-800 bg-[#0B1120]">
                <div className="flex items-center gap-2.5">
                  <Code2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">{snippet.title}</span>
                  <Badge tone="slate">{snippet.crate}</Badge>
                </div>
                <CopyButton text={snippet.code} />
              </div>
              <pre className="p-5 text-xs sm:text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed">
                <code>{snippet.code}</code>
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 13. STUDENT PROFILE & ACHIEVEMENTS
// ============================================================================

function ProfileAchievementsPage() {
  const { state, stats, updateProfile, resetProgress } = useLab();
  const [name, setName] = useState(state.profile.name);
  const [role, setRole] = useState(state.profile.role);
  const [bio, setBio] = useState(state.profile.bio);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    setName(state.profile.name);
    setRole(state.profile.role);
    setBio(state.profile.bio);
  }, [state.profile]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || 'Zcash Explorer',
      role: role.trim() || 'Privacy Learner',
      bio: bio.trim(),
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <Badge tone="emerald">Student Profile & Achievements</Badge>
        <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Your ZecLearn Lab Progress
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Customize your local student profile, review unlocked badges, and track completion across
          tracks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editable Profile Form */}
        <form
          onSubmit={handleSaveProfile}
          className="lg:col-span-5 rounded-2xl border border-slate-800/80 bg-[#0B1120] p-6 space-y-4"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/25 to-violet-500/25 border border-emerald-500/30 text-emerald-300">
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="text-base font-semibold text-white">{state.profile.name}</div>
              <div className="text-xs text-emerald-400 font-mono">
                Level {stats.level} • {stats.totalXp} XP
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-[#050814] px-3.5 py-2 text-sm text-slate-100 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Role / Focus</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-[#050814] px-3.5 py-2 text-sm text-slate-100 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Short Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-[#050814] px-3.5 py-2 text-sm text-slate-100 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-colors"
          >
            Save Profile Locally
          </button>
        </form>

        {/* Track Breakdown & Danger Zone */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-800/80 bg-[#0B1120] p-6 space-y-4">
            <h2 className="text-base font-semibold text-white">Learning Breakdown by Track</h2>
            <div className="space-y-4">
              {TRACKS.map((track) => {
                const trackLessons = LESSONS.filter((l) => l.track === track.id);
                const done = trackLessons.filter((l) =>
                  state.completedLessons.includes(l.id)
                ).length;
                const pct = Math.round((done / trackLessons.length) * 100);
                return (
                  <div key={track.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200">{track.name}</span>
                      <span className="font-mono text-slate-400">
                        {done} / {trackLessons.length} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          track.color === 'emerald'
                            ? 'bg-emerald-400'
                            : track.color === 'violet'
                            ? 'bg-violet-400'
                            : 'bg-sky-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-rose-500/20 bg-[#0B1120] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Reset Local Progress</h3>
              <p className="mt-1 text-xs text-slate-400">
                Clear all completed lessons, XP, quiz scores, achievements, and sandbox history.
              </p>
            </div>
            <button
              onClick={() => setShowResetModal(true)}
              className="shrink-0 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
            >
              Reset All Progress
            </button>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Achievements &amp; Badges ({stats.achievementsCount} / {stats.totalAchievements})
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ACHIEVEMENTS_META.map((badge) => {
            const unlocked = state.unlockedAchievements.includes(badge.id);
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`rounded-2xl border p-5 transition-all ${
                  unlocked
                    ? 'border-emerald-500/35 bg-[#0B1120]'
                    : 'border-slate-800/70 bg-[#0B1120]/50 opacity-65'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                      unlocked
                        ? 'border-emerald-500/35 bg-emerald-500/15 text-emerald-400'
                        : 'border-slate-800 bg-[#050814] text-slate-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge tone={unlocked ? 'emerald' : 'slate'}>
                    {unlocked ? 'Unlocked' : 'Locked'}
                  </Badge>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-white">{badge.title}</h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">{badge.description}</p>
                <div className="mt-3 font-mono text-[11px] text-emerald-400">
                  +{badge.xpBonus} Bonus XP
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inline Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0B1120] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-base font-semibold text-white">Reset All Progress?</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              This will permanently clear your locally saved lessons, XP, quiz scores, achievements,
              and simulated transactions from this browser.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetProgress();
                  setShowResetModal(false);
                }}
                className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-400"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 14. MAIN APP ROOT & STATE-BASED NAVIGATION
// ============================================================================

function ZecLearnRouter() {
  const [route, setRoute] = useState({ page: 'landing', params: {} });

  const navigate = (page, params = {}) => {
    setRoute({ page, params });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderDashboardPage = () => {
    switch (route.page) {
      case 'overview':
        return <OverviewPage navigate={navigate} />;
      case 'academy':
        return (
          <LearningAcademyPage
            navigate={navigate}
            initialTrack={route.params?.trackFilter || 'all'}
          />
        );
      case 'lesson':
        return (
          <LessonViewPage
            lessonId={route.params?.lessonId || LESSONS[0].id}
            navigate={navigate}
          />
        );
      case 'playground':
        return <PrivacyPlaygroundPage />;
      case 'simulator':
        return <TransactionSimulatorPage />;
      case 'quiz':
        return <QuizArenaPage />;
      case 'devhub':
        return <DeveloperHubPage />;
      case 'profile':
        return <ProfileAchievementsPage />;
      default:
        return <OverviewPage navigate={navigate} />;
    }
  };

  return (
    <>
      {route.page === 'landing' ? (
        <LandingPage navigate={navigate} />
      ) : (
        <DashboardLayout currentPage={route.page} navigate={navigate}>
          {renderDashboardPage()}
        </DashboardLayout>
      )}
      <ToastBanner />
    </>
  );
}

export default function App() {
  return (
    <LabProvider>
      <ZecLearnRouter />
    </LabProvider>
  );
}