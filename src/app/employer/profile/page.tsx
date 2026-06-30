import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { upsertCompanyProfile } from '@/actions/employer'
import { redirect } from 'next/navigation'

export default async function CompanyProfilePage() {
  const session = await auth()
  
  if (!session?.user) return redirect('/login')

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id }
  })

  return (
    <div className="max-w-2xl mx-auto w-full">
      <Card>
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
          <CardDescription>
            Manage your company details. This information will be visible to job seekers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={async (formData) => { "use server"; await upsertCompanyProfile(formData); }} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={company?.name || ''} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">About the Company</Label>
              <Textarea 
                id="description" 
                name="description" 
                defaultValue={company?.description || ''} 
                rows={5}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Headquarters Location</Label>
                <Input 
                  id="location" 
                  name="location" 
                  defaultValue={company?.location || ''} 
                  placeholder="e.g. Bangkok, Thailand"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website" 
                  name="website" 
                  type="url" 
                  defaultValue={company?.website || ''} 
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <Button type="submit">Save Profile</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
