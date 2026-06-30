import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/Navbar'

export default async function CompanyProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  
  const company = await prisma.company.findUnique({
    where: { id: params.id },
    include: {
      jobs: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!company) {
    return notFound()
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Company Details Sidebar */}
          <div className="w-full md:w-1/3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{company.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.location && (
                  <div>
                    <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider mb-1">Headquarters</h3>
                    <p>{company.location}</p>
                  </div>
                )}
                {company.website && (
                  <div>
                    <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider mb-1">Website</h3>
                    <a href={company.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {company.description && (
                  <div>
                    <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider mb-1">About Us</h3>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{company.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Open Positions List */}
          <div className="w-full md:w-2/3 space-y-6">
            <h2 className="text-2xl font-bold">Open Positions ({company.jobs.length})</h2>
            
            {company.jobs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
                This company has no open positions at the moment.
              </div>
            ) : (
              <div className="grid gap-4">
                {company.jobs.map(job => (
                  <Card key={job.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-xl">
                        <Link href={`/jobs/${job.id}`} className="hover:underline">
                          {job.title}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {job.location && <span>{job.location}</span>}
                        {job.location && <span>•</span>}
                        <Badge variant="secondary">{job.jobType}</Badge>
                        {job.remote && <Badge variant="outline" className="border-primary text-primary">Remote</Badge>}
                      </div>
                      <div className="text-sm font-medium mt-2">
                        {job.salaryMin ? `$${job.salaryMin} - $${job.salaryMax}` : 'Salary undisclosed'}
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex-shrink-0">
                      <Button asChild>
                        <Link href={`/jobs/${job.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
