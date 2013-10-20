/* global intellisense, window */
"use strict";

(function (global) {
	// The global object
	global.global = intellisense.global = global.global = global;

	var defaultGlobals = [
		'decodeURIComponent', 'DTRACE_NET_SERVER_CONNECTION', 'SyntaxError', 'ReferenceError', 'Uint8ClampedArray',
		'COUNTER_NET_SERVER_CONNECTION_CLOSE', 'Math', 'encodeURIComponent', 'parseInt', 'decodeURI', 'COUNTER_HTTP_SERVER_REQUEST',
		'Error', 'ArrayBuffer', 'DTRACE_HTTP_CLIENT_REQUEST', '__filename', 'DTRACE_NET_STREAM_END', 'parseFloat', 'Buffer', 'require',
		'undefined', 'URIError', 'Object', 'Int8Array', 'Float32Array', 'COUNTER_HTTP_SERVER_RESPONSE', 'RangeError', 'encodeURI',
		'DTRACE_NET_SOCKET_WRITE', 'setTimeout', 'setInterval', 'Date', 'clearInterval', 'unescape', 'NaN', 'COUNTER_NET_SERVER_CONNECTION',
		'GLOBAL', '__dirname', 'isFinite', 'Int16Array', 'console', 'Uint32Array', 'DataView', 'isNaN', 'Number', 'JSON', 'Uint16Array',
		'DTRACE_HTTP_SERVER_REQUEST', 'eval', 'process', 'Infinity', 'Float64Array', 'clearImmediate', 'root', 'clearTimeout', 'setImmediate',
		'exports', 'DTRACE_HTTP_CLIENT_RESPONSE', 'TypeError', 'EvalError', 'COUNTER_HTTP_CLIENT_REQUEST', 'Function', 'Boolean', 'RegExp',
		'String', 'module', 'Int32Array', 'COUNTER_HTTP_CLIENT_RESPONSE', 'global', 'DTRACE_NET_SOCKET_READ', 'Uint8Array', 'DTRACE_HTTP_SERVER_RESPONSE', 'escape', 'Array'
	];

	// If we can't delete a global, we set it to this object to hide it in the filter.
	var deletedMarkerObject = {};
	var deletedGlobals = Object.create(null);

	intellisense.deleteExtraGlobals = function (desiredGlobals) {
		/// <summary>Deletes all globals that aren't found in Node.js.  Call this function from a referenced file for scripts that run in Node.js.</summary>
		/// <param name="desiredGlobals" type="Array">An array of globals to keep.  If omitted, a built-in set of Node.js globals will be kept.</param>

		desiredGlobals = intellisense.nodeGlobals || defaultGlobals;

		var count = 0;
		var keys = Object.getOwnPropertyNames(global);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			if (key === 'intellisense' || /^_\$/.test(key) || desiredGlobals.indexOf(key) >= 0)
				continue;

			deletedGlobals[key] = Object.getOwnPropertyDescriptor(global, key);
			delete global[key];
			// If it couldn't be deleted, set it to our marker so we can hide it from IntelliSense.
			if (Object.hasOwnProperty.call(global, key))
				global[key] = deletedMarkerObject;
			count++;
		}

		intellisense.logMessage("Node.js entry: Deleted " + count + " globals");
	};

	intellisense.restoreGlobals = function () {
		/// <summary>Restores non-Node.js globals.  Call this function from a referenced file in scripts that run in a browser to restore browser globals.</summary>
		var count = 0;

		for (var key in deletedGlobals) {
			if (Object.hasOwnProperty.call(global, key) && global[key] !== deletedMarkerObject) {
				intellisense.logMessage('Global ' + key + " was recreated after being deleted for Node.js mode and will not be restored.  Original type: " + typeof deletedGlobals[key] + "; new type: " + typeof global[key]);
				continue;
			}
			Object.defineProperty(global, key, deletedGlobals[key]);
			count++;
		}
		intellisense.logMessage("Node.js exit: Restored " + count + " globals");
		deletedGlobals = Object.create(null);
	};

	// Filter out those items that we couldn't delete.
	intellisense.addEventListener('statementcompletion', function (event) {
		if (typeof event.targetName !== "undefined") return;

		event.items = event.items.filter(function (item) {
			// If it's a function parameter, a keyword, or a local variable, show it
			if (item.kind === 'reserved' || item.kind === 'parameter' || item.scope !== 'global')
				return true;
			// If it wasn't deleted, show it
			if (!(item.name in deletedGlobals))
				return true;
			// If it was deleted, but has a phantom entry from IntelliSense.annotate, hide it.  (the value will be undefined)
			if (!(item.name in global))
				return false;
			// If it was deleted, but was then re-created locally, show it.
			if (item.value !== deletedMarkerObject)
				return true;
			return false;
		});
	});

})(window);