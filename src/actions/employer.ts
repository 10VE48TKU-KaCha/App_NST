'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function upsertCompanyProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user?.role !== 'EMPLOYER') {
    return { error: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const website = formData.get('website') as string

  if (!name) return { error: 'Company name is required' }

  await prisma.company.upsert({
    where: { userId: session.user.id },
    update: { name, description, location, website },
    create: {
      userId: session.user.id,
      name,
      description,
      location,
      website
    }
  })

  revalidatePath('/employer/profile')
  revalidatePath('/employer/dashboard')
  
  return { success: true }
}

export async function createJob(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user?.role !== 'EMPLOYER') {
    return { error: 'Unauthorized' }
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id }
  })

  if (!company) {
    return { error: 'You must create a company profile first' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const jobType = formData.get('jobType') as string
  const remote = formData.get('remote') === 'on'
  const salaryMinStr = formData.get('salaryMin') as string
  const salaryMaxStr = formData.get('salaryMax') as string

  if (!title || !description) return { error: 'Title and description are required' }

  await prisma.job.create({
    data: {
      companyId: company.id,
      title,
      description,
      location,
      jobType,
      remote,
      salaryMin: salaryMinStr ? parseInt(salaryMinStr) : null,
      salaryMax: salaryMaxStr ? parseInt(salaryMaxStr) : null,
    }
  })

  revalidatePath('/employer/dashboard')
  
  redirect('/employer/dashboard')
}

export async function updateApplicationStatus(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user?.role !== 'EMPLOYER') {
    return { error: 'Unauthorized' }
  }

  const applicationId = formData.get('applicationId') as string
  const status = formData.get('status') as "REVIEWING" | "INTERVIEW" | "HIRED" | "REJECTED"

  if (!applicationId || !status) return { error: 'Missing data' }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true }
  })

  if (!application) return { error: 'Application not found' }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id }
  })

  if (application.job.companyId !== company?.id) {
    return { error: 'Unauthorized' }
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { status }
  })

  revalidatePath(`/employer/jobs/${application.jobId}`)
  
  return { success: true }
}

export async function updateJob(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user?.role !== 'EMPLOYER') {
    return { error: 'Unauthorized' }
  }

  const jobId = formData.get('jobId') as string
  if (!jobId) return { error: 'Job ID is required' }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id }
  })
  
  const existingJob = await prisma.job.findUnique({ where: { id: jobId } })
  if (!existingJob || existingJob.companyId !== company?.id) {
    return { error: 'Unauthorized or job not found' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const jobType = formData.get('jobType') as string
  const remote = formData.get('remote') === 'on'
  const salaryMinStr = formData.get('salaryMin') as string
  const salaryMaxStr = formData.get('salaryMax') as string

  if (!title || !description) return { error: 'Title and description are required' }

  await prisma.job.update({
    where: { id: jobId },
    data: {
      title,
      description,
      location,
      jobType,
      remote,
      salaryMin: salaryMinStr ? parseInt(salaryMinStr) : null,
      salaryMax: salaryMaxStr ? parseInt(salaryMaxStr) : null,
    }
  })

  revalidatePath('/employer/dashboard')
  redirect('/employer/dashboard')
}

export async function deleteJob(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user?.role !== 'EMPLOYER') {
    return { error: 'Unauthorized' }
  }

  const jobId = formData.get('jobId') as string
  if (!jobId) return { error: 'Job ID is required' }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id }
  })
  
  const existingJob = await prisma.job.findUnique({ where: { id: jobId } })
  if (!existingJob || existingJob.companyId !== company?.id) {
    return { error: 'Unauthorized or job not found' }
  }

  await prisma.job.delete({
    where: { id: jobId }
  })

  revalidatePath('/employer/dashboard')
  redirect('/employer/dashboard')
}
