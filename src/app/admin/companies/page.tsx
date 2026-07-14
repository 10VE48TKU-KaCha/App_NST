import { prisma } from '@/lib/prisma'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default async function AdminCompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true, _count: { select: { jobs: true } } }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Manage Companies</h1>
      
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Jobs Posted</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell>{company.user?.email || 'Unknown'}</TableCell>
                <TableCell>{company.location || '-'}</TableCell>
                <TableCell>{company._count.jobs}</TableCell>
                <TableCell>{new Date(company.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {companies.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No companies found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
