import axios, { AxiosRequestConfig } from 'axios';

export default class CanonXCController {
    private config: CanonXCConfig;
    private baseUrl: string;
    constructor(config: CanonXCConfig) {
        this.config = config;
        this.baseUrl = 'http://' + this.config.ipAdress + '/-wvhttp-01-/';
    }

    public setPreviewTally() {
        this.setTally('on', 'preview');
    }

    public setProgramTally() {
        this.setTally('on', 'program');
    }

    public setTallyOff() {
        this.setTally('off');
    }

    public setInTransitionTally() {
        // not yet implemented so fallback to normal tally
        // manual says when preview & program are at the same time.
        // The Tally color will be amber. But XC protocol cant set these commands
        this.setProgramTally();
    }

    private setTally(status: 'on' | 'off', mode?: 'preview' | 'program') {
        const tallyOptions: {
            'f.tally': string;
            'f.tally.mode'?: string;
        } = {
            'f.tally': status,
        }

        if (mode) tallyOptions['f.tally.mode'] = mode;
        this.sendSessionlessCommand('control.cgi', tallyOptions);
    }

    private sendSessionlessCommand(command: string, params: object) {
        axios.get(this.baseUrl + command + '?', { params }).catch((reason) => {
            console.log(this.config.name + '(' + this.config.ipAdress + ') is not reachable');
        });
    }
}

export interface CanonXCConfig {
    name: string,
    ipAdress: string,
    username: string,
    password: string,
}