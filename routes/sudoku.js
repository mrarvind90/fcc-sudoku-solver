import { Router } from 'express';

import { handler } from '#handlers/index.js';
import { validator } from '#validators/index.js';
import { validation } from '../validations/index.js';
import { controller } from '#controllers/index.js';

const router = Router();

router
	.route('/check')
	.post(validator.validate(validation.rules.check), controller.sudoku.check)
	.all(handler.error._405);

router
	.route('/solve')
	.post(validator.validate(validation.rules.solve), controller.sudoku.solve)
	.all(handler.error._405);

export default router;
