import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { createJob } from '@/actions/employer'
import { redirect } from 'next/navigation'

export default async function CreateJobPage() {
  const session = await auth()
  
  if (!session?.user) return redirect('/login')

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id }
  })

  if (!company) {
    return redirect('/employer/profile')
  }

  return (
    <div className="max-w-3xl mx-auto w-full">
      <Card>
        <CardHeader>
          <CardTitle>Post a New Job</CardTitle>
          <CardDescription>
            Reach thousands of potential candidates by posting a detailed job description.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={async (formData) => { "use server"; await createJob(formData); }} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input 
                id="title" 
                name="title" 
                placeholder="e.g. Senior Frontend Developer" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Describe the role, responsibilities, and requirements..."
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
                  placeholder="e.g. Bangkok, Thailand"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobType">Job Type</Label>
                <select 
                  id="jobType" 
                  name="jobType" 
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
                  placeholder="e.g. 30000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryMax">Maximum Salary (Optional)</Label>
                <Input 
                  id="salaryMax" 
                  name="salaryMax" 
                  type="number" 
                  placeholder="e.g. 50000"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="remote" name="remote" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <Label htmlFor="remote" className="font-normal cursor-pointer">This is a 100% Remote position</Label>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl mt-6">
              <div className="flex items-start space-x-3">
                <input type="checkbox" id="isPremium" name="isPremium" className="h-5 w-5 mt-1 rounded border-amber-400 text-amber-500 focus:ring-amber-500" />
                <div>
                  <Label htmlFor="isPremium" className="font-bold cursor-pointer text-amber-700 dark:text-amber-500 text-base">Make this a Premium Job (Mock Payment)</Label>
                  <p className="text-sm text-amber-600/80 dark:text-amber-400/80 mt-1">
                    Premium jobs are pinned to the top of the search results and receive 3x more views. You will be redirected to a mock checkout page.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <a href="/employer/dashboard">Cancel</a>
              </Button>
              <Button type="submit">Publish Job</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
