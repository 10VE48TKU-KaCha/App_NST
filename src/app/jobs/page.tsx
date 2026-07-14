import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Navbar } from '@/components/Navbar'
import { Star, MapPin, Search, Briefcase, DollarSign, Filter, Bell } from 'lucide-react'
import Link from 'next/link'
import { Prisma } from '@prisma/client'

export default async function JobsPage(props: { searchParams: Promise<{ q?: string, page?: string, jobType?: string, remote?: string, minSalary?: string }> }) {
  const searchParams = await props.searchParams
  const q = searchParams?.q || ''
  const page = parseInt(searchParams?.page || '1')
  const jobType = searchParams?.jobType || ''
  const remote = searchParams?.remote === 'true'
  const minSalary = searchParams?.minSalary ? parseInt(searchParams.minSalary) : undefined
  
  const limit = 8
  const skip = (page - 1) * limit
  
  const whereClause: Prisma.JobWhereInput = {
    AND: [
      q ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' as const } },
          { location: { contains: q, mode: 'insensitive' as const } }
        ]
      } : {},
      jobType ? { jobType: { contains: jobType, mode: 'insensitive' as const } } : {},
      remote ? { remote: true } : {},
      minSalary ? { salaryMin: { gte: minSalary } } : {}
    ]
  }
  
  const [jobs, totalJobs] = await Promise.all([
    prisma.job.findMany({
      where: whereClause,
      include: { company: true },
      orderBy: [
        { isPremium: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    }),
    prisma.job.count({
      where: whereClause
    })
  ])
  
  const totalPages = Math.ceil(totalJobs / limit)

  return (
    <div className="min-h-screen bg-muted/10">
      <Navbar />
      
      {/* Search Header */}
      <div className="bg-white dark:bg-card border-b py-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">ค้นหางานทั้งหมด</h1>
              <p className="text-muted-foreground mt-1">
                {totalJobs} ตำแหน่งงานที่ตรงกับความต้องการของคุณ
              </p>
            </div>
            
            <form action={async (formData) => { "use server"; const { createJobAlert } = await import('@/actions/seeker'); await createJobAlert(formData); }} className="flex items-center">
              <input type="hidden" name="keyword" value={q} />
              <input type="hidden" name="jobType" value={jobType} />
              <input type="hidden" name="remote" value={remote ? 'true' : 'false'} />
              <input type="hidden" name="minSalary" value={minSalary || ''} />
              <Button type="submit" variant="outline" className="gap-2 border-primary/20 text-primary hover:bg-primary/5">
                <Bell className="w-4 h-4" /> Subscribe to Alerts
              </Button>
            </form>
          </div>

          <form className="flex flex-col md:flex-row gap-4 p-4 shadow-sm rounded-xl border bg-background">
            <div className="flex-1 flex items-center gap-2 border-b md:border-b-0 md:border-r pb-3 md:pb-0 md:pr-4">
              <Search className="w-5 h-5 text-muted-foreground ml-2" />
              <Input 
                name="q" 
                placeholder="ตำแหน่งงาน, ทักษะ, หรือบริษัท..." 
                defaultValue={q} 
                className="border-0 focus-visible:ring-0 px-2 text-base"
              />
            </div>
            <div className="flex-1 flex items-center gap-2 border-b md:border-b-0 md:border-r pb-3 md:pb-0 md:pr-4">
              <Briefcase className="w-5 h-5 text-muted-foreground ml-2" />
              <select name="jobType" defaultValue={jobType} className="flex-1 bg-transparent border-0 focus:ring-0 text-sm outline-none">
                <option value="">ทุกประเภทสัญญา</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div className="flex-1 flex items-center gap-2 border-b md:border-b-0 md:border-r pb-3 md:pb-0 md:pr-4">
              <DollarSign className="w-5 h-5 text-muted-foreground ml-2" />
              <Input 
                name="minSalary" 
                type="number"
                placeholder="เงินเดือนขั้นต่ำ" 
                defaultValue={minSalary || ''} 
                className="border-0 focus-visible:ring-0 px-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-3 md:w-auto w-full justify-between">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer pl-2">
                <input type="checkbox" name="remote" value="true" defaultChecked={remote} className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4" />
                Remote Only
              </label>
              <Button type="submit" size="lg" className="px-8 shadow-none">ค้นหา</Button>
            </div>
          </form>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {jobs.length === 0 ? (
            <div className="col-span-full text-center py-20 text-muted-foreground bg-white border rounded-xl flex flex-col items-center justify-center">
              <Filter className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">ไม่พบงานที่ตรงกับตัวกรองของคุณ</h3>
              <p>ลองปรับเปลี่ยนเงื่อนไขการค้นหาให้กว้างขึ้น</p>
            </div>
          ) : (
            jobs.map(job => (
              <Link href={`/jobs/${job.id}`} key={job.id} className="block group">
                <Card className={`h-full overflow-hidden flex flex-col premium-hover border-0 shadow-sm ring-1 ${job.isPremium ? 'ring-amber-300 shadow-amber-100 dark:ring-amber-500/50 dark:shadow-amber-900/20' : 'ring-border/50'}`}>
                  <div 
                    className="h-40 w-full relative"
                    style={{
                      background: job.isPremium ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : `linear-gradient(135deg, hsl(${job.id.charCodeAt(0) * 15 % 360} 70% 60%), hsl(${job.id.charCodeAt(job.id.length-1) * 25 % 360} 70% 40%))`
                    }}
                  >
                    <div className="absolute top-3 left-3 flex gap-2">
                      {job.isPremium && <Badge className="bg-white text-amber-600 hover:bg-white border-0 shadow-sm font-bold uppercase tracking-widest text-[10px]">Promoted</Badge>}
                      <Badge className="bg-white/90 text-foreground hover:bg-white border-0 shadow-sm font-semibold">{job.jobType}</Badge>
                      {job.remote && <Badge className="bg-primary text-primary-foreground border-0 shadow-sm">Remote</Badge>}
                    </div>
                  </div>
                  
                  <CardContent className="p-4 flex flex-col flex-1 relative pt-8">
                    <Avatar className="h-14 w-14 absolute -top-7 left-4 border-4 border-card shadow-sm">
                      <AvatarFallback className="bg-background text-primary font-bold text-lg">
                        {job.company.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="text-sm font-medium text-muted-foreground flex items-center justify-between mb-1">
                      <span className="truncate">{job.company.name}</span>
                      <div className="flex items-center text-amber-500 font-bold text-xs gap-1">
                        <Star className="w-3 h-3 fill-current" /> 5.0
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {job.title}
                    </h3>
                    
                    <div className="flex items-center text-xs text-muted-foreground mt-auto mb-4">
                      <MapPin className="w-3 h-3 mr-1 opacity-70" />
                      {job.location}
                    </div>

                    <div className="border-t pt-3 flex items-center justify-between mt-auto">
                      <span className="text-xs text-muted-foreground">เริ่มต้นที่</span>
                      <span className="font-bold text-lg text-foreground">
                        {job.salaryMin ? `฿${job.salaryMin.toLocaleString()}` : 'ตามตกลง'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12 gap-2">
            <Button variant="outline" asChild disabled={page <= 1}>
              <Link href={`/jobs?q=${q}&jobType=${jobType}&remote=${remote}&minSalary=${minSalary || ''}&page=${page > 1 ? page - 1 : 1}`} className={page <= 1 ? "pointer-events-none opacity-50" : ""}>
                ก่อนหน้า
              </Link>
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button 
                  key={i} 
                  variant={page === i + 1 ? "default" : "outline"} 
                  size="icon" 
                  asChild
                >
                  <Link href={`/jobs?q=${q}&jobType=${jobType}&remote=${remote}&minSalary=${minSalary || ''}&page=${i + 1}`}>
                    {i + 1}
                  </Link>
                </Button>
              ))}
            </div>
            
            <Button variant="outline" asChild disabled={page >= totalPages}>
              <Link href={`/jobs?q=${q}&jobType=${jobType}&remote=${remote}&minSalary=${minSalary || ''}&page=${page < totalPages ? page + 1 : totalPages}`} className={page >= totalPages ? "pointer-events-none opacity-50" : ""}>
                ถัดไป
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
