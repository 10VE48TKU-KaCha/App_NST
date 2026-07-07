import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { MoreHorizontal, Briefcase, Users, CheckCircle2 } from 'lucide-react'
import { OnboardingModal } from '@/components/OnboardingModal'

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
        include: { _count: { select: { applications: true } }, applications: { select: { status: true } } },
        orderBy: { createdAt: 'desc' }
      })
    : []

  const totalJobs = jobs.length;
  const totalApplicants = jobs.reduce((sum, job) => sum + job._count.applications, 0);
  const totalHired = jobs.reduce((sum, job) => sum + job.applications.filter(a => a.status === 'HIRED').length, 0);

  return (
    <div className="max-w-6xl mx-auto w-full">
      <OnboardingModal isNewUser={!company} role="EMPLOYER" />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employer Dashboard</h1>
          <p className="text-muted-foreground">Manage your job postings and applicants.</p>
        </div>
      </div>
      
      {!company && (
        <Card className="bg-muted/30 border-dashed py-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to JobSearch Employer</CardTitle>
            <CardDescription className="text-base">You need to create your company profile before posting jobs.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild className="rounded-full px-8 premium-hover">
              <Link href="/employer/profile">Setup Company Profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {company && (
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="premium-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{totalJobs}</div>
            </CardContent>
          </Card>
          <Card className="premium-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalApplicants}</div>
            </CardContent>
          </Card>
          <Card className="premium-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hired Candidates</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{totalHired}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {company && (
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
            <div>
              <CardTitle>Recent Job Postings</CardTitle>
              <CardDescription>View and manage your recent job listings.</CardDescription>
            </div>
            <Button asChild size="sm" className="rounded-full premium-hover">
              <Link href="/employer/jobs/new">Post New Job</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                <Briefcase className="h-10 w-10 mb-3 text-muted-foreground/50" />
                <p>No jobs posted yet.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-center">Applicants</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.id} className="premium-hover">
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell className="text-muted-foreground">{job.location}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.jobType}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="px-3">
                            {job._count.applications}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Link href={`/employer/jobs/${job.id}`} className="w-full text-left">View Applicants</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link href={`/employer/jobs/${job.id}/edit`} className="w-full text-left">Edit Job</Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer">
                                <form action={async (formData) => { "use server"; const { deleteJob } = await import('@/actions/employer'); await deleteJob(formData); }} className="w-full">
                                  <input type="hidden" name="jobId" value={job.id} />
                                  <button type="submit" className="w-full text-left">Delete Job</button>
                                </form>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
