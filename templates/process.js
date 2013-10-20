/*jshint unused: false */
/*global intellisense*/
"use strict";

intellisense.browserConsole = console;
global.console = require('console');

// Node.js' process object is defined by a mix of special Javascript
// and C code; I can't automatically steal its source.
// This source is based on the documentation for v0.10.21 on Windows
// Installation-dependent properties like versions & environment are
// set in environment-data.js from the actual data in the generator.
global.process = new (require('events').EventEmitter)();

process.stdin = require('stream').Readable();
process.stdout = require('stream').Writable();
process.stderr = require('stream').Writable();

// An array containing the command line arguments. The first element will be 'node', the second element will be the name of the JavaScript file. The next elements will be any additional command line arguments.
process.argv = ["node", "my-file.js", "arguments..."];

// This is the absolute pathname of the executable that started the process.
process.execPath = "";

//This is the set of node-specific command line options from the executable that started the process. These options do not show up in process.argv, and do not include the node executable, the name of the script, or any options following the script name. These options are useful in order to spawn child processes with the same execution environment as the parent.
process.execArgv = [];

process.abort = function () {
	/// <summary>This causes node to emit an abort. This will cause node to exit and generate a core file.</summary>
};
process.chdir = function (directory) {
	/// <summary>Changes the current working directory of the process or throws an exception if that fails.</summary>
};
process.cwd = function () {
	/// <summary>Returns the current working directory of the process.</summary>
	return "";
};
process.exit = function (code) {
	/// <summary>Ends the process with the specified code. If omitted, exit uses the 'success' code 0.</summary>
	/// <param name="code" type="Integer" optional="true" />
};

// Skipped gid, uid, and groups functions as they don't exist on Windows.


process.kill = function (pid, signal) {
	/// <summary>Send a signal to a process. pid is the process id and signal is the string describing the signal to send. Signal names are strings like 'SIGINT' or 'SIGHUP'. If omitted, the signal will be 'SIGTERM'. See kill(2) for more information.</summary>
	/// <param name="pid" type="Integer" />
	/// <param name="signal" type="Integer" optional="true" />
};

process.pid = 0;

process.title = 'Node.js';

process.memoryUsage = function () {
	/// <summary>Returns an object describing the memory usage of the Node process measured in bytes.</summary>
	return {
		rss: 18464768,
		heapTotal: 16571136,
		heapUsed: 5422256
	};
};

process.nextTick = function (cb) {
	/// <summary>On the next loop around the event loop call this callback. This is not a simple alias to setTimeout(fn, 0), it's much more efficient. It typically runs before any other I/O events fire, but there are some exceptions. See process.maxTickDepth below.</summary>
	/// <param name="cb" type="Function" />
};

//Callbacks passed to process.nextTick will usually be called at the end of the current flow of execution, and are thus approximately as fast as calling a function synchronously. Left unchecked, this would starve the event loop, preventing any I/O from occurring.
process.maxTickDepth = 1000;

process.umask = function (newmask) {
	/// <summary>Sets or reads the process's file mode creation mask. Child processes inherit the mask from the parent process. Returns the old mask if mask argument is given, otherwise returns the current mask.</summary>
	/// <param name="newmask" type="Integer" optional="true" />
	if (arguments.length === 0)
		return 0;
};

process.uptime = function () {
	/// <summary>Number of seconds Node has been running.</summary>
	return 0;
};

process.hrtime = function (previous) {
	/// <summary>Returns the current high-resolution real time in a [seconds, nanoseconds] tuple Array. It is relative to an arbitrary time in the past. It is not related to the time of day and therefore not subject to clock drift. The primary use is for measuring performance between intervals.</summary>
	/// <param name="previous" type="Array" optional="true">You may pass in the result of a previous call to process.hrtime() to get a diff reading, useful for benchmarks and measuring intervals.</param>
	return [0, 0];
};