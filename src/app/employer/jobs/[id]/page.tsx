import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { notFound, redirect } from 'next/navigation'
import { updateApplicationStatus } from '@/actions/employer'
import { ChevronDown, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HIRED': return <CheckCircle2 className="w-4 h-4 mr-2" />;
      case 'REJECTED': return <XCircle className="w-4 h-4 mr-2" />;
      case 'INTERVIEW': return <Clock className="w-4 h-4 mr-2" />;
      default: return null;
    }
  }

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
            <Badge variant="outline" className="bg-primary/5">{job.jobType}</Badge>
          </div>
          <p className="text-muted-foreground">{job.location} • Posted {new Date(job.createdAt).toLocaleDateString()}</p>
        </div>
        <Button variant="outline" asChild className="rounded-full premium-hover">
          <Link href="/employer/dashboard">Back to Dashboard</Link>
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader className="border-b pb-4 mb-4">
          <CardTitle>Candidates ({job.applications.length})</CardTitle>
          <CardDescription>Review applicants ordered by AI Match Score.</CardDescription>
        </CardHeader>
        <CardContent>
          {job.applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
              <FileText className="h-12 w-12 mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium">No applications received yet.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead className="text-center">Match Score</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Manage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {job.applications.map((app) => (
                    <TableRow key={app.id} className="premium-hover">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {(app.profile.user.name || app.profile.user.email).substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{app.profile.user.name || "Unknown"}</div>
                            <div className="text-xs text-muted-foreground">{app.profile.user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="border-primary/50 text-primary font-bold px-3 py-1 text-sm">
                          {app.matchScore}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {app.profile.expectedSalary && (
                            <div className="text-xs text-muted-foreground">
                              <span className="font-semibold text-foreground">Exp. Salary:</span> ${app.profile.expectedSalary}
                            </div>
                          )}
                          {app.profile.resumeUrl && (
                            <div className="text-xs">
                              <a href={app.profile.resumeUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                <FileText className="w-3 h-3" /> View Resume
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={app.status === 'HIRED' ? 'default' : app.status === 'REJECTED' ? 'destructive' : app.status === 'INTERVIEW' ? 'secondary' : 'outline'} className="capitalize">
                          {app.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center rounded-full border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
                            Update Status <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem disabled={app.status === 'INTERVIEW'}>
                              <form action={async (formData) => { "use server"; await updateApplicationStatus(formData); }} className="w-full">
                                <input type="hidden" name="applicationId" value={app.id} />
                                <input type="hidden" name="status" value="INTERVIEW" />
                                <button type="submit" className="w-full text-left flex items-center">
                                  <Clock className="w-4 h-4 mr-2" /> Move to Interview
                                </button>
                              </form>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem disabled={app.status === 'HIRED'}>
                              <form action={async (formData) => { "use server"; await updateApplicationStatus(formData); }} className="w-full">
                                <input type="hidden" name="applicationId" value={app.id} />
                                <input type="hidden" name="status" value="HIRED" />
                                <button type="submit" className="w-full text-left flex items-center text-primary font-medium">
                                  <CheckCircle2 className="w-4 h-4 mr-2" /> Hire Candidate
                                </button>
                              </form>
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem disabled={app.status === 'REJECTED'}>
                              <form action={async (formData) => { "use server"; await updateApplicationStatus(formData); }} className="w-full">
                                <input type="hidden" name="applicationId" value={app.id} />
                                <input type="hidden" name="status" value="REJECTED" />
                                <button type="submit" className="w-full text-left flex items-center text-destructive">
                                  <XCircle className="w-4 h-4 mr-2" /> Reject
                                </button>
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
    </div>
  )
}
