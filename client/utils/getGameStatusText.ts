import { GameState } from '@/types';

const getGameStatusText = (gameState: GameState) => {
  const {
    hasPlayer2Moved,
    hasPlayer1Revealed,
    hasGameTimedOut,
    canPlayer1ClaimStake,
    canPlayer2ClaimStake,
    hasPlayer1ClaimedStake,
    hasPlayer2ClaimedStake,
  } = gameState;

  if (!hasGameTimedOut && !hasPlayer2Moved) {
    return 'Waiting for player 2 to make a move...';
  } else if (!hasGameTimedOut && hasPlayer2Moved && !hasPlayer1Revealed) {
    return 'Waiting for player 1 to reveal their move...';
  } else if (canPlayer1ClaimStake) {
    return 'Game Timed Out. Player 1 can claim stake.';
  } else if (canPlayer2ClaimStake) {
    return 'Game Timed Out. Player 2 can claim stake.';
  } else if (hasPlayer1ClaimedStake) {
    return 'Game Timed Out';
  } else if (hasPlayer2ClaimedStake) {
    return 'Game Timed Out. Player 2 has claimed stake.';
  } else if (hasPlayer2Moved && hasPlayer1Revealed) {
    return 'Game Settled';
  }
};

export default getGameStatusText;