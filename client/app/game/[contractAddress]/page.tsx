'use client';

import React, { use } from 'react';
import { useReadContracts } from 'wagmi';

import GameLoading from '@/components/game/GameLoading';
import GameDisplay from '@/components/game/GameDisplay';
import { contractABI } from '@/utils/constants';

const Page = ({ params }: { params: Promise<{ contractAddress: string }> }) => {
  const { contractAddress } = use(params)
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const gameContract: {
    address: `0x${string}`;
    abi: any;
  } = {
    address: contractAddress as `0x${string}`,
    abi: contractABI,
  };

  const { data, isError, isLoading, isSuccess, refetch } = useReadContracts({
    contracts: [
      {
        ...gameContract,
        functionName: 'stake',
      },
      {
        ...gameContract,
        functionName: 'j1',
      },
      {
        ...gameContract,
        functionName: 'j2',
      },
      {
        ...gameContract,
        functionName: 'c1Hash',
      },
      {
        ...gameContract,
        functionName: 'c2',
      },
      {
        ...gameContract,
        functionName: 'TIMEOUT',
      },
      {
        ...gameContract,
        functionName: 'lastAction',
      },
    ],
  });

  // only client side render
  if (!isClient) {
    return null;
  }

  return (
    <div className="w-full h-full">
      {isLoading && <GameLoading />}
      {isError && (
        <h1 className="text-3xl text-red-500">
          There was an error loading the game. Please try again!
        </h1>
      )}
      {isSuccess && data && (
        <GameDisplay
          gameData={data}
          gameContract={contractAddress as `0x${string}`}
          refetch={refetch}
        />
      )}
    </div>
  );
};

export default Page;