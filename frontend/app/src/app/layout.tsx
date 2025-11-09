import type { Metadata } from 'next'
import { Providers } from '../store/providers'
import '@/styles/Global/index.scss'
import Head from 'next/head'

export const metadata: Metadata = {
  title: 'Revolutionary AI Bot | Your Personal Genius Unleashed',
  description:
    '⚡ Lightning-fast. 🧠 Mind-blowing smart. 💎 Insanely accurate. Experience the AI that doesnt just answer—it transforms how you work, create, and think. From coding wizardry to creative breakthroughs, this is the assistant that redefines possible. Try it now and feel the future.',
  openGraph: {
    title: 'Revolutionary AI Bot | Your Personal Genius Unleashed',
    description:
      '⚡ Lightning-fast. 🧠 Mind-blowing smart. 💎 Insanely accurate. Experience the AI that doesnt just answer—it transforms how you work, create, and think. From coding wizardry to creative breakthroughs, this is the assistant that redefines possible. Try it now and feel the future.',
    url: 'https://dev.whirav.ru/',
    siteName: 'Revolutionary AI Bot',
    images: [
      {
        url: 'https://i.pinimg.com/1200x/42/4c/56/424c563e3152e946bf84c0d2f41929d3.jpg',
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Revolutionary AI Bot | Your Personal Genius Unleashed',
    description:
      '⚡ Lightning-fast. 🧠 Mind-blowing smart. 💎 Insanely accurate. Experience the AI that doesnt just answer—it transforms how you work, create, and think. From coding wizardry to creative breakthroughs, this is the assistant that redefines possible. Try it now and feel the future.',
    images: [
      'https://i.pinimg.com/1200x/42/4c/56/424c563e3152e946bf84c0d2f41929d3.jpg',
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Head>
        <meta property="og:title" content="Revolutionary AI Bot" />
        <meta property="og:description" content="Super fast AI assistant that transforms how you work, create, and think." />
        <meta property="og:image" content="https://i.pinimg.com/1200x/42/4c/56/424c563e3152e946bf84c0d2f41929d3.jpg" />
        <meta property="og:url" content="https://dev.whirav.ru/" />
      </Head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
