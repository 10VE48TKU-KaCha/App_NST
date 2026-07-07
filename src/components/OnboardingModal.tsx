"use client"

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Briefcase, Target, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function OnboardingModal({ isNewUser, role }: { isNewUser: boolean, role: 'SEEKER' | 'EMPLOYER' }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)

  useEffect(() => {
    if (isNewUser) {
      setOpen(true)
    }
  }, [isNewUser])

  if (!isNewUser) return null;

  const seekerSteps = [
    { title: "ยินดีต้อนรับสู่ JobSearch", description: "แพลตฟอร์มหางานที่ใช่สำหรับคุณ เราจะพาคุณไปทำความรู้จักกับระบบเบื้องต้นกันครับ", icon: <Briefcase className="w-12 h-12 text-primary" /> },
    { title: "1. สร้างโปรไฟล์ของคุณ", description: "อันดับแรก กรอกข้อมูลโปรไฟล์ ทักษะ และประสบการณ์ เพื่อให้ AI ของเราจับคู่คุณกับงานที่เหมาะสมที่สุด", icon: <Target className="w-12 h-12 text-primary" /> },
    { title: "2. ค้นหางานที่ใช่", description: "เรียกดูตำแหน่งงาน หรือรอรับการแนะนำจากระบบ แล้วกดสมัครได้ทันที ขอให้โชคดีในการหางานครับ!", icon: <Search className="w-12 h-12 text-primary" /> },
  ];

  const employerSteps = [
    { title: "ยินดีต้อนรับสู่ JobSearch Employer", description: "ระบบจัดการรับสมัครงานสำหรับบริษัทของคุณ เริ่มต้นใช้งานกันเลยครับ", icon: <Briefcase className="w-12 h-12 text-primary" /> },
    { title: "1. สร้างโปรไฟล์บริษัท", description: "เพิ่มข้อมูลบริษัทของคุณ เพื่อให้ผู้สมัครรู้จักและสนใจร่วมงานด้วย", icon: <Target className="w-12 h-12 text-primary" /> },
    { title: "2. ประกาศรับสมัครงาน", description: "ลงประกาศตำแหน่งงาน และจัดการผู้สมัครที่สนใจได้อย่างง่ายดายผ่านแดชบอร์ด", icon: <Search className="w-12 h-12 text-primary" /> },
  ];

  const steps = role === 'SEEKER' ? seekerSteps : employerSteps;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="sr-only">Onboarding</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="p-4 rounded-full bg-primary/10">
                {steps[step - 1].icon}
              </div>
              <h2 className="text-2xl font-bold text-foreground">{steps[step - 1].title}</h2>
              <p className="text-muted-foreground">{steps[step - 1].description}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <DialogFooter className="flex items-center sm:justify-between w-full">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full transition-colors ${i === step - 1 ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
          <div className="flex gap-2">
            {step < steps.length ? (
              <Button onClick={() => setStep(step + 1)}>ถัดไป</Button>
            ) : (
              <Button asChild onClick={() => setOpen(false)}>
                <Link href={role === 'SEEKER' ? "/profile" : "/employer/profile"}>
                  เริ่มตั้งค่าโปรไฟล์
                </Link>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
