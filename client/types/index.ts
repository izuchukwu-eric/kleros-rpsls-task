export enum Move {
    Rock,
    Paper,
    Scissors,
    Spock,
    Lizard,
}
  
export type ContractReadResponse = {
    result?: unknown | undefined;
    status: string;
    error?: Error;
};
  
export type GameState = {
    hasPlayer2Moved: boolean;
    hasPlayer1Revealed: boolean;
    hasGameTimedOut: boolean;
    canPlayer1ClaimStake: boolean;
    canPlayer2ClaimStake: boolean;
    hasPlayer1ClaimedStake: boolean;
    hasPlayer2ClaimedStake: boolean;
}; 