import Card from '@/components/ui/Card'
import SignupForm from '@/components/auth/SignupForm'

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[#f8fafc]">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0079a7]">Daily Awareness Diary</h1>
          <p className="text-sm text-slate-500 mt-1">Create your account</p>
        </div>
        <Card>
          <SignupForm />
        </Card>
      </div>
    </main>
  )
}
