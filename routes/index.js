import express from 'express';
import electionRoutes from './electionRoutes.js';
import candidateRoutes from './candidateRoutes.js';
import partyRoutes from './partyRoutes.js';
import nominationDistrictRoutes from './nominationDistrictRoutes.js';
import constituencyRoutes from './constituencyRoutes.js';
import pollingStationRoutes from './pollingStationRoutes.js';
import keyRoutes from './keyRoutes.js';

const router = express.Router();

router.get('/', (req, res) => {
	res.send(router.stack);
});

router.use('/election', electionRoutes);
router.use('/candidates', candidateRoutes);
router.use('/parties', partyRoutes);
router.use('/nominationDistricts', nominationDistrictRoutes);
router.use('/constituencies', constituencyRoutes);
router.use('/pollingStations', pollingStationRoutes);
router.use('/keys', keyRoutes);


export default router;