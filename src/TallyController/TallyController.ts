import { PanasonicRpController } from './../PanasonicRpController/PansonicRpController';
import { VideoSwitcher } from './../VideoSwitcher/VideoSwitcher';
import { TallyLight } from './../TallyLight/TallyLight';
import { MultiViewTally } from '../MultiViewTally/MultiViewTally';
import { TallyWebsocketServer } from './../TallyWebsocketServer/TallyWebsocketServer';

export class TallyController {
  private tallyWebsocketServer = new TallyWebsocketServer({
    port: 3000,
  });

  private panasonicRpController = new PanasonicRpController({
    host: '172.17.121.13',
    port: 3001,
    websocketAuthToken: 'sDJZn16TuP7zu82a',
  });

  private videoSwitcher = new VideoSwitcher({
    host: '172.17.121.61',
  });

  private remoteOperatorTallyLight1 = new TallyLight({
    name: 'Remote Operator Tally Light 1',
    identifier: '3fbb2e26',
    type: 'blink',
  });

  private multiViewTally1 = new MultiViewTally({
    name: 'Remote MultiView 1',
    ip: '172.17.121.64',
    type: 'blackmagicSdiTallyRestApi',
  });

  private mobileCameraTallyLight1 = new TallyLight({
    name: 'Mobile Camera Tally Light 1',
    identifier: 'mobil',
    type: 'websocket',
    websocketServer: this.tallyWebsocketServer,
  });

  constructor() {
    console.log('Start Tally Controller');
    this.panasonicRpController.remoteTallyStateChange$.subscribe(() => {
      this.handleRemoteTallyStateChange();
    });

    this.videoSwitcher.programChanged$.subscribe((state) => {
      this.tallyProgramChange();
    });

    this.videoSwitcher.previewChanged$.subscribe((state) => {
      this.tallyPreviewChange();
    });

    this.videoSwitcher.inTransitionChanged$.subscribe((state) => {
      this.tallyInTransitionChange();
    });
  }

  private handleRemoteTallyStateChange() {
    // console.log('handleRemoteTallyStateChange:');
    // console.log({
    //   remoteSelectedCamera: this.panasonicRpController.selectedCamera,
    //   inputPreviewState: this.videoSwitcher.inputPreviewState,
    //   inputProgramState: this.videoSwitcher.inputProgramState,
    //   inTransition: this.videoSwitcher.inTransition,
    // });

    // handle Remote Tally
    if (
      this.panasonicRpController.selectedCamera ===
      this.videoSwitcher.inputProgramState
    ) {
      if (this.videoSwitcher.inTransition) {
        this.remoteOperatorTallyLight1.setInTransitionTally();
      } else {
        if (this.panasonicRpController.wasChanged) {
          this.remoteOperatorTallyLight1.setProgramTallyWithAttention();
        } else {
          this.remoteOperatorTallyLight1.setProgramTally();
        }
      }
    } else if (
      this.panasonicRpController.selectedCamera ===
      this.videoSwitcher.inputPreviewState
    ) {
      if (this.videoSwitcher.inTransition) {
        this.remoteOperatorTallyLight1.setInTransitionTally();
      } else {
        this.remoteOperatorTallyLight1.setPreviewTally();
      }
    } else {
      this.remoteOperatorTallyLight1.setTallyOff();
    }
    this.panasonicRpController.wasChanged = false;
  }

  private handleWebsocketsStateChanged() {
    const websocketCameraNumber = 7;
    // console.log('handleWebsocketsStateChanged:');
    // console.log({
    //   inputPreviewState: this.videoSwitcher.inputPreviewState,
    //   inputProgramState: this.videoSwitcher.inputProgramState,
    //   inTransition: this.videoSwitcher.inTransition,
    // });

    // handle Remote Tally
    if (websocketCameraNumber === this.videoSwitcher.inputProgramState) {
      if (this.videoSwitcher.inTransition) {
        this.mobileCameraTallyLight1.setInTransitionTally();
      } else {
        this.mobileCameraTallyLight1.setProgramTally();
      }
    } else if (websocketCameraNumber === this.videoSwitcher.inputPreviewState) {
      if (this.videoSwitcher.inTransition) {
        this.mobileCameraTallyLight1.setInTransitionTally();
      } else {
        this.mobileCameraTallyLight1.setPreviewTally();
      }
    } else {
      this.mobileCameraTallyLight1.setTallyOff();
    }
  }

  private handleTallyChangeForMultiview() {
    const multiviewMapping = [];
    multiviewMapping[1] = 1;
    multiviewMapping[2] = 3;
    multiviewMapping[3] = 2;
    multiviewMapping[4] = 4;

    console.log({
      last: this.videoSwitcher.lastInputProgramState,
      current: this.videoSwitcher.inputProgramState,
    });

    this.multiViewTally1.sendTallyCommandToArduino(
      multiviewMapping[this.videoSwitcher.inputProgramState],
      true,
      false
    );

    this.multiViewTally1.sendTallyCommandToArduino(
      multiviewMapping[this.videoSwitcher.lastInputProgramState],
      false,
      false
    );
  }

  public tallyPreviewChange() {
    console.log('tallyPreviewChange');

    this.handleRemoteTallyStateChange();
    this.handleWebsocketsStateChanged();
    this.handleTallyChangeForMultiview();
  }
  public tallyProgramChange() {
    console.log('tallyProgramChange');

    this.handleRemoteTallyStateChange();
    this.handleWebsocketsStateChanged();
    this.handleTallyChangeForMultiview();
  }

  public tallyInTransitionChange() {
    console.log('tallyInTransitionChange:' + this.videoSwitcher.inTransition);
    this.handleRemoteTallyStateChange();
    this.handleWebsocketsStateChanged();
    this.handleTallyChangeForMultiview();
  }
}
