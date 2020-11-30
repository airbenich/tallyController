import { TallyController } from './TallyController/TallyController';
import { LowerThirdTallyController } from './LowerThirdTallyController/LowerThirdTallyController';

const tallyController = new TallyController();
const lowerThirdTallyController = new LowerThirdTallyController({
    host: '172.17.121.14',
    port: 3000
});