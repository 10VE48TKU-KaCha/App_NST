import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'

export default async function SeekerDashboard() {
  const session = await auth()
  
  if (!session?.user) return redirect('/login')
  if (session.user?.role !== 'SEEKER') return redirect('/employer/dashboard')

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: {
      applications: {
        include: { job: { include: { company: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-muted-foreground">Track your job applications and profile status.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/profile">Edit Profile</Link>
        </Button>
      </div>

      {!profile && (
        <Card className="bg-muted/50 border-dashed mb-8">
          <CardHeader>
            <CardTitle>Welcome to JobSearch!</CardTitle>
            <CardDescription>You haven't set up your profile yet. Create it to start applying for jobs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/profile">Setup Profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>My Applications</CardTitle>
            <CardDescription>Track the status of jobs you've applied to.</CardDescription>
          </CardHeader>
          <CardContent>
            {profile.applications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                You haven't applied to any jobs yet.<br/>
                <Button variant="link" asChild className="mt-2 font-semibold">
                  <Link href="/jobs">Browse Jobs</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {profile.applications.map((app) => (
                  <div key={app.id} className="flex flex-col md:flex-row md:items-center justify-between py-6 gap-4">
                    <div>
                      <div className="font-semibold text-lg">{app.job.title}</div>
                      <div className="text-muted-foreground text-sm">{app.job.company.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Applied on {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex flex-col items-end mr-4">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Status</span>
                        <Badge variant={app.status === 'HIRED' ? 'default' : app.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                          {app.status}
                        </Badge>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Match Score</span>
                        <Badge variant="outline" className="border-primary text-primary font-bold">
                          {app.matchScore}%
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm" asChild className="ml-2">
                        <Link href={`/jobs/${app.job.id}`}>View Job</Link>
                      </Button>
                      {app.status === 'REVIEWING' && (
                        <form action={async (formData) => { "use server"; const { withdrawApplication } = await import('@/actions/seeker'); await withdrawApplication(formData); }}>
                          <input type="hidden" name="applicationId" value={app.id} />
                          <Button type="submit" variant="destructive" size="sm" className="ml-2">Withdraw</Button>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
    </>
  )
}
