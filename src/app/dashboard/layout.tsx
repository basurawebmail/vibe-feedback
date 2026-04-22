import { Inbox, Settings, CreditCard, Box } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-border">
            <div className="w-6 h-6 rounded bg-primary mr-3 flex items-center justify-center">
              <div className="w-3 h-3 bg-primary-foreground rounded-sm" />
            </div>
            <span className="font-semibold text-lg tracking-tight">VibeFeedback</span>
          </div>
          
          <nav className="p-4 space-y-1">
            <Link href="/dashboard" className="w-full flex items-center px-3 py-2 text-sm rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
              <Inbox className="w-4 h-4 mr-3" />
              Inbox
            </Link>
            <Link href="/dashboard/projects" className="w-full flex items-center px-3 py-2 text-sm rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
              <Box className="w-4 h-4 mr-3" />
              Projects
            </Link>
            <Link href="#" className="w-full flex items-center px-3 py-2 text-sm rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Link>
            <Link href="#" className="w-full flex items-center px-3 py-2 text-sm rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
              <CreditCard className="w-4 h-4 mr-3" />
              Billing
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-border">
          <form action={async () => {
            'use server'
            const { logout } = await import('@/app/login/actions')
            await logout()
          }}>
            <button type="submit" className="w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-500 mr-3 opacity-80 group-hover:opacity-10" />
              <div className="flex flex-col text-left overflow-hidden">
                <span className="font-medium text-sm truncate group-hover:hidden">{user.email}</span>
                <span className="text-xs text-muted-foreground group-hover:hidden">Pro Plan</span>
                <span className="font-medium text-sm hidden group-hover:block">Sign out</span>
              </div>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
