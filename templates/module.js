/* global intellisense */
"use strict";

function require(id) {
	/// <summary>Loads a Javascript or JSON file, or a Node.js module, returning the module's exports object.</summary>
	/// <param name="id" type="String">The name of an built-in or installed module (in a node_modules folder), or a relative path to a .js file.</param>
	/// <field name='cache' type='Object' static='true'>Stores every module that has already been loaded.  For internal use.</field>

	var fullId = require.resolve(id);
	if (!require.cache.hasOwnProperty(fullId)) {
		intellisense.logMessage("Node.js modules: require() called with unknown id " + id + " from " + module.id);
		return null;
	}
	return require.cache[fullId].exports;
}

(function () {
	// require.cache must contain:
	// - Every built-in module.
	// - The full path to every .js file.
	// - The full path (including trailing slash) to every folder with an index.* or package.json, aliased to the resolved file.
	// This is done by the Node-side generator.
	require.cache = {};

	var implicitSuffixes = ['/', '.js', '.json'];
	function getFile(path) {
		// Unless this is already a path to a directory, check for directory or extension
		if (/\/$/.test(path) && !require.cache.hasOwnProperty(path)) {
			for (var i = 0; i < implicitSuffixes.length; i++) {
				if (!require.cache.hasOwnProperty(path + implicitSuffixes[i]))
					continue;
				path += implicitSuffixes[i];
			}
		}

		// In case this was a path to a directory (whether or not we added a slash), get the actual file path.
		if (require.cache.hasOwnProperty(path))
			return require.cache[path].id;
		else
			return null;
	}
	function regExpEscape(s) {
		return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	}

	require.resolve = function (id) {
		/// <summary>Resolves a relative path or module name to a full module filename, as used by require().</summary>
		return Module._resolveFilename(id, module);
	};

	Module._resolveFilename = function (id, parent) {
		/// <summary>Resolves a relative path or module name to a full module filename, as used by require().</summary>

		id = id.replace(/\\/g, '/');
		// If it's a relative path, resolve it.
		if (/^\.{0,2}\//.test(id)) {
			if (parent && parent.filename)
				return getFile(require('path').join(require('path').dirname(parent.filename), id));
			// TODO: Try to guess the current module path from multiple matching included files

			return null;
		}

		// If it's already a full path (especially a built-in), return it.
		if (require.cache.hasOwnProperty(id))
			return require.cache[id].id;

		// Otherwise, search for it as a module

		if (!parent || !parent.filename) {
			// If we don't know where we're coming from, find the first matching module, whether it's a directory 
			var regex = new RegExp('/node_modules/' + regExpEscape(id) + '/?$');
			for (var key in require.cache) {
				if (regex.test(key))
					return require.cache[key].id;
			}
			return null;
		}

		var parts = parent.filename.split(/[\/\\]/);

		for (var tip = parts.length - 1; tip >= 0; tip--) {
			// don't search in .../node_modules/node_modules
			if (parts[tip] === 'node_modules') continue;
			var dir = getFile(parts.slice(0, tip + 1).concat('node_modules').join('/'));
			if (dir)
				return dir;
		}
		return null;
	};


	function Module(id, parent) {
		/// <field name='exports' type='Object'>The object that will be returned when this module is require()d.</field>
		this.id = id;

		this.exports = {};

		this.parent = parent;
		if (parent && parent.children) {
			parent.children.push(this);
		}

		this.filename = id;
		this.loaded = false;
		this.children = [];
	}
	Module.prototype.require = function (id) {
		/// <summary>Loads a module relative to this module.</summary>
		/// <param name="id" type="String">The name of an built-in or installed module (in a node_modules folder), or a relative path to a .js file.</param>

		var fullId = Module._resolveFilename(id, this);
		if (!require.cache.hasOwnProperty(fullId)) {
			intellisense.logMessage("Node.js modules: require() called with unknown id " + id);
			return null;
		}
		return require.cache[fullId].exports;
	};


	intellisense.declareModule = function (path) {
		/// <summary>Creates an empty module object.  Call this function before running any actual modules so that require() can see future modules.  This should only be used in generated code.</summary>
		if (require.cache.hasOwnProperty(path))
			return require.cache[path];
		var newModule = require.cache[path] = new Module(path);
		return newModule;
	};
	intellisense.enterModuleDefinition = function (path) {
		/// <summary>Creates globals for the definition of a new module.  Call this function before running the normal Node.js module source code.  This should only be used in generated code.</summary>
		var newModule = global.module = require.cache[path] || intellisense.declareModule(path);

		// Shorthand for module.exports
		global.exports = newModule.exports;
		global.__filename = path;
		global.__dirname = path.replace(/[\/\\][^\/\\]+$/, '');
	};

	intellisense.closeModule = function () {
		/// <summary>Closes the definition of a module.  Call this function after running the normal Node.js module source code.  This should only be used in generated code.</summary>
		global.module = new Module("<unknown user code>");
	};

	var moduleModule = new Module('module');
	require.cache.module = moduleModule;
	require.cache.module.exports = Module;
})();