/**
 * Websocket Server for Websocket Tally
 */
import express, { Request, Response } from 'express';
import ioserver, { Socket } from 'socket.io';
import ioclient from 'socket.io-client';


interface TallyWebsocketServerConfig {
  port: number;
}

interface TallyWebsocketServerCommandValue {
  command: 'tally/program' | 'tally/preview' | 'tally/transition' | 'tally/off';
  camera: string;
}

export class TallyWebsocketServer {
  private app: any;
  private server: any;
  private port = 3000;
  private io: any;

  private config: TallyWebsocketServerConfig;
  private websocketClients: any[] = [];
  private websocketServer: any;

  constructor(initialConfig: TallyWebsocketServerConfig) {
    this.app = express();
    this.server = require('http').Server(this.app);
    this.server.listen(this.port, () => console.log(`Tally Websocket Server listening on port: ${this.port}!`));
    this.websocketServer = ioserver(this.server);
    this.config = initialConfig;


    // Authentication
    this.websocketServer.use((socket: any, next: any) => {
      console.log("Query: ", socket.handshake.query);
      // return the result of next() to accept the connection.
      if (socket.handshake.query.authentication === 'sDJZn16TuP7zu82a') {
        return next();
      }
      // call next() with an Error if you need to reject the connection.
      next(new Error('Authentication error'));
    });

    // on conncection
    this.websocketServer.on('connection', (socket: any) => {
      console.log('Websocket Tally client connected');

      // add client to clientlist
      this.websocketClients.push(socket);

      // return 'connected'
      socket.emit('connetion', true);

      socket.on('disconnect', () => {
        console.log('Websocket Tally client disconnected');
      });
    });
  }

  public sendCommandToAllWebsocketClients(
    key: string,
    value: TallyWebsocketServerCommandValue
  ) {
    this.websocketClients.forEach((websocketClient) => {
      websocketClient.emit(key, value);
    });
  }
}
