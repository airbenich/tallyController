import { TallyController } from './TallyController/TallyController';
import { LowerThirdTallyController } from './LowerThirdTallyController/LowerThirdTallyController';

const tallyController = new TallyController();
const lowerThirdTallyController = new LowerThirdTallyController({
    host: '10.1.1.31',
    port: 3000
});