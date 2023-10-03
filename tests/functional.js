import { suite, test } from 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';

import server from '../server.js';
import { puzzlesAndSolutions } from '../constants/solutions.js';

chai.use(chaiHttp);
const { assert } = chai;

suite('Functional Tests', () => {
	test('POST /api/solve with valid puzzle string', async () => {
		const [puzzle, solution] = puzzlesAndSolutions[0];
		const requestPayload = {
			puzzle,
		};
		const expectedResponsePayload = {
			solution,
		};

		const response = await chai
			.request(server)
			.post('/api/solve')
			.set('content-type', 'application/json')
			.send(requestPayload);

		assert.equal(response.status, 200);
		assert.deepStrictEqual(response.body, expectedResponsePayload);
	});

	test('POST /api/solve with missing puzzle string', async () => {
		const requestPayload = {};
		const expectedResponsePayload = {
			error: 'Required field missing',
		};

		const response = await chai
			.request(server)
			.post('/api/solve')
			.set('content-type', 'application/json')
			.send(requestPayload);

		assert.equal(response.status, 422);
		assert.deepStrictEqual(response.body, expectedResponsePayload);
	});

	test('POST /api/solve with invalid characters', async () => {
		const requestPayload = {
			puzzle: puzzlesAndSolutions[0][0].replace(/[.]/g, '#'),
		};
		const expectedResponsePayload = {
			error: 'Invalid characters in puzzle',
		};

		const response = await chai
			.request(server)
			.post('/api/solve')
			.set('content-type', 'application/json')
			.send(requestPayload);

		assert.equal(response.status, 422);
		assert.deepStrictEqual(response.body, expectedResponsePayload);
	});

	test('POST /api/solve with incorrect length', async () => {
		const requestPayload = {
			puzzle: `${puzzlesAndSolutions[0]}.`,
		};
		const expectedResponsePayload = {
			error: 'Expected puzzle to be 81 characters long',
		};

		const response = await chai
			.request(server)
			.post('/api/solve')
			.set('content-type', 'application/json')
			.send(requestPayload);

		assert.equal(response.status, 422);
		assert.deepStrictEqual(response.body, expectedResponsePayload);
	});

	test('POST /api/solve with an unsolvable puzzle string', async () => {
		const requestPayload = {
			puzzle: '5168497323.76.5...8.97...65135.6.9.7472591..696837..5.253186.746842.75..791.5.6.8',
		};
		const expectedResponsePayload = {
			error: 'Puzzle cannot be solved',
		};

		const response = await chai
			.request(server)
			.post('/api/solve')
			.set('content-type', 'application/json')
			.send(requestPayload);

		assert.equal(response.status, 422);
		assert.deepStrictEqual(response.body, expectedResponsePayload);
	});

	test('POST /api/check with all placement', async () => {
		const requestPayload = {
			coordinate: 'A2',
			puzzle: puzzlesAndSolutions[0][0],
			value: '3',
		};
		const expectedResponsePayload = {
			valid: true,
		};

		const response = await chai
			.request(server)
			.post('/api/check')
			.set('content-type', 'application/json')
			.send(requestPayload);

		assert.equal(response.status, 200);
		assert.deepStrictEqual(response.body, expectedResponsePayload);
	});

	test('POST /api/check with single placement conflict', async () => {
		const requestPayload = {
			coordinate: 'A2',
			puzzle: puzzlesAndSolutions[0][0],
			value: '8',
		};
		const expectedResponsePayload = {
			valid: false,
			conflict: ['row'],
		};

		const response = await chai
			.request(server)
			.post('/api/check')
			.set('content-type', 'application/json')
			.send(requestPayload);

		assert.equal(response.status, 422);
		assert.deepStrictEqual(response.body, expectedResponsePayload);
	});

	test('POST /api/check with multiple placement conflict', async () => {
		const requestPayload = {
			coordinate: 'A2',
			puzzle: puzzlesAndSolutions[0][0],
			value: '1',
		};
		const expectedResponsePayload = {
			valid: false,
			conflict: ['row', 'region'],
		};

		const response = await chai
			.request(server)
			.post('/api/check')
			.set('content-type', 'application/json')
			.send(requestPayload);

		assert.equal(response.status, 422);
		assert.deepStrictEqual(response.body, expectedResponsePayload);
	});

	test('POST /api/check with all placement conflict', async () => {
		const requestPayload = {
			coordinate: 'A2',
			puzzle: puzzlesAndSolutions[0][0],
			value: '2',
		};
		const expectedResponsePayload = {
			valid: false,
			conflict: ['row', 'column', 'region'],
		};

		const response = await chai
			.request(server)
			.post('/api/check')
			.set('content-type', 'application/json')
			.send(requestPayload);

		assert.equal(response.status, 422);
		assert.deepStrictEqual(response.body, expectedResponsePayload);
	});

	test('POST /api/check with missing required fields', async () => {
		const requestPayload1 = {
			puzzle: puzzlesAndSolutions[0][0],
			value: '2',
		};
		const expectedResponsePayload = {
			error: 'Required field(s) missing',
		};

		const response1 = await chai
			.request(server)
			.post('/api/check')
			.set('content-type', 'application/json')
			.send(requestPayload1);

		assert.equal(response1.status, 422);
		assert.deepStrictEqual(response1.body, expectedResponsePayload);

		const requestPayload2 = {
			coordinate: 'A2',
			value: '2',
		};

		const response2 = await chai
			.request(server)
			.post('/api/check')
			.set('content-type', 'application/json')
			.send(requestPayload2);

		assert.equal(response2.status, 422);
		assert.deepStrictEqual(response2.body, expectedResponsePayload);

		const requestPayload3 = {
			coordinate: 'A2',
			puzzle: puzzlesAndSolutions[0][0],
		};

		const response3 = await chai
			.request(server)
			.post('/api/check')
			.set('content-type', 'application/json')
			.send(requestPayload3);

		assert.equal(response3.status, 422);
		assert.deepStrictEqual(response3.body, expectedResponsePayload);
	});

	test('POST /api/check with invalid characters', async () => {
		const requestPayload = {
			coordinate: 'A2',
			puzzle: puzzlesAndSolutions[0][0].replace(/[.]/g, '#'),
			value: '2',
		};
		const expectedResponsePayload = {
			error: 'Invalid characters in puzzle',
		};

		const response = await chai
			.request(server)
			.post('/api/check')
			.set('content-type', 'application/json')
			.send(requestPayload);

		assert.equal(response.status, 422);
		assert.deepStrictEqual(response.body, expectedResponsePayload);
	});

	test('POST /api/check with incorrect length', async () => {
		const requestPayload = {
			coordinate: 'A2',
			puzzle: `${puzzlesAndSolutions[0][0]}.`,
			value: '2',
		};
		const expectedResponsePayload = {
			error: 'Expected puzzle to be 81 characters long',
		};

		const response = await chai
			.request(server)
			.post('/api/check')
			.set('content-type', 'application/json')
			.send(requestPayload);

		assert.equal(response.status, 422);
		assert.deepStrictEqual(response.body, expectedResponsePayload);
	});

	test('POST /api/check with invalid placement coordinate', async () => {
		const requestPayload = {
			coordinate: 'J2',
			puzzle: puzzlesAndSolutions[0][0],
			value: '2',
		};
		const expectedResponsePayload = {
			error: 'Invalid coordinate',
		};

		const response = await chai
			.request(server)
			.post('/api/check')
			.set('content-type', 'application/json')
			.send(requestPayload);

		assert.equal(response.status, 422);
		assert.deepStrictEqual(response.body, expectedResponsePayload);
	});

	test('POST /api/check with invalid placement value', async () => {
		const requestPayload = {
			coordinate: 'A2',
			puzzle: puzzlesAndSolutions[0][0],
			value: 'A',
		};
		const expectedResponsePayload = {
			error: 'Invalid value',
		};

		const response = await chai
			.request(server)
			.post('/api/check')
			.set('content-type', 'application/json')
			.send(requestPayload);

		assert.equal(response.status, 422);
		assert.deepStrictEqual(response.body, expectedResponsePayload);
	});
});
