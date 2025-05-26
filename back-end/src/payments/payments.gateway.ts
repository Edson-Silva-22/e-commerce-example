import { Logger } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
  namespace: 'payments',
  cors: {
    origin: "*"
  }
})
export class PaymentsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger('PaymentsGateway')

  @WebSocketServer() server: Server

  afterInit() {
    this.logger.log('PaymentsGateway initialized')
  }

  handleConnection() {
    this.logger.log('PaymentsGateway connection established')
  }

  handleDisconnect() {
    this.logger.log('PaymentsGateway connection closed')
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: string) {
    //O usuário entra em uma sala criada com o nome do seu proprio id
    client.join(room);
    console.log('usuário entrou na sala ' + room)
  }

  // Evento que o servidor dispara para notificar os clientes sobre um pagamento
  // O evento é emitido para um cliente específico, e o cliente pode ser identificado pelo seu id
  notifyPayment(data: any) {
    this.server.emit('notifyPayment', data);
  }
}