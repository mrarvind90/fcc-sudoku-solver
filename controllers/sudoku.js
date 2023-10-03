export const convertToGrid = (puzzleArr, chunkSize) =>
	puzzleArr.length > chunkSize
		? [puzzleArr.slice(0, chunkSize), ...convertToGrid(puzzleArr.slice(chunkSize), chunkSize)]
		: [puzzleArr];

export const isValidRowPlacement = (grid, row, value) => !grid[row].includes(value);

export const isValidColumnPlacement = (grid, column, value) => {
	for (let row = 0; row < 9; row++) {
		if (grid[row][column] === value) {
			return false;
		}
	}

	return true;
};

export const isValidRegionPlacement = (grid, startRow, startColumn, value) => {
	for (let row = startRow; row < startRow + 3; row++) {
		for (let col = startColumn; col < startColumn + 3; col++) {
			if (grid[row][col] === value) {
				return false;
			}
		}
	}

	return true;
};

export const getPlacementConflicts = (grid, row, column, value) => {
	const conflict = [];

	if (!isValidRowPlacement(grid, row, value)) conflict.push('row');
	if (!isValidColumnPlacement(grid, column, value)) conflict.push('column');
	if (!isValidRegionPlacement(grid, row - (row % 3), column - (column % 3), value)) conflict.push('region');

	return conflict;
};

const findEmptyCell = (grid) => {
	for (let row = 0; row < 9; row++) {
		for (let col = 0; col < 9; col++) {
			if (grid[row][col] === '0') {
				return [row, col];
			}
		}
	}

	return null;
};

export const solvePuzzle = (grid) => {
	const emptyCell = findEmptyCell(grid);

	if (!emptyCell) return true;

	const [row, col] = emptyCell;

	for (let num = 1; num <= 9; num++) {
		const conflicts = getPlacementConflicts(grid, row, col, num.toString());

		if (conflicts.length === 0) {
			grid[row][col] = num.toString();

			if (solvePuzzle(grid)) return true;

			grid[row][col] = '0';
		}
	}

	return false;
};

export const check = (req, res) => {
	const grid = convertToGrid(req.body.puzzle.split(''), 9);
	const [row, column] = req.body.coordinate;
	const { value } = req.body;

	const conflict = getPlacementConflicts(grid, row, column, value);

	return conflict.length > 0 && grid[row][column] !== value
		? res.status(422).json({ valid: false, conflict })
		: res.status(200).json({ valid: true });
};

export const solve = (req, res) => {
	let initialGrid = convertToGrid(req.body.puzzle.split(''), 9);
	let gridToBeSolved = JSON.parse(JSON.stringify(initialGrid));

	solvePuzzle(gridToBeSolved);

	initialGrid = initialGrid.flat().join('');
	gridToBeSolved = gridToBeSolved.flat().join('');

	if (gridToBeSolved === initialGrid) {
		return res.status(422).json({ error: 'Puzzle cannot be solved' });
	}

	return res.status(200).json({ solution: gridToBeSolved });
};
