/* global intellisense */
"use strict";

intellisense.removeNodeGlobals = function () {
	/// <summary>Removes all Node.js-related globals.  This should usually be called together with intellisense.restoreGlobals() to restore the regular DOM environment.</summary>
	intellisense.global.console = intellisense.browserConsole;

	delete intellisense.global.require;
	delete intellisense.global.module;
	delete intellisense.global.__filename;
	delete intellisense.global.__dirname;
	delete intellisense.global.exports;
	delete intellisense.global.process;
	delete intellisense.global.Buffer;
	delete intellisense.global.global;
};
