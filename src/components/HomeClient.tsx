"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Building, Search } from 'lucide-react'

export function HomeClient() {
  return (
    <main className="flex-1">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 lg:py-40 relative">
        <div className="container px-4 md:px-6 relative z-10 mx-auto">
          <div className="flex flex-col items-center space-y-8 text-center max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary"
            >
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              The #1 Platform for Tech Professionals
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Find Your Dream Job <br className="hidden sm:block" />
                <span className="text-gradient">Today</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl leading-relaxed">
                Connect with elite employers and discover opportunities that match your exceptional skills. Your next career move starts here.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-lg"
            >
              <Link
                className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-105"
                href="/jobs"
              >
                <Search className="mr-2 h-4 w-4" /> Browse Jobs
              </Link>
              <Link
                className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-input bg-background/50 backdrop-blur-sm px-8 text-base font-semibold shadow-sm transition-all hover:bg-accent hover:text-accent-foreground hover:scale-105"
                href="/employer"
              >
                <Building className="mr-2 h-4 w-4" /> Post a Job
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 border-y border-border/40 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border/40">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="space-y-2">
              <h3 className="text-4xl font-bold">10k+</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Active Jobs</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="space-y-2">
              <h3 className="text-4xl font-bold">500+</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Companies</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="space-y-2">
              <h3 className="text-4xl font-bold">2M+</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Candidates</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="space-y-2">
              <h3 className="text-4xl font-bold">98%</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Success Rate</p>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
}
