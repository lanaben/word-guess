import { Codes } from '../config/codes';
import { Request } from '../models/request';
import { encodeMessage, decodeMessage } from '../encoding/encoding';
require("dotenv").config();
const crypto = require('crypto');

export function handleRequest(request: Request) {
  if (request.type === Codes.PASSWORD) {
    return checkPassword(request.payload);
  } else {
    return encodeMessage(Codes.ERROR, 'Unhandled request type');
  }
}

function checkPassword(password: String){
  if(password === process.env.PASSWORD) {
    const clientId = crypto.randomUUID();
    console.log("sent id: " + clientId)
    return encodeMessage(Codes.ID_CREATION, clientId);
  } else {
    return encodeMessage(Codes.ERROR, 'Invalid password');
  }
}

