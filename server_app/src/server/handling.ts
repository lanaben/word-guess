import { Socket } from 'net';
import { decodeMessage } from '../encoding/encoding';
import { Request } from '../models/request';
import { handleRequest } from './requests';
import { Codes } from '../config/codes';
import Client from '../models/client';
import { Game } from '../models/game';

export async function processClientData(client: Client, data: Buffer, clientRegistry: Map<string, Client>, gameSessions: Map<string, Game>) {
    try {
        const decoded = decodeMessage(data);
        const request = new Request(decoded.type, decoded.payload);
        const messageBuffer = await handleRequest(request, client, clientRegistry, gameSessions);

        if (messageBuffer[0] === Codes.ERROR) {
            console.log(`Error detected: ${decoded.payload}, disconnecting client.`);
            client.sendMessage(messageBuffer);
            client.disconnect();
        } else {
            client.sendMessage(messageBuffer);
        }
    } catch (error) {
        console.error('Error processing data:', error);
        client.disconnect();
    }
}