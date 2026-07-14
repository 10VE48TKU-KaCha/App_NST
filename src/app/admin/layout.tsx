import { Navbar } from '@/components/Navbar'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard-redirect')
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="container py-8">
        {children}
      </div>
    </div>
  )
}
