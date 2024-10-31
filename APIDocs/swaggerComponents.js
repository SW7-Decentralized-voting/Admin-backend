import { candidateResponses, params, reqBody } from './Candidates/candidates.js';
import { responses } from './general.js';
import { Candidate } from './schemas.js';

export default {
	schemas: {
		Candidate: Candidate,
	},
	responses: {
		general: responses,
		candidate: candidateResponses,
	},
	reqBody: {
		candidate: reqBody,
	},
	parameters: {
		candidate: params,
	}
};