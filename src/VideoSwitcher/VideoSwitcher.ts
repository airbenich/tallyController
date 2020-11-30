/**
 * Connect to Blackmagic ATEM Switcher and react on tally state change
 */

import { Atem } from 'atem-connection';
import { Subject } from 'rxjs';

interface VideoSwitcherConfig {
    host: string;
};

export class VideoSwitcher {
    private myAtem: Atem = new Atem();

    public inputProgramState = 0;
    public lastInputProgramState = 0;
    public inputPreviewState = 0;
    public lastInputPreviewState = 0;
    public inTransition = false;
    public lastInTransition = false;
    private config: VideoSwitcherConfig;

    public programChanged$ = new Subject();
    public previewChanged$ = new Subject();
    public inTransitionChanged$ = new Subject();

    constructor(initialConfig: VideoSwitcherConfig) {
        this.config = initialConfig;
        this.myAtem.on('error', console.error);
        this.myAtem.connect(this.config.host);

        this.myAtem.on('connected', () => {
            console.log('Connected to Video Switcher on ' + this.config.host);
            // myAtem.changeProgramInput(3).then(() => {
            // 	// Fired once the atem has acknowledged the command
            // 	// Note: the state likely hasnt updated yet, but will follow shortly
            // 	console.log('Program input set')
            // })
            // console.log(myAtem.state)
        });

        this.myAtem.on('stateChanged', (state, pathToChange) => {
            if(state.video.ME['0']) {
                if(this.lastInputProgramState !== state.video.ME['0'].programInput) {
                    this.lastInputProgramState = this.inputProgramState;
                    this.inputProgramState = state.video.ME['0'].programInput;
                    this.programChanged$.next(this.inputProgramState);
                }
                if(this.lastInputPreviewState !== state.video.ME['0'].previewInput) {
                    this.lastInputPreviewState = this.inputPreviewState;
                    this.inputPreviewState = state.video.ME['0'].previewInput;
                    this.previewChanged$.next(this.inputPreviewState);
                }
                if(this.lastInTransition !== state.video.ME['0'].inTransition) {
                    console.log('tallyInTransitionChange:' + state);
                    this.lastInTransition = this.inTransition;
                    this.inTransition = state.video.ME['0'].inTransition;
                    this.inTransitionChanged$.next(this.inTransition);
                }
            }
        });
    }
}