import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "DriftV8.xyz - Secure File Sharing",
  description: "Share files securely with access codes. Private, fast, and reliable.",
  keywords: ["file sharing", "secure", "private", "access codes"],
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <div className="noise min-h-screen gradient-bg">{children}</div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "oklch(0.12 0.005 270)",
              border: "1px solid oklch(0.25 0.005 270)",
              color: "oklch(0.98 0 0)",
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
