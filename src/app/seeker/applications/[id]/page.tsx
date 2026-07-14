import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Video, Send } from "lucide-react"
import { sendMessage, confirmInterview } from "@/actions/communication"
import { Navbar } from "@/components/Navbar"

export default async function SeekerApplicationDetailsPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SEEKER') return redirect('/login')

  const params = await props.params
  const applicationId = params.id

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      profile: true,
      job: {
        include: { company: true }
      },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { sender: true }
      },
      interviews: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!application || application.profile.userId !== session.user.id) {
    return redirect('/seeker/applications')
  }

  const latestInterview = application.interviews[0]

  return (
    <div className="min-h-screen bg-muted/10">
      <Navbar />
      <div className="container mx-auto p-4 md:p-6 max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{application.job.title}</h1>
            <p className="text-muted-foreground">
              {application.job.company.name}
            </p>
          </div>
          <Badge variant="secondary" className="text-lg py-1 px-3">
            {application.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Interview Schedule */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Interview Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {latestInterview ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{latestInterview.scheduledAt.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{latestInterview.scheduledAt.toLocaleTimeString()}</span>
                      </div>
                      {latestInterview.meetingLink && (
                        <div className="flex items-center gap-2 text-sm">
                          <Video className="w-4 h-4 text-muted-foreground" />
                          <a href={latestInterview.meetingLink} target="_blank" rel="noreferrer" className="text-primary hover:underline line-clamp-1">
                            Join Meeting
                          </a>
                        </div>
                      )}
                    </div>
                    
                    {latestInterview.status === 'PENDING' ? (
                      <form action={async () => {
                        "use server"
                        await confirmInterview(latestInterview.id, application.job.company.userId, `/seeker/applications/${application.id}`)
                      }}>
                        <Button type="submit" className="w-full" size="sm">Confirm Interview</Button>
                      </form>
                    ) : (
                      <Badge variant="default" className="w-full justify-center">
                        {latestInterview.status}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No interview scheduled yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Chat Box */}
          <div className="md:col-span-2 flex flex-col h-[600px]">
            <Card className="flex flex-col h-full border shadow-sm">
              <CardHeader className="border-b py-3 px-4 bg-muted/30">
                <CardTitle className="text-base flex items-center gap-2">
                  Chat with {application.job.company.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
                {application.messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    No messages yet. Say hello!
                  </div>
                ) : (
                  application.messages.map(msg => {
                    const isMe = msg.senderId === session.user.id
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-muted-foreground">
                            {isMe ? 'You' : msg.sender.name || application.job.company.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground/70">
                            {msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-white border shadow-sm rounded-tl-sm'}`}>
                          {msg.content}
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
              <div className="p-3 border-t bg-white">
                <form action={async (formData) => {
                  "use server"
                  const content = formData.get('content') as string
                  if (content) {
                    await sendMessage(application.id, content, application.job.company.userId, `/seeker/applications/${application.id}`)
                  }
                }} className="flex items-center gap-2">
                  <Input name="content" placeholder="Type your message..." className="flex-1 rounded-full px-4 border-muted-foreground/20" autoComplete="off" />
                  <Button type="submit" size="icon" className="rounded-full shrink-0">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
