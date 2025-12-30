import React, { useState, useEffect } from 'react'
import { Wallet, X, TrendingUp, Clock, Egg } from 'lucide-react'

// Read Supabase from env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

const HensPresale: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [showPresaleModal, setShowPresaleModal] = useState(false)
  const [showShedModal, setShowShedModal] = useState(false)
  const [croAmount, setCroAmount] = useState('')
  const [userContribution, setUserContribution] = useState(0)
  const [totalRaised, setTotalRaised] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const PRESALE_ADDRESS = '0x46914D5DC59598801e435AF2a08928Da87C60dF0'
  const TOTAL_SUPPLY = 100000000
  const PRESALE_ALLOCATION = TOTAL_SUPPLY * 0.5

  // Supabase helper functions
  const supabaseRequest = async (endpoint:string, options: any = {}) => {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
      ...options,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...options.headers,
      },
    })
    return response.json()
  }

  // Connect wallet
  const connectWallet = async () => {
    if (typeof (window as any).ethereum !== 'undefined') {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })

        const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' })
        const cronosChainId = '0x19' // Cronos mainnet

        if (chainId !== cronosChainId) {
          try {
            await (window as any).ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: cronosChainId }],
            })
          } catch (error: any) {
            if (error?.code === 4902) {
              await (window as any).ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: cronosChainId,
                  chainName: 'Cronos Mainnet',
                  nativeCurrency: { name: 'CRO', symbol: 'CRO', decimals: 18 },
                  rpcUrls: ['https://evm.cronos.org'],
                  blockExplorerUrls: ['https://cronoscan.com'],
                }],
              })
            }
          }
        }

        setWalletAddress(accounts[0])
        setIsConnected(true)
        await loadUserData(accounts[0])
      } catch (error) {
        console.error('Error connecting wallet:', error)
        alert('Failed to connect wallet. Please try again.')
      }
    } else {
      alert('Please install MetaMask or a Web3 wallet!')
    }
  }

  // Load user data from Supabase
  const loadUserData = async (address:string) => {
    try {
      // Get user contribution
      const userData: any = await supabaseRequest(
        `contributions?wallet_address=eq.${address.toLowerCase()}&select=total_contribution`,
        { method: 'GET' }
      )

      if (userData && userData.length > 0) {
        setUserContribution(parseFloat(userData[0].total_contribution || 0))
      }

      // Get total raised
      const totalData: any = await supabaseRequest(
        'contributions?select=total_contribution',
        { method: 'GET' }
      )

      if (totalData) {
        const total = totalData.reduce((sum:any, item:any) => sum + parseFloat(item.total_contribution || 0), 0)
        setTotalRaised(total)
      }

      // Get user transactions
      const txData: any = await supabaseRequest(
        `transactions?wallet_address=eq.${address.toLowerCase()}&order=created_at.desc&limit=10`,
        { method: 'GET' }
      )

      if (txData) {
        setTransactions(txData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  // Send CRO
  const handlePresale = async () => {
    if (!croAmount || parseFloat(croAmount) <= 0) {
      alert('Please enter a valid CRO amount')
      return
    }

    setIsLoading(true)
    try {
      const amountWeiHex = BigInt(Math.floor(parseFloat(croAmount) * 1e18)).toString(16)

      const txHash = await (window as any).ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: PRESALE_ADDRESS,
          value: '0x' + amountWeiHex,
        }],
      })

      // Log transaction to Supabase
      await supabaseRequest('transactions', {
        method: 'POST',
        body: JSON.stringify({
          wallet_address: walletAddress.toLowerCase(),
          amount: parseFloat(croAmount),
          tx_hash: txHash,
          status: 'pending',
        }),
      })

      // Update user contribution
      const newTotal = userContribution + parseFloat(croAmount)
      await supabaseRequest('contributions', {
        method: 'POST',
        body: JSON.stringify({
          wallet_address: walletAddress.toLowerCase(),
          total_contribution: newTotal,
        }),
      })

      alert('Transaction submitted! Your $HENS tokens will be claimable on TGE.')
      setCroAmount('')
      setShowPresaleModal(false)
      await loadUserData(walletAddress)
    } catch (error) {
      console.error('Transaction error:', error)
      alert('Transaction failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate expected tokens
  const calculateExpectedTokens = () => {
    if (totalRaised === 0) return 0
    return (userContribution / totalRaised) * PRESALE_ALLOCATION
  }

  // reload totals on mount
  useEffect(()=>{
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY){
      (async ()=>{
        // fetch totals
        try{
          const totals:any = await supabaseRequest('contributions?select=total_contribution')
          if (totals) setTotalRaised(totals.reduce((s:any,i:any)=>s+parseFloat(i.total_contribution||0),0))
        }catch(e){/* ignore */}
      })()
    }
  },[])

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-200 to-green-200 relative overflow-hidden">
      {/* Sun */}
      <div className="absolute top-8 right-8 w-20 h-20 bg-yellow-400 rounded-full shadow-lg animate-pulse" />

      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-amber-900">$HENS Presale</h1>
          <p className="text-amber-800">Fresh Eggs, Fresh Gains! 🐔</p>
        </div>
        
        {!isConnected ? (
          <button onClick={connectWallet} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg transition-all transform hover:scale-105">
            <Wallet size={20} />
            Connect Wallet
          </button>
        ) : (
          <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg">{walletAddress.slice(0,6)}...{walletAddress.slice(-4)}</div>
        )}
      </div>

      {/* Main Farm Scene */}
      <div className="relative h-screen flex items-end justify-center px-4 pb-20">
        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-600 to-green-500" />

        {/* Chickens */}
        <div className="absolute bottom-32 left-1/4 text-6xl animate-bounce cursor-pointer hover:scale-110 transition-transform" style={{animationDelay: '0s'}}>🐔</div>
        <div className="absolute bottom-36 right-1/3 text-5xl animate-bounce cursor-pointer hover:scale-110 transition-transform" style={{animationDelay: '0.5s'}}>🐓</div>
        <div className="absolute bottom-32 left-1/2 text-6xl animate-bounce cursor-pointer hover:scale-110 transition-transform" style={{animationDelay: '1s'}}>🐔</div>

        {/* Eggs on ground */}
        <div className="absolute bottom-32 left-1/3 text-4xl cursor-pointer hover:scale-125 transition-transform">🥚</div>
        <div className="absolute bottom-36 right-1/4 text-3xl cursor-pointer hover:scale-125 transition-transform">🥚</div>
        <div className="absolute bottom-34 left-2/3 text-4xl cursor-pointer hover:scale-125 transition-transform">🥚</div>

        {/* Farmer (clickable for presale) */}
        <div onClick={() => isConnected && setShowPresaleModal(true)} className={`absolute bottom-32 right-1/4 text-7xl ${isConnected ? 'cursor-pointer hover:scale-110' : 'opacity-50'} transition-all`}>🧑‍🌾
          {isConnected && (<div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-amber-900 text-white px-3 py-1 rounded-full text-sm whitespace-nowrap animate-bounce">Click to Buy!</div>)}
        </div>

        {/* Shed (clickable for stats) */}
        <div onClick={() => isConnected && setShowShedModal(true)} className={`absolute bottom-32 left-12 ${isConnected ? 'cursor-pointer hover:scale-105' : 'opacity-70'} transition-all`}>
          <div className="relative">
            <div className="w-40 h-32 bg-red-700 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full w-0 h-0 border-l-[80px] border-r-[80px] border-b-[40px] border-l-transparent border-r-transparent border-b-red-800" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-16 bg-amber-900" />
            </div>
            {isConnected && (<div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-red-800 text-white px-3 py-1 rounded-full text-xs whitespace-nowrap animate-bounce">View Stats</div>)}
          </div>
        </div>

        {/* Stats Banner */}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 w-96">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-amber-900">
              <Egg className="text-orange-500" />
              <h2 className="text-2xl font-bold">Presale Live!</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-100 p-4 rounded-lg">
                <p className="text-sm text-amber-800">Total Supply</p>
                <p className="text-2xl font-bold text-amber-900">100M $HENS</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <p className="text-sm text-green-800">Presale Pool</p>
                <p className="text-2xl font-bold text-green-900">50M $HENS</p>
              </div>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <p className="text-sm text-blue-800">Total Raised</p>
              <p className="text-3xl font-bold text-blue-900">{totalRaised.toFixed(2)} CRO</p>
            </div>
          </div>
        </div>
      </div>

      {/* Presale Modal */}
      {showPresaleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button onClick={() => setShowPresaleModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"><X size={24} /></button>
            <h2 className="text-3xl font-bold text-amber-900 mb-4">Buy $HENS Tokens</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (CRO)</label>
                <input type="number" value={croAmount} onChange={(e)=>setCroAmount(e.target.value)} placeholder="0.0" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none" disabled={isLoading} />
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-amber-800">Your contribution determines your share of the 50M $HENS presale allocation. Tokens are claimable on TGE!</p>
              </div>
              <button onClick={handlePresale} disabled={isLoading} className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-4 rounded-lg font-bold text-lg transition-colors">{isLoading ? 'Processing...' : 'Contribute CRO'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Shed Stats Modal */}
      {showShedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowShedModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"><X size={24} /></button>
            <h2 className="text-3xl font-bold text-amber-900 mb-6">Your Egg Basket 🥚</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-100 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 flex items-center gap-2"><TrendingUp size={16} />Your Contribution</p>
                  <p className="text-2xl font-bold text-blue-900">{userContribution.toFixed(2)} CRO</p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                  <p className="text-sm text-green-800 flex items-center gap-2"><Egg size={16} />Expected Tokens</p>
                  <p className="text-2xl font-bold text-green-900">{calculateExpectedTokens().toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                </div>
                <div className="bg-purple-100 p-4 rounded-lg">
                  <p className="text-sm text-purple-800 flex items-center gap-2"><Clock size={16} />Status</p>
                  <p className="text-lg font-bold text-purple-900">Presale Live</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Transaction History</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {transactions.length > 0 ? (
                    transactions.map((tx, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">{tx.amount} CRO</p>
                          <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs ${tx.status === 'confirmed' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>{tx.status}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No transactions yet. Start contributing!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HensPresale
