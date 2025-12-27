import './globals.css'

export const metadata = {
  title: 'NOPE - Bukan kamu yang aneh',
  description: 'Bukan kamu yang aneh tapi systemnya yang broken!',
  manifest: '/manifest.json',
  themeColor: '#000000',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
