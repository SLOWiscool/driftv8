import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { randomBytes } from "crypto"

function generateAccessCode() {
  return randomBytes(4).toString("hex").toUpperCase()
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: codes, error } = await supabase
      .from("access_codes")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ codes: codes || [] })
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

    const { label, expiresInDays } = await request.json()

    const code = generateAccessCode()
    const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString() : null

    const { data: accessCode, error } = await supabase
      .from("access_codes")
      .insert({
        code,
        label: label || null,
        expires_at: expiresAt,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ code: accessCode })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
