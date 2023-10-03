import { validationResult } from 'express-validator';

import logger from '#config/logger.js';

export const validate = (validationRules) => {
	return async (req, res, next) => {
		await Promise.all(validationRules.map((validationRule) => validationRule.run(req)));
		const result = validationResult(req);

		if (!result.isEmpty()) {
			const statusCode = 422;

			logger.error(
				`${statusCode} ${req.method} ${req.path}${' ' + JSON.stringify(req.body) || ''} - ${
					result.array()[0]['error']
				}`,
			);

			// For the purposes of FCC project, we only return the first error message each time
			return res.status(statusCode).json({ error: result.array()[0].msg });
		}

		return next();
	};
};
