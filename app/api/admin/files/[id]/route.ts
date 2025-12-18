import { createClient } from "@/lib/supabase/server"
import { del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: file } = await supabase.from("files").select("blob_url, thumbnail_url").eq("id", id).single()

    if (file) {
      // Delete from blob storage
      try {
        await del(file.blob_url)
        if (file.thumbnail_url) {
          await del(file.thumbnail_url)
        }
      } catch {
        // Continue even if blob delete fails
      }
    }

    // Delete from database
    const { error } = await supabase.from("files").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
