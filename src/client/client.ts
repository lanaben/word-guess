import { connect, Socket } from 'net';
import { encodeMessage, decodeMessage } from '../encoding/encoding';
import { Codes } from '../config/codes';

const PORT = 1234;
const HOST = 'localhost';
const client = new Socket();

client.connect(PORT, HOST, () => {
    console.log('Connected to server');

    client.on('data', (data) => {
        const { type, payload } = decodeMessage(data);

        if (type === Codes.INITIALIZATION) { 
            console.log('Received initiation from server:', payload);
            const password = "pass";
            const passwordBuffer = encodeMessage(0x02, password);
            client.write(passwordBuffer);
        }
    });

    client.on('close', () => {
        console.log('Connection closed');
    });

    client.on('error', (err) => {
        console.error('Connection error: ' + err.message);
    });
});
