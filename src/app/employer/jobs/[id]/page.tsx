import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { notFound, redirect } from 'next/navigation'
import { updateApplicationStatus } from '@/actions/employer'

export default async function EmployerJobDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth()
  
  if (!session?.user || session.user?.role !== 'EMPLOYER') return redirect('/login')

  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      applications: {
        include: { profile: { include: { user: true } } },
        orderBy: { matchScore: 'desc' }
      }
    }
  })

  if (!job) return notFound()

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id }
  })

  if (job.companyId !== company?.id) {
    return redirect('/employer/dashboard')
  }

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <p className="text-muted-foreground">{job.location} • {job.jobType}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidates ({job.applications.length})</CardTitle>
          <CardDescription>Review applicants ordered by AI Match Score.</CardDescription>
        </CardHeader>
        <CardContent>
          {job.applications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No applications received yet.
            </div>
          ) : (
            <div className="space-y-6">
              {job.applications.map((app) => (
                <div key={app.id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{app.profile.user.name || app.profile.user.email}</span>
                      <Badge variant="outline" className="border-primary text-primary">
                        {app.matchScore}% Match
                      </Badge>
                      <Badge variant={app.status === 'HIRED' ? 'default' : app.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                        {app.status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-semibold">Email: </span> {app.profile.user.email}
                    </div>
                    {app.profile.expectedSalary && (
                      <div className="text-sm">
                        <span className="font-semibold">Expected Salary: </span> ${app.profile.expectedSalary}
                      </div>
                    )}
                    {app.profile.resumeUrl && (
                      <div className="text-sm">
                        <span className="font-semibold">Resume: </span> 
                        <a href={app.profile.resumeUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">View Link</a>
                      </div>
                    )}
                    
                    <div className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                      <span className="font-semibold text-foreground">Skills: </span>
                      {app.profile.skills.join(', ')}
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap line-clamp-2">
                      <span className="font-semibold text-foreground">Experience: </span>
                      {app.profile.experience}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <form action={async (formData) => { "use server"; await updateApplicationStatus(formData); }}>
                      <input type="hidden" name="applicationId" value={app.id} />
                      <input type="hidden" name="status" value="INTERVIEW" />
                      <Button type="submit" variant="secondary" size="sm" className="w-full" disabled={app.status === 'INTERVIEW'}>
                        Move to Interview
                      </Button>
                    </form>
                    <form action={async (formData) => { "use server"; await updateApplicationStatus(formData); }}>
                      <input type="hidden" name="applicationId" value={app.id} />
                      <input type="hidden" name="status" value="HIRED" />
                      <Button type="submit" variant="default" size="sm" className="w-full" disabled={app.status === 'HIRED'}>
                        Hire
                      </Button>
                    </form>
                    <form action={async (formData) => { "use server"; await updateApplicationStatus(formData); }}>
                      <input type="hidden" name="applicationId" value={app.id} />
                      <input type="hidden" name="status" value="REJECTED" />
                      <Button type="submit" variant="destructive" size="sm" className="w-full" disabled={app.status === 'REJECTED'}>
                        Reject
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
