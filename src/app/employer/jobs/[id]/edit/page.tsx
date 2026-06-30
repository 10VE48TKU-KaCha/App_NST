import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { updateJob } from '@/actions/employer'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function EditJobPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth()
  
  if (!session?.user || session.user?.role !== 'EMPLOYER') return redirect('/login')

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id }
  })

  if (!company) {
    return redirect('/employer/profile')
  }

  const job = await prisma.job.findUnique({
    where: { id: params.id }
  })

  if (!job || job.companyId !== company.id) {
    return notFound()
  }

  return (
    <div className="max-w-3xl mx-auto w-full">
      <Card>
        <CardHeader>
          <CardTitle>Edit Job Post</CardTitle>
          <CardDescription>
            Update the details for this job posting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={async (formData) => { "use server"; await updateJob(formData); }} className="space-y-6">
            <input type="hidden" name="jobId" value={job.id} />
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input 
                id="title" 
                name="title" 
                defaultValue={job.title}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                defaultValue={job.description}
                rows={8}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  name="location" 
                  defaultValue={job.location || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobType">Job Type</Label>
                <select 
                  id="jobType" 
                  name="jobType" 
                  defaultValue={job.jobType || 'Full-time'}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryMin">Minimum Salary (Optional)</Label>
                <Input 
                  id="salaryMin" 
                  name="salaryMin" 
                  type="number" 
                  defaultValue={job.salaryMin || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryMax">Maximum Salary (Optional)</Label>
                <Input 
                  id="salaryMax" 
                  name="salaryMax" 
                  type="number" 
                  defaultValue={job.salaryMax || ''}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="remote" name="remote" defaultChecked={job.remote} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <Label htmlFor="remote" className="font-normal cursor-pointer">This is a 100% Remote position</Label>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/employer/dashboard">Cancel</Link>
              </Button>
              <Button type="submit">Update Job</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
