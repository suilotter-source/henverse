import { ethers } from 'ethers'

export const RECEIVER = '0x46914D5DC59598801e435AF2a08928Da87C60dF0'
export const CRONOS_CHAIN_ID = 25

export function isMetaMaskAvailable(){
  return typeof (window as any).ethereum !== 'undefined'
}

export async function connectWallet(){
  const provider = new ethers.BrowserProvider((window as any).ethereum)
  await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
  const signer = await provider.getSigner()
  const address = await signer.getAddress()
  return { provider, signer, address }
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
