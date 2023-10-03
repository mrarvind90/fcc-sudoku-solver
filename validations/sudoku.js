import { checkSchema } from 'express-validator';

export const check = checkSchema(
	{
		coordinate: {
			exists: {
				bail: true,
				errorMessage: 'Required field(s) missing',
			},
			isValidCoordinate: {
				bail: true,
				custom: (coordinate) => {
					const regex = new RegExp('^[a-iA-I][1-9]$', 'gi');

					return regex.test(coordinate);
				},
				errorMessage: 'Invalid coordinate',
			},
			convertCoordsToRowCols: {
				customSanitizer: (coordinate) => {
					const [row, col] = coordinate.split('');

					return [row.toUpperCase().charCodeAt(0) % 65, parseInt(col) - 1];
				},
			},
		},
		puzzle: {
			exists: {
				bail: true,
				errorMessage: 'Required field(s) missing',
			},
			isLength: {
				bail: true,
				options: {
					min: 81,
					max: 81,
				},
				errorMessage: 'Expected puzzle to be 81 characters long',
			},
			isValidPuzzleString: {
				bail: true,
				custom: (puzzleString) => {
					const regex = new RegExp('^[1-9.]{81}$', 'g');

					return regex.test(puzzleString);
				},
				errorMessage: 'Invalid characters in puzzle',
			},
			convertDotsToZeroes: {
				customSanitizer: (puzzleStr) => puzzleStr.replace(/[.]/g, '0'),
			},
		},
		value: {
			exists: {
				bail: true,
				errorMessage: 'Required field(s) missing',
			},
			isValidValue: {
				bail: true,
				custom: (value) => {
					const regex = new RegExp('^[1-9]$', 'g');

					return regex.test(value);
				},
				errorMessage: 'Invalid value',
			},
		},
	},
	['body'],
);

export const solve = checkSchema(
	{
		puzzle: {
			exists: {
				bail: true,
				errorMessage: 'Required field missing',
			},
			isLength: {
				bail: true,
				options: {
					min: 81,
					max: 81,
				},
				errorMessage: 'Expected puzzle to be 81 characters long',
			},
			isValidPuzzleString: {
				bail: true,
				custom: (puzzleString) => {
					const regex = new RegExp('^[1-9.]{81}$', 'g');

					return regex.test(puzzleString);
				},
				errorMessage: 'Invalid characters in puzzle',
			},
			convertDotsToZeroes: {
				customSanitizer: (puzzleStr) => puzzleStr.replace(/[.]/g, '0'),
			},
		},
	},
	['body'],
);
