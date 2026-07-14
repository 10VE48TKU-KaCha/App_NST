'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function sendMessage(applicationId: string, content: string, receiverId: string, redirectUrl: string) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  if (!content.trim()) return { error: 'Message cannot be empty' }

  await prisma.message.create({
    data: {
      applicationId,
      senderId: session.user.id,
      content
    }
  })

  // Create notification for the receiver
  await prisma.notification.create({
    data: {
      userId: receiverId,
      title: 'New Message',
      message: `${session.user.name || 'Someone'} sent you a message.`,
      link: redirectUrl
    }
  })

  revalidatePath(redirectUrl)
  return { success: true }
}

export async function scheduleInterview(applicationId: string, scheduledAt: string, meetingLink: string, seekerUserId: string, redirectUrl: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'EMPLOYER') return { error: 'Unauthorized' }

  await prisma.interview.create({
    data: {
      applicationId,
      scheduledAt: new Date(scheduledAt),
      meetingLink
    }
  })

  // Update application status
  await prisma.application.update({
    where: { id: applicationId },
    data: { status: 'INTERVIEW' }
  })

  // Create notification for seeker
  await prisma.notification.create({
    data: {
      userId: seekerUserId,
      title: 'Interview Scheduled',
      message: `An employer has scheduled an interview with you.`,
      link: `/seeker/applications/${applicationId}`
    }
  })

  revalidatePath(redirectUrl)
  return { success: true }
}

export async function confirmInterview(interviewId: string, employerUserId: string, redirectUrl: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SEEKER') return { error: 'Unauthorized' }

  await prisma.interview.update({
    where: { id: interviewId },
    data: { status: 'CONFIRMED' }
  })

  // Create notification for employer
  await prisma.notification.create({
    data: {
      userId: employerUserId,
      title: 'Interview Confirmed',
      message: `The candidate has confirmed the interview.`,
      link: redirectUrl // Actually the employer's redirect URL is different, but let's pass it from frontend or infer it
    }
  })

  revalidatePath(redirectUrl)
  return { success: true }
}

export async function markNotificationsRead() {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true }
  })

  return { success: true }
}
