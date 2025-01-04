import React from 'react'
import { EclipseIcon as Ethereum } from 'lucide-react'

const Header = () => {
  return (
    <header className="border-b border-slate-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Ethereum className="h-8 w-8 text-emerald-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              RPSLS Arena
            </h1>
          </div>
          {/**@ts-expect-error */}
          <appkit-button />
        </div>
    </header>
  )
}

export default Header