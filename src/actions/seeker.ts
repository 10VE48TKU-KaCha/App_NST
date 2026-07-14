'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function upsertSeekerProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user?.role !== 'SEEKER') {
    return { error: 'Unauthorized' }
  }

  const skillsStr = formData.get('skills') as string
  const experience = formData.get('experience') as string
  const resumeUrl = formData.get('resumeUrl') as string
  const expectedSalaryStr = formData.get('expectedSalary') as string

  const skills = skillsStr ? skillsStr.split(',').map(s => s.trim()).filter(Boolean) : []
  const expectedSalary = expectedSalaryStr ? parseInt(expectedSalaryStr) : null

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: { skills, experience, expectedSalary, resumeUrl },
    create: {
      userId: session.user.id,
      skills,
      experience,
      expectedSalary,
      resumeUrl
    }
  })

  revalidatePath('/seeker/profile')
  return { success: true }
}

export async function applyForJob(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user?.role !== 'SEEKER') {
    return { error: 'Unauthorized' }
  }

  const jobId = formData.get('jobId') as string
  const resumePdf = formData.get('resumePdf') as File | null
  
  if (!jobId) return { error: 'Missing Job ID' }
  if (!resumePdf || resumePdf.size === 0) return { error: 'Missing Resume PDF' }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id }
  })

  if (!profile) {
    return { error: 'Please create a profile first' }
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId }
  })

  if (!job) return { error: 'Job not found' }

  let matchScore = 0
  let aiSummary = "ยังไม่ได้ประมวลผลด้วย AI"

  // Since AI is removed for now, we just mock the score and summary or leave them empty.
  // In a real app without AI, HR would manually review the resume.

  await prisma.application.create({
    data: {
      jobId,
      profileId: profile.id,
      status: 'REVIEWING',
      matchScore,
      aiSummary
    }
  })

  revalidatePath(`/jobs/${jobId}`)
  revalidatePath('/seeker/dashboard')
  
  return { success: true }
}

export async function withdrawApplication(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user?.role !== 'SEEKER') {
    return { error: 'Unauthorized' }
  }

  const applicationId = formData.get('applicationId') as string
  if (!applicationId) return { error: 'Application ID is required' }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id }
  })
  if (!profile) return { error: 'Profile not found' }

  const application = await prisma.application.findUnique({
    where: { id: applicationId }
  })

  if (!application || application.profileId !== profile.id) {
    return { error: 'Application not found or unauthorized' }
  }

  // Only allow withdrawing if the status is REVIEWING
  if (application.status !== 'REVIEWING') {
    return { error: 'Cannot withdraw application at this stage' }
  }

  await prisma.application.delete({
    where: { id: applicationId }
  })

  revalidatePath('/seeker/dashboard')
  return { success: true }
}

export async function toggleSaveJob(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user?.role !== 'SEEKER') {
    return { error: 'Unauthorized' }
  }

  const jobId = formData.get('jobId') as string
  if (!jobId) return { error: 'Job ID is required' }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id }
  })
  if (!profile) return { error: 'Profile not found' }

  const existingSave = await (prisma as any).savedJob.findUnique({
    where: {
      jobId_profileId: {
        jobId,
        profileId: profile.id
      }
    }
  })

  if (existingSave) {
    await (prisma as any).savedJob.delete({
      where: { id: existingSave.id }
    })
  } else {
    await (prisma as any).savedJob.create({
      data: {
        jobId,
        profileId: profile.id
      }
    })
  }

  revalidatePath(`/jobs/${jobId}`)
  revalidatePath('/seeker/saved-jobs')
  return { success: true }
}



export async function createJobAlert(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user?.role !== 'SEEKER') {
    // If not logged in, redirect to login
    const { redirect } = await import('next/navigation');
    redirect('/login')
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id }
  })

  if (!profile) {
    const { redirect } = await import('next/navigation');
    redirect('/seeker/profile')
  }

  const keyword = formData.get('keyword') as string
  const jobType = formData.get('jobType') as string
  const remote = formData.get('remote') === 'true'
  const minSalaryStr = formData.get('minSalary') as string
  const minSalary = minSalaryStr ? parseInt(minSalaryStr) : null

  await prisma.jobAlert.create({
    data: {
      profileId: profile.id,
      keyword: keyword || null,
      jobType: jobType || null,
      remote: remote,
      minSalary: minSalary
    }
  })

  // In a real app, this would trigger a cron job/webhook setup.
  // We'll just mock the success by redirecting back with a success flag.
  const { redirect } = await import('next/navigation');
  redirect('/jobs?alert=success')
}
