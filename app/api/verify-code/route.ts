import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Access code required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: accessCode, error } = await supabase.from("access_codes").select("*").eq("code", code).single()

    if (error || !accessCode) {
      return NextResponse.json({ error: "Invalid access code" }, { status: 401 })
    }

    // Check if expired
    if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
      return NextResponse.json({ error: "Access code has expired" }, { status: 401 })
    }

    await supabase
      .from("access_codes")
      .update({
        use_count: (accessCode.use_count || 0) + 1,
      })
      .eq("id", accessCode.id)

    // Log the access
    await supabase.from("access_logs").insert({
      access_code_id: accessCode.id,
      code_used: code,
    })

    // Send WhatsApp notification if enabled
    const { data: settings } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", ["whatsapp_enabled", "whatsapp_phone", "whatsapp_api_key"])

    const settingsMap = Object.fromEntries((settings || []).map((s) => [s.key, s.value]))

    if (settingsMap.whatsapp_enabled === "true" && settingsMap.whatsapp_phone && settingsMap.whatsapp_api_key) {
      const message = encodeURIComponent(
        `🔔 DriftV8.xyz: Code "${code}"${accessCode.label ? ` (${accessCode.label})` : ""} was just used!`,
      )

      fetch(
        `https://api.callmebot.com/whatsapp.php?phone=${settingsMap.whatsapp_phone}&text=${message}&apikey=${settingsMap.whatsapp_api_key}`,
      ).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
