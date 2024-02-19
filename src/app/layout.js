import { Inter } from 'next/font/google'
import './globals.css'
import ApplicationTheme from '@/theme-provider'
import { AuthContextProvider } from '../../context/AuthContext'
import { UserProvider } from '../../context/UserContext'

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
            <UserProvider>
              {children}
            </UserProvider>
          </AuthContextProvider>
        </ApplicationTheme>
      </body>
    </html>
  )
}
