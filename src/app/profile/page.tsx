import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { upsertSeekerProfile } from '@/actions/seeker'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'

export default async function SeekerProfilePage() {
  const session = await auth()
  
  if (!session?.user) return redirect('/login')
  if (!session?.user || session.user?.role !== 'SEEKER') return redirect('/employer/dashboard')

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id }
  })

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto w-full py-8 px-4">
        <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>
            Update your resume, skills, and experience to apply for jobs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={async (formData) => { "use server"; await upsertSeekerProfile(formData); }} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma separated)</Label>
              <Input 
                id="skills" 
                name="skills" 
                defaultValue={profile?.skills?.join(', ') || ''} 
                placeholder="React, Node.js, Python, Project Management"
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experience">Experience Summary</Label>
              <Textarea 
                id="experience" 
                name="experience" 
                defaultValue={profile?.experience || ''} 
                placeholder="Briefly describe your past work experience..."
                rows={5}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedSalary">Expected Salary (Optional)</Label>
                <Input 
                  id="expectedSalary" 
                  name="expectedSalary" 
                  type="number" 
                  defaultValue={profile?.expectedSalary || ''} 
                  placeholder="e.g. 50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resumeUrl">Resume Link (Optional)</Label>
                <Input 
                  id="resumeUrl" 
                  name="resumeUrl" 
                  type="url" 
                  defaultValue={profile?.resumeUrl || ''} 
                  placeholder="https://drive.google.com/... or LinkedIn"
                />
              </div>
            </div>

            <Button type="submit">Save Profile</Button>
          </form>
        </CardContent>
      </Card>
    </div>
    </>
  )
}
