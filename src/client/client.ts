import { connect, Socket } from 'net';
import { encodeMessage, decodeMessage } from '../encoding/encoding';
import { Codes } from '../config/codes';
import readline from 'readline';

const PORT = 1234;
const HOST = 'localhost';
const client = new Socket();
let idRequestSent = false;
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
    console.log(`Received response from server - Type: ${type}, Payload: ${payload}`);

    switch (type) {
        case Codes.INITIALIZATION:
            handleInitialization(payload);
            break;
        case Codes.ID_CREATION:
            requestIdList();
            break;
        case Codes.ID_LIST:
            handleIdList(payload);
            break;
        default:
            console.log('Unknown message type received.');
            break;
    }
}

function handleInitialization(payload: string) {
    console.log('Received initiation from server:', payload);
    const password = "pass";
    const passwordBuffer = encodeMessage(Codes.PASSWORD, password);
    client.write(passwordBuffer);
}

function requestIdList() {
    if (!idRequestSent) {
        client.write(encodeMessage(Codes.ID_LIST_REQUEST));
        idRequestSent = true;
    }
}

function handleIdList(payload: string) {
    const idList = payload.split(',');
    if (idList.length > 1) {
        console.log('Received list of IDs:', payload);
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
            rl.close();
        });
    });
}
