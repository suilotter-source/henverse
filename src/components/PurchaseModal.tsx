import React, { useState } from 'react'
import { connectWallet, sendCro, getChainId, CRONOS_CHAIN_ID } from '../lib/wallet'
import { connectWalletConnect } from '../lib/walletconnect'
import { logContribution } from '../lib/supabase'

export default function PurchaseModal({ isOpen, onClose }:{isOpen:boolean,onClose:()=>void}){
  const [amount, setAmount] = useState('0.1')
  const [status, setStatus] = useState('')
  const [conn, setConn] = useState<{ provider:any, signer:any, address:string } | null>(null)

  if (!isOpen) return null

  async function handleConnect(){
    try{
      const r = await connectWallet()
      setConn(r)
      setStatus('Connected: ' + r.address)
    }catch(e:any){
      setStatus('Failed to connect wallet')
      console.error(e)
    }
  }

  async function handleConnectWalletConnect(){
    try{
      const r = await connectWalletConnect()
      setConn(r)
      setStatus('Connected (WalletConnect): ' + r.address)
    }catch(e:any){
      console.error(e)
      setStatus('WalletConnect failed: ' + (e?.message || e))
    }
  }

  async function handleBuy(){
    setStatus('Sending transaction...')
    try{
      let signer = conn?.signer
      let provider = conn?.provider
      if (!signer){
        const r = await connectWallet()
        signer = r.signer
        provider = r.provider
        setConn(r)
      }

      const chainId = await getChainId(provider)
      if (chainId !== CRONOS_CHAIN_ID){
        setStatus('Please switch your wallet to Cronos chain (chainId 25)')
        return
      }

      const txHash = await sendCro(signer, amount)
      setStatus('Transaction sent: ' + txHash)

      // log to supabase
      const signerAddress = await signer.getAddress()
      await logContribution(signerAddress, txHash, Number(amount))

      // if WalletConnect session present, keep it open — user can disconnect manually via wallet UI
    }catch(e:any){
      console.error(e)
      setStatus('Transaction failed: ' + (e?.message || e))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="text-lg font-bold mb-2">Buy into presale</h2>
        <div className="mb-2">Receiver: <code>0x46914D5DC59598801e435AF2a08928Da87C60dF0</code></div>
        <label className="block mb-2">Amount (CRO)</label>
        <input value={amount} onChange={(e)=>setAmount(e.target.value)} className="w-full border rounded p-2 mb-4" />
        <div className="flex space-x-2 mb-3">
          <button onClick={handleConnect} className="px-3 py-2 bg-blue-500 text-white rounded">MetaMask</button>
          <button onClick={handleConnectWalletConnect} className="px-3 py-2 bg-indigo-600 text-white rounded">WalletConnect</button>
          <button onClick={handleBuy} className="px-3 py-2 bg-green-500 text-white rounded">Buy</button>
        </div>
        <div className="flex justify-between items-center">
          <button onClick={onClose} className="px-3 py-2 border rounded">Close</button>
          <div className="text-sm text-gray-600">{status}</div>
        </div>
      </div>
    </div>
  )
}
