"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeMessage = exports.encodeMessage = void 0;
function encodeMessage(type, payload = '', ids = []) {
    let dataString = '';
    if (ids.length > 0) {
        dataString = ids.join(',');
    }
    else {
        dataString = payload;
    }
    const dataBuffer = Buffer.from(dataString);
    const buffer = Buffer.alloc(1 + dataBuffer.length);
    buffer.writeUInt8(type, 0);
    dataBuffer.copy(buffer, 1);
    return buffer;
}
exports.encodeMessage = encodeMessage;
function decodeMessage(buffer) {
    const type = buffer.readUInt8(0);
    const payload = buffer.toString('utf8', 1);
    return { type, payload };
}
exports.decodeMessage = decodeMessage;
