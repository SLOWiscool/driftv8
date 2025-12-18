"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Upload, FileIcon, ImageIcon, VideoIcon, Cloud, Music, Archive } from "lucide-react"
import { toast } from "sonner"

interface FileItem {
  id: string
  name: string
  description: string | null
  blob_url: string // renamed from file_url
  thumbnail_url: string | null
  file_type: string | null
  file_size: number | null
  created_at: string
}

export function FilesManager() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [description, setDescription] = useState("")

  const fetchFiles = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/files")
      const data = await response.json()
      setFiles(data.files || [])
    } catch {
      toast.error("Failed to load files")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      if (thumbnail) formData.append("thumbnail", thumbnail)
      formData.append("description", description)

      const response = await fetch("/api/admin/files", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      toast.success("File uploaded")
      setDialogOpen(false)
      setFile(null)
      setThumbnail(null)
      setDescription("")
      fetchFiles()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm("Delete this file?")) return

    setDeletingId(fileId)
    try {
      const response = await fetch(`/api/admin/files/${fileId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Delete failed")
      toast.success("File deleted")
      fetchFiles()
    } catch {
      toast.error("Failed to delete")
    } finally {
      setDeletingId(null)
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "—"
    const units = ["B", "KB", "MB", "GB"]
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  const getFileIcon = (type: string | null) => {
    const iconClass = "w-8 h-8 text-muted-foreground/50"
    if (!type) return <FileIcon className={iconClass} />
    if (type.startsWith("image/")) return <ImageIcon className={iconClass} />
    if (type.startsWith("video/")) return <VideoIcon className={iconClass} />
    if (type.startsWith("audio/")) return <Music className={iconClass} />
    if (type.includes("zip") || type.includes("archive")) return <Archive className={iconClass} />
    return <FileIcon className={iconClass} />
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
          <h2 className="text-2xl font-semibold">Files</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {files.length} file{files.length !== 1 ? "s" : ""} uploaded
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 glow-sm hover:glow-primary">
              <Plus className="w-4 h-4" />
              Upload File
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50">
            <DialogHeader>
              <DialogTitle>Upload New File</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-5">
              <div className="space-y-2">
                <Label>File</Label>
                <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Cloud className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">{file ? file.name : "Click to select a file"}</p>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Thumbnail (optional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                  className="bg-input/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  placeholder="Add a description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-input/50 border-border/50 resize-none"
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full h-11" disabled={isUploading || !file}>
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Uploading...
                  </div>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Files grid */}
      {files.length === 0 ? (
        <Card className="glass-card border-dashed border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
              <FileIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg text-muted-foreground mb-2">No files yet</p>
            <p className="text-sm text-muted-foreground/60 mb-6">Upload your first file to get started</p>
            <Button variant="outline" onClick={() => setDialogOpen(true)} className="bg-transparent">
              <Plus className="w-4 h-4 mr-2" />
              Upload File
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {files.map((file, index) => (
            <Card
              key={file.id}
              className="glass-card overflow-hidden group animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="aspect-video relative bg-muted/30 flex items-center justify-center overflow-hidden">
                {file.thumbnail_url ? (
                  <img
                    src={file.thumbnail_url || "/placeholder.svg"}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getFileIcon(file.file_type)
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium truncate mb-1" title={file.name}>
                  {file.name}
                </h3>
                {file.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{file.description}</p>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground font-mono">{formatFileSize(file.file_size)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file.id)}
                    disabled={deletingId === file.id}
                    className="h-8 px-3 text-destructive hover:bg-destructive/10"
                  >
                    {deletingId === file.id ? (
                      <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
