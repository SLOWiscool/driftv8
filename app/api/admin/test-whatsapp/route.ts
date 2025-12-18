import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: settingsData } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", ["whatsapp_phone", "whatsapp_api_key"])

    const settings = Object.fromEntries((settingsData || []).map((s) => [s.key, s.value]))

    if (!settings.whatsapp_phone || !settings.whatsapp_api_key) {
      return NextResponse.json({ error: "WhatsApp not configured" }, { status: 400 })
    }

    const message = encodeURIComponent("DriftV8.xyz Test: WhatsApp notifications are working!")

    const response = await fetch(
      `https://api.callmebot.com/whatsapp.php?phone=${settings.whatsapp_phone}&text=${message}&apikey=${settings.whatsapp_api_key}`,
    )

    if (!response.ok) {
      throw new Error("CallMeBot request failed")
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
