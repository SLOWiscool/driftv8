import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { fileId, code } = await request.json()

    const supabase = await createClient()

    // Get access code ID
    const { data: accessCode } = await supabase.from("access_codes").select("id").eq("code", code).single()

    await supabase.from("download_logs").insert({
      file_id: fileId,
      access_code_id: accessCode?.id || null,
    })

    // Update download count on file
    await supabase.rpc("increment_download_count", { file_id: fileId }).catch(() => {
      // If RPC doesn't exist, do manual update
      supabase
        .from("files")
        .update({ download_count: supabase.rpc("coalesce", { val: "download_count", default_val: 0 }) })
        .eq("id", fileId)
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
