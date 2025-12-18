"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { MessageCircle, Save, ExternalLink, Bell, Phone, KeyRound } from "lucide-react"
import { toast } from "sonner"

interface Settings {
  whatsapp_enabled: string
  whatsapp_phone: string
  whatsapp_api_key: string
}

export function SettingsManager() {
  const [settings, setSettings] = useState<Settings>({
    whatsapp_enabled: "false",
    whatsapp_phone: "",
    whatsapp_api_key: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/settings")
      const data = await response.json()
      if (data.settings) setSettings(data.settings)
    } catch {
      toast.error("Failed to load settings")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (!response.ok) throw new Error("Save failed")
      toast.success("Settings saved")
    } catch {
      toast.error("Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  const testWhatsApp = async () => {
    setIsTesting(true)
    try {
      const response = await fetch("/api/admin/test-whatsapp", { method: "POST" })
      const data = await response.json()
      if (data.success) {
        toast.success("Test message sent!")
      } else {
        toast.error(data.error || "Failed to send")
      }
    } catch {
      toast.error("Failed to send test")
    } finally {
      setIsTesting(false)
    }
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
      <div>
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure notifications and preferences</p>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">WhatsApp Notifications</CardTitle>
              <CardDescription>Get notified when someone uses an access code</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Enable Notifications</p>
                <p className="text-sm text-muted-foreground">Receive alerts via WhatsApp</p>
              </div>
            </div>
            <Switch
              checked={settings.whatsapp_enabled === "true"}
              onCheckedChange={(checked) => setSettings({ ...settings, whatsapp_enabled: checked ? "true" : "false" })}
            />
          </div>

          {/* Setup instructions */}
          <div className="p-5 rounded-xl bg-muted/20 border border-border/50 space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                ?
              </span>
              How to set up CallMeBot
            </h4>
            <ol className="text-sm text-muted-foreground space-y-3 ml-8">
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs font-medium shrink-0">
                  1
                </span>
                <span>
                  Add CallMeBot to WhatsApp: <code className="text-primary">+34 644 47 96 84</code>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs font-medium shrink-0">
                  2
                </span>
                <span>
                  Send them: <code className="text-primary">{'"I allow callmebot to send me messages"'}</code>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs font-medium shrink-0">
                  3
                </span>
                <span>{"You'll receive an API key via WhatsApp"}</span>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs font-medium shrink-0">
                  4
                </span>
                <span>Enter your details below and save</span>
              </li>
            </ol>
            <a
              href="https://www.callmebot.com/blog/free-api-whatsapp-messages/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline underline-offset-4 ml-8"
            >
              Learn more
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Form fields */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Phone Number
              </Label>
              <Input
                placeholder="1234567890"
                value={settings.whatsapp_phone}
                onChange={(e) => setSettings({ ...settings, whatsapp_phone: e.target.value })}
                className="bg-input/50 border-border/50 font-mono"
              />
              <p className="text-xs text-muted-foreground">Without + or spaces</p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-muted-foreground" />
                API Key
              </Label>
              <Input
                type="password"
                placeholder="Your CallMeBot API key"
                value={settings.whatsapp_api_key}
                onChange={(e) => setSettings({ ...settings, whatsapp_api_key: e.target.value })}
                className="bg-input/50 border-border/50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/50">
            <Button onClick={handleSave} disabled={isSaving} className="glow-sm hover:glow-primary">
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
            {settings.whatsapp_enabled === "true" && settings.whatsapp_phone && settings.whatsapp_api_key && (
              <Button variant="outline" onClick={testWhatsApp} disabled={isTesting} className="bg-transparent">
                {isTesting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    Sending...
                  </div>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Test Message
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
