"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRequest = void 0;
const codes_1 = require("../config/codes");
const encoding_1 = require("../encoding/encoding");
const game_1 = require("../models/game");
require("dotenv").config();
const crypto = require('crypto');
function handleRequest(request, client, clientRegistry) {
    if (request.type == codes_1.Codes.PASSWORD) {
        console.log("Checking password..");
        return checkPassword(request.payload, client, clientRegistry);
    }
    if (!client.isAuthenticated) {
        return (0, encoding_1.encodeMessage)(codes_1.Codes.ERROR, 'Not authenticated');
    }
    switch (request.type) {
        case codes_1.Codes.ID_LIST_REQUEST:
            const clientIds = Array.from(clientRegistry.keys());
            return (0, encoding_1.encodeMessage)(codes_1.Codes.ID_LIST, '', clientIds);
        case codes_1.Codes.ID_AND_WORD:
            if (client.id === null) {
                return (0, encoding_1.encodeMessage)(codes_1.Codes.ERROR, 'Client ID is null');
            }
            const parts = request.payload.split(',');
            if (parts.length < 2) {
                return (0, encoding_1.encodeMessage)(codes_1.Codes.ERROR, 'Invalid payload format');
            }
            const opponentId = parts[0];
            const word = parts[1];
            console.log(`Creating game with opponent ID: ${opponentId} and word: ${word}`);
            const game = createGame(client.id, opponentId, word, clientRegistry);
            if (!game) {
                return (0, encoding_1.encodeMessage)(codes_1.Codes.ERROR, 'Failed to create game');
            }
            console.log("Game created successfully.");
            return (0, encoding_1.encodeMessage)(codes_1.Codes.GAME_STARTED, 'Game created successfully');
        default:
            return (0, encoding_1.encodeMessage)(codes_1.Codes.ERROR, 'Unhandled request type');
    }
}
exports.handleRequest = handleRequest;
function checkPassword(password, client, clientRegistry) {
    const correctPassword = process.env.PASSWORD;
    if (password === correctPassword) {
        client.isAuthenticated = true;
        const newId = crypto.randomUUID();
        client.id = newId;
        clientRegistry.set(newId, client);
        return (0, encoding_1.encodeMessage)(codes_1.Codes.ID_CREATION, newId);
    }
    else {
        return (0, encoding_1.encodeMessage)(codes_1.Codes.ERROR, 'Invalid password');
    }
}
function createGame(player1Id, player2Id, winningWord, clientRegistry) {
    const player1 = clientRegistry.get(player1Id);
    const player2 = clientRegistry.get(player2Id);
    if (!player1 || !player2) {
        clientRegistry.forEach((client, clientId) => {
            console.log(`Client ID: ${clientId}, Is Authenticated: ${client.isAuthenticated}`);
        });
        return null;
    }
    const game = new game_1.Game(player1Id, player2Id, winningWord);
    const gameStartMessage = (0, encoding_1.encodeMessage)(codes_1.Codes.GAME_STARTED, 'Game has started');
    player1.sendMessage(gameStartMessage.toString());
    player2.sendMessage(gameStartMessage.toString());
    console.log("Game created and start message sent to both players.");
    return game;
}
