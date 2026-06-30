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

  revalidatePath('/profile')
  return { success: true }
}

export async function applyForJob(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user?.role !== 'SEEKER') {
    return { error: 'Unauthorized' }
  }

  const jobId = formData.get('jobId') as string
  if (!jobId) return { error: 'Missing Job ID' }

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

  // Simple Mock AI Match Score: Compare skills to description words
  const jobWords = new Set(job.description.toLowerCase().split(/\W+/))
  let matches = 0
  profile.skills.forEach(skill => {
    if (jobWords.has(skill.toLowerCase())) matches++
  })
  
  const totalSkills = profile.skills.length || 1
  let matchScore = Math.round((matches / totalSkills) * 100)
  if (matchScore > 100) matchScore = 100
  if (matchScore === 0 && profile.skills.length > 0) matchScore = 10 // baseline

  await prisma.application.create({
    data: {
      jobId,
      profileId: profile.id,
      matchScore
    }
  })

  revalidatePath(`/jobs/${jobId}`)
  revalidatePath('/dashboard')
  
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

  revalidatePath('/dashboard')
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
  revalidatePath('/saved-jobs')
  return { success: true }
}
