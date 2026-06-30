import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export default async function EmployerDashboard() {
  const session = await auth()
  
  // Fetch company
  const company = await prisma.company.findUnique({
    where: { userId: session?.user?.id }
  })

  // Fetch jobs
  const jobs = company 
    ? await prisma.job.findMany({
        where: { companyId: company.id },
        include: { _count: { select: { applications: true } } },
        orderBy: { createdAt: 'desc' }
      })
    : []

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>
      
      {!company && (
        <Card className="bg-muted/50 border-dashed">
          <CardHeader>
            <CardTitle>Welcome to JobSearch Employer</CardTitle>
            <CardDescription>You need to create your company profile before posting jobs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/employer/profile">Setup Company Profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {company && (
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {company && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Job Postings</CardTitle>
              <CardDescription>View and manage your recent job listings.</CardDescription>
            </div>
            <Button asChild size="sm">
              <Link href="/employer/jobs/new">Post New Job</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No jobs posted yet.
              </div>
            ) : (
              <div className="divide-y">
                {jobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between py-4">
                    <div>
                      <div className="font-medium">{job.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {job.location} • {job.jobType}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary">{job._count.applications} Applicants</Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/employer/jobs/${job.id}`}>View</Link>
                      </Button>
                      <Button variant="secondary" size="sm" asChild>
                        <Link href={`/employer/jobs/${job.id}/edit`}>Edit</Link>
                      </Button>
                      <form action={async (formData) => { "use server"; const { deleteJob } = await import('@/actions/employer'); await deleteJob(formData); }}>
                        <input type="hidden" name="jobId" value={job.id} />
                        <Button type="submit" variant="destructive" size="sm">Delete</Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  )
}
