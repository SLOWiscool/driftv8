"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FilesManager } from "./files-manager"
import { AccessCodesManager } from "./access-codes-manager"
import { SettingsManager } from "./settings-manager"
import { Sparkles, LogOut, Files, Key, Settings, User } from "lucide-react"

interface AdminDashboardProps {
  userEmail: string
}

export function AdminDashboard({ userEmail }: AdminDashboardProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 grid-pattern opacity-20 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center glow-sm">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-semibold">DriftV8.xyz</h1>
                <p className="text-xs text-muted-foreground">Admin Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{userEmail}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-transparent border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isLoggingOut ? "..." : "Logout"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Tabs defaultValue="files" className="space-y-8">
          <TabsList className="glass-card border-border/50 p-1 h-auto">
            <TabsTrigger
              value="files"
              className="gap-2 px-4 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Files className="w-4 h-4" />
              <span className="hidden sm:inline">Files</span>
            </TabsTrigger>
            <TabsTrigger
              value="codes"
              className="gap-2 px-4 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">Access Codes</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="gap-2 px-4 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="animate-fade-in">
            <FilesManager />
          </TabsContent>

          <TabsContent value="codes" className="animate-fade-in">
            <AccessCodesManager />
          </TabsContent>

          <TabsContent value="settings" className="animate-fade-in">
            <SettingsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
