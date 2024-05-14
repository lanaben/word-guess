"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.processClientData = void 0;
const encoding_1 = require("../encoding/encoding");
const request_1 = require("../models/request");
const requests_1 = require("./requests");
const codes_1 = require("../config/codes");
function processClientData(client, data, clientRegistry) {
    try {
        const decoded = (0, encoding_1.decodeMessage)(data);
        const request = new request_1.Request(decoded.type, decoded.payload);
        const messageBuffer = (0, requests_1.handleRequest)(request, client, clientRegistry);
        client.sendMessage(messageBuffer.toString());
    }
    catch (error) {
        console.error('Error processing data:', error);
        client.disconnect();
    }
}
exports.processClientData = processClientData;
function handleResponse(socket, messageBuffer, decodedBuffer) {
    if (messageBuffer[0] === codes_1.Codes.ERROR) {
        console.log(`Error detected: ${decodedBuffer.payload}, disconnecting client.`);
        socket.write(messageBuffer, () => socket.end());
    }
    else {
        socket.write(messageBuffer);
    }
}
exports.handleResponse = handleResponse;
