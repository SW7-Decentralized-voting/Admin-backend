import Candidate from '../../schemas/Candidate.js';

const params = {
	get: {
		_id: {
			in: 'query',
			name: '_id',
			required: false,
			description: 'ID to filter candidates by\n\n **Example:** `5f9f4b9c8b3d2b0017f7f2b8`',
			schema: {
				type: 'string'
			},
		},
		name: {
			in: 'query',
			name: 'name',
			required: false,
			description: 'Name to filter candidates by\n\n **Example:** `John Doe`',
			schema: {
				type: 'string',
			},
		},
		party: {
			in: 'query',
			name: 'party',
			required: false,
			description: 'Party to filter candidates by\n\n **Example:** `5f9f4b9c8b3d2b0017f7f2b8`',
			schema: {
				type: 'string'
			},
		},
		nominationDistrict: {
			in: 'query',
			name: 'nominationDistrict',
			required: false,
			description: 'Nomination district to filter candidates by\n\n **Example:** `5f9f4b9c8b3d2b0017f7f2b8`',
			schema: {
				type: 'string'
			},
		},
		createdAt: {
			in: 'query',
			name: 'createdAt',
			required: false,
			description: 'Date the candidate was created\n\n **Example:** `2020-11-01T12:00:00.000Z`',
			schema: {
				type: 'string'
			},
		},
		updatedAt: {
			in: 'query',
			name: 'updatedAt',
			required: false,
			description: 'Date the candidate was last updated\n\n **Example:** `2020-11-01T12:00:00.000Z`',
			schema: {
				type: 'string'
			},
		},
	},
	patch: {
		id: {
			in: 'path',
			name: 'id',
			required: true,
			description: 'The ID of the candidate to update\n\n **Example:** `5f9f4b9c8b3d2b0017f7f2b8`',
			schema: {
				type: 'string'
			},
		},
	},
	delete: {
		id: {
			in: 'path',
			name: 'id',
			required: true,
			description: 'The ID of the candidate to delete\n\n **Example:** `5f9f4b9c8b3d2b0017f7f2b8`',
			schema: {
				type: 'string'
			},
		},
	}
};

const reqBody = {
	description: 'The candidate object to add\n\n Must include the candidate\'s name, party, and nomination district',
	required: true,
	content: {
		'application/json': {
			schema: {
				type: 'object',
				properties: {
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
				}
			}
		}
	}
};

const candidateList = [
	{
		_id: '5f9f4b9c8b3d2b0017f7f2b8',
		name: 'John Doe',
		party: '5f9f4b9c8b3d2b0017f7f2b8',
		nominationDistrict: '5f9f4b9c8b3d2b0017f7f2b8',
		createdAt: '2020-11-01T12:00:00.000Z',
		updatedAt: '2020-11-01T12:00:00.000Z',
	},
	{
		_id: '5f9f4b9c8b3d2b0017f7f2b9',
		name: 'Jane Doe',
		party: '5f9f4b9c8b3d2b0017f7f2b8',
		nominationDistrict: '5f9f4b9c8b3d2b0017f7f2b8',
		createdAt: '2020-11-01T12:00:00.000Z',
		updatedAt: '2020-11-01T12:00:00.000Z',
	},
	{
		_id: '5f9f4b9c8b3d2b0017f7f2ba',
		name: 'John Smith',
		party: '5f9f4b9f8b3d2b0017f7f2b8',
		nominationDistrict: '5f9f4b9c8b3d2b0017f7f2b8',
		createdAt: '2020-11-01T12:00:00.000Z',
		updatedAt: '2020-11-01T12:00:00.000Z',
	}
];
const candidateListPopulated = [
	{
		_id: '5f9f4b9c8b3d2b0017f7f2b8',
		name: 'John Doe',
		party: {
			_id: '5f9f4b9c8b3d2b0017f7f2b8',
			name: 'Party 1'
		},
		nominationDistrict: {
			_id: '5f9f4b9c8b3d2b0017f7f2b8',
			name: 'Nomination District 1'
		},
		createdAt: '2020-11-01T12:00:00.000Z',
		updatedAt: '2020-11-01T12:00:00.000Z',
	},
	{
		_id: '5f9f4b9c8b3d2b0017f7f2b9',
		name: 'Jane Doe',
		party: {
			_id: '5f9f4b9c8b3d2b0017f7f2b8',
			name: 'Party 1'
		},
		nominationDistrict: {
			_id: '5f9f4b9c8b3d2b0017f7f2b8',
			name: 'Nomination District 1'
		},
		createdAt: '2020-11-01T12:00:00.000Z',
		updatedAt: '2020-11-01T12:00:00.000Z',
	},
	{
		_id: '5f9f4b9c8b3d2b0017f7f2ba',
		name: 'John Smith',
		party: {
			_id: '5f9f4b9f8b3d2b0017f7f2b8',
			name: 'Party 2'
		},
		nominationDistrict: {
			_id: '5f9f4b9c8b3d2b0017f7f2b8',
			name: 'Nomination District 1'
		},
		createdAt: '2020-11-01T12:00:00.000Z',
		updatedAt: '2020-11-01T12:00:00.000Z',
	}
];

const candidateResponses = {
	200: {
		get: {
			description: '**OK** \n\n Returns a list of candidates',
			content: {
				'application/json': {
					schema: {
						type: 'array',
						items: Candidate,
					},
					examples: {
						Example1: {
							summary: 'List of candidates',
							value: candidateList
						},
						Example2: {
							summary: 'List of candidates with populated party and nomination district',
							value: candidateListPopulated
						}
					}
				}
			}
		},
		patch: {
			description: '**OK** \n\n Returns a success message and the updated candidate',
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							message: {
								type: 'string'
							},
							candidate: Candidate
						},
					},
					example: {
						message: 'Candidate updated successfully',
						candidate: {
							...candidateList[0],
							name: 'John Doe Jr.',
							updatedAt: '2020-11-01T12:00:00.000Z',
							__v: 0
						}
					}
				}
			}
		},
		delete: {
			description: '**OK** \n\n Returns a success message and the deleted candidate',
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							message: {
								type: 'string'
							},
							candidate: Candidate
						},
					},
					example: {
						message: 'Candidate deleted successfully',
						candidate: {
							...candidateList[0],
							__v: 0
						}
					}
				}
			}
		}
	},
	400: {
		get: {
			description: '**Bad request** \n\n Error message is returned when an invalid query parameter or ID is provided',
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							error: {
								type: 'string'
							}
						},
					},
					examples: {
						Example1: {
							summary: 'Invalid id in query',
							value: {
								error: 'Invalid ID: 32189'
							}
						},
						Example2: {
							summary: 'Invalid query parameter',
							value: {
								error: 'Invalid query parameter: invalidParam'
							}
						},
					}
				}
			}
		},
		post: {
			description: '**Bad request** \n\n Error message is returned when a validation error occurs',
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							errors: {
								type: 'array',
								items: {
									type: 'string'
								}
							}
						},
					},
					examples: {
						Example1: {
							summary: 'Validation error (missing fields)',
							value: {
								errors: {
									name: 'name is required',
									party: 'party is required',
								}
							}
						},
						Example2: {
							summary: 'Validation error (invalid fields)',
							value: {
								errors: {
									party: '\'14943\' (type number) is not a valid ObjectId',
									nominationDistrict: '\'12345678901234\' (type string) is not a valid ObjectId',
									name: 'Name must be longer than 2 characters.'
								}
							}
						},
					}
				}
			}
		},
		patch: {
			description: '**Bad request** \n\n Error message is returned when an invalid ID is provided or a validation error occurs',
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							error: {
								type: 'string'
							}
						},
					},
					examples: {
						Example1: {
							summary: 'Invalid id in path',
							value: {
								error: 'Candidate with id \'5f9f4b9c8b3d2b0017f7f2b8\' not found'
							}
						},
						Example2: {
							summary: 'Invalid name in body',
							value: {
								name: "Name must be longer than 2 characters."
							}
						},
						Example3: {
							summary: 'Invalid id in body',
							value: {
								party: "'14943' (type number) is not a valid ObjectId"
							}
						}
					}
				}
			}
		}
	},
	201: {
		description: '**Created** \n\n Returns a success message and the new candidate',
		content: {
			'application/json': {
				schema: {
					type: 'object',
					properties: {
						message: {
							type: 'string'
						},
						candidate: Candidate
					},
				},
				examples: {
					Example1: {
						summary: 'Candidate added successfully',
						value: {
							message: 'Candidate added successfully',
							candidate: {
								...candidateList[0],
								__v: 0
							}
						}
					},
					Example2: {
						summary: 'Candidate added successfully',
						value: {
							message: 'Candidate added successfully',
							candidate: candidateListPopulated[0]
						}
					},
				}
			}
		}
	},
	204: {
		description: '**No Content** \n\n Returns an empty response when the candidate is not found',
		content: {
			'application/json': {
				schema: {
					type: 'object',
				},
			}
		}
	}
};

export { params, candidateList, candidateListPopulated, candidateResponses, reqBody };