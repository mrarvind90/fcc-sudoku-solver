import fs from 'fs';
import path from 'path';

import { EventEmitter } from 'events';
import Mocha from 'mocha';
import { assertionAnalyser } from '../config/assertion-analyser.js';

const mocha = new Mocha();
const testDir = path.join(process.cwd(), 'tests');

// Add each .js file to the mocha instance
fs.readdirSync(testDir)
	.filter((file) => file.endsWith('.js'))
	.forEach((file) => mocha.addFile(path.join(testDir, file)));

const emitter = new EventEmitter();
emitter.run = () => {
	const tests = [];
	let context = '';
	const separator = ' -> ';
	// Run the tests.
	mocha
		.loadFilesAsync()
		.then(() =>
			mocha
				.ui('tdd')
				.run()
				.on('test end', (test) => {
					// remove comments
					let body = test.body.replace(/\/\/.*\n|\/\*.*\*\//g, '');
					// collapse spaces
					body = body.replace(/\s+/g, ' ');
					const obj = {
						title: test.title,
						context: context.slice(0, -separator.length),
						state: test.state,
						// body: body,
						assertions: assertionAnalyser(body),
					};
					tests.push(obj);
				})
				.on('end', () => {
					emitter.report = tests;
					emitter.emit('done', tests);
				})
				.on('suite', (s) => {
					context += s.title + separator;
				})
				.on('suite end', (s) => {
					context = context.slice(0, -(s.title.length + separator.length));
				}),
		)
		.catch(() => (process.exitCode = 1));
};

export default emitter;
