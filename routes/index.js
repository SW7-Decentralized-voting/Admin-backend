import express from 'express';
import electionRoutes from './electionRoutes.js';
import candidateRoutes from './candidateRoutes.js';

const router = express.Router();

router.get('/', (req, res) => {
	res.send(router.stack);
});

router.use('/election', electionRoutes);
router.use('/candidates', candidateRoutes);


export default router;