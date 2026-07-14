import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const userEmail = process.argv[2]
  const companyOwnerEmail = process.argv[3]

  if (!userEmail || !companyOwnerEmail) {
    console.error('Usage: npx tsx scripts/make-company-member.ts <user-to-add-email> <company-owner-email>')
    process.exit(1)
  }

  const user = await prisma.user.findUnique({ where: { email: userEmail } })
  if (!user) {
    console.error(`User not found: ${userEmail}`)
    process.exit(1)
  }

  const owner = await prisma.user.findUnique({
    where: { email: companyOwnerEmail },
    include: { company: true }
  })

  if (!owner || !owner.company) {
    console.error(`Company owner not found or has no company: ${companyOwnerEmail}`)
    process.exit(1)
  }

  // Update user to EMPLOYER role if they aren't already
  if (user.role !== 'EMPLOYER') {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'EMPLOYER' }
    })
  }

  // Add to members
  try {
    await prisma.companyMember.create({
      data: {
        userId: user.id,
        companyId: owner.company.id,
        role: 'HR'
      }
    })
    console.log(`Successfully added ${userEmail} as HR to company ${owner.company.name}`)
  } catch (err) {
    console.error('Error adding member (maybe they are already a member?)', err)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
