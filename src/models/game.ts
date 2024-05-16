import { randomUUID } from 'crypto';
import { Codes } from '../config/codes';
import Client from './client';
import { encodeMessage } from '../encoding/encoding';

export class Game {
  id: string;
  leadingPlayer: Client;
  guessingPlayer: Client;
  winningWord: string;
  guesses: string[] = [];
  hints: string[] = [];
  isActive: boolean;
  startTime: Date;
  endTime?: Date;

  constructor(leadingPlayer: Client, guessingPlayer: Client, winningWord: string) {
    this.id = randomUUID(); 
    this.leadingPlayer = leadingPlayer;
    this.guessingPlayer = guessingPlayer;
    this.winningWord = winningWord;
    this.isActive = true;
    this.startTime = new Date();
  }

  makeGuess(guess: string): { correct: boolean, message: string, code: Codes } {
    if (!this.isActive) {
      return { correct: false, message: "Game is not active!", code: Codes.ERROR };
    }

    if (!this.leadingPlayer || !this.guessingPlayer) {
      return { correct: false, message: "One of the players not found!", code: Codes.ERROR };
    }

    this.guesses.push(guess);

    if (guess === this.winningWord) {
      this.endGame();
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
    const messageGameEnded = encodeMessage(Codes.GUESS_CORRECT, 'WORD GUESSED!');
    this.leadingPlayer.sendMessage(messageGameEnded);
    this.guessingPlayer.sendMessage(messageGameEnded);
    this.isActive = false;
    this.endTime = new Date();
    this.guessingPlayer.disconnect();
    this.leadingPlayer.disconnect();
  }
}
