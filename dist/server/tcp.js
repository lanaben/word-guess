"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = require("net");
const encoding_1 = require("../encoding/encoding");
const codes_1 = require("../config/codes");
const handling_1 = require("./handling");
const PORT = 1234;
const server = (0, net_1.createServer)((socket) => {
    console.log('Client connected.');
    const initMessage = (0, encoding_1.encodeMessage)(codes_1.Codes.INITIALIZATION, "halo");
    socket.write(initMessage);
    socket.on('data', data => (0, handling_1.processClientData)(socket, data));
    socket.on('close', () => {
        console.log('Connection closed.');
    });
});
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
