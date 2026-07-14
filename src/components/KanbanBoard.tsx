'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { FileText, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { updateApplicationStatus } from '@/actions/employer'
import Link from 'next/link'

type Application = {
  id: string
  status: string
  matchScore: number | null
  aiSummary: string | null
  profile: {
    expectedSalary: number | null
    resumeUrl: string | null
    user: {
      name: string | null
      email: string
    }
  }
}

const COLUMNS = [
  { id: 'REVIEWING', title: 'Reviewing', color: 'bg-slate-100 dark:bg-slate-900', icon: <FileText className="w-4 h-4 text-slate-500" /> },
  { id: 'INTERVIEW', title: 'Interviewing', color: 'bg-blue-50 dark:bg-blue-950/20', icon: <Clock className="w-4 h-4 text-blue-500" /> },
  { id: 'HIRED', title: 'Hired', color: 'bg-green-50 dark:bg-green-950/20', icon: <CheckCircle2 className="w-4 h-4 text-green-500" /> },
  { id: 'REJECTED', title: 'Rejected', color: 'bg-red-50 dark:bg-red-950/20', icon: <XCircle className="w-4 h-4 text-red-500" /> },
]

export function KanbanBoard({ initialApplications }: { initialApplications: Application[] }) {
  const [items, setItems] = useState(initialApplications)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveColumn = COLUMNS.some((col) => col.id === activeId)
    const isOverColumn = COLUMNS.some((col) => col.id === overId)

    if (isActiveColumn) return

    setItems((prev) => {
      const activeIndex = prev.findIndex((t) => t.id === activeId)
      const overIndex = prev.findIndex((t) => t.id === overId)

      if (activeIndex === -1) return prev

      if (isOverColumn) {
        return prev.map(item => 
          item.id === activeId ? { ...item, status: overId as string } : item
        )
      }

      if (overIndex !== -1 && prev[activeIndex].status !== prev[overIndex].status) {
        const newStatus = prev[overIndex].status
        const newItems = prev.map(item => 
          item.id === activeId ? { ...item, status: newStatus } : item
        )
        return arrayMove(newItems, activeIndex, overIndex)
      }

      return arrayMove(prev, activeIndex, overIndex)
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const item = items.find(i => i.id === active.id)
    if (item) {
      const formData = new FormData()
      formData.append('applicationId', item.id)
      formData.append('status', item.status)
      await updateApplicationStatus(formData)
    }
  }

  const activeItem = activeId ? items.find((item) => item.id === activeId) : null

  return (
    <div className="flex flex-col h-full w-full overflow-x-auto pb-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 min-w-max h-full items-start">
          {COLUMNS.map((col) => {
            const columnTasks = items.filter((item) => item.status === col.id)
            return (
              <Column key={col.id} col={col} tasks={columnTasks} />
            )
          })}
        </div>

        <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.5" } } }) }}>
          {activeItem ? <TaskCard task={activeItem} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function Column({ col, tasks }: { col: any, tasks: Application[] }) {
  const { setNodeRef } = useSortable({
    id: col.id,
    data: { type: 'Column', col }
  })

  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-col w-80 rounded-xl border ${col.color} shadow-sm overflow-hidden`}
    >
      <div className="p-4 border-b bg-white/50 dark:bg-black/20 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          {col.icon} {col.title}
        </div>
        <Badge variant="secondary" className="rounded-full px-2 py-0.5">{tasks.length}</Badge>
      </div>
      
      <div className="p-3 flex-1 flex flex-col gap-3 min-h-[150px]">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <SortableTask key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground/60 border-2 border-dashed border-muted-foreground/20 rounded-lg">
              Drop candidates here
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}

function SortableTask({ task }: { task: Application }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
    data: { type: 'Task', task }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (isDragging) {
    return <div ref={setNodeRef} style={style} className="h-40 rounded-lg border-2 border-primary/50 border-dashed bg-primary/5" />
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} />
    </div>
  )
}

function TaskCard({ task, isOverlay }: { task: Application, isOverlay?: boolean }) {
  return (
    <Card className={`relative cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow ${isOverlay ? 'shadow-xl ring-2 ring-primary rotate-2' : ''}`}>
      <Link href={`/employer/applications/${task.id}`} className="absolute inset-0 z-0" />
      <CardContent className="p-4 relative z-10">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {(task.profile.user.name || task.profile.user.email).substring(0,2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-sm leading-tight">{task.profile.user.name || "Unknown"}</span>
              <span className="text-xs text-muted-foreground line-clamp-1">{task.profile.user.email}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant={task.matchScore && task.matchScore > 80 ? "default" : "secondary"} className="text-xs">
            {task.matchScore}% Match
          </Badge>
          {task.profile.expectedSalary && (
            <span className="text-xs text-muted-foreground font-medium">
              Exp: ${task.profile.expectedSalary}
            </span>
          )}
        </div>

        {task.aiSummary && (
          <div className="bg-muted/50 rounded p-2 text-xs text-muted-foreground line-clamp-2 mb-3 border">
            <span className="font-semibold text-primary mr-1">AI:</span>
            {task.aiSummary}
          </div>
        )}
        
        <div className="flex justify-between items-center mt-2 pt-3 border-t">
          {task.profile.resumeUrl ? (
            <a href={task.profile.resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 z-10" onPointerDown={e => e.stopPropagation()}>
              <FileText className="w-3 h-3" /> Resume
            </a>
          ) : <span />}
        </div>
      </CardContent>
    </Card>
  )
}
