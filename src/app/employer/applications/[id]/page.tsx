import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Video, Send } from "lucide-react"
import { sendMessage, scheduleInterview } from "@/actions/communication"

export default async function EmployerApplicationDetailsPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'EMPLOYER') return redirect('/employer/dashboard')

  const params = await props.params
  const applicationId = params.id

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      profile: {
        include: { user: true }
      },
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

  if (!application) return redirect('/employer/dashboard')

  // Check if employer belongs to the company
  const company = await prisma.company.findFirst({
    where: {
      OR: [
        { userId: session.user.id },
        { members: { some: { userId: session.user.id } } }
      ]
    }
  })

  if (!company || company.id !== application.job.companyId) {
    return redirect('/employer/dashboard')
  }

  const applicant = application.profile.user
  const latestInterview = application.interviews[0]

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Application Details</h1>
          <p className="text-muted-foreground">
            {applicant.name} applying for {application.job.title}
          </p>
        </div>
        <Badge variant="secondary" className="text-lg py-1 px-3">
          {application.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Applicant Info & Interview Schedule */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Applicant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {applicant.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{applicant.name}</h3>
                  <p className="text-xs text-muted-foreground">{applicant.email}</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs">Match Score</span>
                  <span className="font-medium text-amber-500">{application.matchScore || 0}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Expected Salary</span>
                  <span className="font-medium">{application.profile.expectedSalary ? `฿${application.profile.expectedSalary.toLocaleString()}` : 'Not specified'}</span>
                </div>
                {application.profile.resumeUrl && (
                  <div>
                    <a href={application.profile.resumeUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">
                      View Resume (PDF)
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Interview Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {latestInterview ? (
                <div className="space-y-3">
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
                        Meeting Link
                      </a>
                    </div>
                  )}
                  <Badge className="mt-2" variant={latestInterview.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                    {latestInterview.status}
                  </Badge>
                </div>
              ) : (
                <form action={async (formData) => { 
                  "use server"
                  const scheduledAt = formData.get('scheduledAt') as string
                  const meetingLink = formData.get('meetingLink') as string
                  if (scheduledAt) {
                    await scheduleInterview(application.id, scheduledAt, meetingLink, applicant.id, `/employer/applications/${application.id}`)
                  }
                }} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Date & Time</label>
                    <Input type="datetime-local" name="scheduledAt" required className="text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Meeting Link (Google Meet, Zoom)</label>
                    <Input type="url" name="meetingLink" placeholder="https://meet.google.com/..." className="text-sm" />
                  </div>
                  <Button type="submit" className="w-full" size="sm">Schedule Interview</Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Chat Box */}
        <div className="md:col-span-2 flex flex-col h-[600px]">
          <Card className="flex flex-col h-full border shadow-sm">
            <CardHeader className="border-b py-3 px-4 bg-muted/30">
              <CardTitle className="text-base flex items-center gap-2">
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
              {application.messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                application.messages.map(msg => {
                  const isMe = msg.senderId === session.user.id
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          {isMe ? 'You' : msg.sender.name}
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
                  await sendMessage(application.id, content, applicant.id, `/employer/applications/${application.id}`)
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
  )
}
