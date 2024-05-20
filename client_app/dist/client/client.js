"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = require("net");
const readline_1 = __importDefault(require("readline"));
const codes_1 = require("../config/codes");
const encoding_1 = require("../encoding/encoding");
require("dotenv").config();
const TCP_PORT = 1234;
const TCP_HOST = '127.0.0.1';
const UNIX_SOCKET_PATH = '/tmp/app.socket';
let client;
let clientId = '';
let choosingOpponent = false;
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
function connectToServer(type) {
    if (type === 'tcp') {
        client = (0, net_1.connect)(TCP_PORT, TCP_HOST, handleConnect);
    }
    else if (type === 'unix') {
        client = (0, net_1.connect)(UNIX_SOCKET_PATH, handleConnect);
    }
    else {
        console.error('Invalid connection type.');
        rl.close();
        return;
    }
}
function handleConnect() {
    console.log('Connected to server');
    setupClientListeners();
}
function setupClientListeners() {
    client.on('data', handleData);
    client.on('close', () => console.log('Connection closed'));
    client.on('error', (err) => console.error('Connection error:', err.message));
}
function handleData(data) {
    const { type, payload } = (0, encoding_1.decodeMessage)(data);
    console.log(payload);
    switch (type) {
        case codes_1.Codes.INITIALIZATION:
            handleInitialization(payload);
            break;
        case codes_1.Codes.ID_CREATION:
            clientId = payload;
            askToChooseOpponent();
            break;
        case codes_1.Codes.ID_LIST:
            handleIdList(payload);
            break;
        case codes_1.Codes.GAME_STARTED_GUESSING || codes_1.Codes.GAME_STARTED_LEADING:
            guessing();
            break;
        case codes_1.Codes.GUESS_WRONG:
            guessing();
            break;
        case codes_1.Codes.HINT_RECEIVED:
            guessing();
            break;
        case codes_1.Codes.HINT_REQUEST:
            promptForHint();
            break;
    }
}
function handleInitialization(payload) {
    console.log('Received initiation from server:', payload);
    const password = process.env.PASSWORD;
    const passwordBuffer = (0, encoding_1.encodeMessage)(codes_1.Codes.PASSWORD, password);
    client.write(passwordBuffer);
}
function askToChooseOpponent() {
    rl.question('Do you want to choose an opponent? (yes/no) ', (answer) => {
        if (answer.toLowerCase() === 'yes') {
            client.write((0, encoding_1.encodeMessage)(codes_1.Codes.ID_LIST_REQUEST));
            choosingOpponent = true;
        }
        else {
            console.log('Connected without choosing an opponent.');
        }
    });
}
function handleIdList(payload) {
    const idList = payload.split(',').filter(id => id.trim() !== '' && id !== clientId);
    if (idList.length > 0) {
        console.log('Received list of IDs:', idList.join(', '));
        promptForId(idList);
    }
    else {
        console.log('Not enough opponents to start a game.');
    }
}
function promptForId(idList) {
    rl.question('Enter the ID you choose from the list above: ', (chosenId) => {
        rl.question('Enter a word to send with the ID: ', (word) => {
            const message = (0, encoding_1.encodeMessage)(codes_1.Codes.ID_AND_WORD, '', [chosenId, word]);
            client.write(message);
            choosingOpponent = false;
        });
    });
}
function guessing() {
    rl.question('Enter your guess. If you want to give up, write the number 17: ', (guess) => {
        let message;
        if (parseInt(guess) === 17) {
            message = (0, encoding_1.encodeMessage)(codes_1.Codes.GIVE_UP);
        }
        else {
            message = (0, encoding_1.encodeMessage)(codes_1.Codes.GUESS, guess);
        }
        client.write(message);
        console.log('Message sent:', guess === '17' ? 'GIVE_UP' : guess);
    });
}
function promptForHint() {
    rl.question('Enter a hint for the guessing player: ', (hint) => {
        const message = (0, encoding_1.encodeMessage)(codes_1.Codes.HINT, hint);
        client.write(message);
    });
}
rl.question('Choose connection type (tcp/unix): ', (answer) => {
    connectToServer(answer.toLowerCase() === 'tcp' ? 'tcp' : 'unix');
});
