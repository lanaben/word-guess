import { Codes } from '../config/codes';
import { Request } from '../models/request';
import { encodeMessage, decodeMessage } from '../encoding/encoding';
import { Socket } from 'net';
import Client from '../models/client';
import { Game } from '../models/game';
require("dotenv").config();
const crypto = require('crypto');

export function handleRequest(request: Request, client: Client, clientRegistry: Map<string, Client>, gameSessions: Map<string, Game>) {
  
  if(request.type == Codes.PASSWORD) {
    console.log("Checking password..")
    return checkPassword(request.payload, client, clientRegistry);
  }
  
  if (!client.isAuthenticated || client.id === null) {
    return encodeMessage(Codes.ERROR, 'Not authenticated or Client ID is null');
  }
  
  switch (request.type) {
    case Codes.ID_LIST_REQUEST:
      const clientIds = Array.from(clientRegistry.keys());
      return encodeMessage(Codes.ID_LIST, '', clientIds);

    case Codes.ID_AND_WORD:
        const parts = request.payload.split(',');
        if (parts.length < 2) {
            return encodeMessage(Codes.ERROR, 'Invalid payload format');
        }
        const [opponentId, word] = parts;
        console.log(`Creating game with opponent ID: ${opponentId} and word: ${word}`);
        return createGame(client.id, opponentId, word, clientRegistry, gameSessions);
    
    case Codes.GUESS:
      if (!client.activeGameId) {
        return encodeMessage(Codes.ERROR, 'Client is not currently in a game');
      }
      
      const game = gameSessions.get(client.activeGameId);
      if (!game) {
        return encodeMessage(Codes.ERROR, 'Game not found');
      }
    
      return handleGuess(request.payload, game, clientRegistry);
      case Codes.HINT:
        if (!client.activeGameId) {
          return encodeMessage(Codes.ERROR, 'Client is not currently in a game');
        }
        
        const hintGame = gameSessions.get(client.activeGameId);
        if (!hintGame) {
          return encodeMessage(Codes.ERROR, 'Game not found');
        }
        
        return sendHint(request.payload, hintGame, clientRegistry);
    default:
      return encodeMessage(Codes.ERROR, 'Unhandled request type');
  }
}

function checkPassword(password: string, client: Client, clientRegistry: Map<string, Client>) {
  const correctPassword = process.env.PASSWORD;
  if (password === correctPassword) {
    client.isAuthenticated = true;
    const newId = crypto.randomUUID();
    client.id = newId;
    clientRegistry.set(newId, client);
    return encodeMessage(Codes.ID_CREATION, newId);
  } else {
    return encodeMessage(Codes.ERROR, 'Invalid password');
  }
}

function createGame(leadingPlayerId: string, guessingPlayerId: string, winningWord: string, clientRegistry: Map<string, Client>, gameSessions: Map<string, Game>) {
  const leadingPlayer = clientRegistry.get(leadingPlayerId);
  const guessingPlayer = clientRegistry.get(guessingPlayerId);

  if (!leadingPlayer || !guessingPlayer) {
      return encodeMessage(Codes.ERROR, 'One or both players not found');
  }

  const game = new Game(leadingPlayerId, guessingPlayerId, winningWord);
  gameSessions.set(game.id, game);

  leadingPlayer.activeGameId = game.id;
  guessingPlayer.activeGameId = game.id;

  const startMessages: [Client, Codes, string][] = [
    [leadingPlayer, Codes.GAME_STARTED_LEADING, 'Game has started'],
    [guessingPlayer, Codes.GAME_STARTED_GUESSING, 'Game has started. Start guessing!']
  ];

  startMessages.forEach(([player, code, message]) => {
    try {
      player.sendMessage(encodeMessage(code, message).toString());
    } catch (error) {
      console.error(`Error sending message to player ${player.id}:`, error);
    }
  });

  console.log("Game created and start message sent to both players.");
  return encodeMessage(Codes.GAME_STARTED_LEADING, 'Game created successfully');
}


function handleGuess(guess: string, game: Game, clientRegistry: Map<string, Client>) {
  if (!game.isActive) {
    return encodeMessage(Codes.ERROR, 'Game is not active');
  }

  const leadingPlayer = clientRegistry.get(game.leadingPlayer);
  const guessingPlayer = clientRegistry.get(game.guessingPlayer);

  if (!leadingPlayer || !guessingPlayer) {
    return encodeMessage(Codes.ERROR, 'One of the players not found');
  }

  const result = game.makeGuess(guess);
  console.log(result)

  if (result.correct) {
    const messageGameEnded = encodeMessage(Codes.GUESS_CORRECT, 'WORD GUESSED!');
    leadingPlayer.sendMessage(messageGameEnded.toString());
    guessingPlayer.sendMessage(messageGameEnded.toString());
    return encodeMessage(Codes.GUESS_CORRECT, 'Correct guess!');
  } else {
    const errorMsg = encodeMessage(Codes.GUESS_WRONG, 'Wrong guess. Try again!');
    const hintMsg = encodeMessage(Codes.HINT_REQUEST, 'Wrong guess. Give a hint!');
    guessingPlayer.sendMessage(errorMsg.toString());
    leadingPlayer.sendMessage(hintMsg.toString());
    return errorMsg;
  }
}

function sendHint(hint: string, game: Game, clientRegistry: Map<string, Client>){
  if (!game.isActive) {
    return encodeMessage(Codes.ERROR, 'Game is not active');
  }

  const leadingPlayer = clientRegistry.get(game.leadingPlayer);
  const guessingPlayer = clientRegistry.get(game.guessingPlayer);

  if (!leadingPlayer || !guessingPlayer) {
    return encodeMessage(Codes.ERROR, 'One of the players not found');
  }
  const messageHint = encodeMessage(Codes.HINT_RECEIVED, 'You got a hint:' + hint);
  guessingPlayer.sendMessage(messageHint.toString());
  const hintMsg = encodeMessage(Codes.HINT_SENT, 'Hint sent!');
  leadingPlayer.sendMessage(hintMsg.toString());
  return hintMsg;
}