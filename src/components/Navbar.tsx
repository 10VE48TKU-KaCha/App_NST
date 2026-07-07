import Link from 'next/link'
import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import { Briefcase } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

export async function Navbar() {
  const session = await auth()

  return (
    <header className="px-6 lg:px-12 h-20 flex items-center border-b bg-background sticky top-0 z-50 shadow-sm">
      <Link className="flex items-center justify-center font-bold text-2xl tracking-tight gap-2" href="/">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
          <Briefcase size={18} />
        </div>
        NakhonJobs
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
          <div className="flex items-center gap-6">
            {session.user?.role === 'SEEKER' && (
              <>
                <Link className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors premium-hover" href="/dashboard">
                  Dashboard
                </Link>
                <Link className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors premium-hover" href="/saved-jobs">
                  Saved Jobs
                </Link>
                <Link className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors premium-hover" href="/profile">
                  Profile
                </Link>
              </>
            )}
            {session.user?.role === 'EMPLOYER' && (
              <>
                <Link className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors premium-hover" href="/employer/dashboard">
                  Dashboard
                </Link>
                <Link className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors premium-hover" href="/employer/jobs/new">
                  Post a Job
                </Link>
              </>
            )}
            
            <div className="h-6 w-px bg-border/60 mx-1"></div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium leading-none">{session.user.name || "User"}</span>
                <span className="text-xs text-muted-foreground">{session.user.role === 'EMPLOYER' ? 'Employer' : 'Seeker'}</span>
              </div>
              <Button variant="outline" size="sm" asChild className="rounded-full premium-hover border-primary/20 hover:bg-primary/5">
                <Link href="/api/auth/signout">Sign Out</Link>
              </Button>
            </div>
          </div>
        )}
        <div className="ml-2">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
