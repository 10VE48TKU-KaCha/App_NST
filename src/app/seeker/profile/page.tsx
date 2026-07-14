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
import { SeekerProfileForm } from '@/components/SeekerProfileForm'

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
          <SeekerProfileForm profile={profile} />
        </CardContent>
      </Card>
    </div>
    </>
  )
}
