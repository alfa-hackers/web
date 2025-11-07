import { Providers } from '../store/providers'

export const metadata = {
  title: 'Next.js Chat App',
  description: 'Next.js + Redux Toolkit chat example',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
