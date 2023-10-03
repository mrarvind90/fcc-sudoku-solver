import { suite, test } from 'mocha';
import chai from 'chai';
import { puzzlesAndSolutions } from '../constants/solutions.js';
import { validation } from '../validations/index.js';
import { validationResult } from 'express-validator';
import { convertToGrid, getPlacementConflicts, solvePuzzle } from '#controllers/sudoku.js';

const { assert } = chai;

suite('Unit Tests', () => {
	test('Handles a valid puzzle string of 81 characters', async () => {
		const req = {
			body: {
				coordinate: 'A2',
				puzzle: puzzlesAndSolutions[0][0],
				value: '3',
			},
		};

		await validation.rules.check.run(req);
		const results = validationResult(req);

		assert.lengthOf(results['errors'], 0, `"${req.body.puzzle}" is a valid puzzle string`);
	});

	test('Handles a puzzle string with invalid characters (not 1-9 or .)', async () => {
		const expectedMessage = 'Invalid characters in puzzle';
		const req = {
			body: {
				coordinate: 'A2',
				puzzle: puzzlesAndSolutions[0][0].replace(/[.]/g, '#'),
				value: '3',
			},
		};

		await validation.rules.check.run(req);
		const results = validationResult(req);

		assert.strictEqual(
			results['errors'][0]['msg'],
			expectedMessage,
			`The puzzle string "${req.body.puzzle}" is not valid and should throw a validation error message "${expectedMessage}"`,
		);
	});

	test('Handles a puzzle string that is not 81 characters in length', async () => {
		const expectedMessage = 'Expected puzzle to be 81 characters long';
		const req = {
			body: {
				coordinate: 'A2',
				puzzle: `${puzzlesAndSolutions[0][0]}.`,
				value: '3',
			},
		};

		await validation.rules.check.run(req);
		const results = validationResult(req);

		assert.strictEqual(
			results['errors'][0]['msg'],
			expectedMessage,
			`The puzzle string "${req.body.puzzle}" is not valid and should throw a validation error message "${expectedMessage}"`,
		);
	});

	test('Handles a valid row placement', async () => {
		const req = {
			body: {
				coordinate: 'A2',
				puzzle: puzzlesAndSolutions[0][0],
				value: '3',
			},
		};

		await validation.rules.check.run(req);

		const grid = convertToGrid(req.body.puzzle.split(''), 9);
		const [row, col] = req.body.coordinate;
		const { value } = req.body;

		const results = getPlacementConflicts(grid, row, col, value);

		assert.isEmpty(
			results,
			`"${value}" in row = ${row}, col = ${col} is a valid row placement for the puzzle string "${req.body.puzzle}"`,
		);
	});

	test('Handles an invalid row placement', async () => {
		const expectedResult = ['row'];
		const req = {
			body: {
				coordinate: 'A2',
				puzzle: puzzlesAndSolutions[0][0],
				value: '8',
			},
		};

		await validation.rules.check.run(req);

		const grid = convertToGrid(req.body.puzzle.split(''), 9);
		const [row, col] = req.body.coordinate;
		const { value } = req.body;

		const results = getPlacementConflicts(grid, row, col, value);

		assert.deepStrictEqual(
			results,
			expectedResult,
			`"${value}" in row = ${row}, col = ${col} is not a valid row placement for the puzzle string "${req.body.puzzle}"`,
		);
	});

	test('Handles a valid column placement', async () => {
		const req = {
			body: {
				coordinate: 'A2',
				puzzle: puzzlesAndSolutions[0][0],
				value: '3',
			},
		};

		await validation.rules.check.run(req);

		const grid = convertToGrid(req.body.puzzle.split(''), 9);
		const [row, col] = req.body.coordinate;
		const { value } = req.body;

		const results = getPlacementConflicts(grid, row, col, value);

		assert.isEmpty(
			results,
			`"${value}" in row = ${row}, col = ${col} is a valid column placement for the puzzle string "${req.body.puzzle}"`,
		);
	});

	test('Handles an invalid column placement', async () => {
		const expectedResult = ['column'];
		const req = {
			body: {
				coordinate: 'A2',
				puzzle: puzzlesAndSolutions[0][0],
				value: '9',
			},
		};

		await validation.rules.check.run(req);

		const grid = convertToGrid(req.body.puzzle.split(''), 9);
		const [row, col] = req.body.coordinate;
		const { value } = req.body;

		const results = getPlacementConflicts(grid, row, col, value);

		assert.deepStrictEqual(
			results,
			expectedResult,
			`"${value}" in row = ${row}, col = ${col} is not a valid column placement for the puzzle string "${req.body.puzzle}"`,
		);
	});

	test('Handles a valid region (3x3 grid) placement', async () => {
		const req = {
			body: {
				coordinate: 'A2',
				puzzle: puzzlesAndSolutions[0][0],
				value: '3',
			},
		};

		await validation.rules.check.run(req);

		const grid = convertToGrid(req.body.puzzle.split(''), 9);
		const [row, col] = req.body.coordinate;
		const { value } = req.body;

		const results = getPlacementConflicts(grid, row, col, value);

		assert.isEmpty(
			results,
			`"${value}" in row = ${row}, col = ${col} is a valid region placement for the puzzle string "${req.body.puzzle}"`,
		);
	});

	test('Handles an invalid region (3x3 grid) placement', async () => {
		const req = {
			body: {
				coordinate: 'A2',
				puzzle: puzzlesAndSolutions[0][0],
				value: '3',
			},
		};

		await validation.rules.check.run(req);

		const grid = convertToGrid(req.body.puzzle.split(''), 9);
		const [row, col] = req.body.coordinate;
		const { value } = req.body;

		const results = getPlacementConflicts(grid, row, col, value);

		assert.isEmpty(
			results,
			`"${value}" in row = ${row}, col = ${col} is a valid region placement for the puzzle string "${req.body.puzzle}"`,
		);
	});

	test('Valid puzzle strings pass the solver', async () => {
		const req = {
			body: {
				puzzle: puzzlesAndSolutions[0][0],
			},
		};

		await validation.rules.solve.run(req);
		const results = validationResult(req);

		assert.lengthOf(results['errors'], 0, `"${req.body.puzzle}" is a valid puzzle string`);
	});

	test('Invalid puzzle strings fail the solver', async () => {
		const expectedMessage = 'Invalid characters in puzzle';
		const req = {
			body: {
				puzzle: puzzlesAndSolutions[0][0].replace(/[.]/g, '#'),
			},
		};

		await validation.rules.solve.run(req);
		const results = validationResult(req);

		assert.strictEqual(
			results['errors'][0]['msg'],
			expectedMessage,
			`The puzzle string "${req.body.puzzle}" is not valid and should throw a validation error message "${expectedMessage}"`,
		);
	});

	test('Solver returns the expected solution for an incomplete puzzle', async () => {
		const [puzzle, expectedOutput] = puzzlesAndSolutions[0];
		const req = {
			body: {
				puzzle,
			},
		};

		await validation.rules.solve.run(req);

		const grid = convertToGrid(req.body.puzzle.split(''), 9);
		solvePuzzle(grid);

		assert.deepStrictEqual(
			grid.flat().join(''),
			expectedOutput,
			`The solution for the puzzle string "${puzzle}" should be "${expectedOutput}"`,
		);
	});
});
