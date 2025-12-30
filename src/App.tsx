import React, { useState } from 'react'
import FarmCanvas from './components/FarmCanvas'
import PurchaseModal from './components/PurchaseModal'
import ShedModal from './components/ShedModal'

export default function App(){
  const [purchaseOpen, setPurchaseOpen] = useState(false)
  const [shedOpen, setShedOpen] = useState(false)

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="w-full max-w-5xl p-8">
        <h1 className="text-3xl font-bold mb-4">Henverse Presale (Prototype)</h1>
        <p className="mb-6">Click the human to buy CRO and the shed to view your contributions.</p>

        <div className="border rounded p-6 bg-white shadow">
          <FarmCanvas onClickHuman={() => setPurchaseOpen(true)} onClickShed={() => setShedOpen(true)} />
        </div>

        <PurchaseModal isOpen={purchaseOpen} onClose={() => setPurchaseOpen(false)} />
        <ShedModal isOpen={shedOpen} onClose={() => setShedOpen(false)} />
      </div>
    </div>
  )
}
