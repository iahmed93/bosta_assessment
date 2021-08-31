export class HttpError extends Error {
  constructor(public code: number, msg: string) {
    super(msg);
  }
}
