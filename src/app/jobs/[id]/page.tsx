import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { auth } from '@/auth'
import { applyForJob } from '@/actions/seeker'
import { Navbar } from '@/components/Navbar'

export default async function JobDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: { company: true }
  })

  if (!job) return notFound()

  const session = await auth()
  const isSeeker = session?.user?.role === 'SEEKER'

  let hasApplied = false
  let hasProfile = false
  let isSaved = false

  if (isSeeker) {
    const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } })
    hasProfile = !!profile
    
    if (profile) {
      const application = await prisma.application.findUnique({
        where: {
          jobId_profileId: { jobId: job.id, profileId: profile.id }
        }
      })
      hasApplied = !!application

      const savedJob = await (prisma as any).savedJob.findUnique({
        where: {
          jobId_profileId: { jobId: job.id, profileId: profile.id }
        }
      })
      isSaved = !!savedJob
    }
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4 md:px-6 max-w-4xl">
        <Card className="mb-8">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-bold">{job.title}</CardTitle>
              <CardDescription className="text-lg mt-2 text-primary font-semibold">
                <Link href={`/company/${job.company.id}`} className="hover:underline">
                  {job.company.name}
                </Link>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">{job.jobType}</Badge>
              {job.remote && <Badge variant="outline" className="text-sm border-primary text-primary">Remote</Badge>}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-muted-foreground mt-4">
            {job.location && (
              <div className="flex items-center gap-1">📍 {job.location}</div>
            )}
            <div className="flex items-center gap-1">
              💰 {job.salaryMin ? `$${job.salaryMin} - $${job.salaryMax}` : 'Salary not specified'}
            </div>
            <div className="flex items-center gap-1">
              📅 Posted on {new Date(job.createdAt).toLocaleDateString()}
            </div>
          </div>
        </CardHeader>
        
        {isSeeker && (
          <CardContent className="border-t pt-6 bg-muted/20">
            {!hasProfile ? (
              <div className="text-sm text-muted-foreground mb-4">
                You need to complete your profile before applying.
                <br/>
                <Button variant="link" className="p-0 h-auto font-semibold" asChild>
                  <a href="/profile">Go to Profile</a>
                </Button>
              </div>
            ) : hasApplied ? (
              <Button disabled className="w-full sm:w-auto font-semibold">You have already applied</Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <form action={async (formData) => { "use server"; await applyForJob(formData); }} className="w-full sm:w-auto">
                  <input type="hidden" name="jobId" value={job.id} />
                  <Button type="submit" size="lg" className="w-full font-semibold">Apply Now</Button>
                </form>
                <form action={async (formData) => { "use server"; const { toggleSaveJob } = await import('@/actions/seeker'); await toggleSaveJob(formData); }} className="w-full sm:w-auto">
                  <input type="hidden" name="jobId" value={job.id} />
                  <Button type="submit" size="lg" variant={isSaved ? "secondary" : "outline"} className="w-full font-semibold">
                    {isSaved ? "Saved" : "Save Job"}
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <section>
            <h3 className="text-xl font-bold mb-4">Job Description</h3>
            <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {job.description}
            </div>
          </section>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About the Company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>{job.company.description || 'No description provided.'}</p>
              {job.company.website && (
                <a href={job.company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
                  Visit Website
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  )
}
