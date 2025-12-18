"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Copy, Key, Share2, Hash, Calendar, Infinity } from "lucide-react"
import { toast } from "sonner"

interface AccessCode {
  id: string
  code: string
  label: string | null
  use_count: number
  expires_at: string | null
  created_at: string
}

export function AccessCodesManager() {
  const [codes, setCodes] = useState<AccessCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [label, setLabel] = useState("")
  const [expiresIn, setExpiresIn] = useState("")

  const fetchCodes = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/access-codes")
      const data = await response.json()
      setCodes(data.codes || [])
    } catch {
      toast.error("Failed to load codes")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCodes()
  }, [fetchCodes])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const response = await fetch("/api/admin/access-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label || null,
          expiresInDays: expiresIn ? Number.parseInt(expiresIn) : null,
        }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      toast.success("Code created")
      setDialogOpen(false)
      setLabel("")
      setExpiresIn("")
      fetchCodes()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (codeId: string) => {
    if (!confirm("Delete this code?")) return

    setDeletingId(codeId)
    try {
      const response = await fetch(`/api/admin/access-codes/${codeId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Delete failed")
      toast.success("Code deleted")
      fetchCodes()
    } catch {
      toast.error("Failed to delete")
    } finally {
      setDeletingId(null)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Copied to clipboard")
  }

  const shareViaWhatsApp = (code: string) => {
    const message = encodeURIComponent(`Your access code for DriftV8.xyz: ${code}`)
    window.open(`https://wa.me/?text=${message}`, "_blank")
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Access Codes</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {codes.length} code{codes.length !== 1 ? "s" : ""} generated
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 glow-sm hover:glow-primary">
              <Plus className="w-4 h-4" />
              Generate Code
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50">
            <DialogHeader>
              <DialogTitle>Generate Access Code</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="space-y-2">
                <Label>Label (optional)</Label>
                <Input
                  placeholder="e.g., John's code"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="bg-input/50 border-border/50"
                />
                <p className="text-xs text-muted-foreground">Help identify who this code is for</p>
              </div>
              <div className="space-y-2">
                <Label>Expires in Days (optional)</Label>
                <Input
                  type="number"
                  placeholder="Leave empty for never"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="bg-input/50 border-border/50"
                  min="1"
                />
                <p className="text-xs text-muted-foreground">Codes can be used unlimited times until they expire</p>
              </div>
              <Button type="submit" className="w-full h-11" disabled={isCreating}>
                {isCreating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Generating...
                  </div>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Generate Code
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Codes list */}
      {codes.length === 0 ? (
        <Card className="glass-card border-dashed border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
              <Key className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg text-muted-foreground mb-2">No access codes yet</p>
            <p className="text-sm text-muted-foreground/60 mb-6">Generate a code to share with others</p>
            <Button variant="outline" onClick={() => setDialogOpen(true)} className="bg-transparent">
              <Plus className="w-4 h-4 mr-2" />
              Generate Code
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {codes.map((code, index) => (
            <Card key={code.id} className="glass-card animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Code info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <code className="text-xl font-mono font-bold tracking-wider text-primary">{code.code}</code>
                      <Badge
                        variant={isExpired(code.expires_at) ? "secondary" : "default"}
                        className={isExpired(code.expires_at) ? "" : "bg-primary/20 text-primary border-primary/30"}
                      >
                        {isExpired(code.expires_at) ? "Expired" : "Active"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                      {code.label && (
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {code.label}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5" />
                        {code.use_count || 0} uses
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Infinity className="w-3.5 h-3.5" />
                        Unlimited
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Expires: {code.expires_at ? formatDate(code.expires_at) : "Never"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyCode(code.code)}
                      title="Copy code"
                      className="bg-transparent border-border/50 hover:bg-secondary/50"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => shareViaWhatsApp(code.code)}
                      title="Share via WhatsApp"
                      className="bg-transparent border-border/50 hover:bg-secondary/50"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(code.id)}
                      disabled={deletingId === code.id}
                      className="bg-transparent border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                    >
                      {deletingId === code.id ? (
                        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
