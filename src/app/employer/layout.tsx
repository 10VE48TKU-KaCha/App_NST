import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Navbar } from '@/components/Navbar'

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/login')
  }

  if (session.user?.role !== 'EMPLOYER') {
    redirect('/jobs') // Redirect job seekers to jobs page
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/10">
      <Navbar />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  )
}
