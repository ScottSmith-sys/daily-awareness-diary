import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import AccountForm from '@/components/auth/AccountForm'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Account</h1>
        <p className="text-sm text-slate-500 mt-1">{user?.email}</p>
      </div>
      <Card>
        <AccountForm />
      </Card>
    </div>
  )
}
