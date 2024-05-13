"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = require("net");
const encoding_1 = require("../encoding/encoding");
const codes_1 = require("../config/codes");
const request_1 = require("../models/request");
const handling_1 = require("./handling");
const PORT = 1234;
const server = (0, net_1.createServer)((socket) => {
    console.log('Client connected.');
    const initMessage = (0, encoding_1.encodeMessage)(codes_1.Codes.INITIALIZATION, "halo");
    socket.write(initMessage);
    socket.on('data', data => {
        const decoded = (0, encoding_1.decodeMessage)(data);
        const request = new request_1.Request(decoded.type, decoded.payload);
        const messageBuffer = (0, handling_1.handleRequest)(request);
        if (messageBuffer[0] === 0x11) {
            console.log("Error detected (Invalid password), disconnecting client.");
            socket.write(messageBuffer, () => {
                socket.end();
            });
        }
        else {
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
