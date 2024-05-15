import { randomUUID } from 'crypto';
import { Codes } from '../config/codes';  // Ensure you have appropriate Codes defined.

export class Game {
  id: string;
  leadingPlayer: string;
  guessingPlayer: string;
  winningWord: string;
  guesses: string[] = [];
  hints: string[] = [];
  isActive: boolean;
  startTime: Date;
  endTime?: Date;

  constructor(leadingPlayer: string, guessingPlayer: string, winningWord: string) {
    this.id = randomUUID(); 
    this.leadingPlayer = leadingPlayer;
    this.guessingPlayer = guessingPlayer;
    this.winningWord = winningWord;
    this.isActive = true;
    this.startTime = new Date();
  }

  makeGuess(guess: string): { correct: boolean, message: string, code: Codes } {
    if (!this.isActive) {
      throw new Error("Game is not active");
    }

    this.guesses.push(guess);
    console.log(guess);
    console.log(this.winningWord);
    if (guess === this.winningWord) {
      this.isActive = false;
      this.endTime = new Date();
      return { correct: true, message: "Correct guess!", code: Codes.GUESS_CORRECT };
    }
    return { correct: false, message: "Wrong guess. Try again!", code: Codes.GUESS_WRONG };
  }

  addHint(hint: string): void {
    if (!this.isActive) {
      throw new Error("Game is not active");
    }
    this.hints.push(hint);
  }

  getHints(): string[] {
    return this.hints;
  }

  getGuessHistory(): string[] {
    return this.guesses;
  }

  endGame(): void {
    this.isActive = false;
    this.endTime = new Date();
  }
}
