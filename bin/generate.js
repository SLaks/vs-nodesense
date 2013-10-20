"use strict";

var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');

var globalSet = Object.getOwnPropertyNames(global);

var projectDir = './';
var outputDir = projectDir + 'node_modules/.vs-nodesense/';

rimraf.sync(outputDir);

var referencesDir = outputDir + 'references/';
var builtinsDir = outputDir + 'builtin-source/';

mkdirp.sync(referencesDir);
mkdirp.sync(builtinsDir);
var referenceListFile = fs.createWriteStream(outputDir + 'module-references.js');
var declarationsFile = fs.createWriteStream(referencesDir + '_module-declarations.js');

var preRefOutFile = referencesDir + '_start.js';
var currentOutFile = fs.createWriteStream(preRefOutFile);
referenceListFile.write('/// <reference path="' + path.relative(outputDir, preRefOutFile) + '" />\r\n');

fs.writeFile(builtinsDir + '.jshintignore', '**');
fs.writeFile(referencesDir + '.jshintignore', '**');

var emittedModules = Object.create(null);

function writePrelude(modulePath) {
	// If this is an index file, add an alias for its directory.
	if (/\/index\.[a-z]+$/.test(modulePath)) {
		var dir = path.dirname(modulePath) + '/';
		declarationsFile.write('require.cache[' + JSON.stringify(dir) + '] = ');
	}

	declarationsFile.write('intellisense.declareModule(');
	declarationsFile.write(JSON.stringify(modulePath));
	declarationsFile.write(');\r\n');

	currentOutFile.write('intellisense.enterModuleDefinition(');
	currentOutFile.write(JSON.stringify(modulePath));
	currentOutFile.write(');\r\n');
}
function writeModuleReference(modulePath) {
	currentOutFile.write('/// <reference path="' + path.relative(referencesDir, modulePath) + '" />\r\n');
}
function startFile(modulePath) {
	var relativePath = path.relative(projectDir, modulePath).replace(/\.\./g, '--').replace(/^\//, '');
	var referenceFile = path.resolve(referencesDir, relativePath);

	if (!path.extname(referenceFile))
		referenceFile += '.js';  // Add extensions to built-in modules

	var index = 0;
	while (fs.existsSync(referenceFile))
		referenceFile = referenceFile.replace(/\.[a-z]+$/i, (++index) + "$1");
	currentOutFile.end();
	mkdirp.sync(path.dirname(referenceFile));
	currentOutFile = fs.createWriteStream(referenceFile);
	referenceListFile.write('/// <reference path="' + path.relative(outputDir, referenceFile) + '" />\r\n');
}

function emitFile(modulePath, filePath) {
	modulePath = require.resolve(modulePath).replace(/\\/g, '/');

	if (emittedModules[modulePath])
		return;
	emittedModules[modulePath] = true;

	writePrelude(modulePath);
	startFile(modulePath);
	writeModuleReference(filePath || modulePath);
}

// TODO: Add node_modules aliases
_.forEach(process.binding('natives'), function (source, name) {
	var filePath = builtinsDir + name + '.js';
	fs.writeFile(filePath, source);
	emitFile(name, filePath);
});
currentOutFile.end();
referenceListFile.end();
declarationsFile.end();