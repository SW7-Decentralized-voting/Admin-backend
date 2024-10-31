const Candidate = {
	type: 'object',
	properties: {
		_id: {
			type: 'string',
			description: 'The candidate\'s ID',
			example: '5f9f4b9c8b3d2b0017f7f2b8'
		},
		name: {
			type: 'string',
			description: 'The candidate\'s name',
			example: 'John Doe'
		},
		party: {
			type: 'string',
			description: 'The candidate\'s party',
			example: '5f9f4b9c8b3d2b0017f7f2b8'
		},
		nominationDistrict: {
			type: 'string',
			description: 'The candidate\'s nomination district',
			example: '5f9f4b9c8b3d2b0017f7f2b8'
		},
		createdAt: {
			type: 'string',
			description: 'The date the candidate was created',
			example: '2020-11-01T12:00:00.000Z'
		},
		updatedAt: {
			type: 'string',
			description: 'The date the candidate was last updated',
			example: '2020-11-01T12:00:00.000Z'
		}
	}
};

export { Candidate };