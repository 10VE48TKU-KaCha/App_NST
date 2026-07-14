import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/Navbar"
import Link from "next/link"
import { Calendar, MessageCircle } from "lucide-react"

export default async function SeekerApplicationsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SEEKER') return redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id }
  })

  if (!profile) return redirect('/seeker/profile')

  const applications = await prisma.application.findMany({
    where: { profileId: profile.id },
    include: {
      job: { include: { company: true } },
      messages: true,
      interviews: { orderBy: { createdAt: 'desc' }, take: 1 }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-muted/10">
      <Navbar />
      <div className="container mx-auto p-4 md:p-6 max-w-4xl">
        <h1 className="text-2xl font-bold tracking-tight mb-6">My Applications</h1>

        {applications.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            You haven't applied to any jobs yet.
          </Card>
        ) : (
          <div className="grid gap-4">
            {applications.map(app => {
              const latestInterview = app.interviews[0]
              const unreadMessages = false // In a real app, track read status per message/application
              return (
                <Link key={app.id} href={`/seeker/applications/${app.id}`}>
                  <Card className="hover:shadow-md transition-shadow premium-hover cursor-pointer border-0 ring-1 ring-border shadow-sm">
                    <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                          {app.job.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{app.job.company.name}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <Badge variant="secondary">{app.status}</Badge>
                          {latestInterview && (
                            <div className="flex items-center gap-1 text-xs text-primary font-medium">
                              <Calendar className="w-3 h-3" />
                              Interview: {latestInterview.status}
                            </div>
                          )}
                          {app.messages.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MessageCircle className="w-3 h-3" />
                              {app.messages.length} messages
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        Applied {app.createdAt.toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
