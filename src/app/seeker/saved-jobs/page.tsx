import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'

export default async function SavedJobsPage() {
  const session = await auth()
  if (!session?.user || session.user?.role !== 'SEEKER') {
    return redirect('/login')
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id }
  })

  if (!profile) {
    return redirect('/profile')
  }

  const savedJobs = await (prisma as any).savedJob.findMany({
    where: { profileId: profile.id },
    include: {
      job: {
        include: { company: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Saved Jobs</h1>
          <p className="text-muted-foreground mt-2">Jobs you have bookmarked for later.</p>
        </div>

        {savedJobs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
            You have not saved any jobs yet.
            <div className="mt-4">
              <Button asChild>
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savedJobs.map(({ job }: { job: any }) => (
              <Card key={job.id} className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{job.jobType}</Badge>
                    {job.remote && <Badge variant="outline" className="border-primary text-primary">Remote</Badge>}
                  </div>
                  <CardTitle className="mt-2 text-xl">{job.title}</CardTitle>
                  <div className="text-sm text-muted-foreground font-medium">
                    <Link href={`/company/${job.company.id}`} className="hover:underline hover:text-primary">
                      {job.company.name}
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="text-sm font-medium">
                      {job.location}
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/jobs/${job.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
