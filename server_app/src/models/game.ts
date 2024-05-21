import { randomUUID } from "crypto";
import { Codes } from "../config/codes";
import Client from "./client";
import { encodeMessage } from "../encoding/encoding";

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

  constructor(
    leadingPlayer: Client,
    guessingPlayer: Client,
    winningWord: string
  ) {
    this.id = randomUUID();
    this.leadingPlayer = leadingPlayer;
    this.guessingPlayer = guessingPlayer;
    this.winningWord = winningWord;
    this.isActive = true;
    this.startTime = new Date();
  }

  /**
   * Handles a guess made by the guessing player.
   *
   * @param guess - The guessed word.
   * @returns An object indicating whether the guess was correct and a corresponding message and code.
   */

  makeGuess(guess: string): { correct: boolean; message: string; code: Codes } {
    if (!this.isActive) {
      return {
        correct: false,
        message: "Game is not active!",
        code: Codes.ERROR,
      };
    }

    if (!this.leadingPlayer || !this.guessingPlayer) {
      return {
        correct: false,
        message: "One of the players not found!",
        code: Codes.ERROR,
      };
    }

    this.guesses.push(guess);

    if (guess === this.winningWord) {
      return {
        correct: true,
        message: "Correct guess!",
        code: Codes.GAME_ENDED,
      };
    }
    return {
      correct: false,
      message: "Wrong guess. Try again!",
      code: Codes.GUESS_WRONG,
    };
  }

  /**
   * Adds a hint to the game.
   *
   * @param hint - The hint provided by the leading player.
   */

  addHint(hint: string): void {
    if (!this.isActive) {
      throw new Error("Game is not active");
    }
    this.hints.push(hint);
  }

  /**
   * Ends the game, either because the guessing player gave up or because the word was guessed correctly.
   *
   * @param giveUp - A boolean indicating whether the game ended due to the guessing player giving up.
   */
  endGame(giveUp: boolean): void {
    let messageGameEnded;
    if (giveUp) {
      messageGameEnded = encodeMessage(
        Codes.GAME_ENDED,
        "Guessing player gave up!"
      );
    } else {
      messageGameEnded = encodeMessage(Codes.GAME_ENDED, "WORD GUESSED!");
    }
    this.leadingPlayer.sendMessage(messageGameEnded);
    this.guessingPlayer.sendMessage(messageGameEnded);
    this.isActive = false;
    this.endTime = new Date();
    this.guessingPlayer.disconnect();
    this.leadingPlayer.disconnect();
  }
}
