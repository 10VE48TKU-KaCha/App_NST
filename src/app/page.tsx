import { Navbar } from '@/components/Navbar'
import { HomeClient } from '@/components/HomeClient'
import Link from 'next/link'
import { Briefcase } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-foreground overflow-hidden">
      <Navbar />

      <HomeClient />

      <footer className="w-full py-8 px-6 mt-auto border-t border-border/40 bg-muted/10">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
              <Briefcase size={12} />
            </div>
            JobSearch Inc.
          </div>
          <p className="text-sm text-muted-foreground">© 2026 JobSearch Platform. All rights reserved.</p>
          <nav className="flex gap-6">
            <Link className="text-sm text-muted-foreground hover:text-foreground transition-colors" href="#">Terms</Link>
            <Link className="text-sm text-muted-foreground hover:text-foreground transition-colors" href="#">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
