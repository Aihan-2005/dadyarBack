export class HttpException extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string = "HTTP_ERRPR",
    public readonly details?: unknown,
  ) {
    super(message);

    this.name = "HttpException";

    Object.setPrototypeOf(this, HttpException.prototype);
  }
}
