import { createClient } from "@/lib/supabase/server"
import { put } from "@vercel/blob"
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

    const { data: files, error } = await supabase.from("files").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ files: files || [] })
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

    const formData = await request.formData()
    const file = formData.get("file") as File
    const thumbnail = formData.get("thumbnail") as File | null
    const description = formData.get("description") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Upload file to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
    })

    // Upload thumbnail if provided
    let thumbnailUrl = null
    if (thumbnail) {
      const thumbBlob = await put(`thumbnails/${thumbnail.name}`, thumbnail, {
        access: "public",
      })
      thumbnailUrl = thumbBlob.url
    }

    const { data: fileRecord, error } = await supabase
      .from("files")
      .insert({
        name: file.name,
        description: description || null,
        blob_url: blob.url,
        thumbnail_url: thumbnailUrl,
        file_type: file.type,
        file_size: file.size,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ file: fileRecord })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
