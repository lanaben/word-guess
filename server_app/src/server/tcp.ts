import { createServer, Socket } from 'net';
import { encodeMessage, decodeMessage } from '../encoding/encoding';
import { Codes } from '../config/codes';
import { processClientData } from './handling';
import Client from '../models/client';
import { Game } from '../models/game';
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';

const PORT = 1234;
const clientRegistry = new Map<string, Client>();
const gameSessions = new Map<string, Game>();

// TCP Configuration
const server = createServer((socket: Socket) => {
    const client = new Client(socket);  
    console.log('Client connected.');

    const initMessage = encodeMessage(Codes.INITIALIZATION, "Connected.");
    socket.write(initMessage);

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


// Express Server Configuration
const app = express();
const HTTP_PORT = process.env.PORT || 3001;

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/matches', (req: Request, res: Response) => {
    res.json(Array.from(gameSessions.values()));
});

app.listen(HTTP_PORT, () => {
    console.log(`Web server running at http://localhost:${HTTP_PORT}`);
});

// UNIX Configuration
// const UNIX_SOCKET_PATH = '/tmp/app.socket';

// fs.unlink(UNIX_SOCKET_PATH, err => {
//     if (err && err.code !== 'ENOENT') {
//         console.error('Failed to remove existing Unix domain socket:', err);
//         return;
//     }
//     server.listen(UNIX_SOCKET_PATH, () => {
//         console.log(`Server listening on Unix socket ${UNIX_SOCKET_PATH}`);
//     });
// });