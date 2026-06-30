import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Input } from '@/components/ui/input'

import { Navbar } from '@/components/Navbar'

export default async function JobsPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams
  const q = searchParams?.q || ''
  
  const jobs = await prisma.job.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } }
      ]
    },
    include: { company: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Explore Jobs</h1>
          <p className="text-muted-foreground">Find your next career opportunity.</p>
        </div>
        <form className="flex w-full max-w-sm items-center space-x-2">
          <Input name="q" type="search" placeholder="Search jobs, locations..." defaultValue={q} />
          <Button type="submit">Search</Button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No jobs found matching your search.
          </div>
        ) : (
          jobs.map(job => (
            <Card key={job.id} className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{job.jobType}</Badge>
                  {job.remote && <Badge variant="outline" className="border-primary text-primary">Remote</Badge>}
                </div>
                <CardTitle className="mt-2 text-xl">{job.title}</CardTitle>
                <div className="text-sm text-muted-foreground font-medium">{job.company.name}</div>
              </CardHeader>
              <CardContent>
                <div className="text-sm mb-4 line-clamp-3 text-muted-foreground">
                  {job.description}
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div className="text-sm font-medium">
                    {job.salaryMin ? `$${job.salaryMin} - $${job.salaryMax}` : 'Salary undisclosed'}
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/jobs/${job.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
    </>
  )
}
