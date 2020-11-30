/**
 * Websocket Server for Websocket Tally
 */

import express = require('express');
import * as http from 'http';
import io = require('socket.io');

interface TallyWebsocketServerConfig {
  port: number;
}

interface TallyWebsocketServerCommandValue {
    command: 'tally/program' | 'tally/preview' | 'tally/transition' | 'tally/off';
    camera: string;
}

export class TallyWebsocketServer {
  private config: TallyWebsocketServerConfig;
  private websocketClients: any[] = [];
  private httpServer = http.createServer(http);
  private websocketServer: io.Server;

  constructor(initialConfig: TallyWebsocketServerConfig) {
    this.config = initialConfig;

    this.httpServer.listen(this.config.port, () => {
      console.log('Websockets listening on *:' + this.config.port);
    });

    this.websocketServer = io();

    // Authentication
    this.websocketServer.use((socket, next) => {
      // console.log("Query: ", socket.handshake.query);
      // return the result of next() to accept the connection.
      if (socket.handshake.query.authentication === 'sDJZn16TuP7zu82a') {
        return next();
      }
      // call next() with an Error if you need to reject the connection.
      next(new Error('Authentication error'));
    });

    // on conncection
    this.websocketServer.on('connection', (socket) => {
      console.log('Websocket client connected');

      // add client to clientlist
      this.websocketClients.push(socket);

      // return 'connected'
      socket.emit('connetion', true);

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }

  public sendCommandToAllWebsocketClients(key: string, value: TallyWebsocketServerCommandValue) {
    this.websocketClients.forEach((websocketClient) => {
      websocketClient.emit(key, value);
    });
  }
}
