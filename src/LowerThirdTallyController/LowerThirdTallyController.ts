/*
 * Connect via Websocket to overlay-server
 */
import ioClient = require('socket.io-client');
import { TallyLight } from './../TallyLight/TallyLight';

interface LowerThirdTallyControllerConfig {
  host: string;
  port: number;
}
export class LowerThirdTallyController {
  private config: LowerThirdTallyControllerConfig;
  private client: SocketIOClient.Socket;

  private lowerThirdTally1 = new TallyLight({
    name: 'Lower Third Tally Light 1',
    identifier: '20002C66',
    type: 'blink',
  });
  private lowerThirdTally2 = new TallyLight({
    name: 'Lower Third Tally Light 2',
    identifier: '20003061',
    type: 'blink',
  });

  constructor(initialConfig: LowerThirdTallyControllerConfig) {
    this.config = initialConfig;

    this.client = ioClient.connect(
      'http://' + this.config.host + ':' + this.config.port,
      {
        query: 'authentication=sDJZn16TuP7zu82a',
      }
    );

    // on connection
    this.client.on('connect', () => {
      console.log(
        'Successfully connected to http://' +
          this.config.host +
          ':' +
          this.config.port
      );
    });

    // on disconnect
    this.client.on('disconnect', () => {
      console.log(
        'Lost connection to http://' + this.config.host + ':' + this.config.port
      );
    });

    // recieve content from server
    this.client.on('content', (data: any) => {
      if (data.type === 'lowerThird') {
        if (data.content.action === 'show') {
          this.lowerThirdWarningOn();
        }
        if (data.content.action === 'hide') {
          this.lowerThirdWarningOff();
        }
      }
    });
  }

  public lowerThirdWarningOn() {
    // this.lowerThirdTally1.setPreviewTally();
    this.lowerThirdTally1.setAlarm();
    this.lowerThirdTally2.setAlarm();
  }

  public lowerThirdWarningOff() {
    this.lowerThirdTally1.setTallyOff();
    this.lowerThirdTally2.setTallyOff();
  }
}
