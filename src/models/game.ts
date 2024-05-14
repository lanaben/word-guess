export class Game {
  player1: string;
  player2: string;
  winningWord: string;

  constructor(player1: string, player2: string, winningWord: string) {
      this.player1 = player1;
      this.player2 = player2;
      this.winningWord = winningWord
  }
}