export class Request {
  type: number;
  payload: any;

  constructor(type: number, payload: any) {
    this.type = type;
    this.payload = payload;
  }
}
