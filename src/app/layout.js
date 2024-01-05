import { Inter } from 'next/font/google'
import './globals.css'
import ApplicationTheme from '@/theme-provider'
import { AuthContextProvider } from '../../context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Pocket Therapist',
  description: 'Manage App',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ApplicationTheme>
          <AuthContextProvider>
            {children}
          </AuthContextProvider>
        </ApplicationTheme>
      </body>
    </html>
  )
}
