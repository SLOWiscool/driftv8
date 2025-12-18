"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Download,
  FileIcon,
  ImageIcon,
  VideoIcon,
  FileTextIcon,
  Music,
  Archive,
  ArrowLeft,
  Sparkles,
  ExternalLink,
} from "lucide-react"
import { toast } from "sonner"

interface FileItem {
  id: string
  name: string
  description: string | null
  blob_url: string // renamed from file_url to match database
  thumbnail_url: string | null
  file_type: string | null
  file_size: number | null
  created_at: string
}

function getFileIcon(type: string | null) {
  const iconClass = "w-12 h-12 text-muted-foreground/50"
  if (!type) return <FileIcon className={iconClass} />
  if (type.startsWith("image/")) return <ImageIcon className={iconClass} />
  if (type.startsWith("video/")) return <VideoIcon className={iconClass} />
  if (type.startsWith("audio/")) return <Music className={iconClass} />
  if (type.includes("pdf") || type.includes("document") || type.includes("text"))
    return <FileTextIcon className={iconClass} />
  if (type.includes("zip") || type.includes("rar") || type.includes("archive")) return <Archive className={iconClass} />
  return <FileIcon className={iconClass} />
}

function formatFileSize(bytes: number | null) {
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

export default function FilesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get("code")
  const [files, setFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    if (!code) {
      router.push("/")
      return
    }

    async function fetchFiles() {
      try {
        const response = await fetch(`/api/files?code=${encodeURIComponent(code!)}`)
        const data = await response.json()

        if (data.error) {
          toast.error(data.error)
          router.push("/")
          return
        }

        setFiles(data.files || [])
      } catch {
        toast.error("Failed to load files")
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFiles()
  }, [code, router])

  const handleDownload = async (file: FileItem) => {
    setDownloadingId(file.id)
    try {
      await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: file.id, code }),
      })

      const link = document.createElement("a")
      link.href = file.blob_url
      link.download = file.name
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("Download started")
    } catch {
      toast.error("Download failed")
    } finally {
      setDownloadingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading files...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Shared Files</h1>
            </div>
            <p className="text-muted-foreground">
              {files.length} file{files.length !== 1 ? "s" : ""} available for download
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="bg-transparent border-border/50 hover:bg-secondary/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {files.length === 0 ? (
          <Card className="glass-card border-dashed border-border/50 animate-fade-in">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
                <FileIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg text-muted-foreground mb-2">No files available</p>
              <p className="text-sm text-muted-foreground/60">Check back later or contact the sender</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {files.map((file, index) => (
              <Card
                key={file.id}
                className="glass-card overflow-hidden group hover:border-primary/30 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Thumbnail */}
                <div className="aspect-video relative bg-muted/30 flex items-center justify-center overflow-hidden">
                  {file.thumbnail_url ? (
                    <img
                      src={file.thumbnail_url || "/placeholder.svg"}
                      alt={file.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center">{getFileIcon(file.file_type)}</div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button
                      size="sm"
                      onClick={() => handleDownload(file)}
                      disabled={downloadingId === file.id}
                      className="gap-2"
                    >
                      {downloadingId === file.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Info */}
                <CardContent className="p-5">
                  <h3
                    className="font-medium truncate mb-1 group-hover:text-primary transition-colors"
                    title={file.name}
                  >
                    {file.name}
                  </h3>
                  {file.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{file.description}</p>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground font-mono">{formatFileSize(file.file_size)}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(file)}
                      disabled={downloadingId === file.id}
                      className="h-8 px-3 text-xs hover:bg-primary/10 hover:text-primary"
                    >
                      {downloadingId === file.id ? (
                        <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      ) : (
                        <>
                          <ExternalLink className="w-3 h-3 mr-1.5" />
                          Get File
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 pb-8">
          <p className="text-xs text-muted-foreground/50">Powered by DriftV8.xyz</p>
        </div>
      </div>
    </div>
  )
}
