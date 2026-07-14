import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { upgradeJobToPremium } from '@/actions/employer'
import { CheckCircle2, Star } from 'lucide-react'

export default async function CheckoutPage(props: { params: Promise<{ jobId: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'EMPLOYER') return redirect('/login')

  const params = await props.params
  const jobId = params.jobId

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { company: true }
  })

  if (!job || job.company.userId !== session.user.id) {
    return redirect('/employer/dashboard')
  }

  if (job.isPremium) {
    return redirect('/employer/dashboard')
  }

  return (
    <div className="max-w-md mx-auto mt-12 w-full">
      <Card className="border-amber-200 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-amber-100 text-amber-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Star className="w-6 h-6 fill-current" />
          </div>
          <CardTitle className="text-2xl">Premium Job Upgrade</CardTitle>
          <CardDescription>
            Boost your visibility and hire faster
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold text-lg">{job.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{job.location}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-500" />
              <span className="text-sm">Pinned to the top of search results</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-500" />
              <span className="text-sm">Highlight badge to attract attention</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-500" />
              <span className="text-sm">Included in weekly job alert emails</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-b py-4 font-bold text-lg">
            <span>Total:</span>
            <span>฿1,500</span>
          </div>

          <div className="bg-blue-50 text-blue-800 p-3 rounded text-sm border border-blue-200">
            <strong>Mock Payment System:</strong> Clicking the button below will bypass actual payment and instantly upgrade the job for testing purposes.
          </div>
        </CardContent>
        <CardFooter>
          <form action={async () => {
            "use server"
            await upgradeJobToPremium(job.id)
          }} className="w-full">
            <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-6 text-lg shadow-md hover:shadow-lg transition-all" size="lg">
              Pay ฿1,500 (Mock)
            </Button>
            <Button type="button" variant="ghost" className="w-full mt-2" asChild>
              <a href="/employer/dashboard">Skip for now</a>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
