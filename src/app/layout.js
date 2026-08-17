import './globals.css'

export const metadata = {
  title: 'Chassis Lookup',
  description: 'Select policy type, enter chassis number, then lookup vehicle details',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50/50 relative overflow-x-hidden">
        {/* Ambient background glows */}
        <div className="ambient-glow bg-blue-400 top-[-200px] left-[-200px]" />
        <div className="ambient-glow bg-indigo-400 bottom-[-200px] right-[-200px] [animation-delay:2s]" />
        <div className="ambient-glow bg-purple-300 top-[30%] right-[10%] [animation-delay:4s] opacity-10" />
        
        {children}
      </body>
    </html>
  )
}
