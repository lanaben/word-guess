import { connect, Socket } from 'net';
import { encodeMessage, decodeMessage } from '../encoding/encoding';
import { Codes } from '../config/codes';
import readline from 'readline';

const PORT = 1234;
const HOST = 'localhost';
const client = new Socket();
let idRequestSent = false;
let clientId = '';

const rl = readline.createInterface({
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

function handleData(data: Buffer) {
    const { type, payload } = decodeMessage(data);
    console.log(payload)

    switch (type) {
        case Codes.INITIALIZATION:
            handleInitialization(payload);
            break;
        case Codes.ID_CREATION:
            requestIdList(payload);
            break;
        case Codes.ID_LIST:
            handleIdList(payload);
            break;
        case Codes.GAME_STARTED_GUESSING || Codes.GAME_STARTED_LEADING:
            guessing();
            break;
        case Codes.GUESS_WRONG:
            guessing();
            break;
        case Codes.HINT_RECEIVED:
            guessing();
            break;
        case Codes.GUESS_CORRECT:
            endGame();
            break;
        case Codes.HINT_REQUEST:
            promptForHint();
            break;
        case Codes.HINT_SENT:
            hintSent();
            break;
        default:
            console.log(payload);
            break;
    }
}

function handleInitialization(payload: string) {
    console.log('Received initiation from server:', payload);
    const password = "pass";
    const passwordBuffer = encodeMessage(Codes.PASSWORD, password);
    client.write(passwordBuffer);
}

function requestIdList(payload: string) {
    clientId = payload;
    if (!idRequestSent) {
        client.write(encodeMessage(Codes.ID_LIST_REQUEST));
        idRequestSent = true;
    }
}

function handleIdList(payload: string) {
    const idList = payload.split(',').filter(id => id.trim() !== '' && id !== clientId);
    if (idList.length > 0) {
        console.log('Received list of IDs:', idList.join(', '));
        promptForId(idList);
    } else {
        console.log('Not enough opponents to start a game.');
    }
}

function promptForId(idList: string[]) {
    rl.question('Enter the ID you choose from the list above: ', (chosenId) => {
        rl.question('Enter a word to send with the ID: ', (word) => {
            const message = encodeMessage(Codes.ID_AND_WORD, '', [chosenId, word]);
            client.write(message);
        });
    });
}

function guessing() {
    rl.question('Enter your guess: ', (guess) => {
        const message = encodeMessage(Codes.GUESS, guess);
        client.write(message);
        console.log('Guess sent:', guess);
    });
}

function promptForHint() {
    rl.question('Enter a hint for the guessing player: ', (hint) => {
        const message = encodeMessage(Codes.HINT, hint);
        client.write(message);
        console.log('Hint sent:', hint);
    });
}

function hintSent() {
        console.log('Hint sent:');
}

function endGame() {
    console.log('Game has ended, word was guessed.');
}
