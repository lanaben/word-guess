import { Socket } from 'net';
import { decodeMessage } from '../encoding/encoding';
import { Request } from '../models/request';
import { handleRequest } from './requests';
import { Codes } from '../config/codes';
import Client from '../models/client';
import { Game } from '../models/game';

export function processClientData(client: Client, data: Buffer, clientRegistry: Map<string, Client>, gameSessions: Map<string, Game>) {
    try {
        const decoded = decodeMessage(data);
        const request = new Request(decoded.type, decoded.payload);
        const messageBuffer = handleRequest(request, client, clientRegistry, gameSessions);
        client.sendMessage(messageBuffer.toString());
    } catch (error) {
        console.error('Error processing data:', error);
        client.disconnect();
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
