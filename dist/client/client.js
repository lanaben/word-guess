"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = require("net");
const encoding_1 = require("../encoding/encoding");
const codes_1 = require("../config/codes");
const readline_1 = __importDefault(require("readline"));
const PORT = 1234;
const HOST = 'localhost';
const client = new net_1.Socket();
let idRequestSent = false;
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
client.connect(PORT, HOST, () => {
    console.log('Connected to server');
    setupClientListeners();
});
function setupClientListeners() {
    client.on('data', handleData);
    client.on('close', () => console.log('Connection closed'));
    client.on('error', (err) => console.error('Connection error:', err.message));
}
function handleData(data) {
    const { type, payload } = (0, encoding_1.decodeMessage)(data);
    console.log(`Received response from server - Type: ${type}, Payload: ${payload}`);
    switch (type) {
        case codes_1.Codes.INITIALIZATION:
            handleInitialization(payload);
            break;
        case codes_1.Codes.ID_CREATION:
            requestIdList();
            break;
        case codes_1.Codes.ID_LIST:
            handleIdList(payload);
            break;
        default:
            console.log('Unknown message type received.');
            break;
    }
}
function handleInitialization(payload) {
    console.log('Received initiation from server:', payload);
    const password = "pass";
    const passwordBuffer = (0, encoding_1.encodeMessage)(codes_1.Codes.PASSWORD, password);
    client.write(passwordBuffer);
}
function requestIdList() {
    if (!idRequestSent) {
        client.write((0, encoding_1.encodeMessage)(codes_1.Codes.ID_LIST_REQUEST));
        idRequestSent = true;
    }
}
function handleIdList(payload) {
    const idList = payload.split(',');
    if (idList.length > 1) {
        console.log('Received list of IDs:', payload);
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
            rl.close();
        });
    });
}
