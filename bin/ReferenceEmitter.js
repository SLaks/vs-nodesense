"use strict";

var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');


/**
 * This class emits references to all module definitions.
 * Because IntelliSense cannot run any code before before
 * executing referenced files, we set the module for each
 * file in the previous JS file. The module's source code
 * is then referenced in the next JS file, so it executes
 * with the correct module object.
 */
function ReferenceEmitter(projectDir, outputDir) {
	this.referencesDir = outputDir + 'references/';
	this.projectDir = projectDir;
	this.outputDir = outputDir;

	// This file holds an ordered list of <reference> tags
	// to the individual files created.
	this.referenceListFile = fs.createWriteStream(outputDir + 'module-references.js');

	// This file declares all of the modules referenced by
	// this instance, and is referenced before all modules
	this.declarationsFile = this.createReferenceFile(outputDir + '$module-declarations.js');

	this.currentOutFile = null;

	// This file calls enterModuleDefinition for the first
	// module, before it is referenced by the second file.
	this.createReferenceFile(this.referencesDir + "$start.js");

	// Holds IDs of all modules that have already been defined.
	this.emittedModules = Object.create(null);
}
module.exports = ReferenceEmitter;

/**
 * Sets this instance to write to a file with the given name.
 * This creates the file, and adds it to the references list.
 */
ReferenceEmitter.prototype.createReferenceFile = function (filePath) {
	if (this.currentOutFile)
		this.currentOutFile.end();
	mkdirp.sync(path.dirname(filePath));

	this.currentOutFile = fs.createWriteStream(filePath);
	this.referenceListFile.write('/// <reference path="' + path.relative(this.outputDir, filePath) + '" />\r\n');
	return this.currentOutFile;
};

/**
 * Writes a module declaration for the given module ID.
 * This writes the declaration to the global list, then
 * writes adefition entry to the current output script.
 * After calling this, write the module definition in a
 * new output file.
 */
ReferenceEmitter.prototype.writePrelude = function (modulePath) {
	// If this is an index file, add an alias for its directory.
	if (/\/index\.[a-z]+$/.test(modulePath)) {
		var dir = path.dirname(modulePath) + '/';
		this.declarationsFile.write('require.cache[' + JSON.stringify(dir) + '] = ');
	}

	this.declarationsFile.write('intellisense.declareModule(');
	this.declarationsFile.write(JSON.stringify(modulePath));
	this.declarationsFile.write(');\r\n');

	this.currentOutFile.write('intellisense.enterModuleDefinition(');
	this.currentOutFile.write(JSON.stringify(modulePath));
	this.currentOutFile.write(');\r\n');
};
/**
 * Writes a reference to a module script file to 
 * the current output file
 */
ReferenceEmitter.prototype.writeModuleReference = function (modulePath) {
	this.currentOutFile.write('/// <reference path="' + path.relative(this.referencesDir, modulePath) + '" />\r\n');
	this.currentOutFile.write('intellisense.closeModule();\r\n');
};
/**
 * Starts a new output file.
 * @param {String} modulePath	The path to the module defined in the file.  This is used to pick a relevant filename.
 */
ReferenceEmitter.prototype.startFile = function (modulePath) {
	var relativePath = path.relative(this.projectDir, modulePath).replace(/\.\./g, '--').replace(/^\//, '');
	var referenceFile = path.resolve(this.referencesDir, relativePath);

	if (!path.extname(referenceFile))
		referenceFile += '.js';  // Add extensions to built-in modules

	var index = 0;
	while (fs.existsSync(referenceFile))
		referenceFile = referenceFile.replace(/\.[a-z]+$/i, (++index) + "$1");

	this.createReferenceFile(referenceFile);
};

/**
 * Emits a complete reference to the given module
 * @param {String} modulePath	The full module ID, as passed to require().
 * @param {String} [filePath]	The path to the module source code.  If omitted, the module ID is assumed to be a filepath.  This parameter is intended for built-in modules.
 */
ReferenceEmitter.prototype.emitFile = function (modulePath, filePath) {
	modulePath = require.resolve(modulePath).replace(/\\/g, '/');

	if (this.emittedModules[modulePath])
		return;
	this.emittedModules[modulePath] = true;

	this.writePrelude(modulePath);
	this.startFile(modulePath);

	// TODO: Handle JSON
	this.writeModuleReference(filePath || modulePath);
};

/**
 * Closes all files created by the emitter 
 */
ReferenceEmitter.prototype.end = function () {
	this.currentOutFile.end();
	this.referenceListFile.end();
	this.declarationsFile.end();
};