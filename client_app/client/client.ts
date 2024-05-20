import { connect, Socket } from 'net';
import readline from 'readline';
import { Codes } from '../config/codes';
import { decodeMessage, encodeMessage } from '../encoding/encoding';
require("dotenv").config();

const TCP_PORT = 1234;
const TCP_HOST = '127.0.0.1';
const UNIX_SOCKET_PATH = '/tmp/app.socket';

let client: Socket;
let clientId = '';
let choosingOpponent = false;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function connectToServer(type: 'tcp' | 'unix') {
    if (type === 'tcp') {
        client = connect(TCP_PORT, TCP_HOST, handleConnect);
    } else if (type === 'unix') {
        client = connect(UNIX_SOCKET_PATH, handleConnect);
    } else {
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

function handleData(data: Buffer) {
    const { type, payload } = decodeMessage(data);
    console.log(payload)

    switch (type) {
        case Codes.INITIALIZATION:
            handleInitialization(payload);
            break;
        case Codes.ID_CREATION:
            clientId = payload; 
            askToChooseOpponent();
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
        case Codes.HINT_REQUEST:
            promptForHint();
            break;
    }
}

function handleInitialization(payload: string) {
    console.log('Received initiation from server:', payload);
    const password = process.env.PASSWORD;
    const passwordBuffer = encodeMessage(Codes.PASSWORD, password);
    client.write(passwordBuffer);
}

function askToChooseOpponent() {
    rl.question('Do you want to choose an opponent? (yes/no) ', (answer) => {
        if (answer.toLowerCase() === 'yes') {
            client.write(encodeMessage(Codes.ID_LIST_REQUEST));
            choosingOpponent = true;
        } else {
            console.log('Connected without choosing an opponent.');
        }
    });
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
            choosingOpponent = false;
        });
    });
}

function guessing() {
    rl.question('Enter your guess. If you want to give up, write the number 17: ', (guess) => {
        let message;
        if (parseInt(guess) === 17) {
            message = encodeMessage(Codes.GIVE_UP);
        } else {
            message = encodeMessage(Codes.GUESS, guess);
        }
        client.write(message);
        console.log('Message sent:', guess === '17' ? 'GIVE_UP' : guess);
    });
}

function promptForHint() {
    rl.question('Enter a hint for the guessing player: ', (hint) => {
        const message = encodeMessage(Codes.HINT, hint);
        client.write(message);
    });
}

rl.question('Choose connection type (tcp/unix): ', (answer) => {
    connectToServer(answer.toLowerCase() === 'tcp' ? 'tcp' : 'unix');
});
