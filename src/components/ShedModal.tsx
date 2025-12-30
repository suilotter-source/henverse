import React, { useEffect, useState } from 'react'
import { connectWallet } from '../lib/wallet'
import { getUserContributions, supabase } from '../lib/supabase'

const PRESALE_TOKENS = 50000000 // 50M

export default function ShedModal({ isOpen, onClose }:{isOpen:boolean,onClose:()=>void}){
  const [address, setAddress] = useState<string | null>(null)
  const [contributions, setContributions] = useState<any[]>([])
  const [total, setTotal] = useState<number>(0)

  const [status, setStatus] = useState('')
  const [claimed, setClaimed] = useState<boolean>(false)

  useEffect(()=>{
    if (!isOpen) return
    (async ()=>{
      try{
        const r = await connectWallet()
        setAddress(r.address)
        const user = await getUserContributions(r.address)
        setContributions(user || [])
        const totals = await computeExpectedTokens(r.address, PRESALE_TOKENS)
        setTotal(totals.total || 0)
        // mark claimed if there's a claim record
        const claims = await getUserClaims(r.address)
        setClaimed((claims || []).some((c:any)=>c.claimed))
      }catch(e){
        console.warn(e)
      }
    })()
  },[isOpen])

  const userTotal = contributions.reduce((s,a)=>s+Number(a.amount_cro), 0)
  const tokenPerCro = total > 0 ? (PRESALE_TOKENS / total) : 0
  const expectedTokens = userTotal * tokenPerCro

  async function handleClaim(){
    if (!address) return
    setStatus('Recording claim...')
    try{
      await recordClaim(address)
      setClaimed(true)
      setStatus('Claim recorded. We will process distribution at TGE.')
    }catch(e:any){
      setStatus('Claim failed: ' + (e?.message || e))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="text-lg font-bold mb-2">Shed — Contributions</h2>
        <div className="text-sm mb-2">Address: {address}</div>
        <div className="mb-2">Your contributed CRO: {userTotal}</div>
        <div className="mb-2">Total CRO (all users): {total}</div>
        <div className="mb-2">Expected $HENS on TGE: {expectedTokens.toFixed(2)}</div>

        <div className="h-32 overflow-auto border rounded p-2">
          {contributions.length === 0 && <div className="text-sm text-gray-500">No contributions yet.</div>}
          {contributions.map(c=> (
            <div key={c.id} className="text-xs border-b py-1">
              {new Date(c.created_at).toLocaleString()} — {c.amount_cro} CRO — Tx {c.tx_hash}
            </div>
          ))}
        </div>

        <div className="mt-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {!claimed && expectedTokens > 0 && (
              <button onClick={handleClaim} className="px-3 py-2 bg-yellow-500 text-white rounded">Claim tokens</button>
            )}
            {claimed && <div className="text-sm text-green-600">Claimed</div>}
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600">{status}</div>
            <button onClick={onClose} className="px-3 py-2 border rounded">Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}
