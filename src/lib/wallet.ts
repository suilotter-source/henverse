import { ethers } from 'ethers'

export const RECEIVER = '0x46914D5DC59598801e435AF2a08928Da87C60dF0'
export const CRONOS_CHAIN_ID = 25

export function isMetaMaskAvailable(){
  try{
    return typeof (window as any).ethereum !== 'undefined'
  }catch(e){
    return false
  }
}

export async function connectWallet(){
  try{
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      throw new Error('No injected wallet found (MetaMask/compatible)')
    }

    // request the accounts (may throw if another extension interferes)
    await (window as any).ethereum.request({ method: 'eth_requestAccounts' })

    const provider = new ethers.BrowserProvider((window as any).ethereum)
    const signer = await provider.getSigner()
    const address = await signer.getAddress()
    return { provider, signer, address }
  }catch(e:any){
    // Bubble up a useful message for the UI to show
    throw new Error(e?.message || 'Failed to connect injected wallet')
  }
}

export async function sendCro(signer: any, amountCro: string){
  const value = ethers.parseEther(amountCro)
  const tx = await signer.sendTransaction({ to: RECEIVER, value })
  await tx.wait()
  return tx.hash
}

export async function getChainId(provider: any){
  const network = await provider.getNetwork()
  return network.chainId
}
