// import express = require('express');
// import * as http from "http";
import ioClient = require('socket.io-client');
import * as rxjs from 'rxjs';

interface PanasonicRpControllerConfig {
  host: string | undefined;
  port: number | undefined;
  websocketAuthToken: string | undefined;
};

export class PanasonicRpController {

  public lastSelectedCamera = 0;
  public selectedCamera = 0;
  public wasChanged = false;
  public remoteTallyStateChange$ = new rxjs.Subject();
  // public httpServer = http.createServer(express());

  public config: PanasonicRpControllerConfig;

  constructor(initialValues?: PanasonicRpControllerConfig) {
    this.config = {
      host: initialValues?.host ? initialValues.host : '127.0.0.1',
      port: initialValues?.port ? initialValues.port : 3000,
      websocketAuthToken: initialValues?.websocketAuthToken ? initialValues.websocketAuthToken : 'sDJZn16TuP7zu82a'
    }

    this.lastSelectedCamera = 0;
    this.selectedCamera = 0;

    // socket.io
    const client = ioClient.connect(
      "http://" + this.config.host + ":" + this.config.port,{
        query: "authentication=" + this.config.websocketAuthToken,
      }
    );

    // on connection
    client.on("connect",() => {
      console.log(
        "Successfully connected to Panasonic Remote Panel Controller http://" +
          this.config.host +":" + this.config.port);
    });

    // on disconnect
    client.on("disconnect", () => {
      console.log(
        "Lost connection to Panasonic Remote Panel Controller http://" +
          this.config.host +
          ":" +
          this.config.port
      );
    });

    // recieve content from server
    client.on("selectedCamera", (data: number) => {
      this.selectedCameraChanged(data);
    });
  }

  public selectedCameraChanged(selectedCamera: number) {
    this.lastSelectedCamera = this.selectedCamera;
    this.selectedCamera = selectedCamera
    console.log('Panasonic Remote Panel - Selected Camera: ' +  selectedCamera);
    this.wasChanged = true;
    this.remoteTallyStateChange$.next();
  }
}
