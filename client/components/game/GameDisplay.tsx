import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';

import { ContractReadResponse, GameState } from '@/types';
import getGameStatusText from '@/utils/getGameStatusText';
import Player1GameDisplay from './Player1GameDisplay';
import Player2GameDisplay from './Player2GameDisplay';
import getTimeLeft from '@/utils/getTimeLeft';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Copy, ExternalLink, Swords, Timer, Wallet } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

type GameDisplayProps = {
  gameData: Array<ContractReadResponse>;
  gameContract: `0x${string}`;
  refetch: () => void;
};

const GameDisplay: React.FC<GameDisplayProps> = ({
  gameData,
  gameContract,
  refetch,
}) => {
  const { address } = useAccount();
  const [copied, setCopied] = useState('')
  const [
    stake,
    player1,
    player2,
    player1MoveHash,
    player2Move,
    timeout,
    lastAction,
  ] = gameData;
  const isCurrentUserPlayer1 = address === player1.result;
  const isCurrentUserPlayer2 = address === player2.result;
  const gameState: GameState = React.useMemo(() => {
    const hasGameTimedOut =
      getTimeLeft(timeout.result as number, lastAction.result as number) <= 0;

    const hasPlayer1Revealed = Boolean(player2Move.result) && stake.result == 0;
    const canPlayer1ClaimStake =
      hasGameTimedOut &&
      (stake.result as number) > 0 &&
      !Boolean(player2Move.result);
    const canPlayer2ClaimStake =
      hasGameTimedOut &&
      (stake.result as number) > 0 &&
      Boolean(player2Move.result) &&
      !hasPlayer1Revealed;
    const hasPlayer1ClaimedStake =
      hasGameTimedOut && stake.result == 0 && !Boolean(player2Move.result);
    const hasPlayer2ClaimedStake =
      hasGameTimedOut &&
      stake.result == 0 &&
      Boolean(player2Move.result) &&
      !hasPlayer1Revealed;

    return {
      hasPlayer2Moved: Boolean(player2Move.result) ? true : false,
      hasPlayer1Revealed,
      hasGameTimedOut: hasGameTimedOut,
      canPlayer1ClaimStake,
      canPlayer2ClaimStake,
      hasPlayer1ClaimedStake,
      hasPlayer2ClaimedStake,
    };
  }, [stake, player2Move, timeout, lastAction]);

  const getStakedAmountText = () => {
    const stakeAmount = formatEther(BigInt(stake?.result as number)).toString();
    if (!isCurrentUserPlayer1 && !isCurrentUserPlayer2) {
      return `${stakeAmount} ETH at stake`;
    } else if (isCurrentUserPlayer1) {
      return `${stakeAmount} ETH staked by you`;
    } else if (isCurrentUserPlayer2) {
      return `${stakeAmount} ETH stake required to play`;
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  const formatAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="text-center border-b border-slate-700">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl text-white">
            <Swords className="h-6 w-6 text-emerald-500" />
            Game in Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Game Status */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-white">
                {getGameStatusText(gameState)}
            </h2>
            <div className="flex items-center justify-center gap-2 text-emerald-500">
              <Wallet className="h-4 w-4" />
                {!gameState.hasPlayer1Revealed && (
                    <span>
                    {(gameState.hasPlayer1ClaimedStake ||
                        gameState.hasPlayer2ClaimedStake) &&
                    stake?.result == 0
                        ? `Stake claimed by ${
                            gameState.hasPlayer1ClaimedStake ? 'Player 1' : 'Player 2'
                        }`
                        : getStakedAmountText()}
                    </span>
                )}
            </div>
          </div>

          {/* Game Info */}
          <div className="grid gap-4 p-4 rounded-lg bg-slate-900">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Game Contract</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:text-emerald-500"
                    onClick={() => copyToClipboard(gameContract, 'contract')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:text-emerald-500"
                    asChild
                  >
                    <a
                      href={`https://etherscan.io/address/${gameContract}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
              <div className="font-mono text-sm text-slate-200">
                {gameContract}
              </div>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Player 1</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 hover:text-emerald-500 font-mono"
                  onClick={() => copyToClipboard(player1.result as string, 'player1')}
                >
                  {formatAddress(player1.result as string)}
                  <Copy className="ml-2 h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Player 2</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 hover:text-emerald-500 font-mono"
                  onClick={() => copyToClipboard(player2.result as string, 'player2')}
                >
                  {formatAddress(player2.result as string)}
                  <Copy className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {isCurrentUserPlayer1 && (
            <Player1GameDisplay
            gameContract={gameContract}
            player2Move={player2Move.result as number}
            timeout={timeout.result as number}
            lastAction={lastAction.result as number}
            gameState={gameState}
            refetch={refetch}
            />
        )}
        {isCurrentUserPlayer2 && (
            <Player2GameDisplay
            gameContract={gameContract}
            player2Move={player2Move.result as number}
            timeout={timeout.result as number}
            lastAction={lastAction.result as number}
            gameState={gameState}
            refetch={refetch}
            stake={stake.result as bigint}
            />
        )}
          
        </CardContent>
      </Card>

      {/* Copy Confirmation Toast */}
      <div className={cn(
        "fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg transition-all transform",
        copied ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      )}>
        {copied === 'contract' && 'Contract address copied!'}
        {copied === 'player1' && 'Player 1 address copied!'}
        {copied === 'player2' && 'Player 2 address copied!'}
      </div>
    </div>
  );
};

export default GameDisplay;