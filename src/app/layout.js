import './globals.css'

export const metadata = {
  title: 'Chassis Lookup',
  description: 'Select policy type, enter chassis number, then lookup vehicle details',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#f0f4f8]">
        {children}
      </body>
    </html>
  )
}
