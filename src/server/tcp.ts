import { createServer, Socket } from 'net';
import { encodeMessage, decodeMessage } from '../encoding/encoding';
import { Codes } from '../config/codes';
import { Request } from '../models/request';
import { handleRequest } from './handling';

const PORT = 1234;

const server = createServer((socket: Socket) => {
    console.log('Client connected.');

    const initMessage = encodeMessage(Codes.INITIALIZATION, "halo");
    
    socket.write(initMessage);

    socket.on('data', data => {
        const decoded = decodeMessage(data);
        const request = new Request(decoded.type, decoded.payload);
        const messageBuffer = handleRequest(request);

        if (messageBuffer[0] === 0x11) {
            console.log("Error detected (Invalid password), disconnecting client.");
            socket.write(messageBuffer, () => {
                socket.end();
            });
        } else {
            socket.write(messageBuffer);
        }
    });

    socket.on('close', () => {
        console.log('Connection closed.');
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

