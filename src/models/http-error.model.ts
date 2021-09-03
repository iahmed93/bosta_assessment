export class HttpError {
  constructor(public code: number, public msg: string, public error?: Error) {}
}
