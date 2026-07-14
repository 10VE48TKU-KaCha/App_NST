import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { KanbanBoard } from '@/components/KanbanBoard'

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

  const company = await prisma.company.findFirst({
    where: { 
      OR: [
        { userId: session.user.id },
        { members: { some: { userId: session.user.id } } }
      ]
    }
  })

  if (!company || job.companyId !== company.id) {
    return redirect('/employer/dashboard')
  }

  // Ensure all applications have a string status for the board
  const applications = job.applications.map(app => ({
    ...app,
    status: app.status as string
  }))

  return (
    <div className="container mx-auto max-w-7xl py-8 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between mb-6 shrink-0">
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

      <Card className="shadow-md flex-1 flex flex-col min-h-0 overflow-hidden border-0 bg-transparent">
        <CardHeader className="border-b pb-4 shrink-0 bg-card rounded-t-xl border">
          <CardTitle>Candidates ({job.applications.length})</CardTitle>
          <CardDescription>Drag and drop candidates to update their status. AI summarizes their fit.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 flex-1 min-h-0 overflow-hidden rounded-b-xl border border-t-0 bg-muted/10">
          <KanbanBoard initialApplications={applications} />
        </CardContent>
      </Card>
    </div>
  )
}
