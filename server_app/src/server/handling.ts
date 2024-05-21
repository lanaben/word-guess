import { Socket } from "net";
import { decodeMessage } from "../encoding/encoding";
import { Request } from "../models/request";
import { handleRequest } from "./requests";
import { Codes } from "../config/codes";
import Client from "../models/client";
import { Game } from "../models/game";

/**
 * Processes incoming data from a client, in case of error disconnects client.
 *
 * @param client - The client sending the data.
 * @param data - The raw data buffer received from the client.
 * @param clientRegistry - A map of all registered clients.
 * @param gameSessions - A map of all active game sessions.
 */

export async function processClientData(
  client: Client,
  data: Buffer,
  clientRegistry: Map<string, Client>,
  gameSessions: Map<string, Game>
) {
  try {
    const decoded = decodeMessage(data);
    const request = new Request(decoded.type, decoded.payload);
    const messageBuffer = await handleRequest(
      request,
      client,
      clientRegistry,
      gameSessions
    );

    if (messageBuffer[0] === Codes.ERROR) {
      console.log(`Error detected: ${decoded.payload}, disconnecting client.`);
      client.sendMessage(messageBuffer);
      client.disconnect();
    } else {
      client.sendMessage(messageBuffer);
    }
  } catch (error) {
    console.error("Error processing data:", error);
    client.disconnect();
  }
}
