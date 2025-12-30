import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !key) {
  console.warn('Supabase vars not set: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(url, key)

export async function logContribution(address:string, txHash:string, amountCRO:number){
  return supabase.from('contributions').insert({ user_address: address, tx_hash: txHash, amount_cro: amountCRO })
}

export async function getTotalContributions(){
  const { data, error } = await supabase.from('contributions').select('amount_cro')
  if (error) throw error
  const total = (data || []).reduce((s:any, r:any)=>s + Number(r.amount_cro), 0)
  return total
}

export async function getUserContributions(address:string){
  const { data, error } = await supabase.from('contributions').select('*').eq('user_address', address).order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function recordClaim(address: string){
  return supabase.from('claims').insert({ user_address: address, claimed: true, claimed_at: new Date().toISOString() })
}

export async function getUserClaims(address:string){
  const { data, error } = await supabase.from('claims').select('*').eq('user_address', address).order('claimed_at', { ascending: false })
  if (error) throw error
  return data
}

export async function computeExpectedTokens(address:string, presaleTokens = 50000000){
  const user = await getUserContributions(address)
  const userTotal = (user || []).reduce((s:any,row:any)=>s+Number(row.amount_cro), 0)
  const total = await getTotalContributions()
  const tokenPerCro = total > 0 ? presaleTokens / total : 0
  return { userTotal, total, expectedTokens: userTotal * tokenPerCro }
}
