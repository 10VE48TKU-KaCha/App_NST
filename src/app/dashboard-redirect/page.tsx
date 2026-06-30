import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardRedirect() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user?.role === 'EMPLOYER') {
    redirect('/employer/dashboard')
  } else {
    redirect('/dashboard')
  }
}
