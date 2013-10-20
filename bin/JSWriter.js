"use strict";

var path = require('path');
var util = require('util');
var fs = require('fs');
var mkdirp = require('mkdirp');


function JSWriter(filePath) {
	mkdirp.sync(path.dirname(filePath));
	fs.WriteStream.call(this, filePath);
	this.dirname = path.dirname(filePath);
}
util.inherits(JSWriter, fs.WriteStream);

module.exports = JSWriter;

/**
 * Writes a reference to the specified Javascript file.
 */
JSWriter.prototype.writeReference = function (referencedFile) {
	if (referencedFile instanceof fs.WriteStream)
		referencedFile = referencedFile.path;
	this.write('/// <reference path="');
	this.write(path.relative(this.dirname, referencedFile));
	this.write('" />\r\n');
};

/**
 * Creates a new Javascript file and references it in this file.
 */
JSWriter.prototype.createReferencedFile = function (newFile) {
	this.writeReference(newFile);
	return new JSWriter(newFile);
};

JSWriter.prototype.writeAssignment = function (name, value) {
	this.write(name);
	this.write(' = ');
	this.write(JSON.stringify(value));
	this.write(';\r\n');
};
