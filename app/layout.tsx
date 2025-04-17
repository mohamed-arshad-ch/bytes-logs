import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: "InvoiceHub - Financial Management",
  description: "Comprehensive financial management for freelancers and businesses",
   
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
      
      </head>
      <body className={poppins.className}>{children}</body>
    </html>
  )
}


import './globals.css'