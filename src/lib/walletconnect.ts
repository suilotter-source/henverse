import { ethers } from 'ethers'

// Cronos public RPC for WalletConnect; you may want to use your own RPC endpoint
const RPC = {
  25: 'https://evm-cronos.crypto.org'
}

export async function connectWalletConnect(){
  // Dynamically import the WalletConnect provider so it doesn't bloat/introduce Node-only shims
  const mod = await import('@walletconnect/web3-provider')
  const WalletConnectProvider = (mod as any).default
  const provider = new (WalletConnectProvider as any)({ rpc: RPC })
  // opens QR modal in browsers
  await provider.enable()
  const web3Provider = new ethers.BrowserProvider(provider)
  const signer = await web3Provider.getSigner()
  const address = await signer.getAddress()
  return { provider, signer, address }
}
