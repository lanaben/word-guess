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

    sendMessage(message: Buffer): void {
        if (this.socket.writable) {
            try {
                this.socket.write(message);
            } catch (error) {
                console.error(`Error sending message to client ${this.id}:`, error);
            }
        } else {
            console.warn(`Attempted to send message to client ${this.id} after socket ended.`);
        }
    }
    
    disconnect(): void {
        try {
            this.socket.end();
        } catch (error) {
            console.error(`Error disconnecting client ${this.id}:`, error);
        }
    }
}

export default Client;
