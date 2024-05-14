"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Client {
    constructor(socket) {
        this.socket = socket;
        this.id = null;
        this.isAuthenticated = false;
    }
    sendMessage(message) {
        this.socket.write(message);
    }
    disconnect() {
        this.socket.end();
        console.log(`Client ${this.id} disconnected.`);
    }
}
exports.default = Client;
