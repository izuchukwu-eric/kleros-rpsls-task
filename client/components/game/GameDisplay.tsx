import React from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';

import { ContractReadResponse, GameState } from '@/types';
import ExplorerLink from '../common/ExplorerLink';
import getGameStatusText from '@/utils/getGameStatusText';
import Player1GameDisplay from './Player1GameDisplay';
import Player2GameDisplay from './Player2GameDisplay';
import getTimeLeft from '@/utils/getTimeLeft';

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

  return (
    <div className="py-8 flex flex-col items-center justify-center">
      <h1 className="text-3xl italic mb-3">{getGameStatusText(gameState)}</h1>
      {!gameState.hasPlayer1Revealed && (
        <h2 className="text-2xl italic mb-8">
          {(gameState.hasPlayer1ClaimedStake ||
            gameState.hasPlayer2ClaimedStake) &&
          stake?.result == 0
            ? `Stake claimed by ${
                gameState.hasPlayer1ClaimedStake ? 'Player 1' : 'Player 2'
              }`
            : getStakedAmountText()}
        </h2>
      )}
      <div className="w-2/3 flex items-center justify-between my-2">
        <span>Game contract:</span>
        <span>
          <ExplorerLink hashOrAddress={gameContract} isAddress></ExplorerLink>
        </span>
      </div>
      <div className="w-2/3 flex items-center justify-between my-2">
        <span>Player 1:</span>
        <span>
          <ExplorerLink
            hashOrAddress={player1.result as string}
            isAddress
          ></ExplorerLink>
        </span>
      </div>
      <div className="w-2/3 flex items-center justify-between my-2">
        <span>Player 2:</span>
        <span>
          <ExplorerLink
            hashOrAddress={player2.result as string}
            isAddress
          ></ExplorerLink>
        </span>
      </div>
      {!address && (
        <div className="flex flex-col items-center justify-center text-sm my-6 space-y-2">
          <span>If you are one of the players, please connect your wallet</span>
          {/**@ts-ignore */}
          <appkit-button />
        </div>
      )}
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
    </div>
  );
};

export default GameDisplay;