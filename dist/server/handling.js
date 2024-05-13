"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRequest = void 0;
const codes_1 = require("../config/codes");
const encoding_1 = require("../encoding/encoding");
require("dotenv").config();
const crypto = require('crypto');
function handleRequest(request) {
    if (request.type === codes_1.Codes.PASSWORD) {
        return checkPassword(request.payload);
    }
    else {
        return (0, encoding_1.encodeMessage)(codes_1.Codes.ERROR, 'Unhandled request type');
    }
}
exports.handleRequest = handleRequest;
function checkPassword(password) {
    if (password === process.env.PASSWORD) {
        const clientId = crypto.randomUUID();
        return (0, encoding_1.encodeMessage)(codes_1.Codes.ID_CREATION, clientId);
    }
    else {
        return (0, encoding_1.encodeMessage)(codes_1.Codes.ERROR, 'Invalid password');
    }
}
