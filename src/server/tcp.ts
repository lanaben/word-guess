import { createServer, Socket } from 'net';
import { encodeMessage, decodeMessage } from '../encoding/encoding';
import { Codes } from '../config/codes';
import { processClientData } from './handling';
import Client from '../models/client';
import { Game } from '../models/game';

const PORT = 1234;
const clientRegistry = new Map<string, Client>();
const gameSessions = new Map<string, Game>();

const server = createServer((socket: Socket) => {
    const client = new Client(socket);  
    console.log('Client connected.');

    const initMessage = encodeMessage(Codes.INITIALIZATION, "Connected.");
    client.sendMessage(initMessage);

    socket.on('data', data => processClientData(client, data, clientRegistry, gameSessions));

    socket.on('close', () => {
        if (client.id) {
            console.log(`Connection closed. Removing client: ${client.id}`);
            clientRegistry.delete(client.id);
            client.disconnect();
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});