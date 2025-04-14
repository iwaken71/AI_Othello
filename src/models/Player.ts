export enum Player {
  None = 0,
  Black = 1,
  White = 2
}

export function getOpponent(player: Player): Player {
  if (player === Player.Black) return Player.White;
  if (player === Player.White) return Player.Black;
  return Player.None;
}
