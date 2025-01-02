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
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import { Timer, Trophy } from 'lucide-react';

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
    <div className="grid gap-4 p-4 rounded-lg bg-slate-900">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-slate-400">Player 1&apos;s move: </h3>
        <div className="flex items-center gap-2 text-white">
            <span className="font-semibold">
                {hasPlayer1Revealed
            ? 'Player 1 has revealed their move'
            : 'Yet to be revealed'}
            </span>
        </div>
      </div>

      {!hasPlayer2Moved && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
              <span className="text-slate-400 flex items-center gap-1">
                <Timer className="h-4 w-4" />
                Time Remaining for player 2:
              </span>
              <span className="text-emerald-500 font-medium">
                {timeLeft > 0 ? 
                  `${Math.floor(timeLeft / 1000 / 60)}:${
                    Math.floor(timeLeft / 1000) % 60
                  }` : 
                  ` Time is up!
                  ${hasPlayer1ClaimedStake
                    ? 'Player 1 has reclaimed stake'
                    : 'But you can still play your move'}`
                }
              </span>
          </div>
          <Progress 
              value={timeLeft} 
              className={cn(
                  "bg-gradient-to-r h-2 bg-slate-700",
                  timeLeft > 50 && "from-emerald-500 to-cyan-500",
                  timeLeft <= 50 && timeLeft > 20 && "from-yellow-500 to-orange-500",
                  timeLeft <= 20 && "from-red-500 to-rose-500"
              )}
          />
        </div>
      )}

      {!hasPlayer1ClaimedStake && (
        <div className="text-xl">
          {!hasPlayer2Moved ? (
            <>
              <div className="flex items-center font-bold">
                <h3 className="text-sm font-medium text-slate-400">Select your move:</h3>
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
                          className="border border-gray-500 rounded-lg p-2 text-sm text-white peer-checked:bg-white peer-checked:text-black cursor-pointer"
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
                className="w-full mt-5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                disabled={showSpinner}
              >
                {showSpinner ? <Spinner /> : 'Submit Move'}
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-sm font-medium text-slate-400">Your move: </h3>
              <div className="flex items-center gap-2 text-white">
                <span className="font-semibold">{moves[player2Move - 1]}</span>
               </div>
            </>
          )}
        </div>
      )}

      {hasPlayer2Moved && !hasPlayer1Revealed && (
        <div className="space-y-2">
          {timeLeft > 0 ? (
            <>
              <div className="flex justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1">
                      <Timer className="h-4 w-4" />
                      Time Remaining for player 1 to reveal move:
                  </span>
                  <span className="text-emerald-500 font-medium">
                    {timeLeft > 0 ? 
                    `${Math.floor(timeLeft / 1000 / 60)}:${
                      Math.floor(timeLeft / 1000) % 60
                    }` : 'Time is up!'}
                  </span>
              </div>
              <Progress 
                  value={timeLeft} 
                  className={cn(
                      "bg-gradient-to-r h-2 bg-slate-700",
                      timeLeft > 50 && "from-emerald-500 to-cyan-500",
                      timeLeft <= 50 && timeLeft > 20 && "from-yellow-500 to-orange-500",
                      timeLeft <= 20 && "from-red-500 to-rose-500"
                  )}
              />
            </>
          ) : (
            <>
              {canPlayer2ClaimStake && (
                <Button 
                  disabled={!canPlayer2ClaimStake || showSpinner}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                  onClick={handleClaimStake}
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  {showSpinner ? <Spinner /> : 'Claim Stake'}
                </Button>
              )}
            </>
          )}

          {hasPlayer2Moved && !hasPlayer1Revealed && timeLeft <= 0 && (
            <p className="text-xs w-full text-slate-400">
              (please refresh if you don&apos;t see the button to claim stake)
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Player2GameDisplay;