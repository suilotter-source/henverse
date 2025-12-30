import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !key) console.warn('Supabase env vars not set')

export const supabase = createClient(url, key)

export async function fetchTransactions(address: string){
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('wallet_address', address.toLowerCase())
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchContributions(){
  const { data, error } = await supabase.from('contributions').select('total_contribution')
  if (error) throw error
  return (data || []).reduce((s:any,row:any)=>s+Number(row.total_contribution||0),0)
}

export function subscribeToTransactions(cb: (tx:any)=>void){
  // Uses Postgres changes realtime
  return supabase
    .channel('public:transactions')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, payload => {
      cb(payload.new)
    })
    .subscribe()
}

export function subscribeToContributions(cb: (row:any)=>void){
  return supabase
    .channel('public:contributions')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contributions' }, payload => {
      cb(payload.new)
    })
    .subscribe()
}
