import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { OnboardingModal } from '@/components/OnboardingModal'
import { Briefcase, Building2, CheckCircle2 } from 'lucide-react'

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

  const applications = profile?.applications || [];
  const hiredCount = applications.filter(a => a.status === 'HIRED').length;
  const interviewingCount = applications.filter(a => a.status === 'INTERVIEW').length;

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4 md:px-6 max-w-6xl">
        <OnboardingModal isNewUser={!profile} role="SEEKER" />

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
            <p className="text-muted-foreground">Track your job applications and profile status.</p>
          </div>
          <Button asChild className="premium-hover rounded-full px-6">
            <Link href="/profile">Edit Profile</Link>
          </Button>
        </div>

        {profile && (
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card className="premium-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applied</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{applications.length}</div>
              </CardContent>
            </Card>
            <Card className="premium-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Interviews</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{interviewingCount}</div>
              </CardContent>
            </Card>
            <Card className="premium-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Offers / Hired</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{hiredCount}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>My Applications</CardTitle>
            <CardDescription>Recent jobs you've applied to.</CardDescription>
          </CardHeader>
          <CardContent>
            {!profile || applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                <Briefcase className="h-12 w-12 mb-4 text-muted-foreground/50" />
                <p className="text-lg font-medium">You haven't applied to any jobs yet.</p>
                <Button asChild className="mt-4 rounded-full">
                  <Link href="/jobs">Browse Jobs</Link>
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Match</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id} className="premium-hover">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border">
                              <AvatarFallback>{app.job.company.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{app.job.company.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{app.job.title}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-primary/50 text-primary font-bold">
                            {app.matchScore}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={app.status === 'HIRED' ? 'default' : app.status === 'REJECTED' ? 'destructive' : app.status === 'INTERVIEW' ? 'secondary' : 'outline'}>
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/jobs/${app.job.id}`}>View</Link>
                            </Button>
                            {app.status === 'REVIEWING' && (
                              <form action={async (formData) => { "use server"; const { withdrawApplication } = await import('@/actions/seeker'); await withdrawApplication(formData); }}>
                                <input type="hidden" name="applicationId" value={app.id} />
                                <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">Withdraw</Button>
                              </form>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
