import express, { json } from 'express';
import path from 'path';
import cors from 'cors';

import CORS_OPTIONS from '#config/cors.js';
import { fcc } from './routes/fcc.js';
import { route } from './routes/index.js';
import { handler } from '#handlers/index.js';
import logger from '#config/logger.js';
import runner from '#tests/runner.js';

// Initialise express server
const app = express();

// Static CSS and JS files
app.use('/public', express.static(path.join(process.cwd(), '/public')));

// CORS and router configuration
app.use(cors(CORS_OPTIONS));
app.use(json());

//For FCC testing purposes
fcc(app);

// Static HTML
app.route('/').get((req, res) => {
	res.sendFile(path.join(process.cwd(), '/views/index.html'));
});

// Application Routers
app.use('/api', route.sudoku);

// Resource not found handling
app.use(handler.error._404);

// Server
app.listen(process.env.PORT, () => {
	logger.info(`Application started and listening at port ${process.env.PORT}`);

	if (process.env.NODE_ENV === 'test') {
		logger.info('Running Tests...');

		setTimeout(function () {
			try {
				runner.run();
			} catch (e) {
				logger.error('Tests are not valid:');
				logger.error(e);
			}
		}, 1500);
	}
});

export default app;
