'use client'

import { EclipseIcon as Ethereum } from 'lucide-react'
import { useAccount } from 'wagmi'
import CreateNewGame from '@/components/game/CreateNewGame'

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <header className="border-b border-slate-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Ethereum className="h-8 w-8 text-emerald-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              RPSLS Arena
            </h1>
          </div>
          {/**@ts-ignore */}
          <appkit-button />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <CreateNewGame />
      </main>

      <footer className="border-t bottom-0 border-slate-700 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-slate-500">
          <p className="text-sm">
            Made with ♠️ by{' '}
            <a 
              href="https://github.com/izuchukwu-eric" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300"
            >
              Eric.eth
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}