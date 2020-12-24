interface MultiViewTallyConfig {
  name: string;
  type: 'blackmagicSdiTallyRestApi';
  ip: string;
}
export class MultiViewTally {
  private config: MultiViewTallyConfig;
  private axios = require('axios').default;

  constructor(initialConfig: MultiViewTallyConfig) {
    this.config = initialConfig;
  }

  /**
   * General public Tally methods
   */

   public sendTallyCommandToArduino(camera: number, program: boolean, preview: boolean): void {
     if (camera >= 1 && camera <= 4) {
       const programFlag: 1 | 0 = program ? 1 : 0;
       const previewFlag: 1 | 0 = preview ? 1 : 0;

       this.axios.get('http://' + this.config.ip + '/tally?cam=' + camera + '&pgm=' + programFlag + '&pvw=' + previewFlag)
        .then((response: any) => {
          // handle success
          console.log(response);
        })
        .catch((error: any) => {
          // handle error
          console.log(error);
        });
     }
   }

}
