'use client'

import CreateNewGame from '@/components/game/CreateNewGame'

export default function Home() {

  return (
    <div className="text-white">
      <main className="container mx-auto px-4 py-8">
        <CreateNewGame />
      </main>

    </div>
  )
}