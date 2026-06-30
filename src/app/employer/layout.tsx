import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { Button } from '@/components/ui/button'

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
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
            🚀 JobSearch <span className="text-muted-foreground text-xs font-normal">Employer</span>
          </Link>
          <Link href="/employer/dashboard" className="text-foreground transition-colors hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/employer/jobs/new" className="text-muted-foreground transition-colors hover:text-foreground">
            Post a Job
          </Link>
          <Link href="/employer/profile" className="text-muted-foreground transition-colors hover:text-foreground">
            Company Profile
          </Link>
        </nav>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="ml-auto flex-1 sm:flex-initial">
          </div>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/api/auth/signout">Logout</Link>
          </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  )
}
