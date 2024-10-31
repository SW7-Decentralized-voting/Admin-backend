import express from 'express';
import electionRoutes from './electionRoutes.js';
import candidateRoutes from './candidateRoutes.js';
import partyRoutes from './partyRoutes.js';
import nominationDistrictRoutes from './nominationDistrictRoutes.js';
import constituencyRoutes from './constituencyRoutes.js';
import pollingStationRoutes from './pollingStationRoutes.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerComponents from '../APIDocs/swaggerComponents.js';

const PORT = process.env.PORT || 8888;

const swaggerDefinition = {
  openapi: '3.0.0',
	servers: [
		{
			url: `http://localhost:${PORT}/api/v1`,
			description: 'Local development server',
		}
	],
  info: {
    title: 'Express API for JSONPlaceholder',
    version: '1.0.0',
  },
  tags: [
    {
      name: 'Candidates',
      description: 'API for candidates in the system',
    },
  ],
  apis: ['./routes/*.js', './schemas/*.js'],
  components: {
		...swaggerComponents,
		securitySchemes: {
			Authorization: {
				type: 'apiKey',
				name: 'Authorization',
				in: 'header',
			},
		},
	},
	security: {
		Authorization: [],
	},
};

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

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
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


export default router;