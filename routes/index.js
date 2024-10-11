import express from 'express';
import electionRoutes from './electionRoutes.js';

const router = express.Router();

router.get('/', (req, res) => {
	res.send(router.stack);
});

router.use('/election', electionRoutes);


export default router;