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
mkdirp.sync(outputDir);

var referencesDir = outputDir + 'references/';
var builtinsDir = referencesDir + '_builtins/';

var indexFile = fs.createWriteStream(referencesDir + '_module-index.js');
var currentOutFile = fs.createWriteStream(referencesDir + '_start.js');

function writePrelude(modulePath) {
	modulePath = require.resolve(modulePath).replace(/\\/g, '/');

	// If this is an index file, 
	if (/\/index\.[a-z]+$/.test(modulePath)) {
		var dir = path.dirname(modulePath) + '/';
		indexFile.write('require.cache[' + JSON.stringify(dir) + '] = ');
	}

	indexFile.write('intellisense.declareModule(');
	indexFile.write(JSON.stringify(modulePath));
	indexFile.write(');\r\n');

	currentOutFile.write('intellisense.enterModuleDefinition(');
	currentOutFile.write(JSON.stringify(modulePath));
	currentOutFile.write(');\r\n');
}
function writeModuleReference(modulePath) {
	currentOutFile.write('/// <reference path="' + path.relative(referencesDir, modulePath) + '" />\r\n');
}
function startFile(modulePath) {
	var relativePath = path.relative(projectDir, modulePath).replace(/\.\./g, '--').replace(/^\//, '');
	var filePath = path.resolve(outputDir, relativePath);

	var index = 0;
	while (fs.existsSync(filePath))
		filePath = filePath.replace(/\.[a-z]+$/i, (++index) + "$1");
	currentOutFile.end();
	mkdirp.sync(path.dirname(filePath));
	currentOutFile = fs.createWriteStream(filePath);
}
// TODO: Add node_modules aliases
_.forEach(process.binding('natives'), function (source, name) {

});
