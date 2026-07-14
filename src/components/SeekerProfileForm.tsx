'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { upsertSeekerProfile } from '@/actions/seeker'

export function SeekerProfileForm({ profile }: { profile: any }) {
  const [skills, setSkills] = useState(profile?.skills?.join(', ') || '')
  const [experience, setExperience] = useState(profile?.experience || '')
  const [expectedSalary, setExpectedSalary] = useState(profile?.expectedSalary?.toString() || '')

  return (
    <form action={async (formData) => { await upsertSeekerProfile(formData); }} className="space-y-6">


      <div className="space-y-2">
        <Label htmlFor="skills">Skills (comma separated)</Label>
        <Input 
          id="skills" 
          name="skills" 
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="React, Node.js, Python, Project Management"
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="experience">Experience Summary</Label>
        <Textarea 
          id="experience" 
          name="experience" 
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          placeholder="Briefly describe your past work experience..."
          rows={5}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expectedSalary">Expected Salary (Optional)</Label>
          <Input 
            id="expectedSalary" 
            name="expectedSalary" 
            type="number" 
            value={expectedSalary}
            onChange={(e) => setExpectedSalary(e.target.value)}
            placeholder="e.g. 50000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="resumeUrl">Resume Link (Optional)</Label>
          <Input 
            id="resumeUrl" 
            name="resumeUrl" 
            type="url" 
            defaultValue={profile?.resumeUrl || ''} 
            placeholder="https://drive.google.com/... or LinkedIn"
          />
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full sm:w-auto">Save Profile</Button>
    </form>
  )
}
