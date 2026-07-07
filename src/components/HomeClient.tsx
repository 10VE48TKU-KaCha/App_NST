"use client"

import Link from 'next/link'
import { Search, Code, Palette, PenTool, PieChart, Database, Monitor, Headphones, Briefcase } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const categories = [
  { name: 'Programming & Tech', icon: <Code className="w-6 h-6" />, count: '2,400+' },
  { name: 'Graphics & Design', icon: <Palette className="w-6 h-6" />, count: '1,800+' },
  { name: 'Digital Marketing', icon: <PieChart className="w-6 h-6" />, count: '1,200+' },
  { name: 'Writing & Translation', icon: <PenTool className="w-6 h-6" />, count: '900+' },
  { name: 'Data Science', icon: <Database className="w-6 h-6" />, count: '600+' },
  { name: 'IT Support', icon: <Monitor className="w-6 h-6" />, count: '450+' },
  { name: 'Consulting', icon: <Briefcase className="w-6 h-6" />, count: '800+' },
  { name: 'Customer Service', icon: <Headphones className="w-6 h-6" />, count: '1,100+' },
]

export function HomeClient() {
  return (
    <main className="flex-1 bg-muted/10">
      
      {/* Hero Section with Massive Search */}
      <section className="w-full pt-20 pb-16 md:pt-32 md:pb-24 bg-white dark:bg-card border-b">
        <div className="container px-4 md:px-6 mx-auto flex flex-col items-center text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl mb-4">
            หางานและพนักงานใน <span className="text-primary">นครศรีธรรมราช</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
            แพลตฟอร์มอันดับ 1 สำหรับชาวนครศรีธรรมราช ค้นหางานที่ใช่ หรือโพสต์หาพนักงานในพื้นที่ได้สะดวกรวดเร็ว
          </p>

          <div className="w-full max-w-3xl flex items-center shadow-lg rounded-full border bg-background overflow-hidden p-1">
            <div className="pl-4 pr-2 text-muted-foreground">
              <Search className="w-5 h-5" />
            </div>
            <Input 
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base py-6 shadow-none" 
              placeholder="ค้นหางาน เช่น 'สร้างเว็บไซต์', 'ออกแบบโลโก้', 'การตลาดออนไลน์'" 
            />
            <Button className="rounded-full px-8 py-6 text-base font-semibold shadow-none hidden sm:flex">
              ค้นหาเลย
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">ยอดฮิต:</span>
            <Link href="/jobs?q=frontend" className="hover:text-primary transition-colors">Frontend Developer,</Link>
            <Link href="/jobs?q=ux" className="hover:text-primary transition-colors">UX/UI Design,</Link>
            <Link href="/jobs?q=seo" className="hover:text-primary transition-colors">SEO Specialist</Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-2xl font-bold mb-8">หมวดหมู่งานยอดนิยม</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <Link 
                href={`/jobs?q=${cat.name.split(' ')[0].toLowerCase()}`} 
                key={i}
                className="flex flex-col items-center justify-center p-6 bg-white dark:bg-card border rounded-xl hover:shadow-md hover:border-primary/50 transition-all premium-hover text-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {cat.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{cat.count} งาน</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}
