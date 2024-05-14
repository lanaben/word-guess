import { Socket } from 'net';

class Client {
    id: string | null;
    socket: Socket;
    isAuthenticated: boolean;

    constructor(socket: Socket) {
        this.socket = socket;
        this.id = null;
        this.isAuthenticated = false;
    }

    sendMessage(message: string): void {
        this.socket.write(message);
    }

    disconnect(): void {
        this.socket.end();
        console.log(`Client ${this.id} disconnected.`);
    }
}

export default Client;
