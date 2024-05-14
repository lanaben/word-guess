import { Socket } from 'net';
import { decodeMessage } from '../encoding/encoding';
import { Request } from '../models/request';
import { handleRequest } from './requests';
import { Codes } from '../config/codes';

export function processClientData(socket: Socket, data: Buffer) {
    try {
        const decoded = decodeMessage(data);
        const request = new Request(decoded.type, decoded.payload);
        const messageBuffer = handleRequest(request);
        const decodedBuffer = decodeMessage(messageBuffer);
        
        handleResponse(socket, messageBuffer, decodedBuffer);
    } catch (error) {
        console.error('Error processing data:', error);
        socket.end();
    }
}

export function handleResponse(socket: Socket, messageBuffer: Buffer, decodedBuffer: any) {
    if (messageBuffer[0] === Codes.ERROR) {
        console.log(`Error detected: ${decodedBuffer.payload}, disconnecting client.`);
        socket.write(messageBuffer, () => socket.end());
    } else {
        socket.write(messageBuffer);
    }
}
