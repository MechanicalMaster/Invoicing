'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNotifications } from '@/lib/providers/notification-provider'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  // Format the notification date
  const formatDate = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAllAsRead()}
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start gap-1 p-3",
                  !notification.read_at && "bg-muted/50"
                )}
                onClick={(e) => {
                  e.preventDefault()
                  if (!notification.read_at) {
                    markAsRead(notification.id)
                  }
                }}
              >
                {notification.action_url ? (
                  <Link 
                    href={notification.action_url} 
                    className="w-full"
                    onClick={() => {
                      if (!notification.read_at) {
                        markAsRead(notification.id)
                      }
                    }}
                  >
                    <div className="flex flex-col w-full">
                      <span className="font-medium">{notification.title}</span>
                      <span className="text-sm">{notification.message}</span>
                      <span className="mt-1 text-xs text-muted-foreground">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div className="flex flex-col w-full">
                    <span className="font-medium">{notification.title}</span>
                    <span className="text-sm">{notification.message}</span>
                    <span className="mt-1 text-xs text-muted-foreground">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 