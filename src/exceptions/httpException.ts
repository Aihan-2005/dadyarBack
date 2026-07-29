export class HttpExceptoin extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code :
    string = "HTTP_ERRPR",
    public readonly details?:
    unknown,
  ) {
    super(message);

    this.name = 
    'HttpExceptoin';

    Object.setPrototypeOf(
      this,
      HttpExceptoin.prototype,
    );    
  }
}