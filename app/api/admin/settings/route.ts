import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: settingsData, error } = await supabase.from("settings").select("key, value")

    if (error) throw error

    const settings = Object.fromEntries((settingsData || []).map((s) => [s.key, s.value || ""]))

    return NextResponse.json({ settings })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await request.json()

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      await supabase
        .from("settings")
        .upsert({ key, value: value as string, updated_at: new Date().toISOString() })
        .eq("key", key)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
