"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = require("net");
const encoding_1 = require("../encoding/encoding");
const codes_1 = require("../config/codes");
const PORT = 1234;
const HOST = 'localhost';
const client = new net_1.Socket();
client.connect(PORT, HOST, () => {
    console.log('Connected to server');
    client.on('data', (data) => {
        const { type, payload } = (0, encoding_1.decodeMessage)(data);
        if (type === codes_1.Codes.INITIALIZATION) {
            console.log('Received initiation from server:', payload);
            const password = "pass";
            const passwordBuffer = (0, encoding_1.encodeMessage)(0x02, password);
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
