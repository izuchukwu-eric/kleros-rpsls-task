'use client'

import { EclipseIcon as Ethereum } from 'lucide-react'
import { useAccount } from 'wagmi'
import CreateNewGame from '@/components/game/CreateNewGame'

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="text-white">
      <main className="container mx-auto px-4 py-8">
        <CreateNewGame />
      </main>

    </div>
  )
}