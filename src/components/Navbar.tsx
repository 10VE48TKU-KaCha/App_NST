import Link from 'next/link'
import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import { Briefcase } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

export async function Navbar() {
  const session = await auth()

  return (
    <header className="px-6 lg:px-12 h-20 flex items-center border-b border-border/40 glass-effect sticky top-0 z-50 bg-background/80 backdrop-blur-md">
      <Link className="flex items-center justify-center font-bold text-2xl tracking-tight gap-2" href="/">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
          <Briefcase size={18} />
        </div>
        JobSearch
      </Link>
      
      <nav className="ml-auto flex gap-6 sm:gap-8 items-center">
        <Link className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" href="/jobs">
          Find Jobs
        </Link>
        
        {!session ? (
          <>
            <Link className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" href="/employer/dashboard">
              For Employers
            </Link>
            <Link 
              className="text-sm font-semibold bg-primary text-primary-foreground px-5 py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5" 
              href="/login"
            >
              Sign In
            </Link>
          </>
        ) : (
          <>
            {session.user?.role === 'SEEKER' && (
              <>
                <Link className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" href="/dashboard">
                  Dashboard
                </Link>
                <Link className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" href="/saved-jobs">
                  Saved Jobs
                </Link>
                <Link className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" href="/profile">
                  Profile
                </Link>
              </>
            )}
            {session.user?.role === 'EMPLOYER' && (
              <>
                <Link className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" href="/employer/dashboard">
                  Dashboard
                </Link>
                <Link className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" href="/employer/jobs/new">
                  Post a Job
                </Link>
              </>
            )}
            <Button variant="outline" size="sm" asChild className="ml-2 rounded-full">
              <Link href="/api/auth/signout">Sign Out</Link>
            </Button>
          </>
        )}
        <div className="ml-2">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
