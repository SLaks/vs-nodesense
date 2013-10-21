/* global intellisense, _$asyncRequests */
"use strict";

intellisense.logMessage("In module.js!");

function require(id) {
	/// <summary>Loads a Javascript or JSON file, or a Node.js module, returning the module's exports object.</summary>
	/// <param name="id" type="String">The name of an built-in or installed module (in a node_modules folder), or a relative path to a .js file.</param>
	/// <field name='cache' type='Object' static='true'>Stores every module that has already been loaded.  For internal use.</field>

	return module.require(id);
}

(function () {
	// require._definitions maps primary module IDs (built-in modules and full paths to source files) to arrays of source paths to load them from.

	// require._aliases maps other require()able paths to their primary IDs.
	// It must contain full paths (including trailing slash) to every folder
	// that contains an index.* file, or a package.json with a "main" entry.
	// To make this code simpler, it must also contain primary module paths,
	// mapped to themselves.
	// These are populated by the Node-side generator.

	// require.cache contains all module objects that were already loaded.
	// This is populated as modules are loaded asynchronously.

	require._definitions = {};
	require._aliases = {};
	require.cache = {};

	var implicitSuffixes = ['/', '.js', '.json'];
	function getFile(path) {
		/// <summary>Finds the primary ID of a require()able path, or null if the path is not a known module.</summary>
		if (require._aliases.hasOwnProperty(path))
			return require._aliases[path];

		// If the path already refers to a directory, and we
		// don't have an alias for it, there is nowhere else
		// to look for a definition.
		if (/\/$/.test(path))
			return null;

		// Check whether this is a path to a directory or to
		// a file without an extension
		for (var i = 0; i < implicitSuffixes.length; i++) {
			var newPath = path + implicitSuffixes[i];
			if (require._aliases.hasOwnProperty(newPath))
				return require._aliases[newPath];
		}
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
		var knownFile = getFile(id);
		if (knownFile)
			return knownFile;

		// Otherwise, search for it as a module
		if (!parent || !parent.filename) {
			// If we don't know where we're coming from, find the first matching module, whether it's a directory 
			var regex = new RegExp('/node_modules/' + regExpEscape(id) + '/?$');
			for (var key in require._aliases) {
				if (regex.test(key))
					return require._aliases[key];
			}
			return null;
		}

		// This part is stolen from Node.js module resolution source
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
		if (!fullId) {
			intellisense.logMessage("Node.js modules: require() called with unknown id " + id);
			return null;
		}
		if (!require.cache.hasOwnProperty(fullId)) {
			loadModule(fullId);
		}
		return require.cache[fullId].exports;
	};

	var asyncLoadedIds = Object.create(null);
	function loadModule(id) {
		if (asyncLoadedIds[id]) return;
		asyncLoadedIds[id] = true;

		intellisense.logMessage("Node.js modules: async loading module " + id + "; queue is " + JSON.stringify(_$asyncRequests.getItems()));
		
		var insertBefore = _$asyncRequests.getItems()[0];
		require._definitions[id].forEach(function (path) {
			_$asyncRequests.insertBefore({ src: path }, insertBefore);
		});
	}

	intellisense.enterModuleDefinition = function (path) {
		/// <summary>Creates globals for the definition of a new module.  Call this function before running the normal Node.js module source code.  This should only be used in generated code.</summary>
		var newModule = global.module = require.cache[path] = new Module(path);

		// Shorthand for module.exports
		global.exports = newModule.exports;
		global.__filename = path;
		global.__dirname = path.replace(/[\/\\][^\/\\]+$/, '');
		intellisense.logMessage("Node.js modules: Defining module " + path);
	};

	intellisense.closeModule = function () {
		/// <summary>Closes the definition of a module.  Call this function after running the normal Node.js module source code.  This should only be used in generated code.</summary>
		global.module = new Module("<unknown user code>");
	};

	var moduleModule = new Module('module');
	require.cache.module = moduleModule;
	require.cache.module.exports = Module;
})();