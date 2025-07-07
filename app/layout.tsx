import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Drag The Task',
  description: 'interactive todo app with drag and drop feature',
  generator: 'awais',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
