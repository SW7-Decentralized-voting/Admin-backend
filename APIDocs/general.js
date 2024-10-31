const responses = {
	401: {
		description: '**Unauthorized** \n\n No token provided or invalid token',
		content: {
			'application/json': {
				schema: {
					type: 'object',
					properties: {
						message: {
							type: 'string'
						}
					},
				},
				examples: {
					NoToken: {
						summary: 'No token provided',
						value: {
							message: 'No token provided'
						}
					},
					InvalidToken: {
						summary: 'Invalid token',
						value: {
							message: 'Failed to authenticate token'
						}
					}
				}
			}
		}
	}
};

export { responses };