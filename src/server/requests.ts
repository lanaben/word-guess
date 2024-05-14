import { Codes } from '../config/codes';
import { Request } from '../models/request';
import { encodeMessage, decodeMessage } from '../encoding/encoding';
import { Socket } from 'net';
import Client from '../models/client';
import { Game } from '../models/game';
require("dotenv").config();
const crypto = require('crypto');

export function handleRequest(request: Request, client: Client, clientRegistry: Map<string, Client>) {
  
  if(request.type == Codes.PASSWORD) {
    console.log("Checking password..")
    return checkPassword(request.payload, client, clientRegistry);
  }
  
  if (!client.isAuthenticated) {
    return encodeMessage(Codes.ERROR, 'Not authenticated');
  }
  
  switch (request.type) {
    case Codes.ID_LIST_REQUEST:
      const clientIds = Array.from(clientRegistry.keys());
      return encodeMessage(Codes.ID_LIST, '', clientIds);

    case Codes.ID_AND_WORD:
      if (client.id === null) {
          return encodeMessage(Codes.ERROR, 'Client ID is null');
      }

      const parts = request.payload.split(',');
      if (parts.length < 2) {
          return encodeMessage(Codes.ERROR, 'Invalid payload format');
      }

      const opponentId = parts[0];
      const word = parts[1];

      console.log(`Creating game with opponent ID: ${opponentId} and word: ${word}`);
      const game = createGame(client.id, opponentId, word, clientRegistry);
      if (!game) {
          return encodeMessage(Codes.ERROR, 'Failed to create game');
      }
    
      console.log("Game created successfully.");
      return encodeMessage(Codes.GAME_STARTED, 'Game created successfully');
      
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

function createGame(player1Id: string, player2Id: string, winningWord: string, clientRegistry: Map<string, Client>): Game | null {
  
  const player1 = clientRegistry.get(player1Id);
  const player2 = clientRegistry.get(player2Id);
  
  if (!player1 || !player2) {
      clientRegistry.forEach((client, clientId) => {
          console.log(`Client ID: ${clientId}, Is Authenticated: ${client.isAuthenticated}`);
      });
      return null;
  }

  const game = new Game(player1Id, player2Id, winningWord);

  const gameStartMessage = encodeMessage(Codes.GAME_STARTED, 'Game has started');
  player1.sendMessage(gameStartMessage.toString());
  player2.sendMessage(gameStartMessage.toString());

  console.log("Game created and start message sent to both players.");
  return game;
}

