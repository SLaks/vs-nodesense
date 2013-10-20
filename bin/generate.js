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

// TODO: Add node_modules aliases
_.forEach(process.binding('natives'), function (source, name) {
	var filePath = builtinsDir + name + '.js';

	// We don't need to wait for the file to be written
	fs.writeFile(filePath, source);
	refGen.emitFile(name, filePath);
});

refGen.end();