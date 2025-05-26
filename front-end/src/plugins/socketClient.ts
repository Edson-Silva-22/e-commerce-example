import { io, Socket} from "socket.io-client";

class SocketClient {
  private socket: Socket | null = null;

  connect(namespace: string): void {
    this.socket = io(`http://localhost:3000/${namespace}`);
  }
  
  subscribeEvent(eventName: string, callback: (data: any) => void) {
    this.socket?.on(eventName, callback);
  }

  unsubscribeEvent(eventName: string): void {
    this.socket?.off(eventName);
  }

  unsubscribeAllEvents(): void {
    this.socket?.removeAllListeners();
  }
  
  emitEvent(eventName: string, data?: any): void {
    this.socket?.emit(eventName, data);
  }

  disconnect(): void {
    this.socket?.disconnect();
  }
}

export default new SocketClient();