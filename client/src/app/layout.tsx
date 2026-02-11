import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
    title: 'JobFeed Admin Portal',
    description: 'Import History Tracking — scalable job importer admin UI',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang='en' className='dark'>
            <body>
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    )
}
