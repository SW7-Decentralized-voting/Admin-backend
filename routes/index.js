import express from 'express';
import electionRoutes from './electionRoutes.js';
import candidateRoutes from './candidateRoutes.js';
import partyRoutes from './partyRoutes.js';
import nominationDistrictRoutes from './nominationDistrictRoutes.js';

const router = express.Router();

router.get('/', (req, res) => {
	res.send(router.stack);
});

router.use('/election', electionRoutes);
router.use('/candidates', candidateRoutes);
router.use('/parties', partyRoutes);
router.use('/nominationDistricts', nominationDistrictRoutes);


export default router;