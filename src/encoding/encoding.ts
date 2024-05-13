export function encodeMessage(type: number, payload: string = '', ids: string[] = []): Buffer {

  let dataString = '';

  if (ids.length > 0) {
    dataString = ids.join(',');
  } else {
    dataString = payload;
  }

  const dataBuffer = Buffer.from(dataString);
  const buffer = Buffer.alloc(1 + dataBuffer.length);

  buffer.writeUInt8(type, 0);
  dataBuffer.copy(buffer, 1);

  return buffer;
}


export function decodeMessage(buffer: Buffer): { type: number; payload: string } {

  const type = buffer.readUInt8(0);
  const payload = buffer.toString('utf8', 1);

  return { type, payload };
}
