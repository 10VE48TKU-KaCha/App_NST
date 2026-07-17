'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { markNotificationsRead } from '@/actions/communication'
import Link from 'next/link'
import { useState } from 'react'
import { Notification } from '@prisma/client'

export function NotificationDropdown({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleOpenChange = async (open: boolean) => {
    if (open && unreadCount > 0) {
      await markNotificationsRead()
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
    }
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger className="relative rounded-full hover:bg-accent hover:text-accent-foreground h-10 w-10 inline-flex items-center justify-center border-0 bg-transparent cursor-pointer">
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-sm text-center text-muted-foreground">
            No new notifications.
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.map((notif) => (
              <DropdownMenuItem key={notif.id} className={`flex flex-col items-start p-0 cursor-pointer ${!notif.isRead ? 'bg-muted/50' : ''}`}>
                <Link href={notif.link || '#'} className="w-full p-3 block">
                  <div className="font-medium text-sm">{notif.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notif.message}</div>
                  <div className="text-[10px] text-muted-foreground/70 mt-1">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
