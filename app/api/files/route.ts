import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code")

    if (!code) {
      return NextResponse.json({ error: "Access code required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: accessCode } = await supabase.from("access_codes").select("*").eq("code", code).single()

    if (!accessCode) {
      return NextResponse.json({ error: "Invalid access code" }, { status: 401 })
    }

    // Check if expired
    if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
      return NextResponse.json({ error: "Access code has expired" }, { status: 401 })
    }

    // Get all files
    const { data: files, error } = await supabase.from("files").select("*").order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ files: files || [] })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
