# Henverse Presale

Prototype single-page presale UI (no smart contract).

Overview
- Single-page poultry farm-themed presale UI.
- Users connect their wallets (MetaMask/WalletConnect) on Cronos chain and send CRO to the receiver address to participate.
- Contributions are logged to Supabase to show history and compute expected $HENS allocation on TGE.

Presale economics
- Total $HENS supply: 100,000,000
- Presale allocation: 50% (50,000,000 $HENS)
- Final tokens per CRO are calculated after the presale based on total CRO contributed.

Receiver address
- CRO receiver: `0x46914D5DC59598801e435AF2a08928Da87C60dF0`

Local dev
1. Install deps: `npm install`
2. Dev server: `npm run dev`

Env vars (.env)
- VITE_SUPABASE_URL=
- VITE_SUPABASE_ANON_KEY=

Database schema (Supabase SQL)

Create a table to log contributions:

CREATE TABLE contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address text NOT NULL,
  tx_hash text NOT NULL,
  amount_cro numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

Create claims table (optional):

CREATE TABLE claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address text NOT NULL,
  claimed boolean DEFAULT false,
  claimed_at timestamptz
);

Notes
- This prototype uses client-side transaction sending (ethers.js) to transfer CRO to the receiver address — NO token contract is used here.
- Token distribution calculations are done from the contributions logged in Supabase.
- On TGE, we (or a script) will compute each user's share and proceed with token distribution off-chain or by other means.

Design notes
- The UI is a single-page farm: chickens lay eggs, some eggs lie on the ground with a human character that opens the purchase modal on click; a shed opens the user's balance & history.

Next steps implemented in repo
- Basic Vite + React scaffold
- Farm canvas skeleton and placeholders
- Supabase client and schemas
- Wallet & transaction helper utilities (in `src/lib`) — **WalletConnect is now supported** using `@walletconnect/web3-provider`. Run `npm install` to fetch the new dependency, then use the human "Buy" flow to connect via QR or MetaMask.

Supabase test notes
- I added functions to record claims and compute expected tokens in `src/lib/supabase.ts`.
- Open the Shed (click the shed in the farm) to connect your wallet, view your contributions and expected $HENS, and press **Claim tokens** to record a claim in the `claims` table.
- `.env` now contains the credentials you provided (keep them private).

Troubleshooting: Blank / white page on production
- If you see console errors like `Uncaught ReferenceError: global is not defined`, or provider errors such as `MetaMask encountered an error setting the global Ethereum provider` or `Cannot redefine property: ethereum`, it is usually caused by:
  - A dependency that expects Node globals (fixed by adding a small `global` polyfill in `src/main.tsx`).
  - Multiple browser wallet extensions both trying to inject `window.ethereum` (try disabling other wallet extensions or test in a clean browser profile).
- We lazy-load WalletConnect and added an `ErrorBoundary` to show a friendly error message; if the app still shows a blank page, paste the first console error here and I'll propose a targeted fix.
