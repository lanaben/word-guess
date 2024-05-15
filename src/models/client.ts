import { Socket } from 'net';

class Client {
    id: string | null;
    socket: Socket;
    isAuthenticated: boolean;
    activeGameId: string | null;

    constructor(socket: Socket) {
        this.socket = socket;
        this.id = null;
        this.isAuthenticated = false;
        this.activeGameId = null;
    }

    sendMessage(message: string): void {
        try {
            this.socket.write(message);
        } catch (error) {
            console.error(`Error sending message to client ${this.id}:`, error);
        }
    }
    
    disconnect(): void {
        try {
            this.socket.end();
            console.log(`Client ${this.id} disconnected.`);
        } catch (error) {
            console.error(`Error disconnecting client ${this.id}:`, error);
        }
    }
}

export default Client;
