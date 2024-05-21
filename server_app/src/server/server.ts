import { createServer, Socket } from "net";
import { encodeMessage, decodeMessage } from "../encoding/encoding";
import { Codes } from "../config/codes";
import { processClientData } from "./handling";
import Client from "../models/client";
import { Game } from "../models/game";
import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";

const TCP_PORT = 1234;
const UNIX_SOCKET_PATH = "/tmp/app.socket";

const clientRegistry = new Map<string, Client>();
const gameSessions = new Map<string, Game>();

// TCP Server Configuration
const tcpServer = createServer((socket: Socket) => {
  const client = new Client(socket);
  console.log("TCP Client connected.");

  const initMessage = encodeMessage(Codes.INITIALIZATION, "Connected.");
  socket.write(initMessage);

  socket.on("data", (data) =>
    processClientData(client, data, clientRegistry, gameSessions)
  );

  socket.on("close", () => {
    if (client.id) {
      console.log(`TCP Connection closed. Removing client: ${client.id}`);
      clientRegistry.delete(client.id);
      client.disconnect();
    }
  });

  socket.on("error", (err) => {
    console.error("TCP Socket error:", err);
    socket.destroy();
  });
});

tcpServer.listen(TCP_PORT, () => {
  console.log(`TCP Server listening on port ${TCP_PORT}`);
});


// UNIX Server Configuration
const unixServer = createServer((socket: Socket) => {
  const client = new Client(socket);
  console.log("UNIX Client connected.");

  const initMessage = encodeMessage(Codes.INITIALIZATION, "Connected.");
  socket.write(initMessage);

  socket.on("data", (data) =>
    processClientData(client, data, clientRegistry, gameSessions)
  );

  socket.on("close", () => {
    if (client.id) {
      console.log(`UNIX Connection closed. Removing client: ${client.id}`);
      clientRegistry.delete(client.id);
      client.disconnect();
    }
  });

  socket.on("error", (err) => {
    console.error("UNIX Socket error:", err);
    socket.destroy();
  });
});

fs.unlink(UNIX_SOCKET_PATH, (err) => {
  if (err && err.code !== "ENOENT") {
    console.error("Failed to remove existing Unix domain socket:", err);
    return;
  }
  unixServer.listen({ path: UNIX_SOCKET_PATH }, () => {
    console.log(`UNIX Server listening on Unix socket ${UNIX_SOCKET_PATH}`);
  });
});


// Express Server Configuration
const app = express();
const HTTP_PORT = process.env.PORT || 3001;

app.use(cors());

const indexPath = path.join(__dirname, "..", "public", "index.html");

app.get("/", (req: Request, res: Response) => {
  res.sendFile(indexPath);
});

app.get("/matches", (req: Request, res: Response) => {
  res.json(Array.from(gameSessions.values()));
});

app.listen(HTTP_PORT, () => {
  console.log(`Web server running at http://localhost:${HTTP_PORT}`);
});
