import React from 'react';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  type BaseError
} from 'wagmi';

import { contractABI, moves } from '@/utils/constants';
import Spinner from '../common/Spinner';
import { GameState } from '@/types';
import getTimeLeft from '@/utils/getTimeLeft';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { Timer, Trophy } from 'lucide-react';

type Player1GameDisplay = {
  gameContract: `0x${string}`;
  player2Move: number;
  timeout: number;
  lastAction: number;
  gameState: GameState;
  refetch: () => void;
};

const Player1GameDisplay: React.FC<Player1GameDisplay> = ({
  gameContract,
  player2Move,
  timeout,
  lastAction,
  gameState,
  refetch,
}) => {
  const {
    hasGameTimedOut,
    hasPlayer2Moved,
    hasPlayer2ClaimedStake,
    hasPlayer1Revealed,
    canPlayer1ClaimStake,
  } = gameState;
  const { data: hash, error, writeContract } = useWriteContract()
  const [showSpinner, setShowSpinner] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(
    getTimeLeft(timeout, lastAction)
  );

  const [waitForSolveTxHash, setWaitForSolveTxHash] =
    React.useState<`0x${string}`>();

  const { data: waitForSolveTxData } = useWaitForTransactionReceipt({
    hash: waitForSolveTxHash,
    confirmations: 1,
  });

  const [waitForClaimTxHash, setWaitForClaimTxHash] =
    React.useState<`0x${string}`>();

  const { data: waitForClaimTxData } = useWaitForTransactionReceipt({
    hash: waitForClaimTxHash,
    confirmations: 1,
  });

  const getPlayer1Move = React.useCallback(() => {
    const gameData = localStorage.getItem(`game-${gameContract}`);
    if (gameData) {
      const parsedGameData = JSON.parse(gameData);
      return moves[parsedGameData.move];
    }
    return null;
  }, [gameContract]);

  const getPlayer1Salt = React.useCallback(() => {
    const gameData = localStorage.getItem(`game-${gameContract}`);
    if (gameData) {
      const parsedGameData = JSON.parse(gameData);
      return parsedGameData.salt;
    }
    return null;
  }, [gameContract]);

  React.useEffect(() => {
    if (waitForSolveTxData || waitForClaimTxData) {
      refetch();
      setShowSpinner(false);
    }
  }, [waitForSolveTxData, refetch, waitForClaimTxData]);

  React.useEffect(() => {
    if (timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(getTimeLeft(timeout, lastAction));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timeLeft, timeout, lastAction]);

  const handleClaimStake = React.useCallback(async () => {
    setShowSpinner(true);

    writeContract({
        address: gameContract,
        abi: contractABI,
        functionName: 'j2Timeout',
    });

    if (error) {
      toast.error((error.cause as BaseError)?.shortMessage ?? error.message);
      setShowSpinner(false);
      return;
    } else {
      setWaitForClaimTxHash(hash);
    }
  }, [gameState.canPlayer1ClaimStake]);

  const handleRevealMove = React.useCallback(async () => {
    setShowSpinner(true);

    writeContract({
        address: gameContract,
        abi: contractABI,
        functionName: 'solve',
        args: [
            moves.indexOf(getPlayer1Move() as string) + 1,
            BigInt(getPlayer1Salt()),
        ],
    });

    if (error) {
        toast.error((error.cause as BaseError)?.shortMessage ?? error.message);
        setShowSpinner(false);
        return;
    } else {
        setWaitForSolveTxHash(hash);
    }
  }, [gameState.hasPlayer2Moved]);

  return (
    <div className="grid gap-4 p-4 rounded-lg bg-slate-900">
        <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-400">Your Move:</h3>
            <div className="flex items-center gap-2 text-white">
              <span className="font-semibold">{getPlayer1Move()}</span>
            </div>
        </div>
        
        {(!hasGameTimedOut || hasPlayer1Revealed) && (
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-slate-400">
                    Player 2&apos;s move: 
                </h3>
                <div className="text-white font-semibold">
                    {Boolean(player2Move)
                    ? moves[player2Move - 1]
                    : 'Waiting for player 2 to move...'}
                </div>
            </div>
        )}

        {!hasPlayer2Moved && (
          <div className="space-y-2">
              {timeLeft > 0 ? (
                  <>
                      <div className="flex justify-between text-sm">
                          <span className="text-slate-400 flex items-center gap-1">
                              <Timer className="h-4 w-4" />
                              Time Remaining for player 2:
                          </span>
                          <span className="text-emerald-500 font-medium">
                            {timeLeft > 0 ? 
                            `${Math.floor(timeLeft / 1000 / 60)}:${
                              Math.floor(timeLeft / 1000) % 60
                            }` : 'Time is up!'}
                          </span>
                      </div>
                  </>
              ) : (
                <>
                  {canPlayer1ClaimStake && (
                    <Button 
                        disabled={!canPlayer1ClaimStake || showSpinner}
                        className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                        onClick={handleClaimStake}
                    >
                        <Trophy className="mr-2 h-4 w-4" />
                        {showSpinner ? <Spinner /> : 'Claim Stake'}
                    </Button>
                  )}
                </>
              )}

              {canPlayer1ClaimStake && !hasPlayer2Moved && timeLeft <= 0 && (
                <p className="text-xs w-full text-slate-400">
                  (please refresh if you don&apos;t see the button to claim stake)
                </p>
              )}
          </div>
        )}

      {hasPlayer2Moved && !hasPlayer1Revealed && (
        <div className="space-y-2">
            <>
              <div className="flex justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Timer className="h-4 w-4" />
                    Time left to reveal move: 
                  </span>
                  <span className="text-emerald-500 font-medium">
                    {timeLeft > 0 ? 
                    `${Math.floor(timeLeft / 1000 / 60)}:${
                      Math.floor(timeLeft / 1000) % 60
                    }` : `Time is up!
                      ${hasPlayer2ClaimedStake
                      ? 'Player 2 has reclaimed stake'
                      : 'But you can still reveal your move'}`}
                  </span>
              </div>
            </>
            {!hasPlayer2ClaimedStake && (
              <Button 
                disabled={showSpinner}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                onClick={() => handleRevealMove()}
              >
                <Trophy className="mr-2 h-4 w-4" />
                {showSpinner ? <Spinner /> : 'Reveal Move'}
              </Button>
            )}
        </div>
      )}
    </div>
  );
};

export default Player1GameDisplay;