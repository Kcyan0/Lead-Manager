import type React from "react"
import type { Metadata } from "next"
import { Figtree } from 'next/font/google'
import "./globals.css"
import { AuthProvider } from '@/lib/auth-context'
import { CRMProvider } from '@/lib/crm-context'

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
})

export const metadata: Metadata = {
  title: "Lead Manager - Sistema de Gestão de Prospecção",
  description: "Sistema completo para gestão de leads, SDRs e Closers",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${figtree.variable} antialiased`}>
      <body className="font-sans">
        <AuthProvider>
          <CRMProvider>
            {children}
          </CRMProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
