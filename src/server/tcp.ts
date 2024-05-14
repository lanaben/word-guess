import { createServer, Socket } from 'net';
import { encodeMessage, decodeMessage } from '../encoding/encoding';
import { Codes } from '../config/codes';
import { processClientData } from './handling';

const PORT = 1234;

const server = createServer((socket: Socket) => {
    console.log('Client connected.');

    const initMessage = encodeMessage(Codes.INITIALIZATION, "halo");
    socket.write(initMessage);

    socket.on('data', data => processClientData(socket, data));

    socket.on('close', () => {
        console.log('Connection closed.');
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});