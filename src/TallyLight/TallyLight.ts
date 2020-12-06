import Blink1 = require('node-blink1');
import { TallyWebsocketServer } from '../TallyWebsocketServer/TallyWebsocketServer';
// import { Blink1 } from 'node-blink1';

interface TallyLightConfig {
  name: string;
  type: 'blink' | 'websocket';
  identifier: string;
  websocketServer?: TallyWebsocketServer;
}
export class TallyLight {
  private config: TallyLightConfig;
  private blinkInstance: Blink1 | undefined = undefined;
  private animationIntervals: any[] = [];

  constructor(initialConfig: TallyLightConfig) {
    this.config = initialConfig;

    if (this.config.type === 'blink') {
      this.initBlink1();
    } else if (this.config.type === 'websocket') {
      this.initWebsocketTally();
    }
  }

  /**
   * General public Tally methods
   */
  public setProgramTally() {
    if (this.config.type === 'blink') {
      this.setBlinkProgramTally();
    } else if (this.config.type === 'websocket') {
      this.setWebsocketProgramTally();
    }
  }

  public setProgramTallyWithAttention() {
    if (this.config.type === 'blink') {
      this.setBlinkProgramTallyWithAttention();
    } else if (this.config.type === 'websocket') {
      this.setWebsocketProgramTallyWithAttention();
    }
  }

  public setPreviewTally() {
    if (this.config.type === 'blink') {
      this.setBlinkPreviewTally();
    } else if (this.config.type === 'websocket') {
      this.setWebsocketPreviewTally();
    }
  }

  public setInTransitionTally() {
    if (this.config.type === 'blink') {
      this.setBlinkInTransitionTally();
    } else if (this.config.type === 'websocket') {
      this.setWebsocketInTransitionTally();
    }
  }

  public setTallyOff() {
    if (this.config.type === 'blink') {
      this.setBlinkTallyOff();
    } else if (this.config.type === 'websocket') {
      this.setWebsocketTallyOff();
    }
  }

  public setAlarm() {
    if (this.config.type === 'blink') {
      this.setBlinkAlarm();
    } else if (this.config.type === 'websocket') {
      console.log('Not yet implemented');
    }
  }

  /**
   * Blink Tally
   */

  private initBlink1() {
    let blinkDevices: any;
    try {
      blinkDevices = Blink1.devices();
    } catch {
      console.log('No Blink1 devices found.');

      return;
    }

    if (!blinkDevices.includes(this.config.identifier)) {
      console.log(
        'Device not found: Blink1 (SN:' + this.config.identifier + ')'
      );
      return;
    }
    try {
      this.blinkInstance = new Blink1(this.config.identifier);
    } catch {
      console.log(
        'Initialization of Blink1 (SN:' + this.config.identifier + ') failed.'
      );
    }
    if (!this.blinkInstance) {
      console.log(
        'Initialization of Blink1 (SN:' + this.config.identifier + ') failed.'
      );
      return;
    } else {
      console.log(
        'Initialization of Blink1 (SN:' +
          this.config.identifier +
          ') successfull.'
      );
    }
  }

  private setBlinkProgramTally() {
    this.blinkInstance.fadeToRGB(100, 255, 0, 0, 0);
  }

  private setBlinkProgramTallyWithAttention() {
    const onTime = 50;
    const offTime = 50;
    const blinkTimes = 2;

    // switchOns
    for (let i = 0; i < blinkTimes + 1; i++) {
      setTimeout(() => {
        this.blinkInstance.fadeToRGB(0, 255, 0, 0, 1);
        this.blinkInstance.fadeToRGB(0, 0, 0, 0, 2);
      }, (onTime + offTime) * i);
    }

    // switch Offs
    for (let i = 0; i < blinkTimes; i++) {
      setTimeout(() => {
        this.blinkInstance.fadeToRGB(0, 0, 0, 0, 1);
        this.blinkInstance.fadeToRGB(0, 255, 0, 0, 2);
      }, offTime + i * (onTime + offTime));
    }
  }

  private setBlinkPreviewTally() {
    this.blinkInstance.fadeToRGB(100, 0, 200, 0, 0);
  }

  private setBlinkInTransitionTally() {
    this.blinkInstance.fadeToRGB(100, 255, 0, 0, 1);
    this.blinkInstance.fadeToRGB(100, 0, 0, 255, 2);
  }

  private setBlinkTallyOff() {
    this.animationIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.blinkInstance.off();
  }

  private setBlinkAlarm() {
    const onTime = 100;
    const offTime = 100;
    const duration = onTime + offTime;
    this.animationIntervals.push(
      setInterval(() => {
        this.blinkInstance.fadeToRGB(50, 255, 200, 0, 0);
      }, duration)
    );
    setTimeout(() => {
      this.animationIntervals.push(
        setInterval(() => {
          this.blinkInstance.fadeToRGB(50, 200, 150, 0, 0);
        }, duration)
      );
    }, onTime);
  }

  /**
   * Websocket Tally
   */

  private initWebsocketTally() {
    //  console.log('To be done.');
  }

  private setWebsocketProgramTally() {
    this.config.websocketServer?.sendCommandToAllWebsocketClients(
      'websocketTally',
      {
        command: 'tally/program',
        camera: this.config.identifier,
      }
    );
  }

  private setWebsocketProgramTallyWithAttention() {
    console.log('To be done.');
  }

  private setWebsocketPreviewTally() {
    this.config.websocketServer?.sendCommandToAllWebsocketClients(
      'websocketTally',
      {
        command: 'tally/preview',
        camera: this.config.identifier,
      }
    );
  }

  private setWebsocketInTransitionTally() {
    this.config.websocketServer?.sendCommandToAllWebsocketClients(
      'websocketTally',
      {
        command: 'tally/transition',
        camera: this.config.identifier,
      }
    );
  }

  private setWebsocketTallyOff() {
    this.config.websocketServer?.sendCommandToAllWebsocketClients(
      'websocketTally',
      {
        command: 'tally/off',
        camera: this.config.identifier,
      }
    );
  }
}

// this.config.websocketServer?.sendCommandToAllWebsocketClients('websocketTally', {
//   command: 'tally/transition',
//   camera: this.config.identifier,
// });
