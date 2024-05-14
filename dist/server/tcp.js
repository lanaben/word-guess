"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = require("net");
const encoding_1 = require("../encoding/encoding");
const codes_1 = require("../config/codes");
const handling_1 = require("./handling");
const client_1 = __importDefault(require("../models/client"));
const PORT = 1234;
const clientRegistry = new Map();
const server = (0, net_1.createServer)((socket) => {
    const client = new client_1.default(socket);
    console.log('Client connected.');
    const initMessage = (0, encoding_1.encodeMessage)(codes_1.Codes.INITIALIZATION, "halo");
    socket.write(initMessage);
    socket.on('data', data => (0, handling_1.processClientData)(client, data, clientRegistry));
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
