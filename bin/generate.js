"use strict";

var fs = require('fs');
var _ = require('lodash');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');

var ReferenceEmitter = require('./ReferenceEmitter');

var projectDir = './';
var outputDir = projectDir + 'node_modules/.vs-nodesense/';

rimraf.sync(outputDir);

var builtinsDir = outputDir + 'builtin-source/';

mkdirp.sync(builtinsDir);

var refGen = new ReferenceEmitter(projectDir, outputDir);

fs.writeFile(builtinsDir + '.jshintignore', '**');
fs.writeFile(refGen.referencesDir + '.jshintignore', '**');

// This order is as close to a topological sort as I can get.
// Otherwise, native modules that inherit other modules won't
// work, since their dependencies won't have been defined. To
// debug this, disable declareModule(), then read JSLS output
// to see which modules were loaded before being defined.
var knownModuleOrder = [
	'util', 'events', 'assert', '_stream_readable', '_stream_writable', '_stream_duplex', '_stream_transform',
	'_stream_passthrough', 'stream', '_linklist', 'timers', 'net', 'path',	'querystring', 'punycode', 'url',
	'string_decoder', 'crypto', 'tls', 'dgram', 'vm', 'child_process'
];

// TODO: Add node_modules aliases
_(process.binding('natives'))
	.pairs()
	.sortBy(function (pair) {
		var index = knownModuleOrder.indexOf(pair[0]);
		return index < 0 ? 9999 : index;
	})
	.forEach(function (p) {
		var name = p[0], source = p[1];
		var filePath = builtinsDir + name + '.js';

		// We don't need to wait for the file to be written
		fs.writeFile(filePath, source);
		refGen.emitFile(name, filePath);
	});

refGen.end();