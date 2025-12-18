"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Lock, Sparkles } from "lucide-react"
import { toast } from "sonner"

export default function AccessGatePage() {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Access granted")
        router.push(`/files?code=${encodeURIComponent(code.trim())}`)
      } else {
        toast.error(data.error || "Invalid access code")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 mb-8 glow-sm animate-pulse-glow">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3 text-balance">
            Drift<span className="text-primary">V8</span>.xyz
          </h1>
          <p className="text-muted-foreground text-lg">Secure File Sharing</p>
        </div>

        {/* Access form */}
        <div className="glass-card rounded-2xl p-8 glow-primary">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold mb-2">Enter Access Code</h2>
            <p className="text-sm text-muted-foreground">Enter the code you received to view shared files</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                type="text"
                placeholder="Enter your code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="pl-12 h-14 bg-input/50 border-border/50 text-lg font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal placeholder:text-muted-foreground/50 focus:border-primary/50 transition-all"
                autoFocus
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-base font-medium gap-3 bg-primary hover:bg-primary/90 transition-all duration-200 glow-sm hover:glow-primary"
              disabled={isLoading || !code.trim()}
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Verifying...
                </div>
              ) : (
                <>
                  Access Files
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Admin link */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Admin?{" "}
          <a
            href="/admin/login"
            className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
          >
            Sign in here
          </a>
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center">
        <p className="text-xs text-muted-foreground/50">Protected by DriftV8.xyz</p>
      </div>
    </div>
  )
}
