'use client';

import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState, use } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';

const Page = ({ params }: { params: Promise<{ txHash: string }> }) => {
  const { txHash } = use(params)
  const [showGameLink, setShowGameLink] = useState(false);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [hash, setHash] = useState<`0x${string}`>(
    txHash as `0x${string}`
  );
  const { data, isSuccess, isLoading } = useWaitForTransactionReceipt({
    confirmations: 1,
    hash: hash,
    onReplaced(response) {
      setHash(response.replacedTransaction.hash);
    },
  });

  useEffect(() => {
    if (isSuccess) {
      const gameInMemory = localStorage.getItem(
        `lobby-room-${txHash}`
      );

      if (gameInMemory) {
        localStorage.setItem(`game-${data?.contractAddress}`, gameInMemory);
        localStorage.removeItem(`lobby-room-${txHash}`);
      }
      setShowGameLink(true);
    }
  }, [isSuccess, data, txHash]);

  // skip server side rendering to avoid hydration errors
  if (!isClient) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full space-y-8 pt-20">
        <h2 className="text-xl font-bold text-white italic">
          Waiting for transaction confirmation...
        </h2>
        <div className="rounded-lg bg-slate-900 p-4 space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Transaction Hash</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:text-emerald-500"
                //   onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy transaction hash</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:text-emerald-500"
                  asChild
                >
                  <a 
                    href={`https://sepolia.etherscan.io/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">View on Etherscan</span>
                  </a>
                </Button>
              </div>
            </div>
            <div className="font-mono text-sm text-slate-200 break-all">
              {hash}
            </div>
          </div>
      </div>
    );
  } else if (isSuccess && data) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full space-y-8 py-20">
        <h2 className="text-xl font-bold italic text-white">
          Your game has been created. Enjoy!
        </h2>
        {showGameLink && (
          <Link href={`/game/${data?.contractAddress}`}>
            <Button>Go to Game</Button>
          </Link>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center h-full w-full space-y-8 py-20">
      <h2 className="text-xl font-bold italic">
        Could not find the transaction. Please check and try again!
      </h2>
    </div>
  );
};

export default Page;