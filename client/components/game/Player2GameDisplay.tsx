import React from 'react';
import {
  useWriteContract,
  useWaitForTransactionReceipt,  
} from 'wagmi';

import { contractABI, moves } from '@/utils/constants';
import Spinner from '../common/Spinner';
import { GameState } from '@/types';
import getTimeLeft from '@/utils/getTimeLeft';
import { Button } from '../ui/button';
import { toast } from 'sonner';

type Player2GameDisplay = {
  gameContract: `0x${string}`;
  player2Move: number;
  timeout: number;
  lastAction: number;
  gameState: GameState;
  refetch: () => void;
  stake: bigint;
};

const Player2GameDisplay: React.FC<Player2GameDisplay> = ({
  gameContract,
  player2Move,
  timeout,
  lastAction,
  gameState,
  refetch,
  stake,
}) => {
  const {
    hasPlayer1ClaimedStake,
    hasPlayer1Revealed,
    hasPlayer2Moved,
    canPlayer2ClaimStake,
  } = gameState;
  const { data: hash, error, writeContract } = useWriteContract()
  const [move, setMove] = React.useState<number>();
  const [showSpinner, setShowSpinner] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(
    getTimeLeft(timeout, lastAction)
  );

  const [waitForPlayTxHash, setWaitForPlayTxHash] =
    React.useState<`0x${string}`>();

  const { data: waitForPlayTxData } = useWaitForTransactionReceipt({
    hash: waitForPlayTxHash,
    confirmations: 1,
  });

  const [waitForClaimTxHash, setWaitForClaimTxHash] =
    React.useState<`0x${string}`>();

  const { data: waitForClaimTxData } = useWaitForTransactionReceipt({
    hash: waitForClaimTxHash,
    confirmations: 1,
  });

  React.useEffect(() => {
    if (waitForPlayTxData || waitForClaimTxData) {
      refetch();
      setShowSpinner(false);
    }
  }, [waitForPlayTxData, refetch, waitForClaimTxData]);

  React.useEffect(() => {
    if (timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(getTimeLeft(timeout, lastAction));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timeLeft, timeout, lastAction]);

  const handleSubmit = React.useCallback(async () => {
    setShowSpinner(true);

    writeContract({
        address: gameContract,
        abi: contractABI,
        functionName: 'play',
        args: [move],
        value: stake,
    });

    if (error) {
        toast.error((error.cause as any)?.shortMessage ?? error.message);
        setShowSpinner(false);
        return;
    } else {
        setWaitForPlayTxHash(hash);
    }
  }, [move]);

  const handleClaimStake = React.useCallback(async () => {
    setShowSpinner(true);

    writeContract({
        address: gameContract,
        abi: contractABI,
        functionName: 'j1Timeout',
    });

    if (error) {
        toast.error((error.cause as any)?.shortMessage ?? error.message);
        setShowSpinner(false);
        return;
    } else {
        setWaitForClaimTxHash(hash);
    }
  }, [gameState.canPlayer2ClaimStake]);

  return (
    <div className="w-2/3 my-8 border border-gray-900 p-4 flex flex-col justify-between space-y-4">
      <div className="text-xl">
        <span className="font-light">Player 1&apos;s move: </span>
        <span className="font-bold italic">
          {hasPlayer1Revealed
            ? 'Player 1 has revealed their move'
            : 'Yet to be revealed'}
        </span>
      </div>
      {!hasPlayer2Moved && (
        <div className="text-xl">
          <span className="font-light">Time left for player 2: </span>
          <span className="font-bold">
            {timeLeft > 0 ? (
              `${Math.floor(timeLeft / 1000 / 60)}:${
                Math.floor(timeLeft / 1000) % 60
              }`
            ) : (
              <div className="inline-flex items-center space-x-4">
                <span>
                  Time is up!{' '}
                  {hasPlayer1ClaimedStake
                    ? 'Player 1 has reclaimed stake'
                    : 'But you can still play your move'}
                </span>
              </div>
            )}
          </span>
        </div>
      )}
      {hasPlayer2Moved && !hasPlayer1Revealed && (
        <div className="text-xl">
          <span className="font-light">
            Time left for player 1 to reveal move:{' '}
          </span>
          <span className="font-bold">
            {timeLeft > 0 ? (
              `${Math.floor(timeLeft / 1000 / 60)}:${
                Math.floor(timeLeft / 1000) % 60
              }`
            ) : (
              <div className="inline-flex items-center space-x-4">
                <span>Time is up!</span>
                {canPlayer2ClaimStake && (
                  <Button
                    disabled={!canPlayer2ClaimStake || showSpinner}
                    onClick={handleClaimStake}
                  >
                    {showSpinner ? <Spinner /> : 'Claim Stake'}
                  </Button>
                )}
              </div>
            )}
          </span>
          {hasPlayer2Moved && !hasPlayer1Revealed && timeLeft <= 0 && (
            <p className="text-xs w-full">
              (please refresh if you don&apos;t see the button to claim stake)
            </p>
          )}
        </div>
      )}
      {!hasPlayer1ClaimedStake && (
        <div className="text-xl">
          {!hasPlayer2Moved ? (
            <>
              <div className="flex items-center font-bold">
                <span className="font-light">Select your move:</span>
                <div className="flex space-x-2 ml-8">
                  {moves.map((move, index) => {
                    return (
                      <button key={move} onClick={() => setMove(index + 1)}>
                        <input
                          type="radio"
                          id={move}
                          name="move"
                          value={move}
                          className="peer appearance-none"
                        />
                        <label
                          htmlFor={move}
                          className="border border-gray-500 rounded-lg p-2 text-sm peer-checked:bg-white peer-checked:text-black cursor-pointer"
                        >
                          {move}
                        </label>
                      </button>
                    );
                  })}
                </div>
              </div>
              <Button
                onClick={() => handleSubmit()}
                className="mt-3"
                disabled={showSpinner}
              >
                {showSpinner ? <Spinner /> : 'Submit Move'}
              </Button>
            </>
          ) : (
            <>
              <span className="font-light">Your move: </span>
              <span className="font-bold italic">{moves[player2Move - 1]}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Player2GameDisplay;