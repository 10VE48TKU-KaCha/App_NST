import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/Navbar'
import { Star, MapPin, Search } from 'lucide-react'

export default async function JobsPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams
  const q = searchParams?.q || ''
  
  const jobs = await prisma.job.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } }
      ]
    },
    include: { company: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-muted/10">
      <Navbar />
      
      {/* Search Header */}
      <div className="bg-white dark:bg-card border-b py-8">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">งานทั้งหมดในเมืองคอน (นครศรีธรรมราช)</h1>
            <p className="text-muted-foreground mt-1">
              {q ? `ผลการค้นหาสำหรับ "${q}"` : "เลือกดูตำแหน่งงานว่างในพื้นที่จังหวัดนครศรีธรรมราช"}
            </p>
          </div>
          <form className="flex w-full md:max-w-md items-center shadow-sm rounded-full border bg-background overflow-hidden p-1">
            <div className="pl-3 pr-2 text-muted-foreground">
              <Search className="w-4 h-4" />
            </div>
            <Input 
              name="q" 
              type="search" 
              placeholder="ค้นหางาน..." 
              defaultValue={q} 
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none px-2"
            />
            <Button type="submit" className="rounded-full px-6 shadow-none">ค้นหา</Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {jobs.length === 0 ? (
            <div className="col-span-full text-center py-20 text-muted-foreground bg-white border rounded-xl">
              ไม่พบงานที่ตรงกับการค้นหาของคุณ
            </div>
          ) : (
            jobs.map(job => (
              <Link href={`/jobs/${job.id}`} key={job.id} className="block group">
                <Card className="h-full overflow-hidden flex flex-col premium-hover border-0 shadow-sm ring-1 ring-border/50">
                  {/* Cover Image Placeholder - Using a CSS gradient pattern based on Job ID */}
                  <div 
                    className="h-40 w-full relative"
                    style={{
                      background: `linear-gradient(135deg, hsl(${job.id.charCodeAt(0) * 15 % 360} 70% 60%), hsl(${job.id.charCodeAt(job.id.length-1) * 25 % 360} 70% 40%))`
                    }}
                  >
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className="bg-white/90 text-foreground hover:bg-white border-0 shadow-sm font-semibold">{job.jobType}</Badge>
                      {job.remote && <Badge className="bg-primary text-primary-foreground border-0 shadow-sm">Remote</Badge>}
                    </div>
                  </div>
                  
                  <CardContent className="p-4 flex flex-col flex-1 relative pt-8">
                    {/* Floating Avatar */}
                    <Avatar className="h-14 w-14 absolute -top-7 left-4 border-4 border-card shadow-sm">
                      <AvatarFallback className="bg-background text-primary font-bold text-lg">
                        {job.company.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
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

                    {/* Price Footer */}
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
      </div>
    </div>
  )
}
