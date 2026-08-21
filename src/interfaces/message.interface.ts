export interface MessageProvider {
  isAvailable(): boolean;

  send(destination: string, message: string): Promise<void>;
}
